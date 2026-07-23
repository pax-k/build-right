import { lstat, realpath } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import type {
  ContinueArgs,
  EvidenceRef,
  Gate,
  ResolverInput,
  TaskSummary,
} from "./contracts";

const postReleaseTracker = "tasks/post-release-backlog.md";
const requiredFields = [
  "Status:",
  "Type:",
  "Owner:",
  "Assumption basis:",
  "Requirement basis:",
  "Reversibility:",
  "Learning objective:",
  "Source under test:",
];
const requiredSections = [
  "## Goal",
  "## Non-Goals",
  "## Required Reading",
  "## Acceptance Criteria",
  "## Baseline Evidence",
  "## Verification",
  "## Evidence Log",
  "## Blockers",
  "## Follow-Ups",
];

async function exists(cwd: string, path: string): Promise<boolean> {
  try {
    const target = resolve(cwd, path);
    const [root, canonical, info] = await Promise.all([
      realpath(cwd),
      realpath(target),
      lstat(target),
    ]);
    return info.isFile() && !info.isSymbolicLink()
      && !relative(root, canonical).startsWith("..");
  } catch {
    return false;
  }
}

async function readIfExists(cwd: string, path: string): Promise<string> {
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

async function globFiles(cwd: string, pattern: string): Promise<string[]> {
  const glob = new Bun.Glob(pattern);
  const files: string[] = [];
  for await (const file of glob.scan({ cwd, onlyFiles: true, dot: true })) {
    files.push(file);
  }
  return files.sort();
}

function statusLine(text: string): string {
  return text.match(/^Status:\s*(.+)$/m)?.[1]?.trim() ?? "missing";
}

function fieldLine(text: string, field: string): string | undefined {
  return text.match(new RegExp(`^${field}:\\s*(.+)$`, "m"))?.[1]?.trim();
}

function fieldLines(text: string, field: string): string[] {
  return [...text.matchAll(new RegExp(`^${field}:\\s*(.+)$`, "gm"))]
    .map((match) => match[1]?.trim() ?? "");
}

function titleLine(path: string, text: string): string {
  return text.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? path;
}

function section(text: string, heading: string): string {
  const lines = text.split("\n");
  const headingLine = `## ${heading}`;
  const start = lines.findIndex((line) => line.trim() === headingLine);
  if (start === -1) {
    return "";
  }

  const body: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line)) {
      break;
    }
    body.push(line);
  }
  return body.join("\n").trim();
}

function nextActionBlock(text: string): string {
  return section(text, "Next Action").replace(/\s+/g, " ").trim();
}

function splitTableLine(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseTable(sectionText: string): Record<string, string>[] {
  const lines = sectionText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"));
  if (lines.length < 2) {
    return [];
  }

  const headerLine = lines[0];
  if (!headerLine) {
    return [];
  }
  const headers = splitTableLine(headerLine);
  return lines.slice(2).map((line) => {
    const values = splitTableLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}

function normalizeStatus(status: string): string {
  return status.trim().toLowerCase();
}

const completedTrackerStatuses = new Set(["complete", "completed", "done"]);
const terminalTaskStatuses = new Set([
  "complete",
  "completed",
  "done",
  "deferred",
  "moved",
  "canceled",
  "cancelled",
  "split",
  "superseded",
]);

function compareTrackerPaths(left: string, right: string): number {
  if (left === postReleaseTracker && right !== postReleaseTracker) {
    return 1;
  }
  if (right === postReleaseTracker && left !== postReleaseTracker) {
    return -1;
  }
  return left.localeCompare(right, undefined, { numeric: true });
}

function isCompleteTrackerStatus(status: string): boolean {
  return completedTrackerStatuses.has(normalizeStatus(status));
}

function isTerminalTaskStatus(status: string): boolean {
  return terminalTaskStatuses.has(normalizeStatus(status));
}

function normalizeOwner(owner?: string): string {
  return (owner ?? "").trim().toLowerCase();
}

function isAiOwned(owner?: string): boolean {
  return ["ai", "agent", "codex"].includes(normalizeOwner(owner));
}

function isExternalOwner(owner?: string): boolean {
  return /external|vendor|provider|platform|service|third[- ]party|directory|search/i.test(owner ?? "");
}

function evidencePath(evidence: string): string {
  return evidence.match(/tasks\/issues\/[A-Za-z0-9._/-]+\.md/)?.[0] ?? "";
}

function missingContractFields(text: string): string[] {
  if (!text) {
    return requiredFields.concat(requiredSections);
  }
  const missing: string[] = [];
  for (const field of requiredFields) {
    if (!text.includes(field)) {
      missing.push(field);
    }
  }
  for (const item of requiredSections) {
    if (!text.includes(item)) {
      missing.push(item);
    }
  }
  return missing;
}

function planningFields(text: string): Pick<TaskSummary, "planningBinding" | "planningBindingError"> {
  const metadata = text.split(/\n##\s+/m)[0] ?? "";
  const providers = fieldLines(metadata, "Planning provider");
  const changes = fieldLines(metadata, "Change ref");
  const workItems = fieldLines(metadata, "Work item ref");
  const count = providers.length + changes.length + workItems.length;
  if (count === 0) return {};
  if (providers.length !== 1 || changes.length !== 1 || workItems.length !== 1) {
    return { planningBindingError: "planning binding fields must appear exactly once and together" };
  }
  if (providers[0] !== "openspec") {
    return { planningBindingError: "planning provider must be openspec" };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(changes[0] ?? "") || (changes[0]?.length ?? 0) > 80) {
    return { planningBindingError: "change reference is invalid" };
  }
  if (!/^\d+(?:\.\d+)*$/.test(workItems[0] ?? "") || (workItems[0]?.length ?? 0) > 40) {
    return { planningBindingError: "work item reference is invalid" };
  }
  return {
    planningBinding: {
      provider: "openspec",
      change: changes[0]!,
      workItem: workItems[0]!,
    },
  };
}

function completionEvidenceValid(text: string): boolean {
  const acceptance = section(text, "Acceptance Criteria");
  const evidence = section(text, "Evidence Log");
  const verification = section(text, "Verification Summary");
  const evidenceRows = parseTable(evidence);
  return /\[x\]/i.test(acceptance) && !/\[\s\]/.test(acceptance)
    && evidenceRows.some((row) =>
      /^(pass|passed)$/i.test(row.Result ?? "")
      && Boolean(row.Evidence)
      && !/not run|not yet|pending|n\/a|<[^>]+>/i.test(row.Evidence ?? ""))
    && verification.length > 0
    && /\bpass(?:ed)?\b/i.test(verification)
    && !/\bfail(?:ed|ure)?\b|\bnot run\b|\bpending\b/i.test(verification);
}

async function loadIssueTasks(cwd: string): Promise<Map<string, TaskSummary>> {
  const files = await globFiles(cwd, "tasks/issues/*.md");
  const tasks = new Map<string, TaskSummary>();
  let order = 10_000;

  for (const path of files) {
    const text = await readIfExists(cwd, path);
    const id = path.match(/\/(\d{3})-/)?.[1] ?? path;
    tasks.set(path, {
      id,
      title: titleLine(path, text),
      status: normalizeStatus(statusLine(text)),
      path,
      tracker: "untracked issue",
      evidence: path,
      order,
      owner: fieldLine(text, "Owner"),
      type: fieldLine(text, "Type"),
      assumptionBasis: fieldLine(text, "Assumption basis"),
      missingContractFields: missingContractFields(text),
      ...planningFields(text),
      completionEvidenceValid: completionEvidenceValid(text),
    });
    order += 1;
  }

  return tasks;
}

async function loadTrackerTasks(cwd: string, issues: Map<string, TaskSummary>, trackers: string[]): Promise<TaskSummary[]> {
  const tasks: TaskSummary[] = [];
  let order = 0;

  for (const tracker of trackers) {
    const text = await readIfExists(cwd, tracker);
    if (!text) {
      continue;
    }
    const rows = parseTable(section(text, "Tasks"));
    for (const row of rows) {
      const path = evidencePath(row.Evidence ?? "");
      const issue = path ? issues.get(path) : undefined;
      tasks.push({
        id: row.ID || issue?.id || path || `${tracker}:${order}`,
        title: row.Title || issue?.title || path || "Untitled task",
        status: normalizeStatus(row.Status || issue?.status || "missing"),
        path: path || issue?.path || "",
        tracker,
        evidence: row.Evidence || path,
        order,
        owner: issue?.owner,
        type: issue?.type,
        assumptionBasis: issue?.assumptionBasis,
        missingContractFields: issue?.missingContractFields ?? [],
        planningBinding: issue?.planningBinding,
        planningBindingError: issue?.planningBindingError,
        completionEvidenceValid: issue?.completionEvidenceValid,
      });
      order += 1;
    }
  }

  const tracked = new Set(tasks.map((task) => task.path).filter(Boolean));
  for (const issue of issues.values()) {
    if (!tracked.has(issue.path)) {
      tasks.push(issue);
    }
  }

  return tasks.sort((left, right) => left.order - right.order);
}

function blueprintGates(text: string): Gate[] {
  const gates: Gate[] = [];
  const rows = parseTable(section(text, "Readiness"));

  for (const row of rows) {
    const status = normalizeStatus(row.Status ?? "");
    const combined = `${row.Gate ?? ""} ${row.Status ?? ""} ${row.Notes ?? ""}`;
    if (status.includes("needs-founder") || /founder|primary user|positioning|promise|mvp/i.test(combined)) {
      if (status !== "ready" && status !== "complete") {
        gates.push({
          type: "founder-owned",
          status: row.Status ?? "",
          source: "docs/blueprint-status.md",
          reason: `${row.Gate ?? "readiness gate"}: ${row.Notes ?? row.Status ?? ""}`.trim(),
        });
      }
    }
  }

  return gates;
}

function openQuestionGates(text: string): Gate[] {
  if (!text) {
    return [];
  }
  const status = statusLine(text);
  const batch = section(text, "Founder Validation Batch");
  if (/needs-founder|founder/i.test(status) || /\d+\.\s+/.test(batch)) {
    return [
      {
        type: "founder-owned",
        status,
        source: "docs/open-questions.md",
        reason: batch.split("\n").find((line) => line.trim())?.trim() ?? "founder validation is pending",
      },
    ];
  }
  return [];
}

function releaseGateSignals(text: string): { blocking: Gate[]; external: Gate[] } {
  const blocking: Gate[] = [];
  const external: Gate[] = [];
  const rows = parseTable(section(text, "Gates"));

  for (const row of rows) {
    const gateName = row.Gate ?? "release gate";
    const status = normalizeStatus(row.Status ?? "");
    const combined = `${gateName} ${row.Status ?? ""} ${row["Command or Proof"] ?? ""}`;
    if (/partial-needs-rerun|mismatch/.test(status)) {
      blocking.push({
        type: "source-mismatch",
        status: row.Status ?? "",
        source: "docs/release-gates.md",
        reason: gateName,
      });
    } else if (/fail|failed/.test(status)) {
      blocking.push({
        type: "failed-verification",
        status: row.Status ?? "",
        source: "docs/release-gates.md",
        reason: gateName,
      });
    } else if (/stale/.test(status)) {
      blocking.push({
        type: "stale",
        status: row.Status ?? "",
        source: "docs/release-gates.md",
        reason: gateName,
      });
    } else if (/follow-up|external|unproven|directory|search/i.test(combined) && status !== "ready") {
      external.push({
        type: "external-state",
        status: row.Status ?? "",
        source: "docs/release-gates.md",
        reason: gateName,
      });
    } else if (/release-claim/i.test(combined) && status !== "ready") {
      blocking.push({
        type: "release-claim",
        status: row.Status ?? "",
        source: "docs/release-gates.md",
        reason: gateName,
      });
    }
  }

  return { blocking, external };
}

function backlogNextActionGate(text: string): Gate | null {
  const nextAction = nextActionBlock(text);
  if (!nextAction) {
    return null;
  }
  if (/founder/i.test(nextAction)) {
    return {
      type: "founder-owned",
      status: statusLine(text),
      source: "tasks/post-release-backlog.md",
      reason: nextAction,
    };
  }
  if (/external|directory|search|discovery|no ai-owned backlog task is ready/i.test(nextAction)) {
    return {
      type: "external-state",
      status: statusLine(text),
      source: "tasks/post-release-backlog.md",
      reason: nextAction,
    };
  }
  return null;
}

function taskOwnerGates(tasks: TaskSummary[]): { founder: Gate[]; external: Gate[] } {
  const founder: Gate[] = [];
  const external: Gate[] = [];

  for (const task of tasks.filter((item) => item.status === "ready" || item.status === "active")) {
    if (!task.owner || isAiOwned(task.owner)) {
      continue;
    }

    const gate: Gate = {
      type: isExternalOwner(task.owner) ? "external-state" : "founder-owned",
      status: task.status,
      source: task.path || task.tracker,
      reason: `task ${task.id} is owned by ${task.owner}, not AI`,
    };
    if (gate.type === "external-state") {
      external.push(gate);
    } else {
      founder.push(gate);
    }
  }

  return { founder, external };
}

function conflictGates(text: string): { founder: Gate[]; external: Gate[]; blocking: Gate[] } {
  const founder: Gate[] = [];
  const external: Gate[] = [];
  const blocking: Gate[] = [];
  const rows = parseTable(section(text, "Conflicts"));

  for (const row of rows) {
    const conflict = row.Conflict ?? "";
    const status = normalizeStatus(row.Status ?? "");
    const owner = row.Owner ?? "";
    if (!conflict || conflict.includes("<") || ["resolved", "closed", "complete", "done", "none"].includes(status)) {
      continue;
    }

    const gate: Gate = {
      type: isExternalOwner(owner) ? "external-state" : isAiOwned(owner) ? "open-conflict" : "founder-owned",
      status: row.Status ?? "open",
      source: "docs/conflicts.md",
      reason: conflict,
    };
    if (gate.type === "external-state") {
      external.push(gate);
    } else if (gate.type === "founder-owned") {
      founder.push(gate);
    } else {
      blocking.push(gate);
    }
  }

  return { founder, external, blocking };
}

async function invalidStateGates(cwd: string, tasks: TaskSummary[], strict: boolean): Promise<Gate[]> {
  if (!strict) {
    return [];
  }
  const gates: Gate[] = [];
  const activeTasks = tasks.filter((task) => task.status === "active");
  if (activeTasks.length > 1) {
    gates.push({
      type: "invalid-state",
      status: "strict",
      source: "tasks",
      reason: `multiple active tasks: ${activeTasks.map((task) => task.path || task.id).join(", ")}`,
    });
  }

  for (const task of tasks.filter((item) => item.status === "ready" || item.status === "active")) {
    if (!task.path || !(await exists(cwd, task.path))) {
      gates.push({
        type: "invalid-state",
        status: task.status,
        source: task.tracker,
        reason: `task ${task.id} points at missing evidence path`,
      });
    }
    if (task.missingContractFields.length > 0) {
      gates.push({
        type: "invalid-state",
        status: task.status,
        source: task.path || task.tracker,
        reason: `task ${task.id} is missing contract fields: ${task.missingContractFields.join(", ")}`,
      });
    }
  }

  return gates;
}

async function sprintClosureGates(cwd: string, sprintTrackers: string[], strict: boolean): Promise<Gate[]> {
  if (!strict) {
    return [];
  }
  const gates: Gate[] = [];
  for (const tracker of sprintTrackers) {
    const trackerText = await readIfExists(cwd, tracker);
    if (!isCompleteTrackerStatus(statusLine(trackerText))) {
      continue;
    }
    for (const row of parseTable(section(trackerText, "Tasks"))) {
      const status = normalizeStatus(row.Status ?? "");
      if (isTerminalTaskStatus(status)) {
        continue;
      }
      const taskId = row.ID || row.Id || row.id || row.Title || "unknown task";
      gates.push({
        type: "invalid-state",
        status: row.Status || "missing",
        source: tracker,
        reason: `${tracker} is complete but ${taskId} is ${row.Status || "missing"}; complete, defer, move, cancel, split, or supersede it before advancing.`,
      });
    }
  }
  return gates;
}

export async function inspectMarkdownRepository(args: Pick<ContinueArgs, "cwd" | "strict">): Promise<ResolverInput> {
  const evidence: EvidenceRef[] = [];
  const blueprint = await readIfExists(args.cwd, "docs/blueprint-status.md");
  const openQuestions = await readIfExists(args.cwd, "docs/open-questions.md");
  const releaseGates = await readIfExists(args.cwd, "docs/release-gates.md");
  const conflicts = await readIfExists(args.cwd, "docs/conflicts.md");
  const postRelease = await readIfExists(args.cwd, postReleaseTracker);
  const sprintTrackers = await globFiles(args.cwd, "tasks/sprint-*.md");
  const trackers = [...sprintTrackers, ...(postRelease ? [postReleaseTracker] : [])].sort(compareTrackerPaths);
  const issues = await loadIssueTasks(args.cwd);
  const tasks = await loadTrackerTasks(args.cwd, issues, trackers);

  if (blueprint) {
    evidence.push({ source: "docs/blueprint-status.md", summary: `status ${statusLine(blueprint)}` });
  }
  if (openQuestions) {
    evidence.push({ source: "docs/open-questions.md", summary: `status ${statusLine(openQuestions)}` });
  }
  if (releaseGates) {
    evidence.push({ source: "docs/release-gates.md", summary: `status ${statusLine(releaseGates)}` });
  }
  if (conflicts) {
    evidence.push({ source: "docs/conflicts.md", summary: `status ${statusLine(conflicts)}` });
  }
  for (const tracker of sprintTrackers.sort(compareTrackerPaths)) {
    const text = await readIfExists(args.cwd, tracker);
    if (text) {
      evidence.push({ source: tracker, summary: `status ${statusLine(text)}` });
    }
  }
  if (postRelease) {
    evidence.push({ source: postReleaseTracker, summary: `status ${statusLine(postRelease)}` });
  }

  const invalidGates = [
    ...(await invalidStateGates(args.cwd, tasks, args.strict)),
    ...(await sprintClosureGates(args.cwd, sprintTrackers, args.strict)),
  ];
  const ownerSignals = taskOwnerGates(tasks);
  const conflictSignals = conflictGates(conflicts);
  const founderGates = [
    ...blueprintGates(blueprint),
    ...openQuestionGates(openQuestions),
    ...ownerSignals.founder,
    ...conflictSignals.founder,
  ];
  const releaseSignals = releaseGateSignals(releaseGates);
  const backlogGate = backlogNextActionGate(postRelease);
  if (backlogGate?.type === "founder-owned") {
    founderGates.push(backlogGate);
  }
  const externalFollowUps = [
    ...releaseSignals.external,
    ...ownerSignals.external,
    ...conflictSignals.external,
    ...(backlogGate?.type === "external-state" ? [backlogGate] : []),
  ];
  const aiBlockingGates = [
    ...releaseSignals.blocking,
    ...conflictSignals.blocking,
  ];
  const activeTasks = tasks.filter((task) => task.status === "active");
  const readyTasks = tasks.filter((task) => task.status === "ready");
  const plannedTasks = tasks.filter((task) => task.status === "planned");
  const completedTasks = tasks.filter((task) => task.status === "complete");
  const hasExecutionRules = await exists(args.cwd, "docs/execution-rules.md");
  const hasTracker = trackers.length > 0;
  const missingExecutionSurface = !hasTracker || !hasExecutionRules || tasks.length === 0;

  return {
    cwd: args.cwd,
    invalidGates,
    founderGates,
    externalFollowUps,
    aiBlockingGates,
    readyTasks,
    activeTasks,
    plannedTasks,
    completedTasks,
    evidence,
    missingExecutionSurface,
  };
}
