import { dirname } from "node:path";
import { test } from "bun:test";

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
  for (const line of match[1].split("\n")) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (pair) {
      data[pair[1]] = pair[2].trim();
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
    name: "skills.sh.json parses and manifest skill paths exist",
    run: async () => {
      const skills = await manifestSkills();
      if (skills.length === 0) {
        throw new Error("skills.sh.json does not list any skills");
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
        "continue-check.ts",
        "execution-check.ts",
        "read-only Bun scripts",
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
