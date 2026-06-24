import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";

type SkillName = "build-right-preflight" | "build-right-feature-planning" | "build-right-execution";
type StepStatus = "pass" | "partial-needs-rerun" | "failures-logged" | "blocked" | "dry-run";
type NegativeFixture = "missing-manual-trial-packet" | "missing-skill-read" | "missing-reference-read" | "planning-product-file";

type Step = {
  id: string;
  slug: string;
  skill: SkillName;
  title: string;
  stepUnderTest: string;
  prompt: string;
  feature?: string;
};

type Args = {
  task?: string;
  start?: string;
  end?: string;
  negativeFixture?: NegativeFixture;
  continueOnFailure: boolean;
  dryRun: boolean;
  jsonOutput: boolean;
  noPlanningWrites: boolean;
  summary: boolean;
  statusAudit: boolean;
  help: boolean;
};

type CommandResult = {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
};

type ParsedCodexEvents = {
  events: Array<Record<string, unknown>>;
  invalidLines: string[];
  commandText: string;
  agentText: string;
  hasTurnCompleted: boolean;
};

type JudgeInput = {
  step: Step;
  target: string;
  eventsPath: string;
  lastMessagePath: string;
  proofPath: string;
  codexExitCode: number;
  helperResults: CommandResult[];
};

type JudgeResult = {
  status: StepStatus;
  failures: string[];
  checks: EvalChecks;
};

type EvalChecks = {
  codexExitZero: boolean;
  validJsonl: boolean;
  turnCompleted: boolean;
  skillRead: boolean;
  referenceReads: boolean;
  helperObserved: boolean;
  helpersPassed: boolean;
  finalMarkers: boolean;
  proofMarkers: boolean;
  manualPacket: boolean;
  forbiddenWrites: boolean;
};

type StepResult = {
  step: Step;
  target: string;
  status: StepStatus;
  eventsPath: string;
  lastMessagePath: string;
  proofPath: string;
  promptPath: string;
  manualTrialPath: string;
  helperResults: CommandResult[];
  failures: string[];
  checks: EvalChecks;
};

export const manualTrialPacketMarkers = [
  "Run label:",
  "Agent/tool surface:",
  "Skill source:",
  "Target:",
  "Commands:",
  "Artifacts:",
  "Result:",
  "Proved:",
  "Simulated:",
  "Unproven:",
  "Follow-ups:",
] as const;

const negativeFixtures = [
  "missing-manual-trial-packet",
  "missing-skill-read",
  "missing-reference-read",
  "planning-product-file",
] as const;

const repoRoot = join(import.meta.dir, "..");
const scratchRoot = "/tmp/build-right-native-step-trials";
const codexHome = Bun.env.CODEX_HOME ?? `${Bun.env.HOME}/.codex`;
const installedSkillsRoot = join(codexHome, "skills");
const failureLogPath = join(repoRoot, "planning/failed-tests.md");
const summaryPath = join(repoRoot, "planning/codex-native-step-trials.md");

export const steps: Step[] = [
  {
    id: "041",
    slug: "preflight-inspect-project-state",
    skill: "build-right-preflight",
    title: "Test preflight project-state inspection",
    stepUnderTest: "Inspect project state, classify project/source mode, run helper, and report before writing.",
    prompt: "Bootstrap this blank Bun Todo repo, but first inspect project state and report helper findings before writing.",
  },
  {
    id: "042",
    slug: "preflight-file-plan",
    skill: "build-right-preflight",
    title: "Test preflight file-plan announcement",
    stepUnderTest: "Announce Create, Update, Leave untouched, and Needs user input before writes.",
    prompt: "Run preflight on a scratch repo with one existing blueprint stub and prove the file plan appears before writes.",
  },
  {
    id: "043",
    slug: "preflight-founder-context",
    skill: "build-right-preflight",
    title: "Test preflight founder-context capture",
    stepUnderTest: "Ask focused founder questions and record founder answers as raw context.",
    prompt: "Run preflight with thin founder context and capture the smallest useful founder-question batch.",
  },
  {
    id: "044",
    slug: "preflight-claim-evidence-tagging",
    skill: "build-right-preflight",
    title: "Test preflight claim and evidence tagging",
    stepUnderTest: "Tag claims as founder, repository, public, customer, prototype, or unknown evidence.",
    prompt: "Run preflight with mixed founder claims, repo facts, and unsupported market claims; tag every important claim.",
  },
  {
    id: "045",
    slug: "preflight-research-delegation",
    skill: "build-right-preflight",
    title: "Test preflight research and delegation routing",
    stepUnderTest: "Route to bounded research or review only when gates require it.",
    prompt: "Run preflight in web-assisted mode with a narrow public-evidence gap and record the research/delegation route.",
  },
  {
    id: "046",
    slug: "preflight-operating-artifacts",
    skill: "build-right-preflight",
    title: "Test preflight operating-artifact creation",
    stepUnderTest: "Create canonical docs, evidence, Sprint 0, and first issue using the artifact contract.",
    prompt: "Run preflight with founder-fed Todo context and create the minimum operating artifacts.",
  },
  {
    id: "047",
    slug: "preflight-mvp-prototype-scope",
    skill: "build-right-preflight",
    title: "Test preflight MVP and prototype scope extraction",
    stepUnderTest: "Extract bounded MVP/prototype scope without unsupported durable commitments.",
    prompt: "Run preflight and prove MVP scope names one customer, workflow, value moment, exclusions, and validation gaps.",
  },
  {
    id: "048",
    slug: "preflight-sprint0-preparation",
    skill: "build-right-preflight",
    title: "Test preflight Sprint 0 preparation",
    stepUnderTest: "Prepare Sprint 0 and one bounded executable task without executing it.",
    prompt: "Run preflight and stop after creating Sprint 0 plus the first ready AI task.",
  },
  {
    id: "049",
    slug: "preflight-readiness-gate",
    skill: "build-right-preflight",
    title: "Test preflight readiness gate",
    stepUnderTest: "Rerun readiness, reconcile warnings, and close with an explicit gate state.",
    prompt: "Run preflight readiness on ready and blocked fixture states; do not overclaim readiness.",
  },
  {
    id: "050",
    slug: "feature-planning-read-surface",
    skill: "build-right-feature-planning",
    title: "Test feature planning surface read",
    stepUnderTest: "Read the Build Right planning surface before choosing a destination.",
    prompt: "Plan a Todo due-date feature after reading blueprint, MVP, execution, evidence, sprint, backlog, and tasks.",
    feature: "Add due dates to todos",
  },
  {
    id: "051",
    slug: "feature-planning-helper-report",
    skill: "build-right-feature-planning",
    title: "Test feature planning helper report",
    stepUnderTest: "Run planning helper and report decision, gates, questions, triggers, candidates, and next action.",
    prompt: "Run the feature planning helper for Add due dates to todos and report every helper field before writing.",
    feature: "Add due dates to todos",
  },
  {
    id: "052",
    slug: "feature-planning-classification",
    skill: "build-right-feature-planning",
    title: "Test feature classification",
    stepUnderTest: "Classify requests into sprint, backlog, research, review, blocked, or ready-task destinations.",
    prompt: "Classify due dates, collaboration, and an MVP-conflicting request into the right planning destinations.",
    feature: "Classify due dates, collaboration, and MVP-conflicting realtime sync",
  },
  {
    id: "053",
    slug: "feature-planning-founder-questions",
    skill: "build-right-feature-planning",
    title: "Test feature planning founder questions",
    stepUnderTest: "Ask only founder-owned questions that change scope, priority, promise, or acceptance criteria.",
    prompt: "Plan a feature whose acceptance criteria affect the product promise and stop for founder input.",
    feature: "Share Todo lists with clients under a promised team workflow",
  },
  {
    id: "054",
    slug: "feature-planning-research-delegation",
    skill: "build-right-feature-planning",
    title: "Test feature planning research and delegation routing",
    stepUnderTest: "Use bounded public research or review only when evidence is needed.",
    prompt: "Plan an OAuth calendar integration and record bounded research or review triggers.",
    feature: "Add OAuth calendar integration with vendor API and pricing constraints",
  },
  {
    id: "055",
    slug: "feature-planning-artifact-updates",
    skill: "build-right-feature-planning",
    title: "Test feature planning artifact updates",
    stepUnderTest: "Update planning artifacts only: backlog, sprint, tasks, evidence, decisions, and conflicts.",
    prompt: "Plan a current-sprint feature and post-release feature while keeping implementation files untouched.",
    feature: "Add due dates now and team comments later",
  },
  {
    id: "056",
    slug: "feature-planning-executable-handoff",
    skill: "build-right-feature-planning",
    title: "Test feature planning executable handoff",
    stepUnderTest: "Rerun planning helper and execution resolver to prove a ready task handoff.",
    prompt: "Create a ready AI-owned feature task and prove build-right-execution can select it.",
    feature: "Add due dates to todos as a ready AI-owned task",
  },
  {
    id: "057",
    slug: "feature-planning-implementation-boundary",
    skill: "build-right-feature-planning",
    title: "Test feature planning implementation boundary",
    stepUnderTest: "Stop before implementation and close with a planning result.",
    prompt: "Plan a feature that could be implemented immediately, but stop at ready-for-execution.",
    feature: "Add due dates to todos",
  },
  {
    id: "058",
    slug: "execution-task-selection",
    skill: "build-right-execution",
    title: "Test execution task selection",
    stepUnderTest: "Run strict resolver and select exactly one resolver-approved task.",
    prompt: "Execute only the next ready AI-owned task after reporting resolver findings.",
  },
  {
    id: "059",
    slug: "execution-task-intake",
    skill: "build-right-execution",
    title: "Test execution task intake",
    stepUnderTest: "Print full task intake and reconcile task-contract fields before editing.",
    prompt: "Print the full task intake record and run task-contract checks before edits.",
  },
  {
    id: "060",
    slug: "execution-workspace-preflight",
    skill: "build-right-execution",
    title: "Test execution workspace preflight",
    stepUnderTest: "Inspect git state, dirty files, conflicts, source under test, and concurrent work before editing.",
    prompt: "Inspect workspace state, conflicts, source under test, and dirty files before editing.",
  },
  {
    id: "061",
    slug: "execution-baseline-evidence",
    skill: "build-right-execution",
    title: "Test execution baseline evidence capture",
    stepUnderTest: "Capture baseline proof before implementation evidence.",
    prompt: "Capture baseline proof for missing Todo behavior before implementation.",
  },
  {
    id: "062",
    slug: "execution-gap-analysis-plan",
    skill: "build-right-execution",
    title: "Test execution gap analysis and narrow plan",
    stepUnderTest: "Name the gap, target files, checks, evidence destination, and stop condition.",
    prompt: "Analyze the gap and produce a narrow implementation plan bounded to the selected task.",
  },
  {
    id: "063",
    slug: "execution-narrow-implementation",
    skill: "build-right-execution",
    title: "Test execution narrow implementation",
    stepUnderTest: "Implement only the smallest accepted change with Bun runtime rules.",
    prompt: "Implement one bounded Todo behavior with the smallest Bun-only change.",
  },
  {
    id: "064",
    slug: "execution-verification-ladder",
    skill: "build-right-execution",
    title: "Test execution verification ladder",
    stepUnderTest: "Verify from focused checks to broader/domain proof without overclaiming.",
    prompt: "Run focused tests, broader Bun checks, and browser-proof evidence in order.",
  },
  {
    id: "065",
    slug: "execution-review-evidence-state-update",
    skill: "build-right-execution",
    title: "Test execution review, evidence, and state update",
    stepUnderTest: "Record evidence before state changes and handle required review triggers.",
    prompt: "Record evidence, handle review triggers or substitutes, then update task/tracker state.",
  },
  {
    id: "066",
    slug: "execution-commit-handoff",
    skill: "build-right-execution",
    title: "Test execution commit or handoff",
    stepUnderTest: "Commit coherently or hand off changed files, verification, evidence, blockers, and next task.",
    prompt: "Complete the selected task and provide either a scoped commit or full handoff.",
  },
  {
    id: "067",
    slug: "execution-closeout",
    skill: "build-right-execution",
    title: "Test execution closeout",
    stepUnderTest: "Close with status, task path, changes, proved/simulated/unproven scope, evidence, and next task.",
    prompt: "Close the execution run with concrete proof, simulated scope, unproven scope, stop gates, and next task.",
  },
];

function usage(): string {
  return `Usage: bun scripts/codex-native-step-trials.ts [--task <id> | --start <id> --end <id>] [--continue-on-failure] [--dry-run] [--json-output] [--no-planning-writes] [--negative-fixture <name>] [--summary] [--status-audit]

Runs native Codex step trials for Build Right workflow steps 041-067.`;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    continueOnFailure: false,
    dryRun: false,
    jsonOutput: false,
    noPlanningWrites: false,
    summary: false,
    statusAudit: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }
    if (arg === "--continue-on-failure") {
      args.continueOnFailure = true;
      continue;
    }
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (arg === "--json-output") {
      args.jsonOutput = true;
      continue;
    }
    if (arg === "--no-planning-writes") {
      args.noPlanningWrites = true;
      continue;
    }
    if (arg === "--summary") {
      args.summary = true;
      continue;
    }
    if (arg === "--status-audit") {
      args.statusAudit = true;
      continue;
    }
    if (arg === "--negative-fixture") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`${arg} requires a value`);
      }
      if (!negativeFixtures.includes(value as NegativeFixture)) {
        throw new Error(`unknown negative fixture: ${value}`);
      }
      args.negativeFixture = value as NegativeFixture;
      index += 1;
      continue;
    }
    if (arg === "--task" || arg === "--start" || arg === "--end") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`${arg} requires a value`);
      }
      index += 1;
      if (arg === "--task") {
        args.task = value;
      } else if (arg === "--start") {
        args.start = value;
      } else {
        args.end = value;
      }
      continue;
    }
    throw new Error(`unknown argument: ${arg}`);
  }

  if (args.task && (args.start || args.end)) {
    throw new Error("use either --task or --start/--end, not both");
  }
  if (args.dryRun && args.negativeFixture) {
    throw new Error("use either --dry-run or --negative-fixture, not both");
  }
  if (args.noPlanningWrites && (args.summary || args.statusAudit)) {
    throw new Error("--no-planning-writes cannot be used with --summary or --status-audit");
  }
  if (args.jsonOutput && (args.summary || args.statusAudit)) {
    throw new Error("--json-output cannot be used with --summary or --status-audit");
  }
  return args;
}

function selectedSteps(args: Args): Step[] {
  if (args.task) {
    const step = steps.find((item) => item.id === args.task);
    if (!step) {
      throw new Error(`unknown step: ${args.task}`);
    }
    return [step];
  }
  if (args.start || args.end) {
    const start = args.start ?? steps[0]?.id;
    const end = args.end ?? steps.at(-1)?.id;
    return steps.filter((step) => step.id >= (start ?? "") && step.id <= (end ?? ""));
  }
  return steps;
}

async function ensureDir(path: string): Promise<void> {
  await Bun.$`mkdir -p ${path}`.quiet();
}

async function writeFile(path: string, text: string): Promise<void> {
  await ensureDir(dirname(path));
  await Bun.write(path, text);
}

async function readIfExists(path: string): Promise<string> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return "";
  }
  return file.text();
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
  return join(codexHome, "skills", skill);
}

async function assertInstalledParity(step: Step): Promise<void> {
  const installed = installedSkillPath(step.skill);
  if (!(await Bun.file(join(installed, "SKILL.md")).exists())) {
    const parent = join(codexHome, "skills");
    await ensureDir(parent);
    const copy = await run(["cp", "-R", join(repoRoot, "skills", step.skill), installed], repoRoot);
    if (copy.exitCode !== 0) {
      throw new Error(`failed to install ${step.skill}: ${copy.stdout}${copy.stderr}`);
    }
  }
  const diff = await run(["diff", "-qr", join(repoRoot, "skills", step.skill), installed], repoRoot);
  if (diff.exitCode !== 0) {
    throw new Error(`${step.skill} installed source differs from repo-local source:\n${diff.stdout}${diff.stderr}`);
  }
}

async function copyRepoLocalSkills(target: string): Promise<void> {
  await ensureDir(join(target, "skills"));
  for (const skill of ["build-right-preflight", "build-right-feature-planning", "build-right-execution"]) {
    const result = await run(["cp", "-R", join(repoRoot, "skills", skill), join(target, "skills", skill)], repoRoot);
    if (result.exitCode !== 0) {
      throw new Error(result.stdout + result.stderr);
    }
  }
}

function stepTarget(step: Step): string {
  return join(scratchRoot, `${step.id}-${step.slug}-${Date.now()}-${process.pid}-${randomUUID()}`);
}

export function refsFor(step: Step): string[] {
  if (step.skill === "build-right-preflight") {
    return ["workflow.md", "founder-gates.md", "artifact-contract.md", "research-and-delegation.md"];
  }
  if (step.skill === "build-right-feature-planning") {
    return ["workflow.md", "gates.md", "planning-contract.md", "research-and-delegation.md"];
  }
  return ["workflow.md", "gates.md", "evidence-contract.md", "review-and-delegation.md"];
}

function shellDisplayArg(arg: string): string {
  if (/^[A-Za-z0-9_./:@%+=,-]+$/.test(arg)) {
    return arg;
  }
  return JSON.stringify(arg);
}

function displayCommand(args: string[]): string {
  return args.map(shellDisplayArg).join(" ");
}

function helperCommandArgs(step: Step): string[][] {
  const skillPath = installedSkillPath(step.skill);
  if (step.skill === "build-right-preflight") {
    return [["bun", `${skillPath}/scripts/preflight-check.ts`, "--cwd", ".", "--mode", "all", "--format", "markdown"]];
  }
  if (step.skill === "build-right-feature-planning") {
    return [
      [
        "bun",
        `${skillPath}/scripts/feature-planning-check.ts`,
        "--cwd",
        ".",
        "--feature",
        step.feature ?? "Add due dates to todos",
        "--format",
        "markdown",
      ],
    ];
  }
  return [
    ["bun", `${skillPath}/scripts/continue-check.ts`, "--cwd", ".", "--format", "markdown", "--strict"],
    ["bun", `${skillPath}/scripts/execution-check.ts`, "--cwd", ".", "--mode", "next-task", "--format", "markdown"],
    [
      "bun",
      `${skillPath}/scripts/execution-check.ts`,
      "--cwd",
      ".",
      "--task",
      "tasks/issues/001-native-step.md",
      "--mode",
      "task-contract",
      "--format",
      "markdown",
    ],
    [
      "bun",
      `${skillPath}/scripts/execution-check.ts`,
      "--cwd",
      ".",
      "--task",
      "tasks/issues/001-native-step.md",
      "--mode",
      "stop-gates",
      "--format",
      "markdown",
    ],
  ];
}

export function helperCommands(step: Step): string[] {
  return helperCommandArgs(step).map(displayCommand);
}

function helperEventMarkers(step: Step): string[][] {
  return helperCommandArgs(step).map((args) => {
    if (step.skill === "build-right-preflight") {
      return [args[1] ?? "", "--mode", "all"];
    }
    if (step.skill === "build-right-feature-planning") {
      return [args[1] ?? "", "--feature", step.feature ?? "Add due dates to todos"];
    }
    const modeIndex = args.indexOf("--mode");
    const mode = modeIndex >= 0 ? args[modeIndex + 1] ?? "" : "";
    return [args[1] ?? "", "--mode", mode];
  });
}

function blueprint(step: Step): string {
  return `# Blueprint Status

Status: ready
Current phase: Sprint 006 native step validation
Project state: existing
Source mode: founder-fed
Prototype confidence: n/a
Active task: tasks/issues/001-native-step.md
Current gate: ready
Last evidence: docs/evidence/codex-native-step-proof.md

## Readiness

| Gate | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Product truth | ready | docs/mvp-scope.md | Native step fixture |
| Operating rules | ready | docs/execution-rules.md | Bun-only rules |
| Release gates | ready | docs/release-gates.md | Native step proof |
| Task surface | ready | tasks/sprint-0.md | One ready AI-owned task |
`;
}

function sprintTracker(step: Step): string {
  return `# Sprint 0

Status: active

## Tasks

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| 001 | ${step.title} | ready | tasks/issues/001-native-step.md |
`;
}

function issueTask(step: Step): string {
  return `# 001: ${step.title}

Status: ready
Type: validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: ${step.stepUnderTest}
Source under test: installed user-scope path with repo-local parity

## Goal

${step.stepUnderTest}

## Non-Goals

- Write outside this scratch repository.
- Claim customer validation.
- Treat Codex final reply as the only proof.

## Required Reading

- AGENTS.md
- docs/blueprint-status.md
- docs/execution-rules.md
- docs/release-gates.md

## Acceptance Criteria

- [ ] Native Codex run reads the selected skill and references.
- [ ] Native Codex run executes the relevant helper commands.
- [ ] Native proof artifact is written.
- [ ] Outer runner can judge the run from JSONL and files.

## Baseline Evidence

No native step proof exists before the run.

## Verification

- codex exec --ephemeral --json
- Bun helper commands

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Blockers

- None.

## Follow-Ups

- None.
`;
}

function commonDocs(step: Step): Record<string, string> {
  return {
    "README.md": `# Sprint 006 Native Step ${step.id}\n\nScratch repo for ${step.title}.\n`,
    "docs/blueprint-status.md": blueprint(step),
    "docs/mvp-scope.md": `# MVP Scope

Status: ready
Source mode: founder-fed
Prototype confidence: n/a

Primary customer: Build Right reviewers.
Primary workflow: prove every workflow step through native Codex.
Value moment: native JSONL evidence proves the step was followed.

## Included

- Native Codex step trial.
- Source parity.
- Helper verification.

## Excluded

- Deployment.
- Customer validation.
`,
    "docs/source-index.md": `# Source Index

Status: ready

## Sources

| Claim | Status | Evidence |
| --- | --- | --- |
| Step ${step.id} validates ${step.skill} | repo-evidence-backed | planning/sprints/006-codex-native-step-validation.md |
`,
    "docs/execution-rules.md": `# Execution Rules

Status: ready

## Runtime

Use bun for commands, scripts, and tests.

## Stop/Ask Gates

- Stop on source mismatch.
- Stop on missing native proof.
- Stop on failed helper commands.
`,
    "docs/release-gates.md": `# Release Gates

Status: ready

## Gates

| Gate | Required Evidence | Command or Proof | Status |
| --- | --- | --- | --- |
| Native Codex step | JSONL events and proof artifact | codex exec --ephemeral --json | ready |
| Source parity | installed skill matches repo-local source | diff -qr | ready |
`,
    "docs/conflicts.md": `# Conflicts

Status: resolved

## Conflicts

| Conflict | Sources | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| None | n/a | n/a | AI | resolved | No conflict for native step trial |
`,
    "docs/open-questions.md": `# Open Questions

Status: resolved

## Resolved Operational Questions

| Question | Decision | Evidence |
| --- | --- | --- |
| Is native step proof required? | yes | planning/sprints/006-codex-native-step-validation.md |
`,
    "docs/evidence/evidence-notes.md": `# Evidence Notes

Status: ready

## Repository Evidence

- Step ${step.id}: ${step.stepUnderTest}

## Prototype Assumptions

- None for native skill loading; codex exec is the native surface under test.
`,
    "docs/raw/founder-dump.md": `# Founder Dump

Status: captured

Run native Codex validation for ${step.title}.
`,
    "docs/raw/founder-interview.md": `# Founder Interview

Status: captured

Primary user: Build Right reviewers.
Workflow under test: ${step.stepUnderTest}
`,
    "tasks/sprint-0.md": sprintTracker(step),
    "tasks/post-release-backlog.md": "# Post-Release Backlog\n\nStatus: active\n\n## Tasks\n\n| ID | Title | Status | Evidence |\n| --- | --- | --- | --- |\n",
    "tasks/issues/001-native-step.md": issueTask(step),
  };
}

async function writeMinimalBunApp(target: string): Promise<void> {
  await writeFile(join(target, "package.json"), JSON.stringify({ name: "native-step-trial", type: "module" }, null, 2));
  await writeFile(
    join(target, "index.test.ts"),
    "import { expect, test } from 'bun:test';\n\ntest('native step fixture', () => {\n  expect(1).toBe(1);\n});\n",
  );
}

async function seedScratch(target: string, step: Step): Promise<void> {
  await ensureDir(target);
  await ensureDir(join(target, "docs/evidence"));
  await ensureDir(join(target, "docs/raw"));
  await ensureDir(join(target, "tasks/issues"));
  await copyRepoLocalSkills(target);
  await Bun.write(join(target, "AGENTS.md"), await Bun.file(join(repoRoot, "AGENTS.md")).text());
  for (const [path, text] of Object.entries(commonDocs(step))) {
    await writeFile(join(target, path), text);
  }
  if (step.skill === "build-right-execution") {
    await writeMinimalBunApp(target);
  }
  const git = await run(["git", "init"], target);
  if (git.exitCode !== 0) {
    throw new Error(git.stdout + git.stderr);
  }
}

function manualTrialPacketForPrompt(step: Step, target: string): string {
  const helpers = helperCommands(step).map((command) => `\`${command}\``).join(", ");
  return `Run label: Sprint 006 native step ${step.id}
Agent/tool surface: codex exec --ephemeral --json
Skill source: ${installedSkillPath(step.skill)}
Target: ${target}
Commands: ${helpers || "none"}
Artifacts: docs/evidence/codex-prompt.txt, docs/evidence/codex-events.jsonl, docs/evidence/codex-last-message.txt, docs/evidence/codex-native-step-proof.md
Result: pass
Proved: native Codex read the required workflow instructions, ran helpers, and wrote scratch evidence
Simulated: none
Unproven: none
Follow-ups: none`;
}

function promptFor(step: Step, target: string): string {
  const skillPath = installedSkillPath(step.skill);
  const refs = refsFor(step).map((ref) => `${skillPath}/references/${ref}`);
  const helpers = helperCommands(step);
  return `Use $${step.skill}.

Native step trial: ${step.id} - ${step.title}
Step under test: ${step.stepUnderTest}
User prompt to satisfy: ${step.prompt}

Rules:
- Work only inside the current scratch repository.
- Do not edit files outside this scratch repository.
- Do not create commits.
- Read ${skillPath}/SKILL.md.
- Read these reference files:
${refs.map((ref) => `  - ${ref}`).join("\n")}
- Run these helper commands with Bun from the scratch repo:
${helpers.map((command) => `  - ${command}`).join("\n")}
- Create docs/evidence/codex-native-step-proof.md.
- Create or update docs/evidence/manual-trials.md with the exact Manual Trial Evidence Packet below before the final response.
- Keep generated product files inside this scratch repo only.
- Treat this as native evidence for exactly step ${step.id}; do not combine multiple Sprint 006 steps.

The proof file must contain these exact fields:
Native step: ${step.id}
Native skill: ${step.skill}
Codex native invocation: yes
Installed skill source: ${skillPath}
Repo-local parity: pass
Step under test: ${step.stepUnderTest}
Helper commands run: ${helpers.length}
Proved: native Codex read the required workflow instructions, ran helpers, and wrote scratch evidence
Simulated: none
Unproven: none
Result: pass

The manual-trials file must contain these exact fields and values:
${manualTrialPacketForPrompt(step, target)}

Final response must include:
CODEX_NATIVE_STEP=${step.id}
CODEX_NATIVE_SKILL=${step.skill}
PROOF_FILE=docs/evidence/codex-native-step-proof.md
RESULT=pass
`;
}

async function writeManualPacket(target: string, step: Step, status: StepStatus): Promise<string> {
  const path = join(target, "docs/evidence/manual-trials.md");
  const existing = await readIfExists(path);
  const header = existing.trim().length > 0 ? existing.trimEnd() : "# Manual Trials";
  const text = `${header}

---

## Runner Judgment: Native Step ${step.id}

Run label: Sprint 006 native step ${step.id}
Agent/tool surface: codex exec --ephemeral --json
Skill source: ${installedSkillPath(step.skill)}
Target: ${target}
Commands: ${helperCommands(step).map((command) => `\`${command}\``).join(", ") || "none"}
Artifacts: docs/evidence/codex-prompt.txt, docs/evidence/codex-events.jsonl, docs/evidence/codex-last-message.txt, docs/evidence/codex-native-step-proof.md
Result: ${status}
Proved: ${status === "dry-run" ? "scratch setup and prompt generation only" : "runner judged native evidence"}
Simulated: none for native invocation; dry-run mode does not invoke Codex
Unproven: ${status === "dry-run" ? "native Codex execution" : "none when result is pass; see failure rows for non-pass results"}
Follow-ups: ${status === "dry-run" ? "run without --dry-run" : status === "pass" ? "none" : "see planning/failed-tests.md"}
`;
  await writeFile(path, text);
  return path;
}

export function parseCodexEvents(text: string): ParsedCodexEvents {
  const events: Array<Record<string, unknown>> = [];
  const invalidLines: string[] = [];
  const commandParts: string[] = [];
  const agentParts: string[] = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    try {
      const event = JSON.parse(line) as Record<string, unknown>;
      events.push(event);
      const item = event.item as Record<string, unknown> | undefined;
      if (item?.type === "command_execution") {
        commandParts.push(String(item.command ?? ""));
      }
      if (item?.type === "agent_message") {
        agentParts.push(String(item.text ?? ""));
      }
    } catch {
      invalidLines.push(line);
    }
  }

  return {
    events,
    invalidLines,
    commandText: commandParts.join("\n"),
    agentText: agentParts.join("\n"),
    hasTurnCompleted: events.some((event) => event.type === "turn.completed"),
  };
}

async function existingProductFiles(target: string): Promise<string[]> {
  const candidates = ["package.json", "index.ts", "index.html", "frontend.tsx", "index.css", "todo.ts", "todo.test.ts"];
  const found: string[] = [];
  for (const candidate of candidates) {
    if (await Bun.file(join(target, candidate)).exists()) {
      found.push(candidate);
    }
  }
  return found;
}

async function runPostHelpers(target: string, step: Step): Promise<CommandResult[]> {
  const results: CommandResult[] = [];
  for (const [index, args] of helperCommandArgs(step).entries()) {
    const result = await run(args, target);
    results.push(result);
    const log = [
      `# Helper ${index + 1}`,
      "",
      `Command: ${displayCommand(args)}`,
      `Exit code: ${result.exitCode}`,
      "",
      "## Stdout",
      "",
      "```text",
      result.stdout.trim(),
      "```",
      "",
      "## Stderr",
      "",
      "```text",
      result.stderr.trim(),
      "```",
      "",
    ].join("\n");
    await writeFile(join(target, "docs/evidence", `helper-${index + 1}.log.md`), log);
  }
  return results;
}

function blockedChecks(): EvalChecks {
  return {
    codexExitZero: false,
    validJsonl: false,
    turnCompleted: false,
    skillRead: false,
    referenceReads: false,
    helperObserved: false,
    helpersPassed: false,
    finalMarkers: false,
    proofMarkers: false,
    manualPacket: false,
    forbiddenWrites: false,
  };
}

function dryRunChecks(): EvalChecks {
  return {
    codexExitZero: true,
    validJsonl: true,
    turnCompleted: false,
    skillRead: false,
    referenceReads: false,
    helperObserved: false,
    helpersPassed: true,
    finalMarkers: false,
    proofMarkers: false,
    manualPacket: true,
    forbiddenWrites: true,
  };
}

export async function judgeNativeStepResult(input: JudgeInput): Promise<JudgeResult> {
  const failures: string[] = [];
  const eventsText = await readIfExists(input.eventsPath);
  const lastMessage = await readIfExists(input.lastMessagePath);
  const proof = await readIfExists(input.proofPath);
  const manualTrials = await readIfExists(join(input.target, "docs/evidence/manual-trials.md"));
  const scan = parseCodexEvents(eventsText);
  const skillPath = installedSkillPath(input.step.skill);
  const checks: EvalChecks = {
    codexExitZero: input.codexExitCode === 0,
    validJsonl: scan.invalidLines.length === 0,
    turnCompleted: scan.hasTurnCompleted,
    skillRead: scan.commandText.includes(`${skillPath}/SKILL.md`),
    referenceReads: true,
    helperObserved: true,
    helpersPassed: input.helperResults.every((result) => result.exitCode === 0),
    finalMarkers: true,
    proofMarkers: true,
    manualPacket: true,
    forbiddenWrites: true,
  };

  if (!checks.codexExitZero) {
    failures.push(`codex exec exited ${input.codexExitCode}`);
  }
  if (!checks.validJsonl) {
    failures.push(`codex-events.jsonl has ${scan.invalidLines.length} invalid JSONL line(s)`);
  }
  if (!checks.turnCompleted) {
    failures.push("codex-events.jsonl missing turn.completed event");
  }
  if (!checks.skillRead) {
    failures.push(`command stream missing selected skill read: ${skillPath}/SKILL.md`);
  }
  for (const ref of refsFor(input.step)) {
    const refPath = `${skillPath}/references/${ref}`;
    if (!scan.commandText.includes(refPath)) {
      checks.referenceReads = false;
      failures.push(`command stream missing reference read: ${refPath}`);
    }
  }
  for (const markers of helperEventMarkers(input.step)) {
    const missing = markers.filter((marker) => marker && !scan.commandText.includes(marker));
    if (missing.length > 0) {
      checks.helperObserved = false;
      failures.push(`helper command not observed in native command stream: ${markers.join(" ")}`);
    }
  }
  for (const result of input.helperResults) {
    if (result.exitCode !== 0) {
      failures.push(`post-run helper failed: ${result.command} exited ${result.exitCode}`);
    }
  }
  for (const marker of [
    `CODEX_NATIVE_STEP=${input.step.id}`,
    `CODEX_NATIVE_SKILL=${input.step.skill}`,
    "PROOF_FILE=docs/evidence/codex-native-step-proof.md",
    "RESULT=pass",
  ]) {
    if (!lastMessage.includes(marker) && !scan.agentText.includes(marker)) {
      checks.finalMarkers = false;
      failures.push(`final response missing marker: ${marker}`);
    }
  }
  for (const marker of [
    `Native step: ${input.step.id}`,
    `Native skill: ${input.step.skill}`,
    "Codex native invocation: yes",
    "Repo-local parity: pass",
    "Step under test:",
    "Helper commands run:",
    "Proved:",
    "Simulated:",
    "Unproven:",
    "Result: pass",
  ]) {
    if (!proof.includes(marker)) {
      checks.proofMarkers = false;
      failures.push(`proof missing marker: ${marker}`);
    }
  }
  const missingManualMarkers = manualTrialPacketMarkers.filter((marker) => !manualTrials.includes(marker));
  if (missingManualMarkers.length > 0) {
    checks.manualPacket = false;
    failures.push(`manual-trials.md missing manual trial packet markers: ${missingManualMarkers.join(", ")}`);
  }
  if (scan.commandText.includes(repoRoot)) {
    checks.forbiddenWrites = false;
    failures.push(`native command stream references source repo path: ${repoRoot}`);
  }
  if (input.step.skill !== "build-right-execution") {
    const productFiles = await existingProductFiles(input.target);
    if (productFiles.length > 0) {
      checks.forbiddenWrites = false;
      failures.push(`planning-only step created product implementation files: ${productFiles.join(", ")}`);
    }
  }

  return {
    status: failures.length > 0 ? "failures-logged" : "pass",
    failures,
    checks,
  };
}

async function writeNegativeFixtureEvidence(input: {
  step: Step;
  target: string;
  eventsPath: string;
  lastMessagePath: string;
  proofPath: string;
  negativeFixture: NegativeFixture;
}): Promise<CommandResult[]> {
  const { step, target, eventsPath, lastMessagePath, proofPath, negativeFixture } = input;
  const skillPath = installedSkillPath(step.skill);
  const refs = refsFor(step).map((ref) => `${skillPath}/references/${ref}`);
  const readTargets = [
    ...(negativeFixture === "missing-skill-read" ? [] : [`${skillPath}/SKILL.md`]),
    ...refs.filter((_ref, index) => !(negativeFixture === "missing-reference-read" && index === 0)),
  ];
  const readCommand = readTargets.length > 0
    ? `/bin/zsh -lc "sed -n '1,220p' ${readTargets.join(" ")}"`
    : "/bin/zsh -lc \"printf 'fixture omitted required reads'\"";
  const helperEvents = helperCommands(step).map((command, index) => ({
    type: "item.completed",
    item: {
      id: `fixture_helper_${index + 1}`,
      type: "command_execution",
      command: `/bin/zsh -lc ${JSON.stringify(command)}`,
      exit_code: 0,
      status: "completed",
    },
  }));
  const finalMessage = `CODEX_NATIVE_STEP=${step.id}
CODEX_NATIVE_SKILL=${step.skill}
PROOF_FILE=docs/evidence/codex-native-step-proof.md
RESULT=pass
`;
  const events = [
    { type: "thread.started", thread_id: `fixture-${step.id}` },
    { type: "turn.started" },
    {
      type: "item.completed",
      item: {
        id: "fixture_reads",
        type: "command_execution",
        command: readCommand,
        exit_code: 0,
        status: "completed",
      },
    },
    ...helperEvents,
    {
      type: "item.completed",
      item: {
        id: "fixture_final",
        type: "agent_message",
        text: finalMessage,
      },
    },
    { type: "turn.completed", usage: { input_tokens: 1, output_tokens: 1 } },
  ];
  await writeFile(eventsPath, `${events.map((event) => JSON.stringify(event)).join("\n")}\n`);
  await writeFile(lastMessagePath, finalMessage);
  await writeFile(
    proofPath,
    `# Codex Native Step Proof

Native step: ${step.id}
Native skill: ${step.skill}
Codex native invocation: yes
Installed skill source: ${skillPath}
Repo-local parity: pass
Step under test: ${step.stepUnderTest}
Helper commands run: ${helperCommands(step).length}
Proved: native Codex read the required workflow instructions, ran helpers, and wrote scratch evidence
Simulated: synthetic negative fixture for Promptfoo and unit tests
Unproven: live native behavior for this fixture
Result: pass
`,
  );
  const manualTrialPath = join(target, "docs/evidence/manual-trials.md");
  const manualTrialText = negativeFixture === "missing-manual-trial-packet"
    ? "# Manual Trials\n\nFixture intentionally omits the required packet markers.\n"
    : `# Manual Trials\n\n${manualTrialPacketForPrompt(step, target)}\n`;
  await writeFile(manualTrialPath, manualTrialText);
  if (negativeFixture === "planning-product-file") {
    await writeFile(join(target, "package.json"), JSON.stringify({ name: "forbidden-planning-write", type: "module" }, null, 2));
  }
  return runPostHelpers(target, step);
}

async function runNativeStep(step: Step, args: Args): Promise<StepResult> {
  await assertInstalledParity(step);
  const target = stepTarget(step);
  await seedScratch(target, step);
  const promptPath = join(target, "docs/evidence/codex-prompt.txt");
  const eventsPath = join(target, "docs/evidence/codex-events.jsonl");
  const lastMessagePath = join(target, "docs/evidence/codex-last-message.txt");
  const proofPath = join(target, "docs/evidence/codex-native-step-proof.md");
  const stderrPath = join(target, "docs/evidence/codex-stderr.log");
  await writeFile(promptPath, promptFor(step, target));

  if (args.negativeFixture) {
    const helperResults = await writeNegativeFixtureEvidence({
      step,
      target,
      eventsPath,
      lastMessagePath,
      proofPath,
      negativeFixture: args.negativeFixture,
    });
    const judged = await judgeNativeStepResult({
      step,
      target,
      eventsPath,
      lastMessagePath,
      proofPath,
      codexExitCode: 0,
      helperResults,
    });
    return {
      step,
      target,
      status: judged.status,
      eventsPath,
      lastMessagePath,
      proofPath,
      promptPath,
      manualTrialPath: join(target, "docs/evidence/manual-trials.md"),
      helperResults,
      failures: judged.failures,
      checks: judged.checks,
    };
  }

  if (args.dryRun) {
    await writeFile(eventsPath, "");
    await writeFile(lastMessagePath, `CODEX_NATIVE_STEP=${step.id}\nDRY_RUN=yes\n`);
    await writeFile(
      proofPath,
      `# Codex Native Step Proof

Native step: ${step.id}
Native skill: ${step.skill}
Codex native invocation: dry-run
Installed skill source: ${installedSkillPath(step.skill)}
Repo-local parity: pass
Step under test: ${step.stepUnderTest}
Helper commands run: 0
Proved: scratch setup and prompt generation only
Simulated: native Codex execution
Unproven: native Codex execution and event judgment
Result: dry-run
`,
    );
    const manualTrialPath = await writeManualPacket(target, step, "dry-run");
    return {
      step,
      target,
      status: "dry-run",
      eventsPath,
      lastMessagePath,
      proofPath,
      promptPath,
      manualTrialPath,
      helperResults: [],
      failures: [],
      checks: dryRunChecks(),
    };
  }

  const proc = Bun.spawn([
    "codex",
    "exec",
    "--ephemeral",
    "--json",
    "-s",
    "workspace-write",
    "-C",
    target,
    "-o",
    lastMessagePath,
    await Bun.file(promptPath).text(),
  ], {
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
  const helperResults = await runPostHelpers(target, step);
  const judged = await judgeNativeStepResult({
    step,
    target,
    eventsPath,
    lastMessagePath,
    proofPath,
    codexExitCode: exitCode,
    helperResults,
  });
  const manualTrialPath = await writeManualPacket(target, step, judged.status);
  return {
    step,
    target,
    status: judged.status,
    eventsPath,
    lastMessagePath,
    proofPath,
    promptPath,
    manualTrialPath,
    helperResults,
    failures: judged.failures,
    checks: judged.checks,
  };
}

function tableCell(text: string): string {
  return text.replace(/\n/g, "<br>").replace(/\|/g, "\\|");
}

async function appendFailure(result: StepResult): Promise<void> {
  if (result.failures.length === 0) {
    return;
  }
  const row = [
    new Date().toISOString().slice(0, 10),
    result.step.id,
    `codex-native-step-${result.step.id}`,
    `codex exec --ephemeral --json -s workspace-write -C ${result.target}`,
    "native step trial exits cleanly and captures evidence",
    result.failures.join("; "),
    "agent-instruction",
    result.target,
    followUpTaskForStep(result.step),
    "open",
  ].map(tableCell);
  await Bun.write(failureLogPath, `${await readIfExists(failureLogPath)}| ${row.join(" | ")} |\n`);
}

function followUpTaskForStep(step: Step): string {
  if (step.id <= "049") {
    return "planning/tasks/073-run-native-preflight-step-trials.md";
  }
  if (step.id <= "057") {
    return "planning/tasks/074-run-native-feature-planning-step-trials.md";
  }
  if (step.id <= "062") {
    return "planning/tasks/075-run-native-execution-intake-step-trials.md";
  }
  return "planning/tasks/076-run-native-execution-implementation-step-trials.md";
}

function stepById(id: string): Step {
  const step = steps.find((item) => item.id === id);
  if (!step) {
    throw new Error(`unknown step in summary: ${id}`);
  }
  return step;
}

function summaryCells(row: string): string[] {
  return row.split("|").slice(1, -1).map((cell) => cell.trim());
}

function normalizeSummaryRow(row: string): string {
  const cells = summaryCells(row);
  if (cells.length < 6) {
    return row;
  }
  const step = stepById(cells[0] ?? "");
  while (cells.length < 8) {
    cells.push("n/a");
  }
  if (cells.length < 9) {
    cells.push(cells[2] === "pass" ? "none" : followUpTaskForStep(step));
  }
  return `| ${cells.slice(0, 9).join(" | ")} |`;
}

async function writeSummary(results: StepResult[]): Promise<void> {
  const existing = await readIfExists(summaryPath);
  const priorRows = existing
    .split("\n")
    .filter((line) => /^\| 0\d\d \|/.test(line))
    .map(normalizeSummaryRow);
  const newRows = results.map((result) => {
    const helperSummary = result.helperResults.length === 0
      ? "n/a"
      : result.helperResults.map((helper) => `${helper.command}: ${helper.exitCode}`).join("<br>");
    const failures = result.failures.length === 0 ? "none" : result.failures.join("<br>");
    const followUp = result.failures.length === 0 ? "none" : followUpTaskForStep(result.step);
    return `| ${result.step.id} | ${result.step.skill} | ${result.status} | \`${result.target}\` | \`${result.eventsPath}\` | \`${result.proofPath}\` | ${tableCell(helperSummary)} | ${tableCell(failures)} | ${followUp} |`;
  });
  const unique = new Map<string, string>();
  for (const row of [...priorRows, ...newRows]) {
    const id = row.split("|")[1]?.trim() ?? randomUUID();
    unique.set(id, row);
  }
  const rows = [...unique.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, row]) => row);
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    const status = row.split("|")[3]?.trim() ?? "unknown";
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});
  const text = `# Codex Native Step Trials

Generated: ${new Date().toISOString().slice(0, 10)}
Scratch root: \`${scratchRoot}\`

## Native Proof Scope

This is Sprint 006 native Codex proof. Sprint 005 deterministic helper fixtures
remain separate evidence in \`planning/sprints/005-skill-step-validation.md\`;
they are not counted as native step proof in this summary.

## Totals

- pass: ${counts.pass ?? 0}
- partial-needs-rerun: ${counts["partial-needs-rerun"] ?? 0}
- failures-logged: ${counts["failures-logged"] ?? 0}
- blocked: ${counts.blocked ?? 0}
- dry-run: ${counts["dry-run"] ?? 0}

## Results

| Step | Skill | Status | Scratch Repo | JSONL Events | Proof | Helpers | Failures | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.join("\n")}
`;
  await writeFile(summaryPath, text);
}

async function writeSummaryOnly(): Promise<void> {
  await writeSummary([]);
  console.log(`native step summary: ${summaryPath}`);
}

function stripTicks(text: string): string {
  return text.replace(/^`|`$/g, "");
}

async function statusAudit(): Promise<void> {
  await writeSummary([]);
  const summary = await readIfExists(summaryPath);
  const rows = summary.split("\n").filter((line) => /^\| 0\d\d \|/.test(line));
  const byId = new Map(rows.map((row) => [summaryCells(row)[0], summaryCells(row)]));
  const failures: string[] = [];
  for (const step of steps) {
    const cells = byId.get(step.id);
    if (!cells) {
      failures.push(`missing summary row for ${step.id}`);
      continue;
    }
    const status = cells[2] ?? "";
    if (!["pass", "partial-needs-rerun", "failures-logged", "blocked"].includes(status)) {
      failures.push(`${step.id} has invalid status: ${status}`);
    }
    for (const [label, value] of [["events", cells[4]], ["proof", cells[5]]] as const) {
      const path = stripTicks(value ?? "");
      if (!path || !(await Bun.file(path).exists())) {
        failures.push(`${step.id} missing ${label} artifact: ${path || "empty"}`);
      }
    }
    if (status !== "pass" && (!cells[8] || cells[8] === "none")) {
      failures.push(`${step.id} has non-pass status without follow-up`);
    }
  }
  if (failures.length > 0) {
    throw new Error(`native status audit failed:\n${failures.join("\n")}`);
  }
  console.log(`native status audit: pass (${steps.length} steps)`);
}

function stepResultForJson(result: StepResult): Record<string, unknown> {
  return {
    status: result.status,
    step: result.step.id,
    skill: result.step.skill,
    title: result.step.title,
    target: result.target,
    eventsPath: result.eventsPath,
    proofPath: result.proofPath,
    lastMessagePath: result.lastMessagePath,
    promptPath: result.promptPath,
    manualTrialPath: result.manualTrialPath,
    failures: result.failures,
    checks: result.checks,
    helperResults: result.helperResults.map((helper) => ({
      command: helper.command,
      exitCode: helper.exitCode,
    })),
  };
}

async function main(): Promise<void> {
  const args = parseArgs(Bun.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (args.summary) {
    await writeSummaryOnly();
    return;
  }
  if (args.statusAudit) {
    await statusAudit();
    return;
  }

  const selected = selectedSteps(args);
  if (args.jsonOutput && selected.length !== 1) {
    throw new Error("--json-output requires exactly one selected step");
  }

  const results: StepResult[] = [];
  for (const step of selected) {
    if (!args.jsonOutput) {
      console.log(`native step ${step.id}: ${args.dryRun ? "dry-run" : args.negativeFixture ? args.negativeFixture : "codex exec"}`);
    }
    try {
      const result = await runNativeStep(step, args);
      results.push(result);
      if (!args.noPlanningWrites) {
        await appendFailure(result);
      }
      if (!args.jsonOutput) {
        console.log(`${step.id}: ${result.status} ${result.target}`);
      }
      if (result.failures.length > 0 && !args.continueOnFailure) {
        break;
      }
    } catch (error) {
      const target = stepTarget(step);
      const result: StepResult = {
        step,
        target,
        status: "blocked",
        eventsPath: join(target, "docs/evidence/codex-events.jsonl"),
        lastMessagePath: join(target, "docs/evidence/codex-last-message.txt"),
        proofPath: join(target, "docs/evidence/codex-native-step-proof.md"),
        promptPath: join(target, "docs/evidence/codex-prompt.txt"),
        manualTrialPath: join(target, "docs/evidence/manual-trials.md"),
        helperResults: [],
        failures: [error instanceof Error ? error.message : String(error)],
        checks: blockedChecks(),
      };
      results.push(result);
      if (!args.noPlanningWrites) {
        await appendFailure(result);
      }
      if (!args.jsonOutput) {
        console.error(`${step.id}: blocked ${result.failures.join("; ")}`);
      }
      if (!args.continueOnFailure) {
        break;
      }
    }
  }
  if (args.jsonOutput) {
    console.log(JSON.stringify(stepResultForJson(results[0] as StepResult), null, 2));
    return;
  }
  if (!args.noPlanningWrites) {
    await writeSummary(results);
  }
  const failed = results.filter((result) => result.status === "failures-logged" || result.status === "blocked");
  if (failed.length > 0) {
    throw new Error(`native step runner stopped with ${failed.length} failed/blocked step(s)`);
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
