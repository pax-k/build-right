import type {
  ContinueResult,
  Decision,
  ResolverInput,
  TaskSummary,
} from "./contracts";

function normalizeOwner(owner?: string): string {
  return (owner ?? "").trim().toLowerCase();
}

function isAiOwned(owner?: string): boolean {
  return ["ai", "agent", "codex"].includes(normalizeOwner(owner));
}

export function resolveState(input: ResolverInput): ContinueResult {
  const {
    cwd,
    invalidGates,
    founderGates,
    externalFollowUps,
    aiBlockingGates,
    readyTasks,
    activeTasks,
    completedTasks,
    evidence,
    missingExecutionSurface,
  } = input;
  const blockingGates = [
    ...invalidGates,
    ...founderGates,
    ...aiBlockingGates,
    ...externalFollowUps,
  ];
  const executableActiveTasks = activeTasks.filter((task) => isAiOwned(task.owner));
  const executableReadyTasks = readyTasks.filter((task) => isAiOwned(task.owner));

  let decision: Decision = "no-ready-task";
  let nextAction = "No ready AI-owned task found. Stop and report current state.";
  let nextTask: TaskSummary | null = null;

  if (invalidGates.length > 0) {
    decision = "invalid-state";
    nextAction = invalidGates[0]?.reason ?? "Resolve invalid state.";
  } else if (founderGates.length > 0) {
    decision = "ask-founder";
    nextAction = founderGates[0]?.reason ?? "Resolve founder-owned gate.";
  } else if (externalFollowUps.length > 0) {
    decision = "wait-external";
    nextAction = externalFollowUps[0]?.reason ?? "Wait for external follow-up.";
  } else if (aiBlockingGates.length > 0) {
    decision = "create-blocker";
    nextAction = aiBlockingGates[0]?.reason ?? "Create the smallest AI-owned blocker.";
  } else if (executableActiveTasks.length > 0) {
    decision = "continue-active-task";
    const activeTask = executableActiveTasks[0];
    nextTask = activeTask ?? null;
    nextAction = activeTask
      ? `Continue active task ${activeTask.id}: ${activeTask.path || activeTask.title}`
      : "Continue active task.";
  } else if (executableReadyTasks.length > 0) {
    decision = "execute-task";
    const readyTask = executableReadyTasks[0];
    nextTask = readyTask ?? null;
    nextAction = readyTask
      ? `Execute ready task ${readyTask.id}: ${readyTask.path || readyTask.title}`
      : "Execute ready task.";
  } else if (missingExecutionSurface) {
    decision = "create-blocker";
    nextAction = "Create the smallest Sprint 0 blocker to establish execution rules and task tracking.";
  }

  const confidence = invalidGates.length > 0
    ? "low"
    : blockingGates.length > 0 || missingExecutionSurface
      ? "medium"
      : "high";

  return {
    cwd,
    decision,
    nextAction,
    nextTask,
    blockingGates,
    readyTasks,
    activeTasks,
    completedTasks,
    externalFollowUps,
    evidence,
    confidence,
  };
}
