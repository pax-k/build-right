import { dirname, join, relative } from "node:path";

type FailureClass =
  | "agent-instruction"
  | "helper-script"
  | "generated-artifact"
  | "verifier-gap"
  | "environment"
  | "browser-proof"
  | "source-under-test"
  | "gate"
  | "regression"
  | "unknown";

type FailureRow = {
  task: string;
  phase: string;
  command: string;
  expected: string;
  actual: string;
  failureClass: FailureClass;
  artifact: string;
  followUp: string;
  status: string;
};

type CommandResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

type FailureRecord = {
  index: number;
  date: string;
  task: string;
  phase: string;
  command: string;
  expected: string;
  actual: string;
  failureClass: string;
  artifact: string;
  followUp: string;
  status: string;
};

type FailureStatusKind =
  | "actionable-open"
  | "historical-resolved"
  | "resolved"
  | "expected-control"
  | "forced-control"
  | "needs-triage";

const repoRoot = join(import.meta.dir, "..");
const defaultTarget = "/tmp/build-right-todo-trial";
const defaultPreflightTarget = "/tmp/build-right-todo-trial-preflight";
const defaultFailureLogPath = join(repoRoot, "planning", "failed-tests.md");
const defaultFailureSummaryPath = join(repoRoot, "planning", "failed-test-summary.md");
const defaultE2eReportPath = join(repoRoot, "planning", "e2e-workflow-report.md");
const e2eOraclePath = join(repoRoot, "planning", "e2e-workflow-oracle.md");
const failureLogPath = argValue("--failure-log", defaultFailureLogPath) ?? defaultFailureLogPath;
const failureSummaryPath =
  argValue("--summary-output", defaultFailureSummaryPath) ?? defaultFailureSummaryPath;
const e2eReportPath = argValue("--report", defaultE2eReportPath) ?? defaultE2eReportPath;
const skillNames = ["build-right-preflight", "build-right-feature-planning", "build-right-execution"];

function trialTempRoot(label: string): string {
  return `${defaultTarget}-${label}-${Date.now()}-${process.pid}-${crypto.randomUUID()}`;
}

function argValue(name: string, fallback?: string): string | undefined {
  const index = Bun.argv.indexOf(name);
  if (index === -1) {
    return fallback;
  }
  return Bun.argv[index + 1] ?? fallback;
}

function today(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function cell(value: string): string {
  return value.replace(/\n/g, "<br>").replace(/\|/g, "\\|");
}

async function exists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

async function directoryExists(path: string): Promise<boolean> {
  const glob = new Bun.Glob("*");
  for await (const _ of glob.scan({ cwd: path, onlyFiles: false })) {
    return true;
  }
  try {
    for await (const _ of new Bun.Glob(".*").scan({ cwd: path, onlyFiles: false })) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function run(command: string[], cwd = repoRoot): Promise<CommandResult> {
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
  return { exitCode, stdout, stderr };
}

async function mustRun(
  command: string[],
  cwd = repoRoot,
  failure: Partial<FailureRow> = {},
): Promise<CommandResult> {
  const result = await run(command, cwd);
  if (result.exitCode !== 0) {
    await appendFailure({
      task: failure.task ?? "008",
      phase: failure.phase ?? "command",
      command: command.join(" "),
      expected: failure.expected ?? "exit 0",
      actual: `exit ${result.exitCode}: ${result.stderr || result.stdout}`,
      failureClass: failure.failureClass ?? "environment",
      artifact: failure.artifact ?? cwd,
      followUp:
        failure.followUp ?? "planning/tasks/008-add-scratch-repo-seed-and-source-parity-checks.md",
      status: failure.status ?? "open",
    });
    throw new Error(`${command.join(" ")} failed with exit ${result.exitCode}`);
  }
  return result;
}

async function appendFailure(row: FailureRow): Promise<void> {
  const line = `| ${today()} | ${cell(row.task)} | ${cell(row.phase)} | ${cell(
    row.command,
  )} | ${cell(row.expected)} | ${cell(row.actual)} | ${cell(
    row.failureClass,
  )} | ${cell(row.artifact)} | ${cell(row.followUp)} | ${cell(row.status)} |\n`;
  const file = Bun.file(failureLogPath);
  const text = (await file.exists()) ? await file.text() : "";
  await Bun.write(failureLogPath, `${text}${line}`);
}

async function readText(path: string): Promise<string> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return "";
  }
  return file.text();
}

async function requireFile(path: string, problems: string[]): Promise<void> {
  if (!(await exists(path))) {
    problems.push(`missing file: ${path}`);
  }
}

async function requireIncludes(path: string, markers: string[], problems: string[]): Promise<void> {
  const text = await readText(path);
  if (!text) {
    problems.push(`missing readable file: ${path}`);
    return;
  }
  for (const marker of markers) {
    if (!text.includes(marker)) {
      problems.push(`${path} missing marker: ${marker}`);
    }
  }
}

async function requireMatches(path: string, marker: string, pattern: RegExp, problems: string[]): Promise<void> {
  const text = await readText(path);
  if (!text) {
    problems.push(`missing readable file: ${path}`);
    return;
  }
  if (!pattern.test(text)) {
    problems.push(`${path} missing semantic marker: ${marker}`);
  }
}

async function requireOrderedIncludes(
  path: string,
  markers: string[],
  problems: string[],
): Promise<void> {
  const text = await readText(path);
  if (!text) {
    problems.push(`missing readable file: ${path}`);
    return;
  }

  let cursor = -1;
  for (const marker of markers) {
    const index = text.indexOf(marker, cursor + 1);
    if (index === -1) {
      problems.push(`${path} missing ordered marker after ${cursor}: ${marker}`);
      return;
    }
    cursor = index;
  }
}

async function failWithProblems(row: FailureRow, problems: string[]): Promise<void> {
  if (problems.length === 0) {
    return;
  }
  await appendFailure({
    ...row,
    actual: problems.slice(0, 6).join("; "),
  });
  throw new Error(problems.join("\n"));
}

function assertScratchTarget(target: string): void {
  if (target !== defaultTarget && !target.startsWith(`${defaultTarget}-`)) {
    throw new Error(`refusing to reset non-trial target: ${target}`);
  }
}

async function seedScratch(target: string): Promise<void> {
  assertScratchTarget(target);
  await mustRun(["rm", "-rf", target]);
  await mustRun(["mkdir", "-p", target]);

  const agentInstructions = await Bun.file(join(repoRoot, "AGENTS.md")).text();
  await Bun.write(join(target, "AGENTS.md"), agentInstructions);
  await Bun.write(
    join(target, "README.md"),
    "# Build Right Todo Trial\n\nScratch repository for Build Right manual trials.\n",
  );
  await mustRun(["git", "init"], target);
}

async function filesUnder(root: string): Promise<string[]> {
  const glob = new Bun.Glob("**/*");
  const files: string[] = [];
  for await (const file of glob.scan({ cwd: root, onlyFiles: true })) {
    if (file.startsWith(".git/")) {
      continue;
    }
    files.push(file);
  }
  return files.sort();
}

async function compareDirectories(expectedRoot: string, actualRoot: string): Promise<string[]> {
  const expectedFiles = await filesUnder(expectedRoot);
  const actualFiles = await filesUnder(actualRoot);
  const allFiles = [...new Set([...expectedFiles, ...actualFiles])].sort();
  const mismatches: string[] = [];

  for (const file of allFiles) {
    const expectedPath = join(expectedRoot, file);
    const actualPath = join(actualRoot, file);
    const expectedExists = await exists(expectedPath);
    const actualExists = await exists(actualPath);
    if (!expectedExists || !actualExists) {
      mismatches.push(`${file}: ${expectedExists ? "missing actual" : "missing expected"}`);
      continue;
    }
    const [expectedText, actualText] = await Promise.all([
      Bun.file(expectedPath).text(),
      Bun.file(actualPath).text(),
    ]);
    if (expectedText !== actualText) {
      mismatches.push(`${file}: content differs`);
    }
  }

  return mismatches;
}

async function parity(compareRoot: string): Promise<string[]> {
  const mismatches: string[] = [];
  for (const skill of skillNames) {
    const expected = join(repoRoot, "skills", skill);
    const actual = join(compareRoot, skill);
    if (!(await exists(join(actual, "SKILL.md")))) {
      mismatches.push(`${skill}: missing ${relative(repoRoot, join(actual, "SKILL.md"))}`);
      continue;
    }
    const skillMismatches = await compareDirectories(expected, actual);
    mismatches.push(...skillMismatches.map((mismatch) => `${skill}/${mismatch}`));
  }
  return mismatches;
}

async function copySkillSource(destination: string): Promise<void> {
  await mustRun(["rm", "-rf", destination]);
  await mustRun(["mkdir", "-p", destination]);
  for (const skill of skillNames) {
    await mustRun(["cp", "-R", join(repoRoot, "skills", skill), join(destination, skill)]);
  }
}

async function copyPreflightSnapshot(source: string, destination: string): Promise<void> {
  assertScratchTarget(destination);
  await mustRun(["rm", "-rf", destination], repoRoot, {
    task: "011",
    followUp: "planning/tasks/011-automate-preflight-artifact-verification.md",
  });
  await mustRun(["mkdir", "-p", destination], repoRoot, {
    task: "011",
    followUp: "planning/tasks/011-automate-preflight-artifact-verification.md",
  });
  for (const path of ["AGENTS.md", "README.md"]) {
    if (await exists(join(source, path))) {
      await mustRun(["cp", join(source, path), join(destination, path)], repoRoot, {
        task: "011",
        followUp: "planning/tasks/011-automate-preflight-artifact-verification.md",
      });
    }
  }
  for (const path of ["docs", "tasks"]) {
    if (!(await directoryExists(join(source, path)))) {
      throw new Error(`missing source directory for preflight snapshot: ${join(source, path)}`);
    }
    await mustRun(["cp", "-R", join(source, path), join(destination, path)], repoRoot, {
      task: "011",
      followUp: "planning/tasks/011-automate-preflight-artifact-verification.md",
    });
  }
}

async function verifyPreflight(target: string, failureOverrides: Partial<FailureRow> = {}): Promise<void> {
  const problems: string[] = [];
  const requiredFiles = [
    "docs/blueprint-status.md",
    "docs/raw/founder-dump.md",
    "docs/raw/founder-interview.md",
    "docs/source-index.md",
    "docs/mvp-scope.md",
    "docs/execution-rules.md",
    "docs/release-gates.md",
    "docs/conflicts.md",
    "docs/evidence/evidence-notes.md",
    "docs/evidence/manual-trials.md",
    "docs/evidence/preflight-transcript.md",
    "tasks/sprint-0.md",
    "tasks/issues/001-build-bun-react-todo-app.md",
  ];

  for (const path of requiredFiles) {
    await requireFile(join(target, path), problems);
  }

  await requireIncludes(join(target, "docs/blueprint-status.md"), [
    "Status:",
    "Current phase:",
    "Project state:",
    "Source mode:",
    "Prototype confidence:",
    "Active task:",
    "Current gate:",
    "Last evidence:",
    "## Readiness",
    "## Current File Plan",
    "## Next Action",
  ], problems);
  await requireIncludes(join(target, "docs/mvp-scope.md"), [
    "Source mode: founder-fed",
    "Prototype confidence: n/a",
    "Primary customer:",
    "Primary workflow:",
    "## Included",
    "## Excluded",
  ], problems);
  await requireIncludes(join(target, "docs/source-index.md"), [
    "founder-claimed",
    "repo-evidence-backed",
    "customer-evidence-backed",
  ], problems);
  await requireIncludes(join(target, "docs/execution-rules.md"), [
    "## Authority Order",
    "## Stop/Ask Gates",
  ], problems);
  await requireMatches(join(target, "docs/execution-rules.md"), "bun runtime rule", /\bbun\b/i, problems);
  await requireIncludes(join(target, "docs/release-gates.md"), [
    "Source parity",
    "Preflight artifacts",
    "Local validation",
    "Browser proof",
  ], problems);
  await requireIncludes(join(target, "docs/evidence/evidence-notes.md"), [
    "## Repository Evidence",
    "## Founder Evidence",
    "## Prototype Assumptions",
  ], problems);
  await requireIncludes(join(target, "docs/evidence/preflight-transcript.md"), [
    "Preflight decision:",
    "Confidence:",
    "Project type:",
    "Next action:",
    "## Focused Founder Questions",
    "## Founder Reply",
    "## File Plan",
    "First executable AI task:",
  ], problems);
  await requireIncludes(join(target, "tasks/issues/001-build-bun-react-todo-app.md"), [
    "Status:",
    "Type:",
    "Owner:",
    "Assumption basis:",
    "Reversibility:",
    "Learning objective:",
    "Source under test:",
    "## Goal",
    "## Non-Goals",
    "## Required Reading",
    "## Acceptance Criteria",
    "## Baseline Evidence",
    "## Verification",
    "## Evidence Log",
    "## Blockers",
    "## Follow-Ups",
  ], problems);

  for (const appFile of ["package.json", "index.ts", "index.html", "frontend.tsx", "todo.ts", "todo.test.ts"]) {
    if (await exists(join(target, appFile))) {
      problems.push(`app file exists during preflight verification: ${appFile}`);
    }
  }

  const helper = await run([
    "bun",
    join(repoRoot, "skills/build-right-preflight/scripts/preflight-check.ts"),
    "--cwd",
    target,
    "--mode",
    "all",
    "--format",
    "json",
  ]);
  if (helper.exitCode !== 0) {
    problems.push(`preflight helper failed: ${helper.stderr || helper.stdout}`);
  } else {
    const parsed = JSON.parse(helper.stdout) as { decision?: string };
    if (parsed.decision !== "ready-for-execution") {
      problems.push(`preflight helper decision was ${parsed.decision}`);
    }
  }

  await failWithProblems({
    task: "011",
    phase: "verify-preflight",
    command: `bun scripts/todo-trial.ts verify-preflight --target ${target}`,
    expected: "preflight artifacts satisfy contract",
    actual: "",
    failureClass: "generated-artifact",
    artifact: target,
    followUp: "planning/tasks/011-automate-preflight-artifact-verification.md",
    status: "open",
    ...failureOverrides,
  }, problems);
}

async function verifyPreflightNegative(kind: "missing" | "app-file"): Promise<void> {
  const root = trialTempRoot(`preflight-negative-${kind}`);
  await copyPreflightSnapshot(argValue("--source", defaultTarget) ?? defaultTarget, root);
  if (kind === "missing") {
    await mustRun(["rm", "-f", join(root, "docs/source-index.md")], repoRoot, {
      task: "011",
      followUp: "planning/tasks/011-automate-preflight-artifact-verification.md",
    });
  } else {
    await Bun.write(join(root, "package.json"), "{\"name\":\"bad-preflight\"}\n");
  }

  try {
    await verifyPreflight(root, {
      phase: `verify-preflight-negative-${kind}`,
      command: `bun scripts/todo-trial.ts verify-preflight-negative --kind ${kind}`,
      expected: "negative preflight fixture fails",
      artifact: root,
      status: "expected-control",
    });
  } catch {
    console.log(`preflight negative (${kind}): expected failure logged`);
    return;
  }

  await appendFailure({
    task: "011",
    phase: `verify-preflight-negative-${kind}`,
    command: `bun scripts/todo-trial.ts verify-preflight-negative --kind ${kind}`,
    expected: "negative fixture fails",
    actual: "negative fixture passed",
    failureClass: "verifier-gap",
    artifact: root,
    followUp: "planning/tasks/011-automate-preflight-artifact-verification.md",
    status: "open",
  });
  throw new Error(`preflight negative (${kind}) unexpectedly passed`);
}

async function verifyNoForbiddenRuntime(target: string, problems: string[]): Promise<void> {
  const files = [
    "package.json",
    "index.ts",
    "index.html",
    "todo.ts",
    "frontend.tsx",
    "index.css",
    "todo.test.ts",
  ];
  const forbidden = /\b(vite|npm|pnpm|yarn|npx|express|dotenv)\b|from\s+['"]ws['"]/i;
  for (const file of files) {
    const text = await readText(join(target, file));
    if (forbidden.test(text)) {
      problems.push(`forbidden runtime reference in ${file}`);
    }
  }
}

async function verifyLiveServer(target: string): Promise<void> {
  const port = "3017";
  const proc = Bun.spawn(["bun", "--hot", "./index.ts"], {
    cwd: target,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...Bun.env,
      PORT: port,
    },
  });

  try {
    let html = "";
    for (let attempt = 0; attempt < 30; attempt += 1) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}`);
        html = await response.text();
        if (response.ok && html.includes("Build Right Todo Trial")) {
          return;
        }
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    const stderr = await new Response(proc.stderr).text();
    throw new Error(`server did not serve expected HTML: ${stderr || html}`);
  } finally {
    proc.kill();
    await proc.exited.catch(() => {});
  }
}

async function verifyExecution(target: string, failureOverrides: Partial<FailureRow> = {}): Promise<void> {
  const problems: string[] = [];
  const requiredFiles = [
    "package.json",
    "bun.lock",
    "index.ts",
    "index.html",
    "todo.ts",
    "frontend.tsx",
    "index.css",
    "todo.test.ts",
    "docs/evidence/execution-transcript.md",
    "docs/evidence/browser-proof.md",
    "docs/evidence/browser-proof.png",
    "tasks/issues/001-build-bun-react-todo-app.md",
  ];

  for (const path of requiredFiles) {
    await requireFile(join(target, path), problems);
  }

  await requireIncludes(join(target, "docs/evidence/execution-transcript.md"), [
    "Resolver decision: execute-task",
    "## Task Intake",
    "Baseline evidence:",
    "Verification ladder:",
    "`bun install`",
    "`bun test`",
    "Browser proof",
    "Stop gates",
  ], problems);
  await requireIncludes(join(target, "docs/evidence/browser-proof.md"), [
    "| Add todo | pass |",
    "| Complete todo | pass |",
    "| Completed filter | pass |",
    "| Active filter | pass |",
    "| Delete todo | pass |",
    "| localStorage restore | pass |",
  ], problems);
  await requireIncludes(join(target, "index.ts"), [
    "Bun.serve",
    "routes:",
    "index.html",
  ], problems);
  await requireIncludes(join(target, "index.html"), [
    "frontend.tsx",
  ], problems);
  await requireIncludes(join(target, "frontend.tsx"), [
    "React",
    "localStorage",
    "data-testid=\"todo-input\"",
    "data-testid={`filter-${option}`}",
  ], problems);
  await requireIncludes(join(target, "todo.test.ts"), [
    "bun:test",
    "filters active and completed todos",
    "restores only valid stored todos",
  ], problems);
  await requireIncludes(join(target, "tasks/issues/001-build-bun-react-todo-app.md"), [
    "Status: complete",
    "## Files Changed",
    "## Verification Summary",
    "Trial status: pass",
  ], problems);
  await verifyNoForbiddenRuntime(target, problems);

  await failWithProblems({
    task: "012",
    phase: "verify-execution",
    command: `bun scripts/todo-trial.ts verify-execution --target ${target}`,
    expected: "execution artifacts satisfy contract",
    actual: "",
    failureClass: "generated-artifact",
    artifact: target,
    followUp: "planning/tasks/012-automate-execution-and-browser-proof-verification.md",
    status: "open",
    ...failureOverrides,
  }, problems);

  await mustRun(["bun", "test"], target, {
    task: "012",
    phase: "scratch-bun-test",
    expected: "scratch tests pass",
    failureClass: "generated-artifact",
    artifact: target,
    followUp: "planning/tasks/012-automate-execution-and-browser-proof-verification.md",
  });

  try {
    await verifyLiveServer(target);
  } catch (error) {
    await appendFailure({
      task: "012",
      phase: "live-server",
      command: "bun --hot ./index.ts",
      expected: "server responds with app HTML",
      actual: error instanceof Error ? error.message : String(error),
      failureClass: "browser-proof",
      artifact: target,
      followUp: "planning/tasks/012-automate-execution-and-browser-proof-verification.md",
      status: "open",
    });
    throw error;
  }
}

async function copyExecutionFixture(source: string, destination: string): Promise<void> {
  assertScratchTarget(destination);
  await mustRun(["rm", "-rf", destination], repoRoot, {
    task: "012",
    followUp: "planning/tasks/012-automate-execution-and-browser-proof-verification.md",
  });
  await mustRun(["mkdir", "-p", destination], repoRoot, {
    task: "012",
    followUp: "planning/tasks/012-automate-execution-and-browser-proof-verification.md",
  });
  for (const path of [
    "AGENTS.md",
    "README.md",
    "package.json",
    "bun.lock",
    "index.ts",
    "index.html",
    "todo.ts",
    "frontend.tsx",
    "index.css",
    "todo.test.ts",
  ]) {
    if (await exists(join(source, path))) {
      await mustRun(["cp", "-R", join(source, path), join(destination, path)], repoRoot, {
        task: "012",
        followUp: "planning/tasks/012-automate-execution-and-browser-proof-verification.md",
      });
    }
  }
  for (const path of ["docs", "tasks"]) {
    if (!(await directoryExists(join(source, path)))) {
      throw new Error(`missing source directory for execution fixture: ${join(source, path)}`);
    }
    await mustRun(["cp", "-R", join(source, path), join(destination, path)], repoRoot, {
      task: "012",
      followUp: "planning/tasks/012-automate-execution-and-browser-proof-verification.md",
    });
  }
}

async function conflictFixtureError(root: string): Promise<string | null> {
  const conflictsPath = join(root, "docs/conflicts.md");
  const text = await readText(conflictsPath);
  if (!text) {
    return "docs/conflicts.md is missing";
  }
  const sectionText = text.match(/^## Conflicts\s*$/m);
  if (!sectionText) {
    return "docs/conflicts.md is missing required ## Conflicts section";
  }
  for (const marker of ["| Conflict |", "| Owner |", "| Status |"]) {
    if (!text.includes(marker)) {
      return `docs/conflicts.md malformed conflict table: missing ${marker}`;
    }
  }
  return null;
}

async function verifyExecutionNegative(): Promise<void> {
  const root = trialTempRoot("execution-negative");
  await copyExecutionFixture(argValue("--source", defaultTarget) ?? defaultTarget, root);
  await Bun.write(
    join(root, "docs/evidence/browser-proof.md"),
    (await readText(join(root, "docs/evidence/browser-proof.md"))).replace(
      "| localStorage restore | pass |",
      "| localStorage restore | fail |",
    ),
  );

  try {
    await verifyExecution(root, {
      phase: "verify-execution-negative",
      command: "bun scripts/todo-trial.ts verify-execution-negative",
      expected: "negative execution fixture fails",
      artifact: root,
      status: "expected-control",
    });
  } catch {
    console.log("execution negative: expected failure logged");
    return;
  }

  await appendFailure({
    task: "012",
    phase: "verify-execution-negative",
    command: "bun scripts/todo-trial.ts verify-execution-negative",
    expected: "negative execution fixture fails",
    actual: "negative fixture passed",
    failureClass: "verifier-gap",
    artifact: root,
    followUp: "planning/tasks/012-automate-execution-and-browser-proof-verification.md",
    status: "open",
  });
  throw new Error("execution negative unexpectedly passed");
}

async function writeFile(path: string, text: string): Promise<void> {
  await mustRun(["mkdir", "-p", dirname(path)], repoRoot, {
    task: "013",
    followUp: "planning/tasks/013-automate-negative-gate-case-trials.md",
  });
  await Bun.write(path, text);
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

function openQuestions(): string {
  return `# Open Questions

Status: resolved

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
| Local validation | checks pass | bun test | ${status} |
`;
}

function tracker(row: string): string {
  return `# Sprint 0

Status: active

## Tasks

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
${row}
`;
}

function taskFile(id: string, status: string, owner = "AI"): string {
  return `# ${id}: Gate Fixture Task

Status: ${status}
Type: validation
Owner: ${owner}

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove negative gate resolver behavior
Source under test: fixture

## Goal

Exercise negative gate behavior.

## Non-Goals

- Implement product features.

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

async function createGateFixture(name: string, files: Record<string, string>): Promise<string> {
  const root = trialTempRoot(`gate-${name}`);
  assertScratchTarget(root);
  await mustRun(["rm", "-rf", root], repoRoot, {
    task: "013",
    followUp: "planning/tasks/013-automate-negative-gate-case-trials.md",
  });
  for (const [path, text] of Object.entries(files)) {
    await writeFile(join(root, path), text);
  }
  return root;
}

async function continueCheckJson(root: string): Promise<{
  decision?: string;
  blockingGates?: Array<{ type?: string }>;
}> {
  const result = await mustRun([
    "bun",
    join(repoRoot, "skills/build-right-execution/scripts/continue-check.ts"),
    "--cwd",
    root,
    "--format",
    "json",
    "--strict",
  ], repoRoot, {
    task: "013",
    phase: "negative-gates",
    artifact: root,
    followUp: "planning/tasks/013-automate-negative-gate-case-trials.md",
  });
  return JSON.parse(result.stdout);
}

async function assertGateDecision(
  label: string,
  root: string,
  expectedDecision: string,
  expectedGateType?: string,
): Promise<void> {
  if (label.includes("conflict")) {
    const fixtureError = await conflictFixtureError(root);
    if (fixtureError) {
      await appendFailure({
        task: "013",
        phase: "negative-gates",
        command: label,
        expected: "well-formed conflict fixture",
        actual: fixtureError,
        failureClass: "verifier-gap",
        artifact: root,
        followUp: "planning/tasks/013-automate-negative-gate-case-trials.md",
        status: "open",
      });
      throw new Error(`fixture error: ${fixtureError}`);
    }
  }

  const result = await continueCheckJson(root);
  const actualGateType = result.blockingGates?.[0]?.type;
  if (result.decision !== expectedDecision || (expectedGateType && actualGateType !== expectedGateType)) {
    await appendFailure({
      task: "013",
      phase: "negative-gates",
      command: label,
      expected: `${expectedDecision}${expectedGateType ? `/${expectedGateType}` : ""}`,
      actual: `${result.decision ?? "none"}${actualGateType ? `/${actualGateType}` : ""}`,
      failureClass: "gate",
      artifact: root,
      followUp: "planning/tasks/013-automate-negative-gate-case-trials.md",
      status: "open",
    });
    throw new Error(`${label} returned ${result.decision}/${actualGateType ?? "no-gate"}`);
  }
}

async function negativeGatesMalformedConflict(): Promise<void> {
  const root = await createGateFixture("malformed-conflict", {
    "docs/blueprint-status.md": readyBlueprint(),
    "docs/open-questions.md": openQuestions(),
    "docs/release-gates.md": releaseGates(),
    "docs/execution-rules.md": "# Execution Rules\n",
    "docs/conflicts.md": `# Conflicts

| Conflict | Sources | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| Missing heading | docs/a.md | high | founder | open |  |
`,
    "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
    "tasks/issues/001-task.md": taskFile("001", "ready"),
  });
  const fixtureError = await conflictFixtureError(root);
  if (!fixtureError) {
    await appendFailure({
      task: "013",
      phase: "negative-gates-malformed-conflict",
      command: "bun scripts/todo-trial.ts negative-gates-malformed-conflict",
      expected: "malformed conflict fixture is rejected before resolver assertion",
      actual: "fixture passed schema validation",
      failureClass: "verifier-gap",
      artifact: root,
      followUp: "planning/tasks/021-fix-negative-gate-fixtures.md",
      status: "open",
    });
    throw new Error("malformed conflict fixture unexpectedly passed schema validation");
  }
  console.log(`fixture error: ${fixtureError}`);
}

async function negativeGates(): Promise<void> {
  const baseDocs = {
    "docs/blueprint-status.md": readyBlueprint(),
    "docs/open-questions.md": openQuestions(),
    "docs/release-gates.md": releaseGates(),
    "docs/execution-rules.md": "# Execution Rules\n",
  };

  await assertGateDecision(
    "blank repo execution",
    await createGateFixture("blank", { "AGENTS.md": "# Agent instructions\n" }),
    "create-blocker",
  );
  await assertGateDecision(
    "founder-owned task",
    await createGateFixture("founder-owner", {
      ...baseDocs,
      "tasks/sprint-0.md": tracker("| 001 | Founder task | ready | tasks/issues/001-task.md |"),
      "tasks/issues/001-task.md": taskFile("001", "ready", "Founder"),
    }),
    "ask-founder",
  );
  await assertGateDecision(
    "external-owned task",
    await createGateFixture("external-owner", {
      ...baseDocs,
      "tasks/sprint-0.md": tracker("| 001 | External task | ready | tasks/issues/001-task.md |"),
      "tasks/issues/001-task.md": taskFile("001", "ready", "External provider"),
    }),
    "wait-external",
  );
  await assertGateDecision(
    "open founder conflict",
    await createGateFixture("founder-conflict", {
      ...baseDocs,
      "docs/conflicts.md": `# Conflicts

## Conflicts

| Conflict | Sources | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| Customer mismatch | docs/a.md | high | founder | open |  |
`,
      "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
      "tasks/issues/001-task.md": taskFile("001", "ready"),
    }),
    "ask-founder",
  );
  await assertGateDecision(
    "open AI conflict",
    await createGateFixture("ai-conflict", {
      ...baseDocs,
      "docs/conflicts.md": `# Conflicts

## Conflicts

| Conflict | Sources | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| Tracker mismatch | tasks/a.md | medium | AI | open |  |
`,
      "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
      "tasks/issues/001-task.md": taskFile("001", "ready"),
    }),
    "create-blocker",
    "open-conflict",
  );
  await assertGateDecision(
    "failed release gate",
    await createGateFixture("failed-release", {
      ...baseDocs,
      "docs/release-gates.md": releaseGates("failed"),
      "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
      "tasks/issues/001-task.md": taskFile("001", "ready"),
    }),
    "create-blocker",
    "failed-verification",
  );
  await assertGateDecision(
    "source mismatch gate",
    await createGateFixture("source-mismatch", {
      ...baseDocs,
      "docs/release-gates.md": releaseGates("partial-needs-rerun"),
      "tasks/sprint-0.md": tracker("| 001 | Ready task | ready | tasks/issues/001-task.md |"),
      "tasks/issues/001-task.md": taskFile("001", "ready"),
    }),
    "create-blocker",
    "source-mismatch",
  );
}

function splitMarkdownRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let current = "";
  let escaped = false;
  for (const char of trimmed) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      current += char;
      continue;
    }
    if (char === "|") {
      cells.push(current.trim().replace(/\\\|/g, "|"));
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim().replace(/\\\|/g, "|"));
  return cells;
}

async function failureRecords(): Promise<FailureRecord[]> {
  const text = await readText(failureLogPath);
  const records: FailureRecord[] = [];
  let index = 0;
  for (const line of text.split("\n")) {
    if (!/^\|\s*20\d\d-\d\d-\d\d\s*\|/.test(line)) {
      continue;
    }
    const cells = splitMarkdownRow(line);
    if (cells.length < 10) {
      continue;
    }
    const [
      date = "",
      task = "",
      phase = "",
      command = "",
      expected = "",
      actual = "",
      failureClass = "",
      artifact = "",
      followUp = "",
      status = "",
    ] = cells;
    records.push({
      index,
      date,
      task,
      phase,
      command,
      expected,
      actual,
      failureClass,
      artifact,
      followUp,
      status,
    });
    index += 1;
  }
  return records;
}

function statusKind(status: string): FailureStatusKind {
  const normalized = status.trim().toLowerCase();
  if (/forced/.test(normalized)) {
    return "forced-control";
  }
  if (/resolved|fixed|closed/.test(normalized)) {
    return "resolved";
  }
  if (/expected|baseline|control|simulated/.test(normalized)) {
    return "expected-control";
  }
  if (/triage|unknown/.test(normalized)) {
    return "needs-triage";
  }
  if (/open|fail|blocked/.test(normalized)) {
    return "actionable-open";
  }
  return "needs-triage";
}

function resolutionKey(record: FailureRecord): string {
  return `${record.task}::${record.failureClass}::${record.phase}`;
}

function recordDisposition(record: FailureRecord, records: FailureRecord[]): FailureStatusKind {
  const kind = statusKind(record.status);
  if (kind !== "actionable-open" && kind !== "needs-triage") {
    return kind;
  }
  const hasLaterResolution = records.some((candidate) => {
    return candidate.index > record.index
      && resolutionKey(candidate) === resolutionKey(record)
      && statusKind(candidate.status) === "resolved";
  });
  return hasLaterResolution ? "historical-resolved" : kind;
}

async function writeFailureSummary(): Promise<void> {
  const records = await failureRecords();
  const groups = new Map<string, FailureRecord[]>();
  for (const record of records) {
    const key = `${record.failureClass}::${record.phase}`;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  const dispositions = new Map<number, FailureStatusKind>();
  for (const record of records) {
    dispositions.set(record.index, recordDisposition(record, records));
  }
  const count = (kind: FailureStatusKind): number =>
    records.filter((record) => dispositions.get(record.index) === kind).length;
  const expectedOrControl = count("expected-control") + count("forced-control");

  const lines = [
    "# Failed Test Summary",
    "",
    `Generated: ${today()}`,
    "",
    "## Totals",
    "",
    `- Total rows: ${records.length}`,
    `- Actionable open rows: ${count("actionable-open") + count("needs-triage")}`,
    `- Historical open rows with resolution: ${count("historical-resolved")}`,
    `- Expected/control rows: ${expectedOrControl}`,
    `- Resolved rows: ${count("resolved")}`,
    "",
    "## Groups",
    "",
    "| Class | Phase | Count | Actionable Open | Historical Resolved | Expected/Control | Related Task |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const [key, group] of [...groups.entries()].sort()) {
    const [failureClass, phase] = key.split("::");
    const actionableOpen = group.filter((record) => {
      const disposition = dispositions.get(record.index);
      return disposition === "actionable-open" || disposition === "needs-triage";
    }).length;
    const historicalResolved = group.filter((record) => {
      return dispositions.get(record.index) === "historical-resolved";
    }).length;
    const groupExpected = group.filter((record) => {
      const disposition = dispositions.get(record.index);
      return disposition === "expected-control" || disposition === "forced-control";
    }).length;
    const followUps = [...new Set(group.map((record) => record.followUp).filter(Boolean))].join("<br>");
    lines.push(
      `| ${failureClass} | ${phase} | ${group.length} | ${actionableOpen} | ${historicalResolved} | ${groupExpected} | ${followUps || "n/a"} |`,
    );
  }

  lines.push(
    "",
    "## Candidate Improvements",
    "",
  );

  const actionableGroups = [...groups.entries()].filter(([, group]) => {
    return group.some((record) => {
      const disposition = dispositions.get(record.index);
      return disposition === "actionable-open" || disposition === "needs-triage";
    });
  });
  if (actionableGroups.length === 0) {
    lines.push("- No actionable failure groups remain.");
  } else {
    for (const [key, group] of actionableGroups) {
      const [failureClass, phase] = key.split("::");
      const followUps = [...new Set(group.map((record) => record.followUp).filter(Boolean))].join(", ");
      const actionable = group.filter((record) => {
        const disposition = dispositions.get(record.index);
        return disposition === "actionable-open" || disposition === "needs-triage";
      }).length;
      lines.push(
        `- ${failureClass}/${phase}: ${group.length} rows, ${actionable} actionable. Candidate follow-up: ${followUps || "triage needed"}.`,
      );
    }
  }

  const closedOrControlGroups = [...groups.entries()].filter(([, group]) => {
    return group.some((record) => {
      const disposition = dispositions.get(record.index);
      return disposition === "historical-resolved"
        || disposition === "resolved"
        || disposition === "expected-control"
        || disposition === "forced-control";
    });
  });
  lines.push(
    "",
    "## Closed And Control Inventory",
    "",
  );
  if (closedOrControlGroups.length === 0) {
    lines.push("- No closed or control groups recorded.");
  } else {
    for (const [key, group] of closedOrControlGroups) {
      const [failureClass, phase] = key.split("::");
      const closed = group.filter((record) => {
        const disposition = dispositions.get(record.index);
        return disposition === "historical-resolved" || disposition === "resolved";
      }).length;
      const controls = group.filter((record) => {
        const disposition = dispositions.get(record.index);
        return disposition === "expected-control" || disposition === "forced-control";
      }).length;
      lines.push(`- ${failureClass}/${phase}: ${closed} closed, ${controls} expected/control.`);
    }
  }

  await Bun.write(failureSummaryPath, `${lines.join("\n")}\n`);
}

async function baselineCheck(target: string): Promise<void> {
  const phase = argValue("--phase", "baseline") ?? "baseline";
  const result = await run(["bun", "test"], target);
  const output = `${result.stdout}${result.stderr}`;
  if (result.exitCode === 0) {
    console.log(`${phase}: pass`);
    return;
  }
  if (phase === "baseline" && /No tests found/i.test(output)) {
    console.log("baseline: expected-baseline");
    return;
  }

  await appendFailure({
    task: phase === "baseline" ? "010" : "023",
    phase,
    command: "bun test",
    expected: phase === "baseline" ? "baseline command is classified" : "final verification passes",
    actual: `exit ${result.exitCode}: ${output}`,
    failureClass: phase === "baseline" ? "generated-artifact" : "environment",
    artifact: target,
    followUp: "planning/tasks/023-fix-baseline-and-status-audit-noise.md",
    status: phase === "baseline" ? "expected-baseline" : "open",
  });
  throw new Error(`${phase} bun test failed with exit ${result.exitCode}`);
}

async function statusAudit(): Promise<void> {
  const auditRoot = argValue("--audit-root", repoRoot) ?? repoRoot;
  const sprintPath = argValue(
    "--sprint",
    "planning/sprints/004-end-to-end-workflow-test-matrix.md",
  ) ?? "planning/sprints/004-end-to-end-workflow-test-matrix.md";
  const start = Number(argValue("--task-start", "027") ?? "027");
  const end = Number(argValue("--task-end", "040") ?? "040");
  const problems: string[] = [];

  const sprintText = await readText(join(auditRoot, sprintPath));
  if (!/^Status:\s*complete$/m.test(sprintText)) {
    problems.push(`${sprintPath} is not complete`);
  }
  for (let id = start; id <= end; id += 1) {
    const idText = String(id).padStart(3, "0");
    const glob = new Bun.Glob(`planning/tasks/${idText}-*.md`);
    const matches: string[] = [];
    for await (const file of glob.scan({ cwd: auditRoot, onlyFiles: true })) {
      matches.push(file);
    }
    if (matches.length !== 1) {
      problems.push(`expected one task file for ${idText}, found ${matches.length}`);
      continue;
    }
    const taskPath = matches[0];
    if (!taskPath) {
      problems.push(`expected one task file for ${idText}, found 0`);
      continue;
    }
    const taskText = await readText(join(auditRoot, taskPath));
    if (!/^Status:\s*complete$/m.test(taskText)) {
      problems.push(`${taskPath} is not complete`);
    }
    if (/- \[ \]/.test(taskText)) {
      problems.push(`${taskPath} has unchecked acceptance criteria`);
    }
  }

  if (problems.length > 0) {
    await appendFailure({
      task: sprintPath.includes("004-end-to-end") ? "040" : "023",
      phase: "status-audit",
      command: "bun scripts/todo-trial.ts status-audit",
      expected: "sprint and tasks complete without unchecked acceptance criteria",
      actual: problems.slice(0, 6).join("; "),
      failureClass: "environment",
      artifact: auditRoot,
      followUp: sprintPath.includes("004-end-to-end")
        ? "planning/tasks/040-run-full-e2e-workflow-verification.md"
        : "planning/tasks/023-fix-baseline-and-status-audit-noise.md",
      status: "open",
    });
    throw new Error(problems.join("\n"));
  }
  console.log("status audit: pass");
}

async function scanRuntime(target: string): Promise<void> {
  const problems: string[] = [];
  await verifyNoForbiddenRuntime(target, problems);
  if (problems.length > 0) {
    await appendFailure({
      task: "019",
      phase: "runtime-scan",
      command: `bun scripts/todo-trial.ts scan-runtime --target ${target}`,
      expected: "runtime source has no forbidden Bun-rule references",
      actual: problems.slice(0, 6).join("; "),
      failureClass: "verifier-gap",
      artifact: target,
      followUp: "planning/tasks/019-fix-execution-verifier-scoping.md",
      status: "open",
    });
    throw new Error(problems.join("\n"));
  }
  console.log("runtime scan: pass");
}

function parityRemediation(mismatches: string[]): string {
  const first = mismatches[0] ?? "unknown source path";
  return [
    `partial-needs-rerun: ${mismatches.length} mismatch(es) detected`,
    `Mismatched source: ${first}`,
    "Remediation: use the repo-local skills/ source for this trial, or reinstall/update the installed skill source, then rerun parity and the affected trial.",
  ].join("\n");
}

async function failureLogSmoke(): Promise<void> {
  await appendFailure({
    task: "014",
    phase: "forced-log-smoke",
    command: "bun scripts/todo-trial.ts failure-log-smoke",
    expected: "forced failure row is durable",
    actual: "intentional smoke failure",
    failureClass: "verifier-gap",
    artifact: "planning/failed-tests.md",
    followUp: "planning/tasks/014-add-failed-test-log-feedback-loop.md",
    status: "forced-open",
  });
  await appendFailure({
    task: "014",
    phase: "forced-log-smoke-resolution",
    command: "bun scripts/todo-trial.ts failure-log-smoke",
    expected: "resolution is appended without deleting original row",
    actual: "forced smoke failure resolved by appended row",
    failureClass: "verifier-gap",
    artifact: "planning/failed-tests.md",
    followUp: "planning/tasks/014-add-failed-test-log-feedback-loop.md",
    status: "resolved",
  });
  await writeFailureSummary();
}

async function parityNegative(): Promise<void> {
  const root = trialTempRoot("parity-negative");
  await copySkillSource(root);
  await Bun.write(
    join(root, "build-right-preflight", "SKILL.md"),
    `${await Bun.file(join(root, "build-right-preflight", "SKILL.md")).text()}\n<!-- forced mismatch -->\n`,
  );
  const mismatches = await parity(root);
  if (mismatches.length === 0) {
    await appendFailure({
      task: "008",
      phase: "source-parity-negative",
      command: "bun run todo-trial -- parity-negative",
      expected: "forced mismatch is detected",
      actual: "no mismatch detected",
      failureClass: "source-under-test",
      artifact: root,
      followUp: "planning/tasks/008-add-scratch-repo-seed-and-source-parity-checks.md",
      status: "open",
    });
    throw new Error("forced parity mismatch was not detected");
  }

  const remediation = parityRemediation(mismatches);
  await appendFailure({
    task: "008",
    phase: "source-parity-negative",
    command: "bun run todo-trial -- parity-negative",
    expected: "forced mismatch logs partial-needs-rerun",
    actual: `${mismatches.slice(0, 3).join("; ")}; ${remediation}`,
    failureClass: "source-under-test",
    artifact: root,
    followUp: "planning/tasks/008-add-scratch-repo-seed-and-source-parity-checks.md",
    status: "expected-logged",
  });
  console.log(remediation);
}

async function verifyE2eOracle(): Promise<void> {
  const problems: string[] = [];
  await requireIncludes(e2eOraclePath, [
    "# E2E Workflow Oracle",
    "## Shared Gates",
    "Source parity",
    "Failure logging",
    "Failure summary",
    "Bun compliance",
    "Scratch isolation",
    "Concurrency",
    "## Preflight Oracle",
    "### Happy Path",
    "### State Matrix",
    "### Artifact Contract",
    "### Transcript Oracle",
    "## Execution Oracle",
    "### Happy Path",
    "### Resolver Matrix",
    "### Todo Behavior",
    "## Negative Controls",
    "## Report Oracle",
    "`partial-needs-rerun`",
    "`expected-control`",
    "`expected-logged`",
  ], problems);
  await failWithProblems({
    task: "027",
    phase: "verify-e2e-oracle",
    command: "bun scripts/todo-trial.ts verify-e2e-oracle",
    expected: "E2E oracle covers shared, preflight, execution, negative, and report expectations",
    actual: "",
    failureClass: "verifier-gap",
    artifact: e2eOraclePath,
    followUp: "planning/tasks/027-define-e2e-workflow-oracle.md",
    status: "open",
  }, problems);
}

async function verifyTranscripts(
  executionTarget: string,
  preflightTarget: string,
  failureOverrides: Partial<FailureRow> = {},
): Promise<void> {
  const problems: string[] = [];
  const preflightTranscript = join(preflightTarget, "docs/evidence/preflight-transcript.md");
  const executionTranscript = join(executionTarget, "docs/evidence/execution-transcript.md");
  const manualTrials = join(executionTarget, "docs/evidence/manual-trials.md");

  await requireOrderedIncludes(preflightTranscript, [
    "## Helper Report",
    "Preflight decision:",
    "## Focused Founder Questions",
    "## Founder Reply",
    "## File Plan",
    "## Closeout",
    "First executable AI task:",
  ], problems);
  await requireOrderedIncludes(executionTranscript, [
    "## Resolver Report",
    "Resolver decision: execute-task",
    "## Task Intake",
    "Baseline evidence:",
    "## Implementation",
    "## Verification",
    "## Stop-Gate Notes",
  ], problems);
  await requireIncludes(manualTrials, [
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
  ], problems);

  for (const appFile of ["package.json", "index.ts", "index.html", "frontend.tsx", "todo.ts", "todo.test.ts"]) {
    if (await exists(join(preflightTarget, appFile))) {
      problems.push(`preflight transcript target contains app file: ${appFile}`);
    }
  }

  await failWithProblems({
    task: "035",
    phase: "verify-transcripts",
    command: `bun scripts/todo-trial.ts verify-transcripts --target ${executionTarget} --preflight-target ${preflightTarget}`,
    expected: "preflight and execution transcripts prove workflow order and evidence packet fields",
    actual: "",
    failureClass: "agent-instruction",
    artifact: `${preflightTranscript}; ${executionTranscript}; ${manualTrials}`,
    followUp: "planning/tasks/035-automate-agentic-transcript-evidence-checks.md",
    status: "open",
    ...failureOverrides,
  }, problems);
}

async function verifyE2eReport(reportPath: string): Promise<void> {
  const problems: string[] = [];
  await requireIncludes(reportPath, [
    "# E2E Workflow Report",
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
    "## Agentic Replay",
    "## Artifacts",
    "## Failure Summary",
    "## Proved",
    "## Simulated",
    "## Unproven",
    "## Follow-Ups",
  ], problems);
  await failWithProblems({
    task: "039",
    phase: "verify-e2e-report",
    command: `bun scripts/todo-trial.ts verify-e2e-report --report ${reportPath}`,
    expected: "E2E report contains required review sections",
    actual: "",
    failureClass: "verifier-gap",
    artifact: reportPath,
    followUp: "planning/tasks/039-add-e2e-report-artifact.md",
    status: "open",
  }, problems);
}

async function e2eReport(executionTarget: string, preflightTarget: string): Promise<void> {
  await writeFailureSummary();
  const records = await failureRecords();
  const actionable = records.filter((record) => recordDisposition(record, records) === "actionable-open");
  const expected = records.filter((record) => {
    const kind = recordDisposition(record, records);
    return kind === "expected-control" || kind === "forced-control";
  });
  const resolved = records.filter((record) => recordDisposition(record, records) === "resolved");
  const runLabel = argValue("--run-label", `sprint-004-e2e-${today()}`) ?? `sprint-004-e2e-${today()}`;
  const replayMode = argValue("--replay-mode", "direct-or-replayed-fixture") ?? "direct-or-replayed-fixture";
  const timestamp = new Date().toISOString();
  const lines = [
    "# E2E Workflow Report",
    "",
    `Run label: ${runLabel}`,
    `Timestamp: ${timestamp}`,
    "Source under test: repo-local `skills/build-right-preflight`, `skills/build-right-feature-planning`, and `skills/build-right-execution`",
    `Preflight target: ${preflightTarget}`,
    `Execution target: ${executionTarget}`,
    `Replay mode: ${replayMode}`,
    "",
    "## Command List",
    "",
    "- `bun test`",
    "- `bun run verify:skill-trials`",
    "- `bun scripts/todo-trial.ts verify-e2e-oracle`",
    `- \`bun scripts/todo-trial.ts verify-preflight --target ${preflightTarget}\``,
    `- \`bun scripts/todo-trial.ts verify-execution --target ${executionTarget}\``,
    `- \`bun scripts/todo-trial.ts verify-transcripts --target ${executionTarget} --preflight-target ${preflightTarget}\``,
    "- `bun scripts/todo-trial.ts negative-gates`",
    "- `bun scripts/todo-trial.ts negative-gates-malformed-conflict`",
    "- `bun scripts/todo-trial.ts parity`",
    "- `bun scripts/todo-trial.ts parity-negative`",
    "- `bun scripts/todo-trial.ts failure-summary`",
    "- `bun scripts/todo-trial.ts status-audit`",
    "- `git diff --check`",
    "",
    "## Shared Gates",
    "",
    "- Source parity: `bun scripts/todo-trial.ts parity`.",
    "- Failure log grouping: `planning/failed-test-summary.md`.",
    "- Bun runtime compliance: `scan-runtime` and execution verifier.",
    "- Scratch isolation: generated Todo files remain under `/tmp/build-right-todo-trial*`.",
    "- Concurrency: negative controls use collision-resistant scratch paths.",
    "",
    "## Preflight",
    "",
    `- Target: ${preflightTarget}`,
    "- Evidence: `docs/evidence/preflight-transcript.md`, `docs/evidence/manual-trials.md`, `tasks/sprint-0.md`.",
    "- Expected result: docs/tasks/evidence only, no app files.",
    "",
    "## Execution",
    "",
    `- Target: ${executionTarget}`,
    "- Evidence: `docs/evidence/execution-transcript.md`, `docs/evidence/browser-proof.md`, `tasks/issues/001-build-bun-react-todo-app.md`.",
    "- Expected result: Bun-served React + TypeScript Todo app with tests and browser proof.",
    "",
    "## Negative Controls",
    "",
    `- Expected/control rows: ${expected.length}`,
    "- Missing preflight artifact, preflight app file, corrupted browser proof, malformed conflict, forbidden runtime source, and source parity mismatch are expected controls.",
    "",
    "## Agentic Replay",
    "",
    `- Replay mode: ${replayMode}`,
    "- Transcript checks prove helper reports, founder questions, file plans, task intake, baseline evidence, implementation, verification, and stop-gate ordering.",
    "- Provider-native conversation export remains simulated unless an external agent transcript is attached.",
    "",
    "## Artifacts",
    "",
    "- `planning/e2e-workflow-oracle.md`",
    "- `planning/e2e-workflow-report.md`",
    `- \`${preflightTarget}/docs/evidence/preflight-transcript.md\``,
    `- \`${executionTarget}/docs/evidence/execution-transcript.md\``,
    `- \`${executionTarget}/docs/evidence/browser-proof.md\``,
    `- \`${executionTarget}/docs/evidence/browser-proof.png\``,
    `- \`${executionTarget}/tasks/issues/001-build-bun-react-todo-app.md\``,
    "",
    "## Failure Summary",
    "",
    `- Total rows: ${records.length}`,
    `- Actionable open rows: ${actionable.length}`,
    `- Expected/control rows: ${expected.length}`,
    `- Resolved rows: ${resolved.length}`,
    `- Summary: planning/failed-test-summary.md`,
    "",
    "## Proved",
    "",
    "- Oracle, helper commands, transcript markers, artifact contracts, negative controls, failure grouping, and status audit are machine-checkable.",
    "- The canonical scratch execution target contains Bun app files, tests, browser proof, and task evidence.",
    "",
    "## Simulated",
    "",
    "- Provider-native chat export is represented by durable transcript artifacts.",
    "- Fresh replay can copy and reverify canonical scratch artifacts without invoking another autonomous agent.",
    "",
    "## Unproven",
    "",
    "- No deployment or external user validation is attempted.",
    "- Live agent behavior beyond the captured transcripts needs a separate provider transcript export if required.",
    "",
    "## Follow-Ups",
    "",
    actionable.length === 0
      ? "- None. No actionable failure groups remain."
      : `- Resolve actionable failures: ${actionable.map((record) => `${record.task}/${record.phase}`).join(", ")}.`,
    "",
  ];
  await Bun.write(e2eReportPath, lines.join("\n"));
  await verifyE2eReport(e2eReportPath);
}

async function e2eReplay(executionTarget: string, preflightTarget: string): Promise<void> {
  const root = argValue("--replay-root", trialTempRoot("e2e-replay")) ?? trialTempRoot("e2e-replay");
  assertScratchTarget(root);
  await mustRun(["rm", "-rf", root], repoRoot, {
    task: "036",
    phase: "e2e-replay-reset",
    followUp: "planning/tasks/036-build-fresh-scratch-replay-harness.md",
  });
  await mustRun(["mkdir", "-p", join(root, "prompts")], repoRoot, {
    task: "036",
    phase: "e2e-replay-seed",
    followUp: "planning/tasks/036-build-fresh-scratch-replay-harness.md",
  });
  await Bun.write(join(root, "prompts", "preflight-prompt.txt"), `$build-right-preflight

Bootstrap this blank repo for a demo React + TypeScript Todo app.
Use Bun only. Do not implement the app yet; prepare the project truth, Sprint 0,
and the first executable AI task.
`);
  await Bun.write(join(root, "prompts", "execution-prompt.txt"), `$build-right-execution

Use the repo-local Build Right execution skill source under test.
Take the next ready AI-owned task only. Use Bun only. Record baseline evidence,
verification, files changed, and stop-gate results.
`);

  const preflightCopy = join(root, "preflight");
  const executionCopy = join(root, "execution");
  await copyPreflightSnapshot(preflightTarget, preflightCopy);
  await copyExecutionFixture(executionTarget, executionCopy);
  if (await directoryExists(join(executionTarget, "node_modules"))) {
    await mustRun(["cp", "-R", join(executionTarget, "node_modules"), join(executionCopy, "node_modules")], repoRoot, {
      task: "036",
      phase: "e2e-replay-node-modules",
      followUp: "planning/tasks/036-build-fresh-scratch-replay-harness.md",
    });
  }
  await verifyPreflight(preflightCopy, {
    task: "036",
    phase: "e2e-replay-preflight",
    artifact: preflightCopy,
    followUp: "planning/tasks/036-build-fresh-scratch-replay-harness.md",
  });
  await verifyExecution(executionCopy, {
    task: "036",
    phase: "e2e-replay-execution",
    artifact: executionCopy,
    followUp: "planning/tasks/036-build-fresh-scratch-replay-harness.md",
  });
  await verifyTranscripts(executionCopy, preflightCopy, {
    task: "036",
    phase: "e2e-replay-transcripts",
    artifact: root,
    followUp: "planning/tasks/036-build-fresh-scratch-replay-harness.md",
  });
  await e2eReport(executionCopy, preflightCopy);
  console.log(`e2e replay: ${root}`);
}

async function appendExpectedFailure(row: FailureRow, actual: string): Promise<void> {
  await appendFailure({
    ...row,
    actual,
    status: row.status || "expected-control",
  });
}

async function failureInjection(): Promise<void> {
  const phases: string[] = [];

  const preflightMissing = trialTempRoot("failure-injection-preflight-missing");
  await copyPreflightSnapshot(argValue("--source", defaultPreflightTarget) ?? defaultPreflightTarget, preflightMissing);
  await mustRun(["rm", "-f", join(preflightMissing, "docs/source-index.md")], repoRoot, {
    task: "037",
    phase: "failure-injection-preflight-missing",
    followUp: "planning/tasks/037-add-failure-injection-log-cases.md",
  });
  try {
    await verifyPreflight(preflightMissing, {
      task: "037",
      phase: "failure-injection-preflight-missing",
      expected: "missing preflight artifact fails and logs expected control",
      artifact: preflightMissing,
      followUp: "planning/tasks/037-add-failure-injection-log-cases.md",
      status: "expected-control",
    });
  } catch {
    phases.push("failure-injection-preflight-missing");
  }

  const preflightApp = trialTempRoot("failure-injection-preflight-app");
  await copyPreflightSnapshot(argValue("--source", defaultPreflightTarget) ?? defaultPreflightTarget, preflightApp);
  await Bun.write(join(preflightApp, "package.json"), "{\"name\":\"bad-preflight\"}\n");
  try {
    await verifyPreflight(preflightApp, {
      task: "037",
      phase: "failure-injection-preflight-app",
      expected: "preflight app file fails and logs expected control",
      artifact: preflightApp,
      followUp: "planning/tasks/037-add-failure-injection-log-cases.md",
      status: "expected-control",
    });
  } catch {
    phases.push("failure-injection-preflight-app");
  }

  const executionBrowser = trialTempRoot("failure-injection-browser");
  await copyExecutionFixture(argValue("--target", defaultTarget) ?? defaultTarget, executionBrowser);
  await Bun.write(
    join(executionBrowser, "docs/evidence/browser-proof.md"),
    (await readText(join(executionBrowser, "docs/evidence/browser-proof.md"))).replace(
      "| localStorage restore | pass |",
      "| localStorage restore | fail |",
    ),
  );
  try {
    await verifyExecution(executionBrowser, {
      task: "037",
      phase: "failure-injection-browser-proof",
      expected: "corrupted browser proof fails and logs expected control",
      artifact: executionBrowser,
      followUp: "planning/tasks/037-add-failure-injection-log-cases.md",
      status: "expected-control",
    });
  } catch {
    phases.push("failure-injection-browser-proof");
  }

  const runtime = trialTempRoot("failure-injection-runtime");
  await copyExecutionFixture(argValue("--target", defaultTarget) ?? defaultTarget, runtime);
  await Bun.write(join(runtime, "frontend.tsx"), "import 'vite';\n");
  const runtimeProblems: string[] = [];
  await verifyNoForbiddenRuntime(runtime, runtimeProblems);
  if (runtimeProblems.length > 0) {
    await appendExpectedFailure({
      task: "037",
      phase: "failure-injection-runtime",
      command: "bun scripts/todo-trial.ts failure-injection",
      expected: "forbidden runtime source fails",
      actual: "",
      failureClass: "verifier-gap",
      artifact: runtime,
      followUp: "planning/tasks/037-add-failure-injection-log-cases.md",
      status: "expected-control",
    }, runtimeProblems.join("; "));
    phases.push("failure-injection-runtime");
  }

  const malformed = await createGateFixture("failure-injection-malformed-conflict", {
    "docs/conflicts.md": "# Conflicts\n\n| Conflict | Sources |\n| --- |\n| bad\n",
  });
  const malformedError = await conflictFixtureError(malformed);
  if (malformedError) {
    await appendExpectedFailure({
      task: "037",
      phase: "failure-injection-malformed-conflict",
      command: "bun scripts/todo-trial.ts failure-injection",
      expected: "malformed conflict fixture fails distinctly",
      actual: "",
      failureClass: "helper-script",
      artifact: malformed,
      followUp: "planning/tasks/037-add-failure-injection-log-cases.md",
      status: "expected-control",
    }, malformedError);
    phases.push("failure-injection-malformed-conflict");
  }

  const parityRoot = trialTempRoot("failure-injection-parity");
  await copySkillSource(parityRoot);
  await Bun.write(
    join(parityRoot, "build-right-preflight", "SKILL.md"),
    `${await readText(join(parityRoot, "build-right-preflight", "SKILL.md"))}\n<!-- forced mismatch -->\n`,
  );
  const mismatches = await parity(parityRoot);
  if (mismatches.length > 0) {
    await appendExpectedFailure({
      task: "037",
      phase: "failure-injection-source-parity",
      command: "bun scripts/todo-trial.ts failure-injection",
      expected: "source parity mismatch logs partial-needs-rerun",
      actual: "",
      failureClass: "source-under-test",
      artifact: parityRoot,
      followUp: "planning/tasks/037-add-failure-injection-log-cases.md",
      status: "expected-logged",
    }, `${mismatches.slice(0, 3).join("; ")}; ${parityRemediation(mismatches)}`);
    phases.push("failure-injection-source-parity");
  }

  const records = await failureRecords();
  for (const phase of phases) {
    const match = records.find((record) => record.task === "037" && record.phase === phase);
    if (!match) {
      throw new Error(`failure injection did not append row for ${phase}`);
    }
    for (const [key, value] of Object.entries(match)) {
      if (key !== "index" && !String(value).trim()) {
        throw new Error(`failure injection row ${phase} has empty ${key}`);
      }
    }
  }
  await writeFailureSummary();
  console.log(`failure injection: ${phases.length} expected rows`);
}

function failureLogTemplate(): string {
  return `# Failed Tests Log

Status: active

## Failures

| Date | Task | Phase | Command or Test | Expected | Actual | Class | Artifact | Follow-up | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
`;
}

async function concurrencyCheck(): Promise<void> {
  const root = trialTempRoot("concurrency");
  const preflightSource = argValue("--source", defaultPreflightTarget) ?? defaultPreflightTarget;
  const executionSource = argValue("--target", defaultTarget) ?? defaultTarget;
  await mustRun(["mkdir", "-p", root], repoRoot, {
    task: "038",
    phase: "concurrency-seed",
    followUp: "planning/tasks/038-add-concurrency-scratch-isolation-cases.md",
  });
  const commands: string[][] = [
    ["bun", "scripts/todo-trial.ts", "parity-negative", "--failure-log", join(root, "parity.md")],
    ["bun", "scripts/todo-trial.ts", "verify-preflight-negative", "--kind", "missing", "--source", preflightSource, "--failure-log", join(root, "preflight-missing.md")],
    ["bun", "scripts/todo-trial.ts", "verify-preflight-negative", "--kind", "app-file", "--source", preflightSource, "--failure-log", join(root, "preflight-app.md")],
    ["bun", "scripts/todo-trial.ts", "verify-execution-negative", "--source", executionSource, "--failure-log", join(root, "execution.md")],
  ];
  for (const command of commands) {
    const logPath = command[command.length - 1];
    if (!logPath) {
      throw new Error(`missing failure log path for ${command.join(" ")}`);
    }
    await Bun.write(logPath, failureLogTemplate());
  }

  const results = await Promise.all(commands.map((command) => run(command)));
  const failures = results
    .map((result, index) => ({ result, command: commands[index]?.join(" ") ?? "unknown command" }))
    .filter(({ result }) => result.exitCode !== 0);
  if (failures.length > 0) {
    await appendFailure({
      task: "038",
      phase: "concurrency",
      command: "bun scripts/todo-trial.ts concurrency",
      expected: "parallel negative controls pass without temp collisions",
      actual: failures.map(({ command, result }) => `${command}: ${result.stderr || result.stdout}`).join("; "),
      failureClass: "environment",
      artifact: root,
      followUp: "planning/tasks/038-add-concurrency-scratch-isolation-cases.md",
      status: "open",
    });
    throw new Error(`concurrency failed: ${failures.map(({ command }) => command).join(", ")}`);
  }

  for (const path of ["docs", "tasks"]) {
    const generated = await filesUnder(join(repoRoot, path)).catch(() => []);
    if (generated.some((file) => file.endsWith(".md"))) {
      throw new Error(`generated root ${path} markdown should not exist in source repo`);
    }
  }
  console.log(`concurrency: ${root}`);
}

function printHelp(): void {
  console.log(`Build Right Todo trial helper

Usage:
  bun scripts/todo-trial.ts <command> [options]

Commands:
  seed                 Reset and seed /tmp/build-right-todo-trial.
  snapshot-preflight   Copy docs/tasks into a preflight-only snapshot.
  parity               Compare repo-local skills with a compare root.
  parity-negative      Force a source mismatch and append it to planning/failed-tests.md.
  verify-e2e-oracle    Verify the Sprint 004 E2E workflow oracle artifact.
  verify-preflight     Verify preflight artifacts in a scratch target.
  verify-preflight-negative
                       Force a preflight verifier failure and log it.
  verify-execution     Verify execution artifacts, Bun tests, server, and browser proof.
  verify-execution-negative
                       Corrupt browser proof and confirm verifier failure logging.
  verify-transcripts   Verify preflight/execution transcript ordering and evidence packet fields.
  negative-gates       Verify unsafe resolver states stop with expected decisions.
  negative-gates-malformed-conflict
                       Confirm malformed conflict fixtures fail as fixture errors.
  failure-injection    Run Sprint 004 expected-control failure-injection cases.
  concurrency          Run parallel negative controls to prove scratch isolation.
  e2e-replay           Copy canonical scratch artifacts into a fresh replay root and verify them.
  e2e-report           Write planning/e2e-workflow-report.md.
  verify-e2e-report    Verify the E2E report artifact shape.
  scan-runtime         Verify Bun-only runtime source scan scope.
  baseline-check       Classify baseline or final bun test results.
  status-audit         Audit Sprint 004 task completion without shell globs.
  failure-summary      Group failed-tests log rows into follow-up candidates.
  failure-log-smoke    Append a forced failure and resolution row, then summarize.

Options:
  --target <path>       Scratch target. Defaults to ${defaultTarget}
  --preflight-target <path>
                       Preflight scratch target. Defaults to ${defaultPreflightTarget}
  --source <path>       Source scratch repo for snapshot/negative commands.
  --compare-root <path> Skill root to compare. Defaults to repo-local skills root.
  --kind <missing|app-file>
  --report <path>       E2E report path. Defaults to ${defaultE2eReportPath}
  --replay-root <path>  Fresh replay root under /tmp/build-right-todo-trial-*.
  --failure-log <path>  Failure log path for fixtures.
  --summary-output <path>
                       Failure summary output path for fixtures.
  --audit-root <path>  Root path for status-audit fixtures.
  --phase <baseline|final>
`);
}

async function main(): Promise<void> {
  const command = Bun.argv[2] ?? "help";
  const target = argValue("--target", defaultTarget) ?? defaultTarget;
  const preflightTarget = argValue("--preflight-target", defaultPreflightTarget) ?? defaultPreflightTarget;
  const source = argValue("--source", defaultTarget) ?? defaultTarget;
  const compareRoot = argValue("--compare-root", join(repoRoot, "skills")) ?? join(repoRoot, "skills");

  if (command === "seed") {
    await seedScratch(target);
    console.log(`seeded ${target}`);
    return;
  }

  if (command === "snapshot-preflight") {
    await copyPreflightSnapshot(source, target);
    console.log(`preflight snapshot: ${target}`);
    return;
  }

  if (command === "parity") {
    const mismatches = await parity(compareRoot);
    if (mismatches.length > 0) {
      const remediation = parityRemediation(mismatches);
      await appendFailure({
        task: "008",
        phase: "source-parity",
        command: `bun scripts/todo-trial.ts parity --compare-root ${compareRoot}`,
        expected: "repo-local and invoked skill source match",
        actual: `${mismatches.slice(0, 5).join("; ")}; ${remediation}`,
        failureClass: "source-under-test",
        artifact: compareRoot,
        followUp: "planning/tasks/008-add-scratch-repo-seed-and-source-parity-checks.md",
        status: "open",
      });
      console.error(remediation);
      process.exit(1);
    }
    console.log("source parity: pass");
    return;
  }

  if (command === "parity-negative") {
    await parityNegative();
    return;
  }

  if (command === "verify-e2e-oracle") {
    await verifyE2eOracle();
    console.log("e2e oracle: pass");
    return;
  }

  if (command === "verify-preflight") {
    await verifyPreflight(target);
    console.log("preflight verification: pass");
    return;
  }

  if (command === "verify-preflight-negative") {
    const kind = (argValue("--kind", "missing") ?? "missing") as "missing" | "app-file";
    if (!["missing", "app-file"].includes(kind)) {
      throw new Error(`invalid --kind: ${kind}`);
    }
    await verifyPreflightNegative(kind);
    return;
  }

  if (command === "verify-execution") {
    await verifyExecution(target);
    console.log("execution verification: pass");
    return;
  }

  if (command === "verify-execution-negative") {
    await verifyExecutionNegative();
    return;
  }

  if (command === "verify-transcripts") {
    await verifyTranscripts(target, preflightTarget);
    console.log("transcript verification: pass");
    return;
  }

  if (command === "negative-gates") {
    await negativeGates();
    console.log("negative gates: pass");
    return;
  }

  if (command === "negative-gates-malformed-conflict") {
    await negativeGatesMalformedConflict();
    return;
  }

  if (command === "failure-injection") {
    await failureInjection();
    return;
  }

  if (command === "concurrency") {
    await concurrencyCheck();
    return;
  }

  if (command === "e2e-replay") {
    await e2eReplay(target, preflightTarget);
    return;
  }

  if (command === "e2e-report") {
    await e2eReport(target, preflightTarget);
    console.log(`e2e report: ${e2eReportPath}`);
    return;
  }

  if (command === "verify-e2e-report") {
    await verifyE2eReport(e2eReportPath);
    console.log("e2e report verification: pass");
    return;
  }

  if (command === "scan-runtime") {
    await scanRuntime(target);
    return;
  }

  if (command === "baseline-check") {
    await baselineCheck(target);
    return;
  }

  if (command === "status-audit") {
    await statusAudit();
    return;
  }

  if (command === "failure-summary") {
    await writeFailureSummary();
    console.log(`failure summary: ${failureSummaryPath}`);
    return;
  }

  if (command === "failure-log-smoke") {
    await failureLogSmoke();
    console.log("failure log smoke: pass");
    return;
  }

  printHelp();
}

await main();
