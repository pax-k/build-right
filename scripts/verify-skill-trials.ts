import { dirname } from "node:path";

type Check = {
  name: string;
  run: () => Promise<void>;
};

const failures: string[] = [];
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

function tracker(rows: string): string {
  return `# Sprint 0

Status: active

## Tasks

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
${rows}
`;
}

function taskFile(id: string, status: string): string {
  return `# ${id}: Fixture Task

Status: ${status}
Type: validation
Owner: AI

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
}> {
  const root = await createFixture("continue", files);
  const output = await runCommand([
    "bun",
    "skills/build-right-execution/scripts/continue-check.ts",
    "--cwd",
    root,
    "--format",
    "json",
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
      ]);
      await assertIncludes("skills/build-right-execution/SKILL.md", [
        "references/gates.md",
        "references/review-and-delegation.md",
        "scripts/continue-check.ts",
        "scripts/execution-check.ts",
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
      await assertIncludes("skills/build-right-execution/assets/templates/task-template.md", [
        "Assumption basis",
        "Reversibility",
        "Learning objective",
        "Learning Notes",
      ]);
      await assertIncludes("docs/evidence/manual-trials.md", [
        "Agent-Agnostic Trial Evidence Packet",
        "Run label",
        "Agent/tool surface",
        "Skill source",
        "Proved",
        "Simulated",
        "Unproven",
        "Follow-ups",
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
        "scripts/continue-check.ts",
        "scripts/execution-check.ts",
        "Founder-owned, external-state, failed-verification, stale-task, and",
      ]);
      await assertIncludes("docs/execution-rules.md", [
        "## Stop/Ask Gates",
        "## Subagent Review Triggers",
        "Continue state resolver",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/docs/execution-rules.md", [
        "## Stop/Ask Gates",
        "## Subagent Review Triggers",
        "Continue state resolver",
      ]);
      await assertIncludes("agent-skills-flow-diagrams.md", [
        "Ask focused founder question batch",
        "Required trigger applies?",
        "Stop/ask gate before next task?",
        "Deterministic Helper Lane",
        "Continue State Resolver",
        "preflight-check.ts",
        "continue-check.ts",
        "execution-check.ts",
        "Track in post-release backlog",
        "Record no ready AI-owned task",
      ]);
      await assertIncludes("README.md", [
        "preflight-check.ts",
        "continue-check.ts",
        "execution-check.ts",
        "read-only Bun scripts",
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
      const preflightJson = JSON.parse(preflightSmoke) as { projectTypeSignal?: string };
      if (!preflightJson.projectTypeSignal) {
        throw new Error("preflight helper smoke output missing projectTypeSignal");
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
      ]);
      const continueJson = JSON.parse(continueSmoke) as {
        decision?: string;
        readyTasks?: unknown[];
      };
      if (!["ask-founder", "wait-external", "no-ready-task"].includes(continueJson.decision ?? "")) {
        throw new Error(`continue helper current-repo decision was ${continueJson.decision}`);
      }
      if ((continueJson.readyTasks ?? []).length !== 0) {
        throw new Error("continue helper found ready tasks in current completed repo");
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

      const external = await continueDecisionForFixture({
        ...baseDocs,
        "docs/release-gates.md": releaseGates("post-release-follow-up"),
        "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
        "tasks/issues/001-task.md": taskFile("001", "ready"),
      });
      if (external.decision !== "wait-external") {
        throw new Error(`external fixture returned ${external.decision}`);
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
    },
  },
  {
    name: "durable docs and tasks do not contain agent-specific evidence handles",
    run: async () => {
      const forbidden = [/codex:\/\/threads/i, /codex_app\.read_thread/i];
      const files = [
        ...(await markdownFilesUnder("docs")),
        ...(await markdownFilesUnder("tasks")),
      ];

      for (const file of files) {
        const text = await read(file);
        for (const pattern of forbidden) {
          if (pattern.test(text)) {
            throw new Error(`${file} contains forbidden handle pattern ${pattern}`);
          }
        }
      }
    },
  },
  {
    name: "release evidence references the deterministic verifier",
    run: async () => {
      await assertIncludes("docs/release-gates.md", ["scripts/verify-skill-trials.ts"]);
    },
  },
  {
    name: "task files are complete and indexed in trackers",
    run: async () => {
      const issueFiles = (await markdownFilesUnder("tasks/issues")).sort();
      if (issueFiles.length === 0) {
        throw new Error("no task issue files found");
      }

      const sprint = await read("tasks/sprint-0.md");
      const postRelease = await read("tasks/post-release-backlog.md");
      await assertIncludes("tasks/sprint-0.md", ["Status: complete-direct-install-ready"]);
      await assertIncludes("tasks/post-release-backlog.md", ["Status: complete-ai-executable"]);

      const trackers = `${sprint}\n${postRelease}`;
      for (const file of issueFiles) {
        const id = file.match(/\/(\d{3})-[^/]+\.md$/)?.[1];
        if (!id) {
          throw new Error(`${file} does not use a three-digit task id`);
        }

        const text = await read(file);
        const status = text.match(/^Status:\s*(.+)$/m)?.[1]?.trim();
        if (status !== "complete") {
          throw new Error(`${file} has status ${status ?? "missing"}, expected complete`);
        }

        if (!trackers.includes(`| ${id} |`) || !trackers.includes(file)) {
          throw new Error(`${file} is not indexed in sprint or post-release tracker`);
        }
      }
    },
  },
];

for (const check of checks) {
  try {
    await check.run();
    console.log(`ok - ${check.name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`${check.name}: ${message}`);
    console.error(`fail - ${check.name}: ${message}`);
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} verifier check(s) failed.`);
  process.exit(1);
}

console.log(`\n${checks.length} verifier checks passed.`);
