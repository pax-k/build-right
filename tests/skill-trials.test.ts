import { dirname } from "node:path";
import { test } from "bun:test";
import { helperCommands, judgeNativeStepResult, parseCodexEvents, refsFor, steps as nativeSteps } from "../scripts/codex-native-step-trials";

type Check = {
  name: string;
  run: () => Promise<void>;
};

let manifestSkillNames: string[] | null = null;

async function read(path: string): Promise<string> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    throw new Error(`missing file: ${path}`);
  }
  return file.text();
}

async function exists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

async function manifestSkills(): Promise<string[]> {
  if (manifestSkillNames) {
    return manifestSkillNames;
  }

  const manifest = JSON.parse(await read("skills.sh.json")) as {
    groupings?: Array<{ skills?: string[] }>;
  };
  manifestSkillNames = manifest.groupings?.flatMap((group) => group.skills ?? []) ?? [];
  return manifestSkillNames;
}

function frontmatter(markdown: string, path: string): Record<string, string> {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    throw new Error(`${path} is missing YAML frontmatter`);
  }

  const data: Record<string, string> = {};
  for (const line of (match[1] ?? "").split("\n")) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    const key = pair?.[1];
    if (key) {
      data[key] = (pair[2] ?? "").trim();
    }
  }
  return data;
}

async function assertIncludes(path: string, markers: string[]): Promise<void> {
  const text = await read(path);
  const missing = markers.filter((marker) => !text.includes(marker));
  if (missing.length > 0) {
    throw new Error(`${path} missing markers: ${missing.join(", ")}`);
  }
}

async function runCommand(command: string[], cwd = "."): Promise<string> {
  const proc = Bun.spawn(command, {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  const output = `${stdout}${stderr}`;
  if (exitCode !== 0) {
    throw new Error(`${command.join(" ")} failed with exit ${exitCode}: ${output}`);
  }
  return output;
}

async function runCommandResult(command: string[], cwd = "."): Promise<{
  exitCode: number;
  output: string;
}> {
  const proc = Bun.spawn(command, {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { exitCode, output: `${stdout}${stderr}` };
}

async function markdownFilesUnder(prefix: string): Promise<string[]> {
  const glob = new Bun.Glob(`${prefix}/**/*.md`);
  const files: string[] = [];
  for await (const file of glob.scan({ cwd: ".", onlyFiles: true })) {
    files.push(file);
  }
  return files;
}

async function rootGeneratedMarkdownFiles(): Promise<string[]> {
  const files: string[] = [];
  for (const prefix of ["docs", "tasks"]) {
    if (!(await exists(prefix))) {
      continue;
    }
    files.push(...(await markdownFilesUnder(prefix)));
  }
  return files.sort();
}

async function filesUnder(prefix: string): Promise<string[]> {
  const glob = new Bun.Glob(`${prefix}/**/*`);
  const files: string[] = [];
  for await (const file of glob.scan({ cwd: ".", onlyFiles: true })) {
    files.push(file.slice(prefix.length + 1));
  }
  return files.sort();
}

async function filesUnderAbsolute(prefix: string): Promise<string[]> {
  const glob = new Bun.Glob("**/*");
  const files: string[] = [];
  for await (const file of glob.scan({ cwd: prefix, onlyFiles: true })) {
    files.push(file);
  }
  return files.sort();
}

function arraysEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

async function writeFixtureFile(root: string, path: string, text: string): Promise<void> {
  await runCommand(["mkdir", "-p", dirname(`${root}/${path}`)]);
  await Bun.write(`${root}/${path}`, text);
}

async function createFixture(name: string, files: Record<string, string>): Promise<string> {
  const safeName = name.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const root = `${Bun.env.TMPDIR ?? "/tmp"}/build-right-${safeName}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
  await runCommand(["mkdir", "-p", root]);
  for (const [path, text] of Object.entries(files)) {
    await writeFixtureFile(root, path, text);
  }
  return root;
}

function installedSkillPathForTest(skill: string): string {
  return `${Bun.env.CODEX_HOME ?? `${Bun.env.HOME}/.codex`}/skills/${skill}`;
}

function nativeStep(id: string) {
  const step = nativeSteps.find((item) => item.id === id);
  if (!step) {
    throw new Error(`missing native step fixture: ${id}`);
  }
  return step;
}

async function nativeJudgeFixture(options: {
  omitSkillRead?: boolean;
  omitHelperCommand?: boolean;
  productFile?: boolean;
} = {}) {
  const step = nativeStep("041");
  const skillPath = installedSkillPathForTest(step.skill);
  const refs = refsFor(step).map((ref) => `${skillPath}/references/${ref}`);
  const readTargets = [...(options.omitSkillRead ? [] : [`${skillPath}/SKILL.md`]), ...refs];
  const helper = helperCommands(step)[0] ?? "";
  const events = [
    { type: "thread.started", thread_id: "fixture" },
    { type: "turn.started" },
    { type: "warning", message: "fixture non-agent event" },
    {
      type: "item.completed",
      item: {
        id: "item_read",
        type: "command_execution",
        command: `/bin/zsh -lc "sed -n '1,220p' ${readTargets.join(" ")}"`,
        exit_code: 0,
        status: "completed",
      },
    },
    ...(options.omitHelperCommand
      ? []
      : [
          {
            type: "item.completed",
            item: {
              id: "item_helper",
              type: "command_execution",
              command: `/bin/zsh -lc "${helper}"`,
              exit_code: 0,
              status: "completed",
            },
          },
        ]),
    {
      type: "item.completed",
      item: {
        id: "item_agent",
        type: "agent_message",
        text: `CODEX_NATIVE_STEP=${step.id}\nCODEX_NATIVE_SKILL=${step.skill}\nPROOF_FILE=docs/evidence/codex-native-step-proof.md\nRESULT=pass`,
      },
    },
    { type: "turn.completed", usage: { input_tokens: 1, output_tokens: 1 } },
  ].map((event) => JSON.stringify(event)).join("\n");
  const proof = `# Codex Native Step Proof

Native step: ${step.id}
Native skill: ${step.skill}
Codex native invocation: yes
Installed skill source: ${skillPath}
Repo-local parity: pass
Step under test: ${step.stepUnderTest}
Helper commands run: 1
Proved: fixture proves judge pass path
Simulated: Codex execution
Unproven: live native behavior
Result: pass
`;
  const root = await createFixture("native-judge", {
    "docs/evidence/codex-events.jsonl": `${events}\n`,
    "docs/evidence/codex-last-message.txt": `CODEX_NATIVE_STEP=${step.id}\nCODEX_NATIVE_SKILL=${step.skill}\nPROOF_FILE=docs/evidence/codex-native-step-proof.md\nRESULT=pass\n`,
    "docs/evidence/codex-native-step-proof.md": proof,
    "docs/evidence/manual-trials.md": `# Manual Trials

- Run label: fixture
- Agent/tool surface: codex exec --ephemeral --json
- Skill source: ${skillPath}
- Target: fixture
- Commands: \`${helper}\`
- Artifacts: docs/evidence/codex-events.jsonl
- Result: pass
- Proved: fixture
- Simulated: live Codex
- Unproven: none
- Follow-ups: none
`,
  });
  if (options.productFile) {
    await writeFixtureFile(root, "package.json", "{\"type\":\"module\"}\n");
  }
  return {
    step,
    root,
    helper,
    eventsPath: `${root}/docs/evidence/codex-events.jsonl`,
    lastMessagePath: `${root}/docs/evidence/codex-last-message.txt`,
    proofPath: `${root}/docs/evidence/codex-native-step-proof.md`,
  };
}

function failureLogFixture(rows: string): string {
  return `# Failed Tests Log

Status: active

## Failures

| Date | Task | Phase | Command or Test | Expected | Actual | Class | Artifact | Follow-up | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows}
`;
}

async function positivePreflightFixture(): Promise<string> {
  return createFixture("todo-preflight-positive", {
    "docs/blueprint-status.md": `# Blueprint Status

Status: ready
Current phase: preflight
Project state: blank/new
Source mode: founder-fed
Prototype confidence: n/a
Active task: tasks/issues/001-build-bun-react-todo-app.md
Current gate: ready
Last evidence: docs/evidence/preflight-transcript.md

## Readiness

| Gate | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Founder intent captured | ready | docs/raw/founder-interview.md | ready |
| Claims tagged | ready | docs/source-index.md | ready |
| MVP extracted | ready | docs/mvp-scope.md | ready |
| Operating rules exist | ready | docs/execution-rules.md | ready |
| First task is bounded and verifiable | ready | tasks/issues/001-build-bun-react-todo-app.md | ready |

## Current File Plan

- Create docs and tasks only.

## Next Action

First executable AI task: tasks/issues/001-build-bun-react-todo-app.md
`,
    "docs/raw/founder-dump.md": "# Founder Dump\nTodo app demo.\n",
    "docs/raw/founder-interview.md": "# Founder Interview\nPrimary customer: first-time skill user.\n",
    "docs/source-index.md": `# Source Index

- founder-claimed: Todo app demo.
- repo-evidence-backed: AGENTS.md requires bun.
- customer-evidence-backed: Founder reply in docs/raw/founder-interview.md.
`,
    "docs/mvp-scope.md": `# MVP Scope

Status: ready
Source mode: founder-fed
Prototype confidence: n/a

Primary customer: First-time Build Right user
Primary workflow: Create a Bun React TypeScript Todo app

## Included

- Add, complete, delete, filter, and restore todos.

## Excluded

- Deployment.
`,
    "docs/execution-rules.md": `# Execution Rules

## Authority Order

1. AGENTS.md

## Stop/Ask Gates

- Stop on failed verification.

Use bun for all commands.
`,
    "docs/release-gates.md": `# Release Gates

Status: ready

## Gates

| Gate | Required Evidence | Command or Proof | Status |
| --- | --- | --- | --- |
| Source parity | skill source matches | bun scripts/todo-trial.ts parity | ready |
| Preflight artifacts | docs/tasks verified | bun scripts/todo-trial.ts verify-preflight | ready |
| Local validation | tests pass | bun test | ready |
| Browser proof | browser evidence exists | docs/evidence/browser-proof.md | ready |
`,
    "docs/conflicts.md": "# Conflicts\n\n## Conflicts\n\n| Conflict | Sources | Severity | Owner | Status | Resolution |\n| --- | --- | --- | --- | --- | --- |\n| None | n/a | low | AI | resolved | n/a |\n",
    "docs/evidence/evidence-notes.md": "# Evidence Notes\n\n## Repository Evidence\n\nAGENTS.md.\n\n## Founder Evidence\n\nInterview.\n\n## Prototype Assumptions\n\nNone.\n",
    "docs/evidence/manual-trials.md": "# Manual Trials\n",
    "docs/evidence/preflight-transcript.md": `# Preflight Transcript

## Helper Report

Preflight decision: ready-for-execution
Confidence: high
Project type: blank/new
Next action: create first task

## Focused Founder Questions

1. Who is the user?

## Founder Reply

First-time skill user.

## File Plan

Create docs and tasks.

## Closeout

First executable AI task: tasks/issues/001-build-bun-react-todo-app.md
`,
    "tasks/sprint-0.md": "# Sprint 0\n\nStatus: ready\n\n## Tasks\n\n| ID | Title | Status | Evidence |\n| --- | --- | --- | --- |\n| 001 | Build app | ready | tasks/issues/001-build-bun-react-todo-app.md |\n",
    "tasks/issues/001-build-bun-react-todo-app.md": taskFile("001", "ready"),
  });
}

async function executionEvidenceFixture(browserProof: string): Promise<string> {
  return createFixture("todo-execution-evidence", {
    "package.json": "{\"name\":\"fixture\",\"type\":\"module\",\"scripts\":{\"test\":\"bun test\"}}\n",
    "bun.lock": "",
    "index.ts": "import index from './index.html';\nBun.serve({ routes: { '/': index } });\n",
    "index.html": "<html><body><script type=\"module\" src=\"./frontend.tsx\"></script></body></html>\n",
    "todo.ts": "export const todos = [];\n",
    "frontend.tsx": "import React from 'react';\nlocalStorage.getItem('todos');\nconst input = 'data-testid=\"todo-input\"';\nconst filter = 'data-testid={`filter-${option}`}';\nconsole.log(React, input, filter);\n",
    "index.css": "body { font-family: sans-serif; }\n",
    "todo.test.ts": "import { test } from 'bun:test';\ntest('filters active and completed todos', () => {});\ntest('restores only valid stored todos', () => {});\n",
    "docs/evidence/execution-transcript.md": `# Execution Transcript

## Resolver Report

Resolver decision: execute-task
Confidence: high
Next action: Execute ready task 001

## Task Intake

Active task: tasks/issues/001-build-bun-react-todo-app.md
Baseline evidence: no app files existed.
Verification ladder: focused

## Implementation

Created Todo app files.

## Verification

\`bun install\`
\`bun test\`
Browser proof

## Stop-Gate Notes

Stop gates before next-task selection.
`,
    "docs/evidence/browser-proof.md": browserProof,
    "docs/evidence/browser-proof.png": "not-a-real-png-for-marker-tests",
    "docs/evidence/manual-trials.md": `# Manual Trials

Run label: fixture-execution
Agent/tool surface: fixture
Skill source: skills/build-right-execution
Target: fixture
Commands:

- \`bun test\`

Artifacts:

- docs/evidence/execution-transcript.md

Result: pass

Proved:

- Ordering markers exist.

Simulated:

- Browser proof is fixture text.

Unproven:

- Live browser.

Follow-ups:

- None.
`,
    "tasks/issues/001-build-bun-react-todo-app.md": `${taskFile("001", "complete")}

## Files Changed

- index.ts

## Verification Summary

- bun test - pass

Trial status: pass
`,
  });
}

function readyBlueprint(): string {
  return `# Blueprint Status

Status: ready

## Readiness

| Gate | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Founder intent captured | ready | docs/open-questions.md | resolved |
| Claims tagged | ready | docs/source-index.md | resolved |
| MVP extracted | ready | docs/mvp-scope.md | resolved |
| Operating rules exist | ready | docs/execution-rules.md | resolved |
| First task is bounded and verifiable | ready | tasks/issues/001-task.md | resolved |
`;
}

function openQuestions(status = "resolved"): string {
  return `# Open Questions

Status: ${status}

## Resolved Operational Questions

| Question | Decision | Evidence |
| --- | --- | --- |
| None | No open decision | docs/blueprint-status.md |
`;
}

function releaseGates(status = "ready"): string {
  return `# Release Gates

Status: ready

## Gates

| Gate | Required Evidence | Command or Proof | Status |
| --- | --- | --- | --- |
| Local validation | checks pass | bun run verify:skill-trials | ready |
| skills.sh directory search | external discovery | bunx skills find example | ${status} |
`;
}

function releaseGatesWithRow(row: string): string {
  return `# Release Gates

Status: active

## Gates

| Gate | Required Evidence | Command or Proof | Status |
| --- | --- | --- | --- |
${row}
`;
}

function tracker(rows: string): string {
  return `# Sprint 0

Status: active

## Tasks

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
${rows}
`;
}

function taskFile(id: string, status: string, owner = "AI"): string {
  return `# ${id}: Fixture Task

Status: ${status}
Type: validation
Owner: ${owner}

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove resolver fixture behavior
Source under test: fixture

## Goal

Exercise resolver behavior.

## Non-Goals

- None.

## Required Reading

- docs/execution-rules.md

## Acceptance Criteria

- [ ] Resolver returns expected decision.

## Baseline Evidence

Fixture state.

## Verification

- continue-check

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Blockers

- None.

## Follow-Ups

- None.
`;
}

async function continueDecisionForFixture(files: Record<string, string>): Promise<{
  decision?: string;
  nextTask?: { id?: string } | null;
  readyTasks?: Array<{ id?: string }>;
  blockingGates?: Array<{ type?: string }>;
}> {
  const root = await createFixture("continue", files);
  const output = await runCommand([
    "bun",
    "skills/build-right-execution/scripts/continue-check.ts",
    "--cwd",
    root,
    "--format",
    "json",
    "--strict",
  ]);
  return JSON.parse(output);
}

async function preflightDecisionForFixture(files: Record<string, string>): Promise<{
  decision?: string;
  nextAction?: string;
  confidence?: string;
  projectTypeSignal?: string;
  missingArtifacts?: string[];
  readinessWarnings?: string[];
  founderInputGaps?: string[];
}> {
  const root = await createFixture("preflight", files);
  const output = await runCommand([
    "bun",
    "skills/build-right-preflight/scripts/preflight-check.ts",
    "--cwd",
    root,
    "--mode",
    "all",
    "--format",
    "json",
  ]);
  return JSON.parse(output);
}

async function featurePlanningDecisionForFixture(
  files: Record<string, string>,
  feature: string,
): Promise<{
  decision?: string;
  confidence?: string;
  recommendedDestination?: string;
  blockingGates?: Array<{ type?: string; source?: string; reason?: string }>;
  founderQuestions?: string[];
  researchTriggers?: string[];
  readyTaskCandidates?: Array<{ id?: string; path?: string; owner?: string }>;
  nextAction?: string;
}> {
  const root = await createFixture("feature-planning", files);
  const output = await runCommand([
    "bun",
    "skills/build-right-feature-planning/scripts/feature-planning-check.ts",
    "--cwd",
    root,
    "--feature",
    feature,
    "--format",
    "json",
  ]);
  return JSON.parse(output);
}

async function executionCheckForFixture(
  files: Record<string, string>,
  args: string[],
): Promise<{
  selectedTask?: { path?: string; status?: string; owner?: string } | null;
  readyTaskCandidates?: Array<{ path?: string; status?: string; owner?: string }>;
  contractMissing?: string[];
  gateReasons?: string[];
  recommendation?: string;
}> {
  const root = await createFixture("execution", files);
  const output = await runCommand([
    "bun",
    "skills/build-right-execution/scripts/execution-check.ts",
    "--cwd",
    root,
    "--format",
    "json",
    ...args,
  ]);
  return JSON.parse(output);
}

const checks: Check[] = [
  {
    name: "codex native event parser tolerates warning and non-agent events",
    run: async () => {
      const scan = parseCodexEvents([
        JSON.stringify({ type: "thread.started", thread_id: "fixture" }),
        JSON.stringify({ type: "warning", message: "non-agent fixture event" }),
        JSON.stringify({ type: "item.completed", item: { type: "agent_message", text: "done" } }),
        JSON.stringify({ type: "turn.completed" }),
      ].join("\n"));
      if (scan.invalidLines.length !== 0) {
        throw new Error(`expected no invalid lines, got ${scan.invalidLines.length}`);
      }
      if (!scan.hasTurnCompleted) {
        throw new Error("expected turn.completed to be detected");
      }
      if (!scan.agentText.includes("done")) {
        throw new Error("expected agent text to be collected");
      }
    },
  },
  {
    name: "codex native judge covers pass, missing reads, missing helpers, and forbidden writes",
    run: async () => {
      const pass = await nativeJudgeFixture();
      const passResult = await judgeNativeStepResult({
        step: pass.step,
        target: pass.root,
        eventsPath: pass.eventsPath,
        lastMessagePath: pass.lastMessagePath,
        proofPath: pass.proofPath,
        codexExitCode: 0,
        helperResults: [{ command: pass.helper, exitCode: 0, stdout: "", stderr: "" }],
      });
      if (passResult.status !== "pass" || passResult.failures.length !== 0) {
        throw new Error(`expected pass fixture to pass, got ${passResult.failures.join("; ")}`);
      }

      const missingSkill = await nativeJudgeFixture({ omitSkillRead: true });
      const missingSkillResult = await judgeNativeStepResult({
        step: missingSkill.step,
        target: missingSkill.root,
        eventsPath: missingSkill.eventsPath,
        lastMessagePath: missingSkill.lastMessagePath,
        proofPath: missingSkill.proofPath,
        codexExitCode: 0,
        helperResults: [{ command: missingSkill.helper, exitCode: 0, stdout: "", stderr: "" }],
      });
      if (!missingSkillResult.failures.some((failure) => failure.includes("missing selected skill read"))) {
        throw new Error(`expected missing skill read failure, got ${missingSkillResult.failures.join("; ")}`);
      }

      const missingHelper = await nativeJudgeFixture({ omitHelperCommand: true });
      const missingHelperResult = await judgeNativeStepResult({
        step: missingHelper.step,
        target: missingHelper.root,
        eventsPath: missingHelper.eventsPath,
        lastMessagePath: missingHelper.lastMessagePath,
        proofPath: missingHelper.proofPath,
        codexExitCode: 0,
        helperResults: [{ command: missingHelper.helper, exitCode: 0, stdout: "", stderr: "" }],
      });
      if (!missingHelperResult.failures.some((failure) => failure.includes("helper command not observed"))) {
        throw new Error(`expected missing helper failure, got ${missingHelperResult.failures.join("; ")}`);
      }

      const forbiddenWrite = await nativeJudgeFixture({ productFile: true });
      const forbiddenWriteResult = await judgeNativeStepResult({
        step: forbiddenWrite.step,
        target: forbiddenWrite.root,
        eventsPath: forbiddenWrite.eventsPath,
        lastMessagePath: forbiddenWrite.lastMessagePath,
        proofPath: forbiddenWrite.proofPath,
        codexExitCode: 0,
        helperResults: [{ command: forbiddenWrite.helper, exitCode: 0, stdout: "", stderr: "" }],
      });
      if (!forbiddenWriteResult.failures.some((failure) => failure.includes("planning-only step created product implementation files"))) {
        throw new Error(`expected forbidden write failure, got ${forbiddenWriteResult.failures.join("; ")}`);
      }
    },
  },
  {
    name: "skills.sh.json parses and manifest skill paths exist",
    run: async () => {
      const skills = await manifestSkills();
      if (skills.length === 0) {
        throw new Error("skills.sh.json does not list any skills");
      }
      for (const expected of [
        "build-right-preflight",
        "build-right-feature-planning",
        "build-right-execution",
      ]) {
        if (!skills.includes(expected)) {
          throw new Error(`skills.sh.json is missing ${expected}`);
        }
      }

      for (const skill of skills) {
        const skillPath = `skills/${skill}/SKILL.md`;
        const text = await read(skillPath);
        const yaml = frontmatter(text, skillPath);
        if (yaml.name !== skill) {
          throw new Error(`${skillPath} frontmatter name is ${yaml.name}, expected ${skill}`);
        }
        if (!yaml.description) {
          throw new Error(`${skillPath} frontmatter is missing description`);
        }
      }
    },
  },
  {
    name: "installed user-scope skills match repo-local source when installed",
    run: async () => {
      const home = Bun.env.CODEX_HOME ?? `${Bun.env.HOME}/.codex`;
      const skills = await manifestSkills();

      for (const skill of skills) {
        const repoRoot = `skills/${skill}`;
        const installedRoot = `${home}/skills/${skill}`;
        if (!(await exists(`${installedRoot}/SKILL.md`))) {
          console.log(`skip - ${skill} is not installed at ${installedRoot}`);
          continue;
        }

        const repoFiles = await filesUnder(repoRoot);
        const installedFiles = await filesUnderAbsolute(installedRoot);
        if (!arraysEqual(repoFiles, installedFiles)) {
          throw new Error(`${skill} installed files differ from repo-local files`);
        }

        for (const file of repoFiles) {
          const repoText = await read(`${repoRoot}/${file}`);
          const installedText = await Bun.file(`${installedRoot}/${file}`).text();
          if (repoText !== installedText) {
            throw new Error(`${skill}/${file} differs between repo-local and installed source`);
          }
        }
      }
    },
  },
  {
    name: "current preflight and execution contract markers exist",
    run: async () => {
      const requiredSkillFiles = [
        "skills/build-right-preflight/references/founder-gates.md",
        "skills/build-right-preflight/references/research-and-delegation.md",
        "skills/build-right-preflight/scripts/preflight-check.ts",
        "skills/build-right-feature-planning/references/gates.md",
        "skills/build-right-feature-planning/references/research-and-delegation.md",
        "skills/build-right-feature-planning/references/planning-contract.md",
        "skills/build-right-feature-planning/scripts/feature-planning-check.ts",
        "skills/build-right-execution/references/gates.md",
        "skills/build-right-execution/references/review-and-delegation.md",
        "skills/build-right-execution/scripts/continue-check.ts",
        "skills/build-right-execution/scripts/execution-check.ts",
      ];
      for (const file of requiredSkillFiles) {
        if (!(await exists(file))) {
          throw new Error(`missing split reference or helper: ${file}`);
        }
      }

      await assertIncludes("skills/build-right-preflight/SKILL.md", [
        "references/founder-gates.md",
        "references/research-and-delegation.md",
        "scripts/preflight-check.ts",
        "Preflight decision:",
      ]);
      const featureSkill = await read("skills/build-right-feature-planning/SKILL.md");
      if (featureSkill.includes("TODO")) {
        throw new Error("feature planning skill still contains TODO placeholder text");
      }
      await assertIncludes("skills/build-right-feature-planning/SKILL.md", [
        "references/workflow.md",
        "references/gates.md",
        "references/planning-contract.md",
        "references/research-and-delegation.md",
        "scripts/feature-planning-check.ts",
        "Planning decision:",
        "Ready for execution:",
        "must not implement the feature",
      ]);
      await assertIncludes("skills/build-right-feature-planning/references/workflow.md", [
        "feature-planning-check.ts",
        "route-preflight",
        "create-ready-tasks",
        "Stop before implementation",
      ]);
      await assertIncludes("skills/build-right-feature-planning/references/gates.md", [
        "Founder-Owned Gates",
        "Research Gates",
        "Delegation Gates",
        "Execution-Readiness Gate",
      ]);
      await assertIncludes("skills/build-right-feature-planning/references/planning-contract.md", [
        "tasks/post-release-backlog.md",
        "tasks/issues/*.md",
        "Reuse the execution task contract",
        "must not edit product implementation files",
      ]);
      await assertIncludes("skills/build-right-feature-planning/references/research-and-delegation.md", [
        "Research Lane",
        "Delegation Lane",
        "Subagents may gather, critique, and audit",
      ]);
      await assertIncludes("skills/build-right-feature-planning/assets/templates/tasks/feature-task.md", [
        "Assumption basis:",
        "Reversibility:",
        "Learning objective:",
        "Source under test:",
        "## Baseline Evidence",
        "## Verification",
        "## Evidence Log",
        "## Learning Notes",
      ]);
      await assertIncludes("skills/build-right-feature-planning/assets/templates/tasks/post-release-backlog.md", [
        "Status: active",
        "No AI-owned backlog task is ready",
      ]);
      await assertIncludes("skills/build-right-execution/SKILL.md", [
        "references/gates.md",
        "references/review-and-delegation.md",
        "scripts/continue-check.ts",
        "--strict",
        "Report the resolver findings",
        "scripts/execution-check.ts",
      ]);
      await assertIncludes("skills/build-right-execution/scripts/execution-check.ts", [
        "openConflictReasons",
        "not AI",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/docs/blueprint-status.md", [
        "Source mode",
        "Prototype confidence",
        "Prototype assumptions labeled",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/tasks/issue-template.md", [
        "Assumption basis",
        "Reversibility",
        "Learning objective",
        "Learning Notes",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/tasks/issues/001-establish-execution-baseline.md", [
        "Assumption basis:",
        "Reversibility:",
        "Learning objective:",
        "Source under test:",
      ]);
      await assertIncludes("skills/build-right-execution/assets/templates/task-template.md", [
        "Assumption basis",
        "Reversibility",
        "Learning objective",
        "Learning Notes",
      ]);
      await assertIncludes("skills/build-right-execution/assets/templates/not-ready-blocker.md", [
        "Assumption basis:",
        "Reversibility:",
        "Learning objective:",
        "Source under test:",
      ]);
      await assertIncludes("skills/build-right-execution/references/workflow.md", [
        "Source under test: <repo-local path | installed path | GitHub source | release tag | n/a>",
        "scripts/continue-check.ts",
        "scripts/execution-check.ts",
        "Before selecting another task, run the state resolver and stop/ask gate again.",
      ]);
      await assertIncludes("skills/build-right-execution/references/gates.md", [
        "State Resolver Gate",
        "continue-check.ts",
        "Stop/Ask Gates",
        "docs/conflicts.md",
        "not owned by AI",
        "Source Under Test Gate",
        "Before selecting another task, run the state resolver and stop/ask gate again.",
      ]);
      await assertIncludes("skills/build-right-execution/references/review-and-delegation.md", [
        "Required Review Triggers",
        "Subagents may gather, critique, and audit",
      ]);
      await assertIncludes("skills/build-right-execution/references/evidence-contract.md", [
        "Source under test: <repo-local path | installed path | GitHub source | release tag | n/a>",
      ]);
      await assertIncludes("skills/build-right-preflight/references/artifact-contract.md", [
        "Source under test: <repo-local path | installed path | GitHub source | release tag | n/a>",
      ]);
      await assertIncludes("skills/build-right-preflight/references/workflow.md", [
        "Interaction gate:",
        "scripts/preflight-check.ts",
      ]);
      await assertIncludes("skills/build-right-preflight/references/founder-gates.md", [
        "Interaction Gate",
        "Stop/Ask Gates",
      ]);
      await assertIncludes("skills/build-right-preflight/references/research-and-delegation.md", [
        "Required delegation triggers",
        "Subagents may gather, draft, critique, and audit",
      ]);
      await assertIncludes("agent-skills-research-delegation-design.md", [
        "scripts/preflight-check.ts",
        "preflight-check.ts`, report its decision",
        "scripts/continue-check.ts",
        "--strict",
        "scripts/execution-check.ts",
        "Founder-owned, external-state, non-AI-owner, open-conflict,",
        "release-claim gates",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/docs/execution-rules.md", [
        "## Stop/Ask Gates",
        "## Subagent Review Triggers",
        "Continue state resolver",
      ]);
      await assertIncludes("agent-skills-flow-diagrams.md", [
        "Ask focused founder question batch",
        "Preflight decision?",
        "Required trigger applies?",
        "Stop/ask gate before next task?",
        "build-right-feature-planning",
        "feature-planning-check.ts",
        "Deterministic Helper Lane",
        "Continue State Resolver",
        "preflight-check.ts",
        "continue-check.ts",
        "Report decision, confidence, next action, next task, blocking gates, and external follow-ups",
        "execution-check.ts",
        "Track in external post-release backlog",
        "Record no ready AI-owned task",
      ]);
      await assertIncludes("README.md", [
        "preflight-check.ts",
        "feature-planning-check.ts",
        "continue-check.ts",
        "execution-check.ts",
        "read-only Bun scripts",
        "route-preflight",
        "create-ready-tasks",
        "continue-active-task",
        "invalid-state",
        "does not commit generated `docs/` or `tasks/`",
      ]);
    },
  },
  {
    name: "bundled helper scripts run help and smoke checks",
    run: async () => {
      const preflightHelp = await runCommand([
        "bun",
        "skills/build-right-preflight/scripts/preflight-check.ts",
        "--help",
      ]);
      if (!preflightHelp.includes("inventory|readiness|all")) {
        throw new Error("preflight helper help output missing mode list");
      }

      const featurePlanningHelp = await runCommand([
        "bun",
        "skills/build-right-feature-planning/scripts/feature-planning-check.ts",
        "--help",
      ]);
      for (const marker of [
        "--feature",
        "route-preflight",
        "ask-founder",
        "run-research",
        "delegate-review",
        "update-roadmap",
        "update-sprint",
        "create-ready-tasks",
        "Planning decision",
        "Ready task candidates",
      ]) {
        if (!featurePlanningHelp.includes(marker)) {
          throw new Error(`feature planning helper help output missing ${marker}`);
        }
      }

      const executionHelp = await runCommand([
        "bun",
        "skills/build-right-execution/scripts/execution-check.ts",
        "--help",
      ]);
      if (!executionHelp.includes("next-task|task-contract|stop-gates|all")) {
        throw new Error("execution helper help output missing mode list");
      }

      const continueHelp = await runCommand([
        "bun",
        "skills/build-right-execution/scripts/continue-check.ts",
        "--help",
      ]);
      if (!continueHelp.includes("--include-completed") || !continueHelp.includes("--strict")) {
        throw new Error("continue helper help output missing mode flags");
      }

      const preflightSmoke = await runCommand([
        "bun",
        "skills/build-right-preflight/scripts/preflight-check.ts",
        "--cwd",
        ".",
        "--mode",
        "all",
        "--format",
        "json",
      ]);
      const preflightJson = JSON.parse(preflightSmoke) as {
        projectTypeSignal?: string;
        decision?: string;
        nextAction?: string;
      };
      if (!preflightJson.projectTypeSignal) {
        throw new Error("preflight helper smoke output missing projectTypeSignal");
      }
      if (!preflightJson.decision || !preflightJson.nextAction) {
        throw new Error("preflight helper smoke output missing decision or nextAction");
      }

      const featurePlanningSmoke = await runCommand([
        "bun",
        "skills/build-right-feature-planning/scripts/feature-planning-check.ts",
        "--cwd",
        ".",
        "--feature",
        "Example feature",
        "--format",
        "json",
      ]);
      const featurePlanningJson = JSON.parse(featurePlanningSmoke) as {
        decision?: string;
        nextAction?: string;
        recommendedDestination?: string;
      };
      if (!featurePlanningJson.decision || !featurePlanningJson.nextAction) {
        throw new Error("feature planning helper smoke output missing decision or nextAction");
      }
      if (!featurePlanningJson.recommendedDestination) {
        throw new Error("feature planning helper smoke output missing recommendedDestination");
      }

      const executionSmoke = await runCommand([
        "bun",
        "skills/build-right-execution/scripts/execution-check.ts",
        "--cwd",
        ".",
        "--mode",
        "next-task",
        "--format",
        "json",
      ]);
      const executionJson = JSON.parse(executionSmoke) as { recommendation?: string };
      if (!executionJson.recommendation) {
        throw new Error("execution helper smoke output missing recommendation");
      }

      const continueSmoke = await runCommand([
        "bun",
        "skills/build-right-execution/scripts/continue-check.ts",
        "--cwd",
        ".",
        "--format",
        "json",
        "--strict",
      ]);
      const continueJson = JSON.parse(continueSmoke) as {
        decision?: string;
        readyTasks?: unknown[];
      };
      if (!["ask-founder", "wait-external", "no-ready-task", "create-blocker"].includes(continueJson.decision ?? "")) {
        throw new Error(`continue helper current-repo decision was ${continueJson.decision}`);
      }
      if ((continueJson.readyTasks ?? []).length !== 0) {
        throw new Error("continue helper found ready tasks in current completed repo");
      }
    },
  },
  {
    name: "todo trial helper exposes sprint 002 verifier commands",
    run: async () => {
      const help = await runCommand(["bun", "scripts/todo-trial.ts", "help"]);
      for (const marker of [
        "snapshot-preflight",
        "verify-preflight",
        "verify-preflight-negative",
        "verify-execution",
        "verify-execution-negative",
        "negative-gates",
        "failure-summary",
        "failure-log-smoke",
        "verify-e2e-oracle",
        "verify-transcripts",
        "failure-injection",
        "concurrency",
        "e2e-replay",
        "e2e-report",
        "verify-e2e-report",
      ]) {
        if (!help.includes(marker)) {
          throw new Error(`todo trial helper help output missing ${marker}`);
        }
      }

      await assertIncludes("planning/failed-tests.md", [
        "## Failure Classes",
        "Command or Test",
        "Follow-up",
      ]);
      await assertIncludes("planning/todo-trial-protocol.md", [
        "Human Prompt: Preflight",
        "Human Prompt: Execution",
        "Failure Logging",
      ]);
      await assertIncludes("planning/sprints/002-todo-skill-trial-automation.md", [
        "Status: complete",
        "Failure Logging Rule",
      ]);
    },
  },
  {
    name: "sprint 004 e2e oracle covers shared, preflight, execution, and negative controls",
    run: async () => {
      await runCommand(["bun", "scripts/todo-trial.ts", "verify-e2e-oracle"]);
      await assertIncludes("planning/e2e-workflow-oracle.md", [
        "## Shared Gates",
        "Source parity",
        "Failure logging",
        "Bun compliance",
        "Scratch isolation",
        "## Preflight Oracle",
        "## Execution Oracle",
        "## Negative Controls",
        "`partial-needs-rerun`",
        "`expected-control`",
        "`expected-logged`",
        "## Report Oracle",
      ]);
    },
  },
  {
    name: "transcript verifier enforces preflight and execution workflow order",
    run: async () => {
      const preflight = await positivePreflightFixture();
      const execution = await executionEvidenceFixture(`| Check | Result |
| --- | --- |
| Add todo | pass |
| Complete todo | pass |
| Completed filter | pass |
| Active filter | pass |
| Delete todo | pass |
| localStorage restore | pass |
`);
      await runCommand([
        "bun",
        "scripts/todo-trial.ts",
        "verify-transcripts",
        "--target",
        execution,
        "--preflight-target",
        preflight,
      ]);

      await Bun.write(
        `${preflight}/docs/evidence/preflight-transcript.md`,
        `# Preflight Transcript

## Helper Report

Preflight decision: ready-for-execution

## File Plan

Create docs.

## Focused Founder Questions

Question.

## Founder Reply

Answer.

## Closeout

First executable AI task: tasks/issues/001-build-bun-react-todo-app.md
`,
      );
      const failureLog = `${preflight}/failed-tests.md`;
      await Bun.write(failureLog, failureLogFixture(""));
      const result = await runCommandResult([
        "bun",
        "scripts/todo-trial.ts",
        "verify-transcripts",
        "--target",
        execution,
        "--preflight-target",
        preflight,
        "--failure-log",
        failureLog,
      ]);
      if (result.exitCode === 0 || !result.output.includes("missing ordered marker")) {
        throw new Error(`transcript ordering failure was not rejected: ${result.output}`);
      }
      const logText = await read(failureLog);
      if (!logText.includes("| 035 | verify-transcripts |")) {
        throw new Error(`transcript failure was not logged to task 035: ${logText}`);
      }
    },
  },
  {
    name: "e2e report generation writes required review sections",
    run: async () => {
      const preflight = await positivePreflightFixture();
      const execution = await executionEvidenceFixture(`| Check | Result |
| --- | --- |
| Add todo | pass |
| Complete todo | pass |
| Completed filter | pass |
| Active filter | pass |
| Delete todo | pass |
| localStorage restore | pass |
`);
      const root = await createFixture("e2e-report", {
        "failed-tests.md": failureLogFixture(
          "| 2026-06-24 | 037 | injected | cmd | expected | actual | generated-artifact | artifact | follow-up.md | expected-control |\n",
        ),
      });
      const report = `${root}/report.md`;
      await runCommand([
        "bun",
        "scripts/todo-trial.ts",
        "e2e-report",
        "--target",
        execution,
        "--preflight-target",
        preflight,
        "--failure-log",
        `${root}/failed-tests.md`,
        "--summary-output",
        `${root}/summary.md`,
        "--report",
        report,
      ]);
      const text = await read(report);
      for (const marker of [
        "Run label:",
        "Timestamp:",
        "Source under test:",
        "Preflight target:",
        "Execution target:",
        "## Command List",
        "## Shared Gates",
        "## Preflight",
        "## Execution",
        "## Negative Controls",
        "Expected/control rows: 1",
        "## Agentic Replay",
        "## Artifacts",
        "## Failure Summary",
        "## Proved",
        "## Simulated",
        "## Unproven",
        "## Follow-Ups",
      ]) {
        if (!text.includes(marker)) {
          throw new Error(`e2e report missing marker ${marker}: ${text}`);
        }
      }
      await runCommand(["bun", "scripts/todo-trial.ts", "verify-e2e-report", "--report", report]);
    },
  },
  {
    name: "failure injection and concurrency commands log expected controls without open failures",
    run: async () => {
      const preflight = await positivePreflightFixture();
      const execution = await executionEvidenceFixture(`| Check | Result |
| --- | --- |
| Add todo | pass |
| Complete todo | pass |
| Completed filter | pass |
| Active filter | pass |
| Delete todo | pass |
| localStorage restore | pass |
`);
      const root = await createFixture("failure-injection", {
        "failed-tests.md": failureLogFixture(""),
      });
      await runCommand([
        "bun",
        "scripts/todo-trial.ts",
        "failure-injection",
        "--source",
        preflight,
        "--target",
        execution,
        "--failure-log",
        `${root}/failed-tests.md`,
        "--summary-output",
        `${root}/summary.md`,
      ]);
      const logText = await read(`${root}/failed-tests.md`);
      for (const phase of [
        "failure-injection-preflight-missing",
        "failure-injection-preflight-app",
        "failure-injection-browser-proof",
        "failure-injection-runtime",
        "failure-injection-malformed-conflict",
        "failure-injection-source-parity",
      ]) {
        if (!logText.includes(`| 037 | ${phase} |`)) {
          throw new Error(`failure injection did not log ${phase}: ${logText}`);
        }
      }
      const summary = await read(`${root}/summary.md`);
      if (!summary.includes("Actionable open rows: 0") || !summary.includes("Expected/control rows: 6")) {
        throw new Error(`failure injection summary was not classified as controls: ${summary}`);
      }

      const concurrency = await runCommand([
        "bun",
        "scripts/todo-trial.ts",
        "concurrency",
        "--source",
        preflight,
        "--target",
        execution,
      ]);
      if (!concurrency.includes("/tmp/build-right-todo-trial-concurrency-")) {
        throw new Error(`concurrency output did not include isolated scratch root: ${concurrency}`);
      }
    },
  },
  {
    name: "failure summary separates actionable, expected, forced, and resolved rows",
    run: async () => {
      const root = await createFixture("failure-summary", {
        "failed-tests.md": failureLogFixture([
          "| 2026-06-24 | 101 | alpha | cmd | expected | actual | verifier-gap | artifact | follow-up.md | open |",
          "| 2026-06-24 | 101 | alpha | fix | expected | actual | verifier-gap | artifact | follow-up.md | resolved |",
          "| 2026-06-24 | 102 | beta | cmd | expected | actual | generated-artifact | artifact | follow-up.md | open |",
          "| 2026-06-24 | 103 | gamma | cmd | expected | actual | source-under-test | artifact | follow-up.md | expected-logged |",
          "| 2026-06-24 | 104 | delta | cmd | expected | actual | verifier-gap | artifact | follow-up.md | forced-open |",
        ].join("\n")),
      });
      const summary = `${root}/summary.md`;
      await runCommand([
        "bun",
        "scripts/todo-trial.ts",
        "failure-summary",
        "--failure-log",
        `${root}/failed-tests.md`,
        "--summary-output",
        summary,
      ]);
      const text = await read(summary);
      for (const marker of [
        "Actionable open rows: 1",
        "Historical open rows with resolution: 1",
        "Expected/control rows: 2",
        "Resolved rows: 1",
        "| verifier-gap | alpha | 2 | 0 | 1 | 0 | follow-up.md |",
        "| generated-artifact | beta | 1 | 1 | 0 | 0 | follow-up.md |",
        "- generated-artifact/beta: 1 rows, 1 actionable. Candidate follow-up: follow-up.md.",
        "## Closed And Control Inventory",
        "- verifier-gap/alpha: 2 closed, 0 expected/control.",
        "- source-under-test/gamma: 0 closed, 1 expected/control.",
        "- verifier-gap/delta: 0 closed, 1 expected/control.",
      ]) {
        if (!text.includes(marker)) {
          throw new Error(`failure summary missing marker: ${marker}\n${text}`);
        }
      }
      for (const forbidden of [
        "Candidate follow-up: follow-up.md.\n- source-under-test/gamma",
        "- verifier-gap/alpha: 2 rows, 0 actionable.",
        "- source-under-test/gamma: 1 rows, 0 actionable.",
        "- verifier-gap/delta: 1 rows, 0 actionable.",
      ]) {
        if (text.includes(forbidden)) {
          throw new Error(`failure summary still lists closed/control group as actionable: ${forbidden}\n${text}`);
        }
      }
    },
  },
  {
    name: "preflight verifier accepts nested fixtures and lowercase bun while rejecting bad preflight state",
    run: async () => {
      const target = await positivePreflightFixture();
      await runCommand(["bun", "scripts/todo-trial.ts", "verify-preflight", "--target", target]);

      const missing = await positivePreflightFixture();
      await runCommand(["rm", "-f", `${missing}/docs/source-index.md`]);
      const missingLog = `${missing}/failed-tests.md`;
      const missingResult = await runCommandResult([
        "bun",
        "scripts/todo-trial.ts",
        "verify-preflight",
        "--target",
        missing,
        "--failure-log",
        missingLog,
      ]);
      if (missingResult.exitCode === 0 || !missingResult.output.includes("missing file")) {
        throw new Error(`missing preflight artifact was not rejected: ${missingResult.output}`);
      }

      const appFile = await positivePreflightFixture();
      await Bun.write(`${appFile}/package.json`, "{\"name\":\"bad-preflight\"}\n");
      const appLog = `${appFile}/failed-tests.md`;
      const appResult = await runCommandResult([
        "bun",
        "scripts/todo-trial.ts",
        "verify-preflight",
        "--target",
        appFile,
        "--failure-log",
        appLog,
      ]);
      if (appResult.exitCode === 0 || !appResult.output.includes("app file exists during preflight verification")) {
        throw new Error(`preflight app file was not rejected: ${appResult.output}`);
      }
    },
  },
  {
    name: "execution verifier scan is scoped and browser proof failures stay isolated",
    run: async () => {
      const scoped = await createFixture("runtime-scan-scoped", {
        "package.json": "{\"name\":\"fixture\",\"type\":\"module\"}\n",
        "index.ts": "Bun.serve({ routes: {} });\n",
        "index.html": "<script type=\"module\" src=\"./frontend.tsx\"></script>\n",
        "todo.ts": "export const todos = [];\n",
        "frontend.tsx": "const marker = 'ok';\n",
        "index.css": "body{}\n",
        "todo.test.ts": "import { test } from 'bun:test';\n",
        "docs/notes.md": "Do not use vite, npm, pnpm, yarn, npx, express, dotenv, or ws.\n",
        "node_modules/pkg/readme.md": "mentions express and vite\n",
      });
      await runCommand(["bun", "scripts/todo-trial.ts", "scan-runtime", "--target", scoped]);

      await Bun.write(`${scoped}/frontend.tsx`, "import 'vite';\n");
      const runtimeLog = `${scoped}/failed-tests.md`;
      const runtimeResult = await runCommandResult([
        "bun",
        "scripts/todo-trial.ts",
        "scan-runtime",
        "--target",
        scoped,
        "--failure-log",
        runtimeLog,
      ]);
      if (runtimeResult.exitCode === 0 || !runtimeResult.output.includes("forbidden runtime reference")) {
        throw new Error(`runtime forbidden reference was not rejected: ${runtimeResult.output}`);
      }

      const browserProof = `| Check | Result |
| --- | --- |
| Add todo | pass |
| Complete todo | pass |
| Completed filter | pass |
| Active filter | pass |
| Delete todo | pass |
| localStorage restore | fail |
`;
      const execution = await executionEvidenceFixture(browserProof);
      const browserLog = `${execution}/failed-tests.md`;
      const browserResult = await runCommandResult([
        "bun",
        "scripts/todo-trial.ts",
        "verify-execution",
        "--target",
        execution,
        "--failure-log",
        browserLog,
      ]);
      if (browserResult.exitCode === 0 || !browserResult.output.includes("| localStorage restore | pass |")) {
        throw new Error(`browser proof corruption was not isolated: ${browserResult.output}`);
      }

      const script = await read("scripts/todo-trial.ts");
      if (script.includes("filter-completed")) {
        throw new Error("execution verifier still depends on literal filter-completed marker");
      }
    },
  },
  {
    name: "negative gate matrix rejects malformed conflict fixtures distinctly",
    run: async () => {
      await runCommand(["bun", "scripts/todo-trial.ts", "negative-gates"]);
      const malformed = await runCommand([
        "bun",
        "scripts/todo-trial.ts",
        "negative-gates-malformed-conflict",
      ]);
      if (!malformed.includes("fixture error: docs/conflicts.md is missing required ## Conflicts section")) {
        throw new Error(`malformed conflict fixture was not rejected distinctly: ${malformed}`);
      }
    },
  },
  {
    name: "baseline and status audit commands are shell independent",
    run: async () => {
      const baseline = await createFixture("baseline-no-tests", {
        "package.json": "{\"name\":\"baseline-no-tests\",\"type\":\"module\"}\n",
      });
      const baselineOutput = await runCommand([
        "bun",
        "scripts/todo-trial.ts",
        "baseline-check",
        "--target",
        baseline,
        "--phase",
        "baseline",
      ]);
      if (!baselineOutput.includes("expected-baseline")) {
        throw new Error(`baseline no-tests output was not classified: ${baselineOutput}`);
      }

      const finalLog = `${baseline}/failed-tests.md`;
      const finalResult = await runCommandResult([
        "bun",
        "scripts/todo-trial.ts",
        "baseline-check",
        "--target",
        baseline,
        "--phase",
        "final",
        "--failure-log",
        finalLog,
      ]);
      if (finalResult.exitCode === 0 || !finalResult.output.includes("final bun test failed")) {
        throw new Error(`final no-tests failure was not rejected: ${finalResult.output}`);
      }

      const auditFiles: Record<string, string> = {
        "planning/sprints/003-failed-test-remediation.md": "# Sprint 003\n\nStatus: complete\n",
      };
      for (let id = 15; id <= 26; id += 1) {
        const idText = String(id).padStart(3, "0");
        auditFiles[`planning/tasks/${idText}-fixture.md`] = `# ${idText}: Fixture

Status: complete

## Acceptance Criteria

- [x] done
`;
      }
      const auditRoot = await createFixture("status-audit", auditFiles);
      await runCommand([
        "bun",
        "scripts/todo-trial.ts",
        "status-audit",
        "--audit-root",
        auditRoot,
        "--sprint",
        "planning/sprints/003-failed-test-remediation.md",
        "--task-start",
        "015",
        "--task-end",
        "026",
      ]);

      await Bun.write(`${auditRoot}/planning/tasks/020-fixture.md`, "# 020: Fixture\n\nStatus: ready\n\n- [ ] not done\n");
      const auditLog = `${auditRoot}/failed-tests.md`;
      const auditResult = await runCommandResult([
        "bun",
        "scripts/todo-trial.ts",
        "status-audit",
        "--audit-root",
        auditRoot,
        "--sprint",
        "planning/sprints/003-failed-test-remediation.md",
        "--task-start",
        "015",
        "--task-end",
        "026",
        "--failure-log",
        auditLog,
      ]);
      if (auditResult.exitCode === 0 || !auditResult.output.includes("020-fixture.md is not complete")) {
        throw new Error(`status audit did not report incomplete task: ${auditResult.output}`);
      }
    },
  },
  {
    name: "source parity mismatch output includes remediation guidance",
    run: async () => {
      await runCommand(["bun", "scripts/todo-trial.ts", "parity"]);

      const compareRoot = await createFixture("parity-mismatch", {});
      await runCommand(["cp", "-R", "skills/build-right-preflight", `${compareRoot}/build-right-preflight`]);
      await runCommand(["cp", "-R", "skills/build-right-feature-planning", `${compareRoot}/build-right-feature-planning`]);
      await runCommand(["cp", "-R", "skills/build-right-execution", `${compareRoot}/build-right-execution`]);
      await Bun.write(
        `${compareRoot}/build-right-preflight/SKILL.md`,
        `${await read(`${compareRoot}/build-right-preflight/SKILL.md`)}\n<!-- mismatch -->\n`,
      );
      const parityLog = `${compareRoot}/failed-tests.md`;
      const mismatch = await runCommandResult([
        "bun",
        "scripts/todo-trial.ts",
        "parity",
        "--compare-root",
        compareRoot,
        "--failure-log",
        parityLog,
      ]);
      for (const marker of ["partial-needs-rerun", "Mismatched source:", "Remediation: use the repo-local skills/ source"]) {
        if (!mismatch.output.includes(marker)) {
          throw new Error(`parity mismatch output missing ${marker}: ${mismatch.output}`);
        }
      }
      if (mismatch.exitCode === 0) {
        throw new Error("parity mismatch unexpectedly passed");
      }

      const negativeLog = `${compareRoot}/negative-failed-tests.md`;
      const negativeSummary = `${compareRoot}/negative-summary.md`;
      await Bun.write(negativeLog, failureLogFixture(""));
      await runCommand([
        "bun",
        "scripts/todo-trial.ts",
        "parity-negative",
        "--failure-log",
        negativeLog,
      ]);
      const concurrentLogA = `${compareRoot}/negative-concurrent-a.md`;
      const concurrentLogB = `${compareRoot}/negative-concurrent-b.md`;
      await Bun.write(concurrentLogA, failureLogFixture(""));
      await Bun.write(concurrentLogB, failureLogFixture(""));
      await Promise.all([
        runCommand([
          "bun",
          "scripts/todo-trial.ts",
          "parity-negative",
          "--failure-log",
          concurrentLogA,
        ]),
        runCommand([
          "bun",
          "scripts/todo-trial.ts",
          "parity-negative",
          "--failure-log",
          concurrentLogB,
        ]),
      ]);
      await runCommand([
        "bun",
        "scripts/todo-trial.ts",
        "failure-summary",
        "--failure-log",
        negativeLog,
        "--summary-output",
        negativeSummary,
      ]);
      const summary = await read(negativeSummary);
      if (!summary.includes("Expected/control rows: 1")) {
        throw new Error(`parity negative was not classified as expected control: ${summary}`);
      }
    },
  },
  {
    name: "preflight helper fixture decisions are stable",
    run: async () => {
      const blank = await preflightDecisionForFixture({});
      if (blank.decision !== "ask-founder" || blank.projectTypeSignal !== "blank/new") {
        throw new Error(`blank preflight fixture returned ${blank.decision}`);
      }

      const existing = await preflightDecisionForFixture({
        "README.md": "# Existing Project\n",
        "docs/a.md": "# A\n",
        "docs/b.md": "# B\n",
        "docs/c.md": "# C\n",
        "docs/d.md": "# D\n",
        "docs/e.md": "# E\n",
        "tasks/roadmap.md": "# Roadmap\n",
      });
      if (existing.decision !== "delegate-inventory") {
        throw new Error(`existing preflight fixture returned ${existing.decision}`);
      }

      const baseReadyPreflight = {
        "docs/raw/founder-dump.md": "# Founder Dump\n",
        "docs/raw/founder-interview.md": "# Founder Interview\n",
        "docs/blueprint-status.md": readyBlueprint(),
        "docs/source-index.md": "# Source Index\n",
        "docs/mvp-scope.md": `# MVP Scope

Status: ready
Source mode: founder-fed
Prototype confidence: n/a

Primary customer: Operators
Primary workflow: Evidence-driven execution
`,
        "docs/execution-rules.md": "# Execution Rules\n",
        "docs/release-gates.md": releaseGates(),
        "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
        "tasks/issues/001-task.md": taskFile("001", "ready"),
      };

      const publicResearch = await preflightDecisionForFixture({
        ...baseReadyPreflight,
        "docs/blueprint-status.md": readyBlueprint().replace("Status: ready", "Status: ready\nSource mode: public-first-prototype"),
      });
      if (publicResearch.decision !== "run-research") {
        throw new Error(`public research preflight fixture returned ${publicResearch.decision}`);
      }

      const ready = await preflightDecisionForFixture(baseReadyPreflight);
      if (ready.decision !== "ready-for-execution") {
        throw new Error(`ready preflight fixture returned ${ready.decision}`);
      }
    },
  },
  {
    name: "preflight helper covers artifact and source-mode matrix",
    run: async () => {
      const baseReadyPreflight = {
        "docs/raw/founder-dump.md": "# Founder Dump\n",
        "docs/raw/founder-interview.md": "# Founder Interview\n",
        "docs/blueprint-status.md": readyBlueprint(),
        "docs/source-index.md": "# Source Index\n",
        "docs/mvp-scope.md": `# MVP Scope

Status: ready
Source mode: founder-fed
Prototype confidence: n/a

Primary customer: Operators
Primary workflow: Evidence-driven execution
`,
        "docs/execution-rules.md": "# Execution Rules\n",
        "docs/release-gates.md": releaseGates(),
        "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
        "tasks/issues/001-task.md": taskFile("001", "ready"),
      };

      const missingCoreDocs = await preflightDecisionForFixture({
        "docs/raw/founder-dump.md": "# Founder Dump\n",
        "docs/raw/founder-interview.md": "# Founder Interview\n",
        "docs/blueprint-status.md": readyBlueprint(),
        "docs/mvp-scope.md": `# MVP Scope

Primary customer: Operators
Primary workflow: Evidence-driven execution
`,
      });
      if (missingCoreDocs.decision !== "write-artifacts") {
        throw new Error(`missing-core-docs fixture returned ${missingCoreDocs.decision}`);
      }

      const missingTaskSurface = await preflightDecisionForFixture({
        "docs/raw/founder-dump.md": "# Founder Dump\n",
        "docs/raw/founder-interview.md": "# Founder Interview\n",
        "docs/blueprint-status.md": readyBlueprint(),
        "docs/source-index.md": "# Source Index\n",
        "docs/mvp-scope.md": `# MVP Scope

Primary customer: Operators
Primary workflow: Evidence-driven execution
`,
        "docs/execution-rules.md": "# Execution Rules\n",
        "docs/release-gates.md": releaseGates(),
      });
      if (missingTaskSurface.decision !== "create-sprint0") {
        throw new Error(`missing-task-surface fixture returned ${missingTaskSurface.decision}`);
      }

      const founderFed = await preflightDecisionForFixture(baseReadyPreflight);
      if (founderFed.decision !== "ready-for-execution") {
        throw new Error(`founder-fed fixture returned ${founderFed.decision}`);
      }

      for (const mode of ["web-assisted", "public-first-prototype"]) {
        const result = await preflightDecisionForFixture({
          ...baseReadyPreflight,
          "docs/blueprint-status.md": readyBlueprint().replace("Status: ready", `Status: ready\nSource mode: ${mode}`),
        });
        if (result.decision !== "run-research") {
          throw new Error(`${mode} fixture returned ${result.decision}`);
        }

        const withEvidence = await preflightDecisionForFixture({
          ...baseReadyPreflight,
          "docs/blueprint-status.md": readyBlueprint().replace("Status: ready", `Status: ready\nSource mode: ${mode}`),
          "docs/evidence/evidence-notes.md": "# Evidence Notes\n",
        });
        if (withEvidence.decision !== "ready-for-execution") {
          throw new Error(`${mode} with public evidence returned ${withEvidence.decision}`);
        }
      }
    },
  },
  {
    name: "feature planning helper covers planning decision matrix",
    run: async () => {
      const basePlanning = {
        "docs/blueprint-status.md": readyBlueprint(),
        "docs/mvp-scope.md": `# MVP Scope

Status: ready

## Included

- Todo app feature iteration.
`,
        "docs/execution-rules.md": "# Execution Rules\n",
        "docs/conflicts.md": `# Conflicts

Status: ready

## Conflicts

| Conflict | Sources | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| None | n/a | low | AI | resolved | n/a |
`,
      };

      const missingPreflight = await featurePlanningDecisionForFixture({}, "Add recurring todos");
      if (missingPreflight.decision !== "route-preflight") {
        throw new Error(`missing preflight fixture returned ${missingPreflight.decision}`);
      }

      const founderGate = await featurePlanningDecisionForFixture(
        {
          ...basePlanning,
          "docs/open-questions.md": "# Open Questions\n\nStatus: active\n\n## Questions\n\n- Confirm MVP priority.\n",
          "tasks/sprint-0.md": tracker(""),
        },
        "Add recurring todos",
      );
      if (founderGate.decision !== "ask-founder" || (founderGate.founderQuestions ?? []).length === 0) {
        throw new Error(`founder gate fixture returned ${founderGate.decision}`);
      }

      const conflict = await featurePlanningDecisionForFixture(
        {
          ...basePlanning,
          "docs/conflicts.md": `# Conflicts

Status: active

## Conflicts

| Conflict | Sources | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| Recurring reminders conflict with MVP boundary | docs/mvp-scope.md | high | founder | open |  |
`,
          "tasks/sprint-0.md": tracker(""),
        },
        "Add recurring todos",
      );
      if (conflict.decision !== "blocked" || conflict.blockingGates?.[0]?.type !== "open-conflict") {
        throw new Error(`conflict fixture returned ${conflict.decision}`);
      }

      const research = await featurePlanningDecisionForFixture(
        {
          ...basePlanning,
          "tasks/sprint-0.md": tracker(""),
        },
        "Compare competitor pricing for paid reminders",
      );
      if (research.decision !== "run-research" || (research.researchTriggers ?? []).length === 0) {
        throw new Error(`research fixture returned ${research.decision}`);
      }

      const delegated = await featurePlanningDecisionForFixture(
        {
          ...basePlanning,
          "tasks/sprint-0.md": tracker(""),
        },
        "Plan an authentication architecture migration across many modules",
      );
      if (delegated.decision !== "delegate-review") {
        throw new Error(`delegate-review fixture returned ${delegated.decision}`);
      }

      const backlog = await featurePlanningDecisionForFixture(
        {
          ...basePlanning,
          "tasks/sprint-0.md": tracker(""),
          "tasks/post-release-backlog.md": tracker(""),
        },
        "Defer dark mode to the post-release backlog",
      );
      if (backlog.decision !== "update-roadmap" || backlog.recommendedDestination !== "tasks/post-release-backlog.md") {
        throw new Error(`backlog fixture returned ${backlog.decision}`);
      }

      const sprint = await featurePlanningDecisionForFixture(
        {
          ...basePlanning,
          "tasks/sprint-0.md": tracker(""),
        },
        "Add due dates to todos",
      );
      if (sprint.decision !== "update-sprint" || sprint.recommendedDestination !== "tasks/sprint-0.md") {
        throw new Error(`sprint fixture returned ${sprint.decision}`);
      }

      const ready = await featurePlanningDecisionForFixture(
        {
          ...basePlanning,
          "tasks/sprint-0.md": tracker("| 002 | Add due dates | ready | tasks/issues/002-add-due-dates.md |"),
          "tasks/issues/002-add-due-dates.md": taskFile("002", "ready"),
        },
        "Add due dates to todos",
      );
      if (
        ready.decision !== "create-ready-tasks" ||
        ready.readyTaskCandidates?.[0]?.path !== "tasks/issues/002-add-due-dates.md"
      ) {
        throw new Error(`ready fixture returned ${ready.decision}`);
      }
    },
  },
  {
    name: "continue resolver fixture decisions are stable",
    run: async () => {
      const baseDocs = {
        "docs/blueprint-status.md": readyBlueprint(),
        "docs/open-questions.md": openQuestions(),
        "docs/release-gates.md": releaseGates(),
        "docs/execution-rules.md": "# Execution Rules\n",
      };

      const active = await continueDecisionForFixture({
        ...baseDocs,
        "tasks/sprint-0.md": tracker("| 001 | Active task | active | tasks/issues/001-task.md |"),
        "tasks/issues/001-task.md": taskFile("001", "active"),
      });
      if (active.decision !== "continue-active-task" || active.nextTask?.id !== "001") {
        throw new Error(`active fixture returned ${active.decision}`);
      }

      const ready = await continueDecisionForFixture({
        ...baseDocs,
        "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
        "tasks/post-release-backlog.md": tracker("| 002 | Later task | ready | tasks/issues/002-task.md |"),
        "tasks/issues/001-task.md": taskFile("001", "ready"),
        "tasks/issues/002-task.md": taskFile("002", "ready"),
      });
      if (ready.decision !== "execute-task" || ready.nextTask?.id !== "001") {
        throw new Error(`ready fixture returned ${ready.decision}`);
      }

      const starterTask = await continueDecisionForFixture({
        ...baseDocs,
        "tasks/sprint-0.md": tracker("| 001 | Starter task | ready | tasks/issues/001-establish-execution-baseline.md |"),
        "tasks/issues/001-establish-execution-baseline.md": await read(
          "skills/build-right-preflight/assets/templates/tasks/issues/001-establish-execution-baseline.md",
        ),
      });
      if (starterTask.decision !== "execute-task" || starterTask.nextTask?.id !== "001") {
        throw new Error(`starter task fixture returned ${starterTask.decision}`);
      }

      const founder = await continueDecisionForFixture({
        ...baseDocs,
        "docs/blueprint-status.md": readyBlueprint().replace(
          "| Founder intent captured | ready | docs/open-questions.md | resolved |",
          "| Founder intent captured | needs-founder | docs/open-questions.md | primary user needed |",
        ),
        "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
        "tasks/issues/001-task.md": taskFile("001", "ready"),
      });
      if (founder.decision !== "ask-founder") {
        throw new Error(`founder fixture returned ${founder.decision}`);
      }

      const founderOwnedTask = await continueDecisionForFixture({
        ...baseDocs,
        "tasks/sprint-0.md": tracker("| 001 | Founder task | ready | tasks/issues/001-task.md |"),
        "tasks/issues/001-task.md": taskFile("001", "ready", "Founder"),
      });
      if (founderOwnedTask.decision !== "ask-founder") {
        throw new Error(`founder-owned task fixture returned ${founderOwnedTask.decision}`);
      }

      const externalOwnedTask = await continueDecisionForFixture({
        ...baseDocs,
        "tasks/sprint-0.md": tracker("| 001 | External task | ready | tasks/issues/001-task.md |"),
        "tasks/issues/001-task.md": taskFile("001", "ready", "External provider"),
      });
      if (externalOwnedTask.decision !== "wait-external") {
        throw new Error(`external-owned task fixture returned ${externalOwnedTask.decision}`);
      }

      const external = await continueDecisionForFixture({
        ...baseDocs,
        "docs/release-gates.md": releaseGates("post-release-follow-up"),
        "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
        "tasks/issues/001-task.md": taskFile("001", "ready"),
      });
      if (external.decision !== "wait-external") {
        throw new Error(`external fixture returned ${external.decision}`);
      }

      const openConflict = await continueDecisionForFixture({
        ...baseDocs,
        "docs/conflicts.md": `# Conflicts

## Conflicts

| Conflict | Sources | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| Customer definition conflicts | docs/a.md, docs/b.md | high | founder | open |  |
`,
        "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
        "tasks/issues/001-task.md": taskFile("001", "ready"),
      });
      if (openConflict.decision !== "ask-founder") {
        throw new Error(`open conflict fixture returned ${openConflict.decision}`);
      }

      const aiOwnedConflict = await continueDecisionForFixture({
        ...baseDocs,
        "docs/conflicts.md": `# Conflicts

## Conflicts

| Conflict | Sources | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| Task tracker paths disagree | tasks/a.md, tasks/b.md | medium | AI | open |  |
`,
        "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
        "tasks/issues/001-task.md": taskFile("001", "ready"),
      });
      if (aiOwnedConflict.decision !== "create-blocker" || aiOwnedConflict.blockingGates?.[0]?.type !== "open-conflict") {
        throw new Error(`AI-owned conflict fixture returned ${aiOwnedConflict.decision}`);
      }

      const missing = await continueDecisionForFixture({
        "docs/blueprint-status.md": readyBlueprint(),
        "docs/open-questions.md": openQuestions(),
        "docs/release-gates.md": releaseGates(),
        "docs/execution-rules.md": "# Execution Rules\n",
      });
      if (missing.decision !== "create-blocker") {
        throw new Error(`missing tracker fixture returned ${missing.decision}`);
      }

      const noReady = await continueDecisionForFixture({
        ...baseDocs,
        "tasks/sprint-0.md": tracker("| 001 | Done task | complete | tasks/issues/001-task.md |"),
        "tasks/issues/001-task.md": taskFile("001", "complete"),
      });
      if (noReady.decision !== "no-ready-task") {
        throw new Error(`no-ready fixture returned ${noReady.decision}`);
      }

      const invalid = await continueDecisionForFixture({
        ...baseDocs,
        "tasks/sprint-0.md": tracker("| 001 | Missing task file | ready | tasks/issues/001-missing.md |"),
      });
      if (invalid.decision !== "invalid-state") {
        throw new Error(`invalid-state fixture returned ${invalid.decision}`);
      }

      const blockingReleaseRows: Array<[string, string]> = [
        [
          "source-mismatch",
          "| Installed source parity | skill diff | diff installed skill | partial-needs-rerun |",
        ],
        [
          "failed-verification",
          "| Local validation | checks pass | bun run verify:skill-trials | failed |",
        ],
        [
          "stale",
          "| Manual trial freshness | current installed skill | stale trial evidence | stale |",
        ],
        [
          "release-claim",
          "| release-claim proof | durable evidence | missing durable artifact | blocked |",
        ],
      ];

      for (const [expectedType, row] of blockingReleaseRows) {
        const blocked = await continueDecisionForFixture({
          ...baseDocs,
          "docs/release-gates.md": releaseGatesWithRow(row),
          "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
          "tasks/issues/001-task.md": taskFile("001", "ready"),
        });
        if (blocked.decision !== "create-blocker" || blocked.blockingGates?.[0]?.type !== expectedType) {
          throw new Error(`release blocker ${expectedType} returned ${blocked.decision}`);
        }
      }

      const externalConflict = await continueDecisionForFixture({
        ...baseDocs,
        "docs/conflicts.md": `# Conflicts

## Conflicts

| Conflict | Sources | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| Search indexing proof missing | docs/release-gates.md | medium | external provider | open |  |
`,
        "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
        "tasks/issues/001-task.md": taskFile("001", "ready"),
      });
      if (externalConflict.decision !== "wait-external") {
        throw new Error(`external conflict fixture returned ${externalConflict.decision}`);
      }
    },
  },
  {
    name: "execution helper reports task contracts and stop gates",
    run: async () => {
      const incompleteTask = `# 001: Incomplete Task

Status: ready
Owner: AI

## Goal

Exercise task contract reporting.
`;
      const contract = await executionCheckForFixture({
        "tasks/issues/001-task.md": incompleteTask,
      }, ["--mode", "task-contract", "--task", "tasks/issues/001-task.md"]);
      for (const expected of ["Type:", "Assumption basis:", "## Non-Goals", "## Verification", "## Evidence Log"]) {
        if (!(contract.contractMissing ?? []).includes(expected)) {
          throw new Error(`task-contract output missing expected missing field ${expected}`);
        }
      }

      const stopped = await executionCheckForFixture({
        "docs/blueprint-status.md": readyBlueprint(),
        "docs/execution-rules.md": "# Execution Rules\n",
        "docs/release-gates.md": "unproven external release proof\n",
        "tasks/issues/001-task.md": taskFile("001", "ready", "Founder"),
      }, ["--mode", "stop-gates", "--task", "tasks/issues/001-task.md"]);
      for (const expected of [
        "selected task is owned by Founder, not AI",
        "release gates contain unproven or external-state language",
      ]) {
        if (!(stopped.gateReasons ?? []).some((reason) => reason.includes(expected))) {
          throw new Error(`stop-gates output missing expected reason ${expected}`);
        }
      }

      const resolvedConflicts = await executionCheckForFixture({
        "docs/blueprint-status.md": readyBlueprint(),
        "docs/execution-rules.md": "# Execution Rules\n",
        "docs/release-gates.md": releaseGates(),
        "docs/conflicts.md": `# Conflicts

## Conflicts

| Conflict | Sources | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| None | n/a | low | AI | resolved | n/a |
`,
        "tasks/issues/001-task.md": taskFile("001", "ready"),
      }, ["--mode", "stop-gates", "--task", "tasks/issues/001-task.md"]);
      if ((resolvedConflicts.gateReasons ?? []).some((reason) => reason.includes("open conflict"))) {
        throw new Error(`resolved conflicts fixture reported gate reasons ${resolvedConflicts.gateReasons?.join(", ")}`);
      }

      const openConflict = await executionCheckForFixture({
        "docs/blueprint-status.md": readyBlueprint(),
        "docs/execution-rules.md": "# Execution Rules\n",
        "docs/release-gates.md": releaseGates(),
        "docs/conflicts.md": `# Conflicts

## Conflicts

| Conflict | Sources | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| Customer definition conflicts | docs/a.md, docs/b.md | high | founder | open |  |
`,
        "tasks/issues/001-task.md": taskFile("001", "ready"),
      }, ["--mode", "stop-gates", "--task", "tasks/issues/001-task.md"]);
      if (!(openConflict.gateReasons ?? []).includes("open conflict: Customer definition conflicts")) {
        throw new Error(`open conflict fixture returned gate reasons ${openConflict.gateReasons?.join(", ")}`);
      }
    },
  },
  {
    name: "malformed markdown tables do not crash helper scripts",
    run: async () => {
      const malformedSprint = `# Sprint 0

Status: active

## Tasks

| ID | Title | Status | Evidence |
| --- | --- |
| 001 | Broken row
plain text without table pipes
`;
      const continued = await continueDecisionForFixture({
        "docs/blueprint-status.md": readyBlueprint(),
        "docs/open-questions.md": openQuestions(),
        "docs/release-gates.md": releaseGates(),
        "docs/execution-rules.md": "# Execution Rules\n",
        "docs/conflicts.md": `# Conflicts

## Conflicts

| Conflict | Sources | Severity |
| --- |
| Partial row
`,
        "tasks/sprint-0.md": malformedSprint,
      });
      if (!continued.decision) {
        throw new Error("continue-check returned no decision for malformed markdown");
      }

      const preflight = await preflightDecisionForFixture({
        "docs/raw/founder-dump.md": "# Founder Dump\n",
        "docs/raw/founder-interview.md": "# Founder Interview\n",
        "docs/blueprint-status.md": `# Blueprint Status

Status: draft

## Readiness

| Gate | Status |
| --- |
| MVP extracted
`,
      });
      if (!preflight.decision) {
        throw new Error("preflight-check returned no decision for malformed markdown");
      }
    },
  },
  {
    name: "templates expose required matrix markers",
    run: async () => {
      await assertIncludes("skills/build-right-preflight/assets/templates/docs/decision-log.md", [
        "MVP boundary",
        "source mode",
        "architecture choice",
        "deployment choice",
        "workflow customization",
        "stop-gate decisions",
        "routine command results",
        "transient implementation notes",
        "every file edit",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/docs/release-gates.md", [
        "Validation baseline",
        "Product scope",
        "Task evidence",
        "Go/No-Go Format",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/docs/mvp-scope.md", [
        "Source mode",
        "Manual Before Automated",
        "Validation Required Before Product Truth",
        "Learning Objective",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/docs/execution-rules.md", [
        "## Authority Order",
        "## AI May Decide",
        "## AI Must Ask",
        "## Stop/Ask Gates",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/docs/blueprint-status.md", [
        "Current phase",
        "Project state",
        "Source mode",
        "Prototype confidence",
        "Active task",
        "Current gate",
        "Last evidence",
        "## Next Action",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/tasks/issue-template.md", [
        "## Acceptance Criteria",
        "## Baseline Evidence",
        "## Learning Notes",
      ]);
      await assertIncludes("skills/build-right-execution/assets/templates/not-ready-blocker.md", [
        "## Acceptance Criteria",
        "## Verification Summary",
        "## Blockers",
      ]);
      const foundationTemplates = [
        "skills/build-right-preflight/assets/templates/tasks/foundation/architecture-boundaries.md",
        "skills/build-right-preflight/assets/templates/tasks/foundation/tech-stack-runtime.md",
        "skills/build-right-preflight/assets/templates/tasks/foundation/directory-structure.md",
        "skills/build-right-preflight/assets/templates/tasks/foundation/deployment-env-contract.md",
      ];
      for (const template of foundationTemplates) {
        await assertIncludes(template, [
          "Assumption basis:",
          "Reversibility:",
          "Learning objective:",
          "Source under test:",
          "## Baseline Evidence",
          "## Verification",
          "## Evidence Log",
          "## Learning Notes",
          "## Blockers",
          "## Follow-Ups",
        ]);
      }
      await assertIncludes("skills/build-right-preflight/assets/templates/tasks/foundation/architecture-boundaries.md", [
        "module, component, and ownership boundaries",
        "Core components and ownership boundaries",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/tasks/foundation/tech-stack-runtime.md", [
        "runtime and package manager",
        "adapts to the existing stack",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/tasks/foundation/directory-structure.md", [
        "directory structure",
        "generated-file boundaries",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/tasks/foundation/deployment-env-contract.md", [
        "Docker/self-hosted",
        "cloud-equivalent",
        "environment variables",
      ]);
      await assertIncludes("skills/build-right-preflight/references/artifact-contract.md", [
        "Use `docs/blueprint-status.md` as the lean state and resume file.",
        "a second mandatory master state file",
        "## Decision Log Contract",
        "MVP boundary",
        "routine command results",
        "Foundation templates are optional.",
        "assets/templates/tasks/foundation/architecture-boundaries.md",
      ]);
      await assertIncludes("skills/build-right-preflight/references/workflow.md", [
        "Optional foundation task templates",
        "assets/templates/tasks/foundation/",
        "architecture boundaries and module ownership",
        "tech stack and runtime choices",
        "directory structure and ownership map",
        "Docker/self-hosting, cloud equivalents",
        "not mandatory docs for every project",
      ]);
    },
  },
  {
    name: "workflow customization markers are additive and preserve gates",
    run: async () => {
      await assertIncludes("workflow-backbone.md", [
        "Customization is additive",
        "before-task-select",
        "after-task-intake",
        "before-edit",
        "after-verify",
        "after-evidence-recorded",
        "after-task-complete",
        "before-next-task",
        "commit after each completed task",
        "require screenshot evidence for UI changes",
        "require no web research for private founder-fed work",
        "require broader verification before release-gate changes",
        "require decision-log entries for architecture or deployment choices",
        "disable web research for a project or phase",
        "skip the resolver",
        "skip founder gate",
        "ignore external-state gates",
        "skip evidence",
        "skip verification",
        "auto-publish",
        "widen task scope",
        "mark complete without evidence",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/docs/execution-rules.md", [
        "## Workflow Customization",
        "Project-local workflow customization belongs in this file",
        "must not bypass stop/ask gates, ownership",
        "before-task-select",
        "after-task-intake",
        "before-edit",
        "after-verify",
        "after-evidence-recorded",
        "after-task-complete",
        "before-next-task",
        "atomic commit after each completed task",
        "screenshot proof for UI work",
        "no web research unless explicitly approved",
        "stronger verification for release tasks",
        "decision-log entry for architecture changes",
        "skip resolver",
        "skip founder gate",
        "ignore external-state gate",
        "skip evidence",
        "skip verification",
        "auto-publish",
        "widen task scope",
      ]);
      await assertIncludes("planning/sprints/001-workflow-backbone-foundation.md", [
        "Customization should add policy hooks around that loop.",
        "It should not bypass",
        "Do not implement workflow customization before task 002 and task 003 are green.",
      ]);
    },
  },
  {
    name: "source repo does not contain generated root docs or tasks",
    run: async () => {
      const generatedFiles = await rootGeneratedMarkdownFiles();
      if (generatedFiles.length > 0) {
        throw new Error(`generated root markdown should live in an external test repo: ${generatedFiles.join(", ")}`);
      }
    },
  },
  {
    name: "release evidence references the deterministic verifier",
    run: async () => {
      await assertIncludes("RELEASE_CHECKLIST.md", [
        "scripts/verify-skill-trials.ts",
        "external test/review repository",
      ]);
    },
  },
  {
    name: "generated markdown only exists in skill assets or verifier fixtures",
    run: async () => {
      await assertIncludes("skills/build-right-preflight/assets/templates/tasks/issue-template.md", [
        "Status: ready",
        "Assumption basis:",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/docs/blueprint-status.md", [
        "## Readiness",
      ]);
    },
  },
];

for (const check of checks) {
  test(check.name, async () => {
    await check.run();
  }, 120_000);
}
