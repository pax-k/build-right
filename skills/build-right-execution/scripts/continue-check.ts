import { resolve } from "node:path";
import type { ContinueArgs, OutputFormat } from "./lib/contracts";
import { inspectMarkdownRepository } from "./lib/markdown-provider";
import { renderMarkdown } from "./lib/render";
import { resolveState } from "./lib/resolver";
import { reconcilePlanningState } from "./lib/planning-reconciliation";

const validFormats = new Set<OutputFormat>(["markdown", "json"]);

export function parseArgs(argv: string[]): ContinueArgs {
  const args: ContinueArgs = {
    cwd: ".",
    format: "markdown",
    includeCompleted: false,
    strict: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }
    if (arg === "--include-completed") {
      args.includeCompleted = true;
      continue;
    }
    if (arg === "--strict") {
      args.strict = true;
      continue;
    }
    if (arg === "--cwd" || arg === "--format") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`${arg} requires a value`);
      }
      index += 1;
      if (arg === "--cwd") {
        args.cwd = value;
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

export function usage(script = "continue-check.ts"): string {
  return `Usage: bun ${script} [--cwd <path>] [--format markdown|json] [--include-completed] [--strict]

Read-only Build Right state resolver. Parses markdown docs/tasks, applies
gate precedence, and returns one recommended next action before an agent
continues.`;
}

async function main(): Promise<void> {
  const args = parseArgs(Bun.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const markdownState = await inspectMarkdownRepository(args);
  const result = resolveState(await reconcilePlanningState(markdownState));
  console.log(args.format === "json"
    ? JSON.stringify(result, null, 2)
    : renderMarkdown(result, args.includeCompleted));
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error(usage());
    process.exit(1);
  }
}
