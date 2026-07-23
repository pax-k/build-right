import type { ContinueResult, Gate, TaskSummary } from "./contracts";

function renderTask(task: TaskSummary): string {
  const planning = task.planningBinding
    ? ` | managed planning: ${task.planningBinding.change}/${task.planningBinding.workItem} ${task.planningWorkItemComplete ? "complete" : "pending"}`
    : "";
  return `- ${task.id} | ${task.status} | ${task.path || task.title} | tracker: ${task.tracker}${planning}`;
}

function renderGate(gate: Gate): string {
  return `- ${gate.type} | ${gate.status} | ${gate.source} | ${gate.reason}`;
}

export function renderMarkdown(result: ContinueResult, includeCompleted: boolean): string {
  const lines = [
    "# Build Right Continue Check",
    "",
    `CWD: ${result.cwd}`,
    `Decision: ${result.decision}`,
    `Confidence: ${result.confidence}`,
    "",
    "## Next Action",
    result.nextAction,
    "",
    "## Next Task",
    result.nextTask ? renderTask(result.nextTask) : "- none",
  ];

  lines.push("", "## Blocking Gates");
  lines.push(...(result.blockingGates.length > 0 ? result.blockingGates.map(renderGate) : ["- none"]));
  lines.push("", "## Ready Tasks");
  lines.push(...(result.readyTasks.length > 0 ? result.readyTasks.map(renderTask) : ["- none"]));
  lines.push("", "## Active Tasks");
  lines.push(...(result.activeTasks.length > 0 ? result.activeTasks.map(renderTask) : ["- none"]));
  lines.push("", "## External Follow-Ups");
  lines.push(...(result.externalFollowUps.length > 0 ? result.externalFollowUps.map(renderGate) : ["- none"]));

  if (includeCompleted) {
    lines.push("", "## Completed Tasks");
    lines.push(...(result.completedTasks.length > 0 ? result.completedTasks.map(renderTask) : ["- none"]));
  } else {
    lines.push("", "## Completed Task Count", String(result.completedTasks.length));
  }

  lines.push("", "## Evidence");
  lines.push(...result.evidence.map((item) => `- ${item.source}: ${item.summary}`));
  return `${lines.join("\n")}\n`;
}
