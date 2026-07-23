import type { ResolverInput } from "./contracts";
import { reconcilePlanningState } from "./planning-reconciliation";
import { ensureOpenSpec } from "./openspec/safe-setup";
import { OpenSpecAdapter } from "./openspec/adapter";
import type { PlanningProvider } from "./openspec/provider-contracts";

type ReconciliationProvider = Pick<PlanningProvider, "inspect" | "validate" | "applyInstructions">;

function hasPlanningBinding(input: ResolverInput): boolean {
  return [
    ...input.readyTasks,
    ...input.activeTasks,
    ...(input.plannedTasks ?? []),
    ...input.completedTasks,
  ].some((task) => task.planningBinding || task.planningBindingError);
}

export async function orchestrateExecutionPlanning(
  input: ResolverInput,
  dependencies: {
    ensure?: typeof ensureOpenSpec;
    provider?: ReconciliationProvider;
  } = {},
): Promise<ResolverInput> {
  if (!hasPlanningBinding(input)) return input;
  const setup = await (dependencies.ensure ?? ensureOpenSpec)({ cwd: input.cwd });
  if (!setup.ok) {
    const unavailable = ["provider-unavailable", "unsupported-version", "timeout"].includes(setup.code);
    return {
      ...input,
      invalidGates: [
        ...input.invalidGates,
        {
          type: unavailable ? "planning-provider-unavailable" : "planning-provider-invalid",
          status: setup.code,
          source: "openspec",
          reason: `managed planning setup failed: ${setup.code}: ${setup.message}`,
        },
      ],
    };
  }
  return reconcilePlanningState(input, { provider: dependencies.provider ?? new OpenSpecAdapter() });
}
