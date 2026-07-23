import { parseArgs, usage } from "./continue-check";
import { inspectMarkdownRepository } from "./lib/markdown-provider";
import { orchestrateExecutionPlanning } from "./lib/execution-orchestration";
import { renderMarkdown } from "./lib/render";
import { resolveState } from "./lib/resolver";

try {
  const args = parseArgs(Bun.argv.slice(2));
  if (args.help) {
    console.log(usage("managed-continue-check.ts"));
    process.exit(0);
  }
  const markdownState = await inspectMarkdownRepository(args);
  const result = resolveState(await orchestrateExecutionPlanning(markdownState));
  console.log(args.format === "json"
    ? JSON.stringify(result, null, 2)
    : renderMarkdown(result, args.includeCompleted));
} catch {
  console.error("managed execution orchestration failed at the CLI boundary");
  process.exit(1);
}
