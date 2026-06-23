import { join, resolve } from "node:path";

type Mode = "inventory" | "readiness" | "all";
type OutputFormat = "markdown" | "json";

type Args = {
  cwd: string;
  mode: Mode;
  format: OutputFormat;
  help: boolean;
};

type CheckResult = {
  cwd: string;
  mode: Mode;
  projectTypeSignal: "blank/new" | "existing";
  inventory: Record<string, string | number | boolean>;
  missingArtifacts: string[];
  readinessWarnings: string[];
  founderInputGaps: string[];
  recommendation: string;
};

const validModes = new Set<Mode>(["inventory", "readiness", "all"]);
const validFormats = new Set<OutputFormat>(["markdown", "json"]);

function parseArgs(argv: string[]): Args {
  const args: Args = {
    cwd: ".",
    mode: "all",
    format: "markdown",
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }

    if (arg === "--cwd" || arg === "--mode" || arg === "--format") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`${arg} requires a value`);
      }
      index += 1;

      if (arg === "--cwd") {
        args.cwd = value;
      } else if (arg === "--mode") {
        if (!validModes.has(value as Mode)) {
          throw new Error(`invalid --mode: ${value}`);
        }
        args.mode = value as Mode;
      } else {
        if (!validFormats.has(value as OutputFormat)) {
          throw new Error(`invalid --format: ${value}`);
        }
        args.format = value as OutputFormat;
      }
      continue;
    }

    throw new Error(`unknown argument: ${arg}`);
  }

  args.cwd = resolve(args.cwd);
  return args;
}

function usage(): string {
  return `Usage: bun preflight-check.ts [--cwd <path>] [--mode inventory|readiness|all] [--format markdown|json]

Read-only helper for Build Right preflight. Reports project type signals,
missing docs/tasks, readiness warnings, and likely founder-input gaps.`;
}

async function exists(cwd: string, path: string): Promise<boolean> {
  return Bun.file(join(cwd, path)).exists();
}

async function readIfExists(cwd: string, path: string): Promise<string> {
  const file = Bun.file(join(cwd, path));
  if (!(await file.exists())) {
    return "";
  }
  return file.text();
}

async function globFiles(cwd: string, pattern: string): Promise<string[]> {
  const glob = new Bun.Glob(pattern);
  const files: string[] = [];
  for await (const file of glob.scan({ cwd, onlyFiles: true, dot: true })) {
    files.push(file);
  }
  return files.sort();
}

function hasAny(text: string, values: string[]): boolean {
  const lower = text.toLowerCase();
  return values.some((value) => lower.includes(value.toLowerCase()));
}

async function runCheck(args: Args): Promise<CheckResult> {
  const docs = await globFiles(args.cwd, "docs/**/*.md");
  const taskFiles = [
    ...(await globFiles(args.cwd, "tasks/**/*.md")),
    ...(await globFiles(args.cwd, "issues/**/*.md")),
  ];
  const packageFiles = [
    ...(await globFiles(args.cwd, "package.json")),
    ...(await globFiles(args.cwd, "bun.lock")),
    ...(await globFiles(args.cwd, "Cargo.toml")),
    ...(await globFiles(args.cwd, "pyproject.toml")),
    ...(await globFiles(args.cwd, "go.mod")),
  ];

  const blueprintStatus = await readIfExists(args.cwd, "docs/blueprint-status.md");
  const mvpScope = await readIfExists(args.cwd, "docs/mvp-scope.md");
  const openQuestions = await readIfExists(args.cwd, "docs/open-questions.md");

  const requiredArtifacts = [
    "docs/blueprint-status.md",
    "docs/source-index.md",
    "docs/mvp-scope.md",
    "docs/execution-rules.md",
    "docs/release-gates.md",
    "tasks/sprint-0.md",
  ];

  const missingArtifacts: string[] = [];
  for (const path of requiredArtifacts) {
    if (!(await exists(args.cwd, path))) {
      missingArtifacts.push(path);
    }
  }

  if (taskFiles.filter((file) => /tasks\/issues\/.+\.md$/.test(file)).length === 0) {
    missingArtifacts.push("tasks/issues/*.md");
  }

  const hasProductTruth =
    (await exists(args.cwd, "docs/mvp-scope.md")) ||
    (await exists(args.cwd, "docs/product-thesis.md")) ||
    (await exists(args.cwd, "docs/product-vision.md"));
  const hasExecutionSurface =
    (await exists(args.cwd, "docs/execution-rules.md")) &&
    taskFiles.some((file) => file.includes("tasks/"));
  const projectTypeSignal = hasProductTruth || hasExecutionSurface ? "existing" : "blank/new";

  const readinessWarnings: string[] = [];
  if (!hasProductTruth) {
    readinessWarnings.push("product truth or MVP scope is missing");
  }
  if (!(await exists(args.cwd, "docs/execution-rules.md"))) {
    readinessWarnings.push("execution rules are missing");
  }
  if (!(await exists(args.cwd, "docs/release-gates.md"))) {
    readinessWarnings.push("release or validation gates are missing");
  }
  if (taskFiles.length === 0) {
    readinessWarnings.push("task tracker is missing");
  }
  if (blueprintStatus && hasAny(blueprintStatus, ["missing", "blocked", "needs-validation"])) {
    readinessWarnings.push("blueprint status still contains missing, blocked, or needs-validation gates");
  }
  if (mvpScope && hasAny(mvpScope, ["prototype-assumption", "validation required before product truth"])) {
    readinessWarnings.push("MVP scope contains prototype assumptions or validation requirements");
  }

  const founderInputGaps: string[] = [];
  if (!(await exists(args.cwd, "docs/raw/founder-dump.md"))) {
    founderInputGaps.push("founder context dump is missing");
  }
  if (!(await exists(args.cwd, "docs/raw/founder-interview.md"))) {
    founderInputGaps.push("founder interview record is missing");
  }
  if (!mvpScope || hasAny(mvpScope, ["<one customer>", "primary customer", "unknown"])) {
    founderInputGaps.push("primary customer may need founder confirmation");
  }
  if (!mvpScope || hasAny(mvpScope, ["<one workflow>", "primary workflow", "unknown"])) {
    founderInputGaps.push("primary workflow may need founder confirmation");
  }
  if (openQuestions && hasAny(openQuestions, ["founder", "primary user", "mvp", "positioning", "promise"])) {
    founderInputGaps.push("open founder-owned questions are recorded");
  }

  const inventory = {
    docsMarkdownFiles: docs.length,
    taskMarkdownFiles: taskFiles.length,
    packageOrBuildFiles: packageFiles.length,
    hasAgentInstructions:
      (await exists(args.cwd, "AGENTS.md")) || (await exists(args.cwd, "CLAUDE.md")),
    hasBlueprintStatus: await exists(args.cwd, "docs/blueprint-status.md"),
    hasSourceIndex: await exists(args.cwd, "docs/source-index.md"),
    hasMvpScope: await exists(args.cwd, "docs/mvp-scope.md"),
    hasExecutionRules: await exists(args.cwd, "docs/execution-rules.md"),
    hasReleaseGates: await exists(args.cwd, "docs/release-gates.md"),
    hasSprintTracker: await exists(args.cwd, "tasks/sprint-0.md"),
  };

  let recommendation = "Proceed with preflight inventory and scaffold missing artifacts.";
  if (readinessWarnings.length === 0 && founderInputGaps.length === 0) {
    recommendation = "Preflight surface looks ready for a bounded execution task.";
  } else if (founderInputGaps.length > 0) {
    recommendation = "Ask the smallest useful founder-question batch before claiming product readiness.";
  }

  return {
    cwd: args.cwd,
    mode: args.mode,
    projectTypeSignal,
    inventory,
    missingArtifacts: args.mode === "readiness" ? [] : missingArtifacts,
    readinessWarnings: args.mode === "inventory" ? [] : readinessWarnings,
    founderInputGaps: args.mode === "inventory" ? [] : founderInputGaps,
    recommendation,
  };
}

function renderMarkdown(result: CheckResult): string {
  const lines = [
    "# Build Right Preflight Check",
    "",
    `CWD: ${result.cwd}`,
    `Mode: ${result.mode}`,
    `Project type signal: ${result.projectTypeSignal}`,
    "",
    "## Inventory",
    ...Object.entries(result.inventory).map(([key, value]) => `- ${key}: ${value}`),
  ];

  if (result.missingArtifacts.length > 0) {
    lines.push("", "## Missing Artifacts", ...result.missingArtifacts.map((item) => `- ${item}`));
  }

  if (result.readinessWarnings.length > 0) {
    lines.push("", "## Readiness Warnings", ...result.readinessWarnings.map((item) => `- ${item}`));
  }

  if (result.founderInputGaps.length > 0) {
    lines.push("", "## Founder Input Gaps", ...result.founderInputGaps.map((item) => `- ${item}`));
  }

  lines.push("", "## Recommendation", result.recommendation);
  return `${lines.join("\n")}\n`;
}

try {
  const args = parseArgs(Bun.argv.slice(2));
  if (args.help) {
    console.log(usage());
    process.exit(0);
  }

  const result = await runCheck(args);
  if (args.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(renderMarkdown(result));
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exit(1);
}

