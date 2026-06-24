import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";

type SkillName = "build-right-preflight" | "build-right-feature-planning" | "build-right-execution";

type SkillReplay = {
  name: SkillName;
  refs: string[];
  helperCommands: string[];
  feature?: string;
};

type CommandResult = {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
};

type ReplayResult = {
  skill: SkillName;
  target: string;
  eventsPath: string;
  lastMessagePath: string;
  proofPath: string;
  exitCode: number;
  missingMarkers: string[];
};

const repoRoot = join(import.meta.dir, "..");
const scratchRoot = "/tmp/build-right-codex-native-skill-replay";
const runRoot = join(scratchRoot, `${Date.now()}-${process.pid}-${randomUUID()}`);
const codexHome = Bun.env.CODEX_HOME ?? `${Bun.env.HOME}/.codex`;
const installedSkillsRoot = join(codexHome, "skills");
const summaryPath = join(repoRoot, "planning/codex-native-skill-replay.md");
const failureLogPath = join(repoRoot, "planning/failed-tests.md");
const followUp = "planning/tasks/069-prove-codex-native-skill-invocation.md";

const replays: SkillReplay[] = [
  {
    name: "build-right-preflight",
    refs: ["workflow.md", "founder-gates.md", "artifact-contract.md", "research-and-delegation.md"],
    helperCommands: [
      "bun /Users/pax/.codex/skills/build-right-preflight/scripts/preflight-check.ts --cwd . --mode all --format markdown",
    ],
  },
  {
    name: "build-right-feature-planning",
    refs: ["workflow.md", "gates.md", "planning-contract.md", "research-and-delegation.md"],
    helperCommands: [
      "bun /Users/pax/.codex/skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd . --feature \"Add due dates to todos\" --format markdown",
    ],
    feature: "Add due dates to todos",
  },
  {
    name: "build-right-execution",
    refs: ["workflow.md", "gates.md", "evidence-contract.md", "review-and-delegation.md"],
    helperCommands: [
      "bun /Users/pax/.codex/skills/build-right-execution/scripts/continue-check.ts --cwd . --format markdown --strict",
      "bun /Users/pax/.codex/skills/build-right-execution/scripts/execution-check.ts --cwd . --task tasks/issues/001-native-proof.md --mode task-contract --format markdown",
      "bun /Users/pax/.codex/skills/build-right-execution/scripts/execution-check.ts --cwd . --task tasks/issues/001-native-proof.md --mode stop-gates --format markdown",
    ],
  },
];

async function ensureDir(path: string): Promise<void> {
  await Bun.$`mkdir -p ${path}`.quiet();
}

async function writeFile(path: string, text: string): Promise<void> {
  await ensureDir(dirname(path));
  await Bun.write(path, text);
}

async function run(command: string[], cwd: string): Promise<CommandResult> {
  const proc = Bun.spawn(command, {
    cwd,
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { command: command.join(" "), exitCode, stdout, stderr };
}

function installedSkillPath(skill: SkillName): string {
  return join(installedSkillsRoot, skill);
}

async function assertInstalledParity(skill: SkillName): Promise<void> {
  const installed = installedSkillPath(skill);
  if (!(await Bun.file(join(installed, "SKILL.md")).exists())) {
    throw new Error(`${skill} is not installed at ${installed}`);
  }
  const diff = await run(["diff", "-qr", join(repoRoot, "skills", skill), installed], repoRoot);
  if (diff.exitCode !== 0) {
    throw new Error(`${skill} installed source differs from repo-local source:\n${diff.stdout}${diff.stderr}`);
  }
}

async function copyRepoLocalSkills(target: string): Promise<void> {
  await ensureDir(join(target, "skills"));
  for (const replay of replays) {
    const copy = await run(["cp", "-R", join(repoRoot, "skills", replay.name), join(target, "skills", replay.name)], repoRoot);
    if (copy.exitCode !== 0) {
      throw new Error(copy.stderr || copy.stdout);
    }
  }
}

function blueprint(): string {
  return `# Blueprint Status

Status: ready
Current phase: native invocation replay
Project state: existing
Source mode: founder-fed
Prototype confidence: n/a
Current gate: ready
Last evidence: docs/evidence/codex-native-proof.md

## Readiness

| Gate | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Product truth | ready | docs/mvp-scope.md | Native replay fixture |
| Operating rules | ready | docs/execution-rules.md | Bun-only rules |
| Release gates | ready | docs/release-gates.md | Native invocation proof gate |
| Task surface | ready | tasks/sprint-0.md | One AI-owned validation task |
`;
}

function commonDocs(skill: SkillName): Record<string, string> {
  return {
    "README.md": `# Native Skill Replay\n\nScratch repo for ${skill} native invocation proof.\n`,
    "AGENTS.md": "Default to using Bun instead of Node.js, npm, pnpm, or vite.\n",
    "docs/blueprint-status.md": blueprint(),
    "docs/mvp-scope.md": `# MVP Scope

Status: ready
Source mode: founder-fed
Prototype confidence: n/a

Primary customer: Build Right reviewers.
Primary workflow: prove native Codex skill invocation.
Value moment: JSONL evidence shows Codex loaded and followed the skill.

## Included

- Native Codex CLI skill invocation.
- Installed source parity against repo-local skills.
- Helper command proof.

## Excluded

- Customer validation.
- Production deployment.
`,
    "docs/execution-rules.md": `# Execution Rules

Status: ready

## Runtime

Use bun for all commands.

## Stop/Ask Gates

- Stop on source mismatch.
- Stop on failed native invocation.
`,
    "docs/release-gates.md": `# Release Gates

Status: ready

## Gates

| Gate | Required Evidence | Command or Proof | Status |
| --- | --- | --- | --- |
| Native invocation | Codex JSONL reads skill and references | codex exec --ephemeral --json | ready |
| Source parity | installed skill matches repo-local source | diff -qr | ready |
`,
    "docs/conflicts.md": `# Conflicts

Status: resolved

## Conflicts

| Conflict | Sources | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| None | n/a | n/a | AI | resolved | No conflict for native replay |
`,
    "docs/open-questions.md": `# Open Questions

Status: resolved

## Resolved Operational Questions

| Question | Decision | Evidence |
| --- | --- | --- |
| Should native invocation be proved? | yes | planning/tasks/069-prove-codex-native-skill-invocation.md |
`,
    "docs/evidence/evidence-notes.md": `# Evidence Notes

Status: ready

## Repository Evidence

- Installed user-scope skill source is checked against repo-local source before replay.

## Prototype Assumptions

- None for native skill loading; codex exec is the native surface under test.
`,
    "docs/raw/founder-dump.md": "# Founder Dump\n\nProve actual Codex-native invocation for Build Right skills.\n",
    "docs/raw/founder-interview.md": "# Founder Interview\n\nPrimary user: Build Right reviewers.\n",
    "tasks/sprint-0.md": `# Sprint 0

Status: active

## Tasks

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| 001 | Prove native skill invocation | ready | tasks/issues/001-native-proof.md |
`,
    "tasks/issues/001-native-proof.md": `# 001: Prove Native Skill Invocation

Status: ready
Type: validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove Codex reads and follows ${skill}
Source under test: installed user-scope path with repo-local parity

## Goal

Create native invocation proof for ${skill}.

## Non-Goals

- Implement a product feature.
- Claim production readiness.

## Required Reading

- AGENTS.md
- docs/blueprint-status.md
- docs/execution-rules.md

## Acceptance Criteria

- [ ] Native Codex run reads the skill.
- [ ] Native Codex run reads required references.
- [ ] Proof artifact exists.

## Baseline Evidence

No native proof exists in this scratch repo before replay.

## Verification

- codex exec --ephemeral --json

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Blockers

- None.

## Follow-Ups

- None.
`,
  };
}

async function seedScratch(skill: SkillName): Promise<string> {
  const target = join(runRoot, skill);
  await ensureDir(target);
  await ensureDir(join(target, "docs/evidence"));
  await ensureDir(join(target, "docs/raw"));
  await ensureDir(join(target, "tasks/issues"));
  await copyRepoLocalSkills(target);
  for (const [path, text] of Object.entries(commonDocs(skill))) {
    await writeFile(join(target, path), text);
  }
  if (skill === "build-right-execution") {
    await writeFile(join(target, "package.json"), JSON.stringify({ name: "native-replay", type: "module" }, null, 2));
    await writeFile(
      join(target, "index.test.ts"),
      "import { expect, test } from 'bun:test';\n\ntest('native replay fixture', () => {\n  expect(1).toBe(1);\n});\n",
    );
  }
  await run(["git", "init"], target);
  return target;
}

function promptFor(replay: SkillReplay): string {
  const installed = installedSkillPath(replay.name);
  const refs = replay.refs.map((ref) => `${installed}/references/${ref}`).join("\n- ");
  return `Use $${replay.name}.

Validation objective: prove actual Codex-native invocation for ${replay.name}.

Rules:
- Work only inside the current scratch repository.
- Do not edit files outside the current scratch repository.
- Do not create commits.
- Read ${installed}/SKILL.md.
- Read these exact reference files:
- ${refs}
- Run these helper commands with Bun:
${replay.helperCommands.map((command) => `  - ${command}`).join("\n")}
- Create docs/evidence/codex-native-proof.md.
- Do not implement product feature code.

The proof file must contain these exact fields:
Native skill: ${replay.name}
Codex native invocation: yes
Installed skill source: ${installed}
Repo-local parity: pass
Required references read: ${replay.refs.join(", ")}
Helper commands run: ${replay.helperCommands.length}
Result: pass

Final response must include:
CODEX_NATIVE_SKILL=${replay.name}
PROOF_FILE=docs/evidence/codex-native-proof.md
RESULT=pass
`;
}

async function runCodexReplay(replay: SkillReplay): Promise<ReplayResult> {
  const target = await seedScratch(replay.name);
  const eventsPath = join(target, "docs/evidence/codex-events.jsonl");
  const stderrPath = join(target, "docs/evidence/codex-stderr.log");
  const lastMessagePath = join(target, "docs/evidence/codex-last-message.txt");
  const args = [
    "exec",
    "--ephemeral",
    "--json",
    "-s",
    "workspace-write",
    "-C",
    target,
    "--skip-git-repo-check",
    "-o",
    lastMessagePath,
    promptFor(replay),
  ];
  const proc = Bun.spawn(["codex", ...args], {
    cwd: target,
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  await writeFile(eventsPath, stdout);
  await writeFile(stderrPath, stderr);

  const proofPath = join(target, "docs/evidence/codex-native-proof.md");
  const proof = (await Bun.file(proofPath).exists()) ? await Bun.file(proofPath).text() : "";
  const lastMessage = (await Bun.file(lastMessagePath).exists()) ? await Bun.file(lastMessagePath).text() : "";
  const expectedPaths = [
    join(installedSkillPath(replay.name), "SKILL.md"),
    ...replay.refs.map((ref) => join(installedSkillPath(replay.name), "references", ref)),
  ];
  const missingMarkers = [
    ...(exitCode === 0 ? [] : [`codex exec exit ${exitCode}`]),
    ...expectedPaths.filter((path) => !stdout.includes(path)).map((path) => `event stream missing read marker: ${path}`),
    ...[`Native skill: ${replay.name}`, "Codex native invocation: yes", "Result: pass"].filter(
      (marker) => !proof.includes(marker),
    ).map((marker) => `proof missing marker: ${marker}`),
    ...[`CODEX_NATIVE_SKILL=${replay.name}`, "RESULT=pass"].filter((marker) => !lastMessage.includes(marker)).map(
      (marker) => `last message missing marker: ${marker}`,
    ),
  ];

  return {
    skill: replay.name,
    target,
    eventsPath,
    lastMessagePath,
    proofPath,
    exitCode,
    missingMarkers,
  };
}

function tableCell(text: string): string {
  return text.replace(/\n/g, "<br>").replace(/\|/g, "\\|");
}

async function appendFailure(result: ReplayResult): Promise<void> {
  const row = [
    "2026-06-24",
    "069",
    `codex-native-${result.skill}`,
    `codex exec --ephemeral --json -s workspace-write -C ${result.target}`,
    "native Codex replay reads skill and required references and writes proof artifact",
    result.missingMarkers.join("; "),
    "agent-instruction",
    result.target,
    followUp,
    "open",
  ].map(tableCell);
  await Bun.write(failureLogPath, `${await Bun.file(failureLogPath).text()}| ${row.join(" | ")} |\n`);
}

async function writeSummary(results: ReplayResult[]): Promise<void> {
  const failed = results.filter((result) => result.missingMarkers.length > 0);
  const lines = [
    "# Codex Native Skill Replay",
    "",
    `Generated: 2026-06-24`,
    `Run root: \`${runRoot}\``,
    `Source under test: installed user-scope skills in \`${installedSkillsRoot}\` with repo-local parity.`,
    `Status: ${failed.length === 0 ? "pass" : "fail"}`,
    "",
    "## Results",
    "",
    "| Skill | Result | Scratch Repo | Evidence |",
    "| --- | --- | --- | --- |",
    ...results.map((result) => {
      const status = result.missingMarkers.length === 0 ? "pass" : `fail: ${result.missingMarkers.join("; ")}`;
      return `| ${result.skill} | ${tableCell(status)} | \`${result.target}\` | \`${result.proofPath}\`, \`${result.eventsPath}\` |`;
    }),
    "",
    "## Verification",
    "",
    "- Installed user-scope skill directories were compared against repo-local `skills/` before replay.",
    "- Each `codex exec --ephemeral --json` event stream was checked for the selected `SKILL.md` path.",
    "- Each event stream was checked for required reference-file path reads.",
    "- Each scratch repo was checked for `docs/evidence/codex-native-proof.md`.",
    "",
    "## Residual Risk",
    "",
    "- This proves native skill loading and bounded skill-guided execution for one replay per skill.",
    "- Sprint 005's per-step matrix remains deterministic helper coverage; it is now backed by this native invocation smoke proof rather than being the only evidence.",
  ];
  await writeFile(summaryPath, `${lines.join("\n")}\n`);
}

async function main(): Promise<void> {
  await ensureDir(runRoot);
  for (const replay of replays) {
    await assertInstalledParity(replay.name);
  }

  const results: ReplayResult[] = [];
  for (const replay of replays) {
    console.log(`native replay: ${replay.name}`);
    const result = await runCodexReplay(replay);
    results.push(result);
    if (result.missingMarkers.length > 0) {
      await appendFailure(result);
    }
    console.log(`${replay.name}: ${result.missingMarkers.length === 0 ? "pass" : "fail"}`);
  }
  await writeSummary(results);
  const failed = results.filter((result) => result.missingMarkers.length > 0);
  if (failed.length > 0) {
    throw new Error(`native replay failed for ${failed.map((result) => result.skill).join(", ")}`);
  }
  console.log(`native replay summary: ${summaryPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
