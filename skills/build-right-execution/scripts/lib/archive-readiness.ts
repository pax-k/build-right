import { join, relative, resolve } from "node:path";
import { lstat, realpath } from "node:fs/promises";
import type { Gate, TaskSummary } from "./contracts";
import { inspectMarkdownRepository } from "./markdown-provider";
import { reconcilePlanningState } from "./planning-reconciliation";
import { OpenSpecAdapter, validChangeName } from "./openspec/adapter";
import type { PlanningProvider } from "./openspec/provider-contracts";
import type { ArchiveReadinessProof } from "./openspec/orchestrator";

type ReadinessProvider = Pick<PlanningProvider, "inspect" | "validate" | "applyInstructions">;

export type ArchiveReadinessResult =
  | (ArchiveReadinessProof & {
      decision: "archive-ready";
      providerVersion: string;
      boundTaskPaths: string[];
    })
  | {
      decision: "archive-blocked";
      repositoryRoot: string;
      change: string;
      checkedAt: string;
      checks: {
        openspecValidation: "pass" | "fail";
        tasksComplete: boolean;
        buildRightEvidenceComplete: boolean;
        projectVerification: "pass" | "fail";
        conflictsClosed: boolean;
        releaseGatesSatisfied: boolean;
        specSyncState: "synced" | "sync-ready" | "contradictory";
      };
      blockingGates: Gate[];
    };

function section(text: string, heading: string): string {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start < 0) return "";
  const body: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line)) break;
    body.push(line);
  }
  return body.join("\n").trim();
}

function tableRows(text: string, heading: string): Record<string, string>[] {
  const lines = section(text, heading).split("\n")
    .filter((line) => line.trim().startsWith("|") && line.trim().endsWith("|"));
  if (lines.length < 3) return [];
  const cells = (line: string) =>
    line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
  const headers = cells(lines[0]!);
  return lines.slice(2).map((line) => {
    const values = cells(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

async function read(cwd: string, path: string): Promise<string> {
  try {
    const target = resolve(cwd, path);
    const [root, canonical, info] = await Promise.all([
      realpath(cwd),
      realpath(target),
      lstat(target),
    ]);
    if (!info.isFile() || info.isSymbolicLink() || info.size > 2 * 1024 * 1024
      || relative(root, canonical).startsWith("..")) return "";
    return Bun.file(target).text();
  } catch {
    return "";
  }
}

async function specSyncState(cwd: string, change: string): Promise<"synced" | "sync-ready" | "contradictory"> {
  const root = join(cwd, "openspec", "changes", change, "specs");
  try {
    const info = await lstat(root);
    if (!info.isDirectory() || info.isSymbolicLink()) return "contradictory";
  } catch {
    return "synced";
  }
  const files = [...new Bun.Glob("**/*").scanSync({ cwd: root, onlyFiles: false, dot: true })];
  let specCount = 0;
  for (const relative of files) {
    try {
      const info = await lstat(join(root, relative));
      if (info.isSymbolicLink() || (!info.isDirectory() && !info.isFile())) return "contradictory";
      if (info.isFile()) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\/spec\.md$/.test(relative) || info.size > 256 * 1024) {
          return "contradictory";
        }
        specCount += 1;
      }
    } catch {
      return "contradictory";
    }
  }
  return specCount > 0 ? "sync-ready" : "synced";
}

function tasksForChange(tasks: TaskSummary[], change: string): TaskSummary[] {
  return tasks.filter((task) => task.planningBinding?.change === change);
}

function blocking(type: Gate["type"], status: string, source: string, reason: string): Gate {
  return { type, status, source, reason };
}

export async function inspectArchiveReadiness(
  input: { cwd: string; change: string },
  provider: ReadinessProvider = new OpenSpecAdapter(),
): Promise<ArchiveReadinessResult> {
  const cwd = await realpath(input.cwd).catch(() => input.cwd);
  const checkedAt = new Date().toISOString();
  const gates: Gate[] = [];
  if (!validChangeName(input.change)) {
    return {
      decision: "archive-blocked",
      repositoryRoot: cwd,
      change: input.change,
      checkedAt,
      checks: {
        openspecValidation: "fail", tasksComplete: false, buildRightEvidenceComplete: false,
        projectVerification: "fail", conflictsClosed: false, releaseGatesSatisfied: false,
        specSyncState: "contradictory",
      },
      blockingGates: [blocking("planning-provider-invalid", "invalid", "archive-readiness", "invalid change identifier")],
    };
  }

  const markdown = await inspectMarkdownRepository({ cwd, strict: true });
  const reconciled = await reconcilePlanningState(markdown, { provider });
  gates.push(...reconciled.invalidGates, ...reconciled.founderGates, ...reconciled.externalFollowUps, ...reconciled.aiBlockingGates);
  const allTasks = [
    ...reconciled.readyTasks,
    ...reconciled.activeTasks,
    ...(reconciled.plannedTasks ?? []),
    ...reconciled.completedTasks,
  ];
  const boundTasks = tasksForChange(allTasks, input.change);
  const tasksComplete = boundTasks.length > 0 && boundTasks.every((task) =>
    task.status === "complete" && task.planningWorkItemComplete === true);
  const buildRightEvidenceComplete = boundTasks.length > 0
    && boundTasks.every((task) => task.completionEvidenceValid === true);
  if (!tasksComplete) gates.push(blocking("planning-drift", "blocked", "tasks", "not every bound task and work item is complete"));
  if (!buildRightEvidenceComplete) gates.push(blocking("failed-verification", "blocked", "tasks", "bound task completion evidence is incomplete"));

  const validation = await provider.validate({ cwd, change: input.change });
  const apply = await provider.applyInstructions({ cwd, change: input.change });
  const openspecValidation = validation.ok && validation.valid ? "pass" : "fail";
  if (openspecValidation === "fail") {
    gates.push(blocking("spec-validation-failed", "blocked", `openspec/changes/${input.change}`, "fresh strict change validation failed"));
  }
  if (!apply.ok || apply.state !== "all-done" || apply.workItems.some((item) => !item.complete)) {
    gates.push(blocking("planning-drift", "blocked", `openspec/changes/${input.change}/tasks.md`, "provider work items are incomplete or invalid"));
  }

  const releaseText = await read(cwd, "docs/release-gates.md");
  const releaseRows = tableRows(releaseText, "Gates");
  const allowedRelease = /^(ready|pass|passed|complete|completed|skipped-with-risk)$/i;
  const releaseGatesSatisfied = releaseRows.length > 0
    && releaseRows.every((row) => allowedRelease.test(row.Status ?? ""));
  const projectVerification = releaseGatesSatisfied
    && releaseRows.some((row) => /validation|verification|test|build|type/i.test(`${row.Gate ?? ""} ${row["Command or Proof"] ?? ""}`))
    ? "pass"
    : "fail";
  if (!releaseGatesSatisfied) gates.push(blocking("release-claim", "blocked", "docs/release-gates.md", "release gates are missing or not satisfied"));
  if (projectVerification === "fail") gates.push(blocking("failed-verification", "blocked", "docs/release-gates.md", "project verification is not freshly recorded"));

  const conflictsText = await read(cwd, "docs/conflicts.md");
  const conflictRows = tableRows(conflictsText, "Conflicts");
  const conflictsClosed = conflictRows.length === 0
    ? /none|resolved/i.test(conflictsText)
    : conflictRows.every((row) =>
      /^(resolved|closed|complete|done|none)$/i.test(row.Status ?? "")
      || /^(none|n\/a)$/i.test(row.Conflict ?? ""));
  if (!conflictsClosed) gates.push(blocking("open-conflict", "blocked", "docs/conflicts.md", "open conflicts prevent finalization"));

  const sync = await specSyncState(cwd, input.change);
  if (sync === "contradictory") gates.push(blocking("spec-sync-pending", "blocked", `openspec/changes/${input.change}/specs`, "spec synchronization surface is contradictory"));
  const uniqueGates = [...new Map(gates.map((gate) => [`${gate.type}\0${gate.source}\0${gate.reason}`, gate])).values()];
  const checks = {
    openspecValidation,
    tasksComplete,
    buildRightEvidenceComplete,
    projectVerification,
    conflictsClosed,
    releaseGatesSatisfied,
    specSyncState: sync,
  } as const;
  if (uniqueGates.length > 0) {
    return {
      decision: "archive-blocked",
      repositoryRoot: cwd,
      change: input.change,
      checkedAt,
      checks,
      blockingGates: uniqueGates,
    };
  }
  if (sync === "contradictory") {
    return {
      decision: "archive-blocked",
      repositoryRoot: cwd,
      change: input.change,
      checkedAt,
      checks,
      blockingGates: [blocking("spec-sync-pending", "blocked", `openspec/changes/${input.change}/specs`, "spec synchronization surface is contradictory")],
    };
  }
  const inspected = await provider.inspect({ cwd, change: input.change });
  if (!inspected.ok) {
    return {
      decision: "archive-blocked",
      repositoryRoot: cwd,
      change: input.change,
      checkedAt,
      checks,
      blockingGates: [blocking("planning-provider-unavailable", "blocked", `openspec/changes/${input.change}`, "final provider inspection failed")],
    };
  }
  return {
    decision: "archive-ready",
    repositoryRoot: cwd,
    change: input.change,
    checkedAt,
    checks: {
      openspecValidation: "pass",
      tasksComplete: true,
      buildRightEvidenceComplete: true,
      projectVerification: "pass",
      conflictsClosed: true,
      releaseGatesSatisfied: true,
      specSyncState: sync,
    },
    blockingGates: [],
    providerVersion: inspected.providerVersion,
    boundTaskPaths: boundTasks.map((task) => task.path),
  };
}
