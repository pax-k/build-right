import type { ResolverInput, Gate, TaskSummary } from "./contracts";
import { join } from "node:path";
import { lstat, readdir } from "node:fs/promises";
import { OpenSpecAdapter } from "./openspec/adapter";
import { validateManagedOpenSpecRoot } from "./openspec/safe-setup";
import type {
  PlanningChangeResult,
  PlanningProvider,
  PlanningValidationResult,
} from "./openspec/provider-contracts";

type ReconciliationProvider = Pick<PlanningProvider, "inspect" | "validate" | "applyInstructions">;

function gate(type: Gate["type"], task: TaskSummary, reason: string): Gate {
  return {
    type,
    status: task.status,
    source: task.path || task.tracker,
    reason: `task ${task.id}: ${reason}`,
  };
}

function failureGate(
  task: TaskSummary,
  result: Extract<PlanningChangeResult | PlanningValidationResult, { ok: false }>,
): Gate {
  const unavailable = ["provider-unavailable", "unsupported-version", "timeout"].includes(result.code);
  return gate(
    unavailable ? "planning-provider-unavailable" : "planning-provider-invalid",
    task,
    `${result.code}: ${result.message}`,
  );
}

function allBoundTasks(input: ResolverInput): TaskSummary[] {
  return [...input.readyTasks, ...input.activeTasks, ...(input.plannedTasks ?? []), ...input.completedTasks]
    .filter((task) => task.planningBinding || task.planningBindingError);
}

async function archivedChangeWorkItems(cwd: string, change: string): Promise<Set<string> | null> {
  const openspecRoot = join(cwd, "openspec");
  try {
    const validation = await validateManagedOpenSpecRoot(cwd, openspecRoot);
    if (!validation.ok) return null;
  } catch {
    return null;
  }
  try {
    await lstat(join(openspecRoot, "changes", change));
    return null;
  } catch {}
  try {
    const archiveRoot = join(openspecRoot, "changes", "archive");
    const names = (await readdir(archiveRoot))
      .filter((name) => new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${change}$`).test(name));
    if (names.length !== 1) return null;
    const archived = join(archiveRoot, names[0]!);
    const [archiveInfo, tasksInfo] = await Promise.all([
      lstat(archived),
      lstat(join(archived, "tasks.md")),
    ]);
    if (!archiveInfo.isDirectory() || archiveInfo.isSymbolicLink()
      || !tasksInfo.isFile() || tasksInfo.isSymbolicLink() || tasksInfo.size > 512 * 1024) return null;
    const tasks = await Bun.file(join(archived, "tasks.md")).text();
    const checkboxes = [...tasks.matchAll(/^\s*-\s+\[([ xX])\]\s+(\d+(?:\.\d+)*)\s+\S.*$/gm)];
    if (checkboxes.length === 0 || checkboxes.some((match) => match[1]?.toLowerCase() !== "x")) return null;
    const identifiers = new Set<string>();
    checkboxes.forEach((match, index) => {
      identifiers.add(String(index + 1));
      identifiers.add(match[2]!);
    });
    return identifiers;
  } catch {
    return null;
  }
}

export async function reconcilePlanningState(
  input: ResolverInput,
  dependencies: {
    provider?: ReconciliationProvider;
  } = {},
): Promise<ResolverInput> {
  const bound = allBoundTasks(input);
  if (bound.length === 0) return input;

  const invalidGates = [...input.invalidGates];
  for (const task of bound) {
    if (task.planningBindingError || !task.planningBinding) {
      invalidGates.push(gate(
        "planning-provider-invalid",
        task,
        task.planningBindingError ?? "planning binding is incomplete",
      ));
    }
  }
  const validBound = bound.filter((task) => task.planningBinding);
  const duplicateKeys = new Set<string>();
  const seen = new Set<string>();
  for (const task of validBound) {
    const binding = task.planningBinding!;
    const key = `${binding.change}\0${binding.workItem}`;
    if (seen.has(key)) duplicateKeys.add(key);
    seen.add(key);
  }
  for (const task of validBound) {
    const binding = task.planningBinding!;
    if (duplicateKeys.has(`${binding.change}\0${binding.workItem}`)) {
      invalidGates.push(gate("planning-drift", task, "work item has duplicate Build Right bindings"));
    }
  }
  if (invalidGates.length > input.invalidGates.length) {
    return { ...input, invalidGates };
  }

  const provider = dependencies.provider ?? new OpenSpecAdapter();
  const changes = new Map<string, {
    inspect?: PlanningChangeResult;
    validation?: PlanningValidationResult;
    apply?: PlanningChangeResult;
    archived?: Set<string>;
  }>();
  for (const change of new Set(validBound.map((task) => task.planningBinding!.change))) {
    const archived = await archivedChangeWorkItems(input.cwd, change);
    if (archived) {
      changes.set(change, { archived });
      continue;
    }
    const inspect = await provider.inspect({ cwd: input.cwd, change });
    if (!inspect.ok) {
      changes.set(change, { inspect });
      continue;
    }
    const validation = await provider.validate({ cwd: input.cwd, change });
    if (!validation.ok || !validation.valid) {
      changes.set(change, { inspect, validation });
      continue;
    }
    const apply = await provider.applyInstructions({ cwd: input.cwd, change });
    changes.set(change, { inspect, validation, apply });
  }

  const reconcileTask = (task: TaskSummary): TaskSummary => {
    const binding = task.planningBinding;
    if (!binding) return task;
    const state = changes.get(binding.change);
    if (!state) {
      invalidGates.push(gate("planning-provider-invalid", task, "change inspection result is missing"));
      return task;
    }
    if (state.archived) {
      if (!state.archived.has(binding.workItem)) {
        invalidGates.push(gate("planning-drift", task, "bound work item is absent from the archived change"));
        return task;
      }
      if (task.status !== "complete" || !task.completionEvidenceValid) {
        invalidGates.push(gate("planning-drift", task, "archived change has a non-complete or unevidenced Build Right binding"));
        return task;
      }
      return { ...task, planningWorkItemComplete: true };
    }
    if (!state.inspect) {
      invalidGates.push(gate("planning-provider-invalid", task, "change inspection result is missing"));
      return task;
    }
    if (!state.inspect.ok) {
      invalidGates.push(failureGate(task, state.inspect));
      return task;
    }
    if (state.inspect.state !== "all-done") {
      invalidGates.push(gate("planning-drift", task, "bound change artifact graph is incomplete"));
      return task;
    }
    if (!state.validation?.ok) {
      invalidGates.push(failureGate(task, state.validation!));
      return task;
    }
    if (!state.validation.valid) {
      invalidGates.push(gate(
        "spec-validation-failed",
        task,
        state.validation.issues.join("; ") || "strict planning validation failed",
      ));
      return task;
    }
    if (!state.apply?.ok) {
      invalidGates.push(failureGate(task, state.apply!));
      return task;
    }
    const matches = state.apply.workItems.filter((item) => item.id === binding.workItem);
    if (matches.length !== 1) {
      invalidGates.push(gate("planning-drift", task, "bound work item is missing or ambiguous"));
      return task;
    }
    const complete = matches[0]!.complete;
    if (task.status === "complete" && !complete) {
      invalidGates.push(gate("planning-drift", task, "Build Right is complete but planning work item is unchecked"));
    } else if ((task.status === "ready" || task.status === "active" || task.status === "planned") && complete) {
      invalidGates.push(gate("planning-drift", task, "planning work item is checked before Build Right completion"));
    } else if (task.status === "complete" && !task.completionEvidenceValid) {
      invalidGates.push(gate("planning-drift", task, "completed binding lacks valid Build Right evidence"));
    }
    return { ...task, planningWorkItemComplete: complete };
  };

  return {
    ...input,
    invalidGates,
    readyTasks: input.readyTasks.map(reconcileTask),
    activeTasks: input.activeTasks.map(reconcileTask),
    plannedTasks: input.plannedTasks?.map(reconcileTask),
    completedTasks: input.completedTasks.map(reconcileTask),
    evidence: [
      ...input.evidence,
      ...[...changes].map(([change, state]) => ({
        source: `openspec/changes/${change}`,
        summary: state.archived
          ? "managed planning state archived"
          : state.inspect?.ok
            ? `managed planning state ${state.inspect.state}`
            : `managed planning failure ${state.inspect?.code ?? "missing"}`,
      })),
    ],
  };
}
