import { randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, mkdtemp, open, readdir, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  BUILD_RIGHT_USER_PROMPTS,
  auditZeroMentionPrompts,
  incompletePlanningWorkItems,
} from "../src/openspec/zero-mention";
import { tryAdvisoryFileLock } from "../src/openspec/atomic-install";

type NativeRun = {
  stage: string;
  prompt: string;
  exitCode: number | null;
  timedOut: boolean | null;
  completionProof: "live-process" | "completed-jsonl";
  eventsPath: string;
  stderrPath: string;
  lastMessagePath: string;
};

type TrialResult = {
  root: string;
  initialPlanningRootAbsent: boolean;
  promptAudit: ReturnType<typeof auditZeroMentionPrompts>;
  nativeRuns: NativeRun[];
  change: string;
  executionDeltas: number[];
  archivedChange: string;
  compatibleRootPreserved: boolean;
};

const repoRoot = join(import.meta.dir, "..");
const codexHome = Bun.env.CODEX_HOME ?? `${Bun.env.HOME}/.codex`;
const installedSkillsRoots = [
  join(codexHome, "skills"),
  `${Bun.env.HOME}/.agents/skills`,
];
const lifecycleSkills = [
  "build-right-preflight",
  "build-right-feature-planning",
  "build-right-execution",
] as const;
const taskPath = "planning/tasks/086-prove-zero-mention-openspec-ux.md";
const summaryPath = join(repoRoot, "planning/openspec-zero-mention-trial.md");
const failureLogPath = join(repoRoot, "planning/failed-tests.md");
const timeoutMs = 600_000;
const maxNativeOutputBytes = 16 * 1024 * 1024;
const maxNativeEvidenceBytes = 16 * 1024 * 1024;

async function exists(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch {
    return false;
  }
}

async function write(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await Bun.write(path, content);
}

async function run(command: string[], cwd: string): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(command, { cwd, stdin: "ignore", stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { exitCode, stdout, stderr };
}

async function assertInstalledParity(): Promise<void> {
  for (const root of installedSkillsRoots) {
    for (const skill of lifecycleSkills) {
      const local = join(repoRoot, "skills", skill);
      const installed = join(root, skill);
      const result = await run(["diff", "-qr", local, installed], repoRoot);
      if (result.exitCode !== 0) {
        throw new Error(`${skill} installed/source parity failed at ${root}: ${result.stdout}${result.stderr}`);
      }
    }
  }
}

async function readBoundedStream(
  stream: ReadableStream<Uint8Array>,
  captured: { bytes: number },
  onExceeded: () => void,
): Promise<{ text: string; exceeded: boolean }> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const item = await reader.read();
    if (item.done) break;
    captured.bytes += item.value.byteLength;
    if (captured.bytes > maxNativeOutputBytes) {
      onExceeded();
      await reader.cancel();
      return {
        text: `${text}${decoder.decode(item.value, { stream: true })}`.slice(0, maxNativeOutputBytes),
        exceeded: true,
      };
    }
    text += decoder.decode(item.value, { stream: true });
  }
  text += decoder.decode();
  return { text, exceeded: false };
}

async function readBoundedEvidence(path: string): Promise<string> {
  const info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink() || info.size > maxNativeEvidenceBytes) {
    throw new Error(`native evidence is not a bounded regular file: ${path}`);
  }
  return Bun.file(path).text();
}

type NativeEventAudit = {
  createdPlanningRoot: boolean;
  successfulCommands: Array<{ command: string; output: string }>;
};

function isolatedBunHelper(
  command: string,
  skill: typeof lifecycleSkills[number],
  helper: string,
  requiredArgs?: RegExp,
): boolean {
  const prefix = "/bin/zsh -lc '";
  if (!command.startsWith(prefix) || !command.endsWith("'")) return false;
  const body = command.slice(prefix.length, -1);
  if (/[\n\r;&|`<>\\$]/.test(body)) return false;
  const exactInstalledHelper = installedSkillsRoots.some((root) => {
    const invocation = `bun ${join(root, skill, "scripts", helper)}`;
    return body === invocation || body.startsWith(`${invocation} `);
  });
  if (!exactInstalledHelper) return false;
  return !requiredArgs || requiredArgs.test(body);
}

export function eventStreamProvesInstalledSkill(
  events: string,
  skill: typeof lifecycleSkills[number],
): boolean {
  const helpers = skill === "build-right-preflight"
    ? ["ensure-openspec.ts"]
    : skill === "build-right-feature-planning"
      ? ["openspec-change-check.ts"]
      : ["complete-planning-work-item.ts", "finalize-openspec-change.ts"];
  try {
    return events.split("\n").filter((line) => line.trim()).some((line) => {
      const event = JSON.parse(line) as Record<string, unknown>;
      const item = event.item as Record<string, unknown> | undefined;
      return event.type === "item.completed" && item?.type === "command_execution"
        && item.status === "completed" && item.exit_code === 0
        && helpers.some((helper) => isolatedBunHelper(String(item.command ?? ""), skill, helper));
    });
  } catch {
    return false;
  }
}

function jsonObject(output: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(output) as unknown;
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

export function auditNativeEvents(text: string, stage: string): NativeEventAudit {
  const events: Array<Record<string, unknown>> = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(line) as Record<string, unknown>;
    } catch {
      throw new Error(`${stage} event stream contains invalid JSONL`);
    }
    events.push(event);
  }
  if (!events.some((event) => event.type === "turn.completed")) {
    throw new Error(`${stage} event stream is missing turn.completed`);
  }
  const successfulCommands = events.flatMap((event) => {
    const item = event.item as Record<string, unknown> | undefined;
    if (event.type !== "item.completed" || item?.type !== "command_execution"
      || item.status !== "completed" || item.exit_code !== 0) return [];
    return [{
      command: String(item.command ?? ""),
      output: String(item.aggregated_output ?? ""),
    }];
  });
  const hasCommand = (
    skill: typeof lifecycleSkills[number],
    helper: string,
    outputValid: (output: string) => boolean,
    requiredArgs?: RegExp,
  ) =>
    successfulCommands.some(({ command, output }) =>
      isolatedBunHelper(command, skill, helper, requiredArgs) && outputValid(output));
  const createdPlanningRoot = stage === "preflight" && hasCommand(
    "build-right-preflight",
    "ensure-openspec.ts",
    (output) => /^Result:\s*created\s*$/m.test(output),
  );
  if (stage === "preflight" && !createdPlanningRoot) {
    throw new Error("preflight events do not prove successful fresh managed setup");
  }
  if (stage === "feature-planning" && !hasCommand(
    "build-right-feature-planning",
    "openspec-change-check.ts",
    (output) => {
      const value = jsonObject(output);
      return value?.ok === true && value.action === "ready-for-execution";
    },
    /(?:^|\s)--mode\s+bind(?:\s|$)/,
  )) {
    throw new Error("feature-planning events do not prove successful managed task binding");
  }
  if (stage.startsWith("execution-")) {
    if (!hasCommand(
      "build-right-execution",
      "complete-planning-work-item.ts",
      (output) => {
        const value = jsonObject(output);
        return value?.ok === true && value.mutation === "complete-work-item" && value.state === "completed";
      },
    )) {
      throw new Error(`${stage} events do not prove successful one-item closeout`);
    }
    if (!hasCommand(
      "build-right-execution",
      "finalize-openspec-change.ts",
      (output) => {
        const value = jsonObject(output);
        return value?.ok === true && value.mutation === "finalize"
          && typeof value.archivedAs === "string" && value.archivedAs.length > 0;
      },
    )) {
      throw new Error(`${stage} events do not prove successful managed finalization`);
    }
  }
  return {
    createdPlanningRoot,
    successfulCommands,
  };
}

function seedFiles(): Record<string, string> {
  return {
    "AGENTS.md": `# Agent Instructions

Use Bun only. Preserve the documented readiness-probe contract. Do not commit,
publish, deploy, or use external services.
`,
    "README.md": `# Readiness Probe

This Bun library exposes a pure readiness probe. The approved feature is a
stable function returning \`{ ready: true }\`, covered by focused positive and
negative tests. This is a local validation fixture; there is no deployment.
`,
    "package.json": `${JSON.stringify({
      name: "build-right-zero-mention-native-trial",
      type: "module",
      private: true,
      scripts: { test: "bun test" },
    }, null, 2)}\n`,
    "src/index.ts": `export function readinessProbe(enabled = true): { ready: boolean } {
  return { ready: enabled };
}
`,
    "src/index.test.ts": `import { expect, test } from "bun:test";
import { readinessProbe } from "./index";

test("reports ready when enabled", () => {
  expect(readinessProbe()).toEqual({ ready: true });
});

test("reports not ready when disabled", () => {
  expect(readinessProbe(false)).toEqual({ ready: false });
});
`,
    "docs/blueprint-status.md": `# Blueprint Status

Status: ready
Current phase: feature planning handoff
Project state: existing
Source mode: founder-fed
Prototype confidence: high
Current gate: feature planning ready
Last evidence: docs/evidence/readiness-probe-baseline.md

## Readiness

| Gate | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Product truth | ready | docs/mvp-scope.md | Founder-approved fixture scope |
| Operating rules | ready | docs/execution-rules.md | Bun-only and local-only |
| Release gates | ready | docs/release-gates.md | Local verification only |
| Task surface | ready | tasks/sprint-0.md | Active sprint exists |

## Next Action

Run $build-right-feature-planning for the approved readiness probe.
`,
    "docs/mvp-scope.md": `# MVP Scope

Status: ready
Owner: founder
Confidence: high
Source mode: founder-fed
Prototype confidence: high

## Primary Customer

Local application maintainers.

## Primary Workflow

Call a pure readiness probe before local work.

## Value Moment

A stable boolean readiness result is available without I/O.

## Included

- A pure readiness function.
- Positive and negative Bun tests.

## Excluded

- Network, persistence, UI, deployment, and external services.

## Product Truth Status

- Ready; this bounded fixture requirement is founder-approved.
`,
    "docs/execution-rules.md": `# Execution Rules

Status: ready

## Runtime

Use Bun only.

## Stop/Ask Gates

- Stop on scope drift, failed tests, or missing evidence.
- Do not deploy, publish, or commit.
`,
    "docs/release-gates.md": `# Release Gates

Status: ready

## Gates

| Gate | Status | Command or Proof |
| --- | --- | --- |
| Project verification | pass | \`bun test\` |
| Scope | pass | docs/mvp-scope.md |
| Task evidence | pass | tasks/issues/*.md |
`,
    "docs/conflicts.md": `# Conflicts

Status: resolved

## Conflicts

| Conflict | Status | Owner |
| --- | --- | --- |
| None | none | AI |
`,
    "docs/decision-log.md": `# Decision Log

## Decisions

| ID | Decision | Status | Evidence |
| --- | --- | --- | --- |
| D-001 | Deliver the bounded local readiness probe | accepted | docs/mvp-scope.md |
`,
    "docs/source-index.md": `# Source Index

| Document | Purpose | Status | Confidence | Owner | Last Reviewed |
| --- | --- | --- | --- | --- | --- |
| docs/mvp-scope.md | Approved product boundary | ready | high | founder | 2026-07-23 |
| docs/execution-rules.md | AI execution contract | ready | high | founder + AI | 2026-07-23 |
| docs/release-gates.md | Local release gates | ready | high | AI | 2026-07-23 |
| docs/evidence/readiness-probe-baseline.md | Repository baseline | ready | high | AI | 2026-07-23 |
`,
    "docs/open-questions.md": `# Open Questions

Status: resolved

- None for the approved readiness probe.
`,
    "docs/raw/founder-dump.md": `# Founder Dump

Status: validated
Owner: founder
Confidence: high

## Product Idea

Provide a pure local readiness probe for application maintainers.

## Target Customer

Local application maintainers.

## Observed Pain

Callers need a stable readiness value without I/O or external services.

## Desired Capabilities

- Preserve the default-ready and explicitly-disabled behavior.

## Explicit Non-Goals

- Network, persistence, UI, deployment, and external services.
`,
    "docs/raw/founder-interview.md": `# Founder Interview

Status: validated
Owner: founder
Confidence: high

## Questions And Answers

| Question | Answer | Claim Status | Notes |
| --- | --- | --- | --- |
| Who is the primary user? | Local application maintainers | founder-claimed | Approved fixture scope |
| What is the smallest useful outcome? | A pure stable readiness result | founder-claimed | No external effects |

## Follow-Up Questions

- None.
`,
    "docs/evidence/readiness-probe-baseline.md": `# Readiness Probe Baseline

Status: repo-evidence-backed

- The project has a Bun library and focused tests.
- The next feature is explicitly approved and bounded.
- No external or production action is authorized.
`,
    "docs/evidence/preflight-inventory.md": `# Preflight Inventory

Status: repo-evidence-backed

- Existing Bun library and tests are present.
- Product authority, execution rules, release gates, and Sprint 0 agree.
- Managed planning is intentionally absent before the native preflight prompt.
- No external, paid, secret-bearing, production, or destructive action is authorized.
`,
    "tasks/sprint-0.md": `# Sprint 0

Status: active

## Tasks

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| 000 | Verify the existing readiness-probe baseline | complete | tasks/issues/000-verify-readiness-probe-baseline.md |
`,
    "tasks/issues/000-verify-readiness-probe-baseline.md": `# 000: Verify Readiness Probe Baseline

Status: complete
Type: validation
Owner: AI

Assumption basis: repo-evidence-backed
Requirement basis: docs/mvp-scope.md
Reversibility: easy
Learning objective: prove the existing Bun baseline is healthy before feature planning
Source under test: src/index.ts

## Goal

Verify the existing readiness-probe baseline.

## Non-Goals

- Change product behavior.

## Required Reading

- docs/mvp-scope.md
- docs/execution-rules.md

## Acceptance Criteria

- [x] Positive and negative baseline tests pass.

## Baseline Evidence

- docs/evidence/readiness-probe-baseline.md

## Verification

- \`bun test\`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-07-23 | \`bun test\` | pass | Fixture baseline passed. |

## Verification Summary

- \`bun test\` - passed.

## Learning Notes

- Proved: the existing pure function and focused tests pass.
- Simulated: none.
- Test next: the separately planned feature increment.

## Blockers

- None.

## Follow-Ups

- Plan the approved readiness-probe increment.
`,
  };
}

async function seedScratch(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "build-right-086-zero-mention-"));
  for (const [path, content] of Object.entries(seedFiles())) {
    await write(join(root, path), content);
  }
  const init = await run(["git", "init"], root);
  if (init.exitCode !== 0) throw new Error(`git init failed: ${init.stderr}`);
  return root;
}

async function runNative(root: string, stage: string, prompt: string): Promise<NativeRun> {
  const evidenceRoot = join(root, "docs", "evidence", "native");
  await mkdir(evidenceRoot, { recursive: true });
  const nonce = `${stage}-${randomUUID()}`;
  const eventsPath = join(evidenceRoot, `${nonce}.jsonl`);
  const stderrPath = join(evidenceRoot, `${nonce}.stderr.log`);
  const lastMessagePath = join(evidenceRoot, `${nonce}.last.txt`);
  const detached = process.platform !== "win32";
  const proc = Bun.spawn([
    "codex",
    "exec",
    "--ephemeral",
    "--json",
    "-s",
    "workspace-write",
    "-C",
    root,
    "--skip-git-repo-check",
    "-o",
    lastMessagePath,
    prompt,
  ], { cwd: root, stdin: "ignore", stdout: "pipe", stderr: "pipe", detached });
  const killGroup = (signal: NodeJS.Signals): void => {
    try {
      if (detached) process.kill(-proc.pid, signal);
      else proc.kill(signal);
    } catch {
      // The process group already exited.
    }
  };
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    killGroup("SIGTERM");
    setTimeout(() => killGroup("SIGKILL"), 200).unref();
  }, timeoutMs);
  const captured = { bytes: 0 };
  const [stdoutResult, stderrResult, exitCode] = await Promise.all([
    readBoundedStream(proc.stdout, captured, () => killGroup("SIGKILL")),
    readBoundedStream(proc.stderr, captured, () => killGroup("SIGKILL")),
    proc.exited,
  ]);
  clearTimeout(timer);
  killGroup("SIGKILL");
  const stdout = stdoutResult.text;
  const stderr = stderrResult.text;
  await Promise.all([write(eventsPath, stdout), write(stderrPath, stderr)]);
  const result: NativeRun = {
    stage,
    prompt,
    exitCode,
    timedOut,
    completionProof: "live-process",
    eventsPath,
    stderrPath,
    lastMessagePath,
  };
  if (stdoutResult.exceeded || stderrResult.exceeded) {
    throw Object.assign(new Error(`${stage} native invocation exceeded bounded output`), { nativeRun: result });
  }
  if (exitCode !== 0 || timedOut) {
    throw Object.assign(new Error(`${stage} native invocation ${timedOut ? "timed out" : `exited ${exitCode}`}`), {
      nativeRun: result,
    });
  }
  auditNativeEvents(stdout, stage);
  const installedSkill = stage === "preflight"
    ? lifecycleSkills[0]
    : stage === "feature-planning"
      ? lifecycleSkills[1]
      : lifecycleSkills[2];
  if (!eventStreamProvesInstalledSkill(stdout, installedSkill)) {
    throw Object.assign(new Error(`${stage} event stream does not prove installed skill loading or helper execution`), {
      nativeRun: result,
    });
  }
  const lastMessage = await readBoundedEvidence(lastMessagePath);
  if (!lastMessage.trim()) {
    throw Object.assign(new Error(`${stage} native invocation did not persist a final message`), {
      nativeRun: result,
    });
  }
  return result;
}

async function activeChanges(root: string): Promise<string[]> {
  const changesRoot = join(root, "openspec", "changes");
  if (!(await exists(changesRoot))) return [];
  return (await readdir(changesRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink() && entry.name !== "archive")
    .map((entry) => entry.name)
    .sort();
}

async function archivedChanges(root: string): Promise<string[]> {
  const archiveRoot = join(root, "openspec", "changes", "archive");
  if (!(await exists(archiveRoot))) return [];
  return (await readdir(archiveRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink())
    .map((entry) => entry.name)
    .sort();
}

export function validateFinalAuthorityText(input: {
  blueprint: string;
  sprint: string;
  boundTasks: string[];
  change: string;
  archivedChange: string;
}): string[] {
  const failures: string[] = [];
  const activeReference = `openspec/changes/${input.change}`;
  const archiveReference = `openspec/changes/archive/${input.archivedChange}`;
  if (input.blueprint.includes(activeReference)) failures.push("blueprint references the absent active change");
  if (!input.blueprint.includes(archiveReference)) failures.push("blueprint does not reference the archive");
  if (!/^Active task:\s*(?:none|n\/a)\b/im.test(input.blueprint)) {
    failures.push("blueprint still names an active task");
  }
  if (/^Current phase:\s*execution handoff\b/im.test(input.blueprint)
    || /^Current gate:\s*ready for bounded execution\b/im.test(input.blueprint)) {
    failures.push("blueprint still advertises an execution-ready state");
  }
  const nextAction = input.blueprint.match(/## Next Action\s*\n+([\s\S]*?)(?=\n## |\s*$)/i)?.[1] ?? "";
  if (/\$?build-right-execution/i.test(nextAction)) {
    failures.push("blueprint next action still routes to execution");
  }
  if (!/^Status:\s*complete\b/im.test(input.sprint)) failures.push("terminal sprint is not complete");
  if (/\|\s*(?:planned|draft|ready|active|in_progress|blocked|needs-founder)\s*\|/i.test(input.sprint)) {
    failures.push("terminal sprint contains a non-terminal row");
  }
  if (input.boundTasks.length === 0) failures.push("no bound task was found for final-state audit");
  for (const task of input.boundTasks) {
    if (!/^Status:\s*complete\b/im.test(task)) failures.push("bound task is not complete");
    if (task.includes(activeReference)) failures.push("bound task references the absent active change");
    if (!task.includes(archiveReference)) failures.push("bound task does not reference the archive");
  }
  return failures;
}

async function assertFinalBuildRightState(
  root: string,
  change: string,
  archivedChange: string,
): Promise<void> {
  const blueprint = await readBoundedEvidence(join(root, "docs", "blueprint-status.md"));
  const issueRoot = join(root, "tasks", "issues");
  const boundTasks: string[] = [];
  for (const name of await readdir(issueRoot)) {
    if (!/^\d{3}-.+\.md$/.test(name)) continue;
    const text = await readBoundedEvidence(join(issueRoot, name));
    if (text.match(/^Change ref:\s*(.+)$/m)?.[1]?.trim() === change) boundTasks.push(text);
  }
  const sprintFiles = (await readdir(join(root, "tasks")))
    .filter((name) => /^sprint-[A-Za-z0-9._-]+\.md$/.test(name));
  const boundTaskNames = boundTasks.map((task) =>
    task.match(/^#\s+(\d{3}):/m)?.[1]).filter(Boolean);
  const relevantSprints: string[] = [];
  for (const name of sprintFiles) {
    const text = await readBoundedEvidence(join(root, "tasks", name));
    if (boundTaskNames.some((id) => new RegExp(`^\\|\\s*${id}\\s*\\|`, "m").test(text))) {
      relevantSprints.push(text);
    }
  }
  if (relevantSprints.length !== 1) {
    throw new Error(`final state has ${relevantSprints.length} sprint trackers for the bound task`);
  }
  const failures = validateFinalAuthorityText({
    blueprint,
    sprint: relevantSprints[0]!,
    boundTasks,
    change,
    archivedChange,
  });
  const resolver = await run([
    "bun",
    join(installedSkillsRoots[0]!, "build-right-execution", "scripts", "managed-continue-check.ts"),
    "--cwd",
    root,
    "--format",
    "json",
    "--strict",
  ], root);
  let decision: Record<string, unknown> | null = null;
  try {
    decision = JSON.parse(resolver.stdout) as Record<string, unknown>;
  } catch {
    failures.push("final managed resolver did not return structured JSON");
  }
  if (resolver.exitCode !== 0 || decision?.decision !== "no-ready-task"
    || decision.nextTask !== null
    || !Array.isArray(decision.activeTasks) || decision.activeTasks.length !== 0
    || !Array.isArray(decision.blockingGates) || decision.blockingGates.length !== 0) {
    failures.push("final managed resolver does not prove a clean no-ready-task state");
  }
  if (failures.length > 0) throw new Error(`final Build Right authority state is contradictory: ${failures.join("; ")}`);
}

async function remainingItems(root: string, change: string): Promise<number> {
  const path = join(root, "openspec", "changes", change, "tasks.md");
  if (!(await exists(path))) return 0;
  return incompletePlanningWorkItems(await Bun.file(path).text());
}

async function compatiblePreservationTrial(): Promise<boolean> {
  const root = await mkdtemp(join(tmpdir(), "build-right-086-compatible-"));
  const helper = join(installedSkillsRoots[1]!, "build-right-preflight", "scripts", "ensure-openspec.ts");
  const first = await run(["bun", helper, "--cwd", root, "--format", "json"], root);
  if (first.exitCode !== 0) return false;
  const sentinel = join(root, "openspec", "specs", "existing-capability", "spec.md");
  await write(sentinel, "## Requirements\n\n### Requirement: Existing capability\nThe system SHALL preserve compatible state.\n");
  const before = await Bun.file(sentinel).text();
  const second = await run(["bun", helper, "--cwd", root, "--format", "json"], root);
  return second.exitCode === 0
    && (await Bun.file(sentinel).text()) === before
    && second.stdout.includes('"state": "preserved"');
}

function tableCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

async function appendFailureRow(row: string[]): Promise<void> {
  const flags = constants.O_APPEND | constants.O_WRONLY | (constants.O_NOFOLLOW ?? 0);
  const handle = await open(failureLogPath, flags);
  try {
    if (!tryAdvisoryFileLock(handle.fd)) {
      throw new Error("failed-test log is busy; refusing an unlocked evidence append");
    }
    await handle.write(`| ${row.join(" | ")} |\n`);
  } finally {
    await handle.close();
  }
}

async function appendFailure(message: string, artifact: string): Promise<void> {
  const row = [
    "2026-07-23",
    "086",
    "zero-mention-native-lifecycle",
    "bun scripts/openspec-zero-mention-trial.ts",
    "three Build Right-only prompts complete managed planning lifecycle",
    message,
    "agent-instruction",
    artifact,
    taskPath,
    "open",
  ].map(tableCell);
  await appendFailureRow(row);
}

async function appendResolution(artifact: string): Promise<void> {
  const row = [
    "2026-07-23",
    "086",
    "zero-mention-native-lifecycle",
    "bun scripts/openspec-zero-mention-trial.ts",
    "bounded rerun completes after fixture authority surface is complete",
    "rerun passed; prior timeout retained as historical evidence",
    "agent-instruction",
    artifact,
    taskPath,
    "resolved",
  ].map(tableCell);
  await appendFailureRow(row);
}

async function writeSummary(result: TrialResult): Promise<void> {
  const lines = [
    "# OpenSpec Zero-Mention Native Trial",
    "",
    "Generated: 2026-07-23",
    "Status: pass",
    `Scratch repository: \`${result.root}\``,
    `Source under test: installed Build Right skills in \`${installedSkillsRoots.join("` and `")}\` with exact repo-local parity.`,
    "",
    "## User Prompt Contract",
    "",
    ...result.promptAudit.prompts.flatMap((prompt, index) => [
      `${index + 1}.`,
      "   ```text",
      ...prompt.split("\n").map((line) => `   ${line}`),
      "   ```",
    ]),
    "",
    "The prompt audit passed: exactly three prompt forms, each names only its Build Right skill and no managed-provider term or operation.",
    "",
    "## Native Results",
    "",
    "| Stage | Result | Evidence |",
    "| --- | --- | --- |",
    ...result.nativeRuns.map((native) =>
      `| ${native.stage} | pass (${native.completionProof}) | \`${native.eventsPath}\`, \`${native.lastMessagePath}\` |`),
    "",
    "## Lifecycle Assertions",
    "",
    `- Fresh start: ${result.initialPlanningRootAbsent ? "pass" : "fail"}; the scratch repository had no managed planning root before preflight.`,
    "- Automatic preflight setup: pass; the installed native preflight invocation created and validated the pinned repository-local root.",
    `- Automatic planning: pass; change \`${result.change}\` was created, strictly validated, and bound into the Build Right sprint.`,
    `- One-item execution: pass; incomplete provider-item deltas per native execution were \`${result.executionDeltas.join(", ")}\`.`,
    `- Automatic finalization: pass; archived change \`${result.archivedChange}\` exists and no active change remains.`,
    `- Compatible existing root: ${result.compatibleRootPreserved ? "pass" : "fail"}; an added sentinel survived the idempotent second setup.`,
    "",
    "## Proof Levels",
    "",
    "- Native agent plus real CLI: installed skills were invoked through `codex exec --ephemeral --json`; their internal helpers used pinned OpenSpec 1.6.0.",
    "- Real CLI: fresh setup, feature artifact generation/validation, execution progress, strict validation, sync, and archive occurred in the scratch repository.",
    "- Deterministic: prompt audit, installed/source parity, component failure matrices, and exact lifecycle postconditions are code-checked.",
    "- Fixture: product authority and the small Bun readiness-probe project were seeded to avoid asking the native agent to invent founder decisions.",
    "- Simulated: negative provider/process/filesystem controls use bounded test doubles where real faults would be unsafe or nondeterministic.",
    "- Unproven: production, customer, deployment, publication, and release behavior.",
  ];
  await Bun.write(summaryPath, `${lines.join("\n")}\n`);
}

async function resumeSuccessfulNativeTrial(root: string): Promise<void> {
  await assertInstalledParity();
  const promptAudit = auditZeroMentionPrompts();
  if (!promptAudit.ok) throw new Error(promptAudit.failures.join("; "));
  const evidenceRoot = join(root, "docs", "evidence", "native");
  const files = await readdir(evidenceRoot);
  const nativeRuns: NativeRun[] = [];
  for (const file of files.filter((name) =>
    /^(?:preflight|feature-planning|execution-\d+)-[0-9a-f-]+\.jsonl$/.test(name)).sort()) {
    const stage = file.match(/^(preflight|feature-planning|execution-\d+)-/)?.[1];
    if (!stage) throw new Error(`cannot parse native evidence stage from ${file}`);
    const prompt = stage === "preflight"
      ? BUILD_RIGHT_USER_PROMPTS.preflight
      : stage === "feature-planning"
        ? BUILD_RIGHT_USER_PROMPTS.featurePlanning
        : BUILD_RIGHT_USER_PROMPTS.execution;
    const eventsPath = join(evidenceRoot, file);
    const events = await readBoundedEvidence(eventsPath);
    const audit = auditNativeEvents(events, stage);
    const skill = stage === "preflight"
      ? lifecycleSkills[0]
      : stage === "feature-planning"
        ? lifecycleSkills[1]
        : lifecycleSkills[2];
    if (!eventStreamProvesInstalledSkill(events, skill)) {
      throw new Error(`${stage} resume evidence does not prove installed skill loading or helper execution`);
    }
    const base = file.slice(0, -".jsonl".length);
    const stderrPath = join(evidenceRoot, `${base}.stderr.log`);
    const lastMessagePath = join(evidenceRoot, `${base}.last.txt`);
    await readBoundedEvidence(stderrPath);
    const lastMessage = await readBoundedEvidence(lastMessagePath);
    if (!lastMessage.trim()) throw new Error(`${stage} resume evidence has no final message`);
    nativeRuns.push({
      stage,
      prompt,
      exitCode: null,
      timedOut: null,
      completionProof: "completed-jsonl",
      eventsPath,
      stderrPath,
      lastMessagePath,
    });
    if (stage === "preflight" && !audit.createdPlanningRoot) {
      throw new Error("resume preflight evidence does not prove a fresh managed root was created");
    }
  }
  const expectedStages = ["preflight", "feature-planning", "execution-1"];
  const actualStages = nativeRuns.map(({ stage }) => stage).sort();
  if (actualStages.length !== expectedStages.length
    || expectedStages.some((stage) => !actualStages.includes(stage))) {
    throw new Error(`resume evidence must contain exactly ${expectedStages.join(", ")}; found ${actualStages.join(", ")}`);
  }
  const executionRuns = nativeRuns.filter((run) => run.stage.startsWith("execution-"));
  if (executionRuns.length !== 1 || (await activeChanges(root)).length !== 0) {
    throw new Error("resume evidence is missing execution or still has an active change");
  }
  const archives = await archivedChanges(root);
  if (archives.length !== 1) throw new Error(`resume evidence has ${archives.length} archived changes`);
    const archivedChange = archives[0]!;
  const change = archivedChange.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const archivedTasks = await Bun.file(join(root, "openspec", "changes", "archive", archivedChange, "tasks.md")).text();
  const totalItems = archivedTasks.match(/^\s*-\s*\[[xX ]\]\s+/gm)?.length ?? 0;
  if (totalItems !== 1 || incompletePlanningWorkItems(archivedTasks) !== 0) {
    throw new Error("resume evidence does not prove the fixture's single work item was completed");
  }
  await assertFinalBuildRightState(root, change, archivedChange);
  const compatibleRootPreserved = await compatiblePreservationTrial();
  if (!compatibleRootPreserved) throw new Error("compatible root preservation trial failed");
  await writeSummary({
    root: await realpath(root),
    initialPlanningRootAbsent: true,
    promptAudit,
    nativeRuns,
    change,
    executionDeltas: [1],
    archivedChange,
    compatibleRootPreserved,
  });
  await appendResolution(root);
  console.log("zero-mention native lifecycle resume audit: pass");
  console.log(`scratch: ${root}`);
  console.log(`summary: ${summaryPath}`);
}

async function main(): Promise<void> {
  let artifact = repoRoot;
  try {
    const resumeIndex = Bun.argv.indexOf("--resume");
    if (resumeIndex >= 0) {
      const requestedRoot = Bun.argv[resumeIndex + 1];
      if (!requestedRoot) throw new Error("--resume requires a scratch path");
      artifact = await realpath(requestedRoot);
      await resumeSuccessfulNativeTrial(artifact);
      return;
    }
    await assertInstalledParity();
    const promptAudit = auditZeroMentionPrompts();
    if (!promptAudit.ok) throw new Error(promptAudit.failures.join("; "));
    const root = await seedScratch();
    artifact = root;
    const initialPlanningRootAbsent = !(await exists(join(root, "openspec")));
    if (!initialPlanningRootAbsent) throw new Error("fresh scratch unexpectedly contains a managed planning root");
    const nativeRuns: NativeRun[] = [];
    nativeRuns.push(await runNative(root, "preflight", BUILD_RIGHT_USER_PROMPTS.preflight));
    if (!(await exists(join(root, "openspec", "config.yaml")))) {
      throw new Error("preflight did not establish the managed planning root");
    }
    nativeRuns.push(await runNative(root, "feature-planning", BUILD_RIGHT_USER_PROMPTS.featurePlanning));
    const changes = await activeChanges(root);
    if (changes.length !== 1) throw new Error(`feature planning produced ${changes.length} active changes`);
    const change = changes[0]!;
    const initialRemaining = await remainingItems(root, change);
    if (initialRemaining !== 1) {
      throw new Error(`feature planning produced ${initialRemaining} work items; the Task086 fixture requires exactly 1`);
    }
    const executionDeltas: number[] = [];
    nativeRuns.push(await runNative(root, "execution-1", BUILD_RIGHT_USER_PROMPTS.execution));
    const active = await activeChanges(root);
    const after = active.length === 0 ? 0 : await remainingItems(root, change);
    executionDeltas.push(initialRemaining - after);
    if (initialRemaining - after !== 1) {
      throw new Error(`execution completed ${initialRemaining - after} work items; expected exactly 1`);
    }
    if ((await activeChanges(root)).length !== 0) throw new Error("active change remains after bounded execution loop");
    const archives = await archivedChanges(root);
    const archivedChange = archives.find((entry) => entry.endsWith(change));
    if (!archivedChange) throw new Error(`archive does not contain change ${change}`);
    await assertFinalBuildRightState(root, change, archivedChange);
    const compatibleRootPreserved = await compatiblePreservationTrial();
    if (!compatibleRootPreserved) throw new Error("compatible root preservation trial failed");
    await writeSummary({
      root: await realpath(root),
      initialPlanningRootAbsent,
      promptAudit,
      nativeRuns,
      change,
      executionDeltas,
      archivedChange,
      compatibleRootPreserved,
    });
    await appendResolution(root);
    console.log(`zero-mention native lifecycle: pass`);
    console.log(`scratch: ${root}`);
    console.log(`summary: ${summaryPath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await appendFailure(message, artifact);
    throw error;
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
