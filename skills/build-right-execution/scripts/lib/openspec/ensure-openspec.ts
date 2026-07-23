import { resolve } from "node:path";
import { ensureOpenSpec } from "./safe-setup";

export async function main(argv: string[]): Promise<number> {
  let cwd = ".";
  let format: "json" | "markdown" = "markdown";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--cwd" || arg === "--format") {
      const value = argv[index + 1];
      if (!value) throw new Error(`${arg} requires a value`);
      index += 1;
      if (arg === "--cwd") cwd = value;
      else if (value === "json" || value === "markdown") format = value;
      else throw new Error(`invalid --format: ${value}`);
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log("Usage: bun ensure-openspec.ts [--cwd <project>] [--format markdown|json]");
      return 0;
    }
    throw new Error(`unknown argument: ${arg}`);
  }
  const result = await ensureOpenSpec({ cwd: resolve(cwd) });
  if (format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    console.log(`# Build Right Managed Planning Setup\n\nResult: ${result.state}\nRoot: ${result.root}\nProvider version: ${result.evidence[0]?.providerVersion ?? "1.6.0"}\n`);
  } else {
    console.error(`# Build Right Managed Planning Setup\n\nResult: blocked\nCode: ${result.code}\nMessage: ${result.message}\n`);
  }
  return result.ok ? 0 : 1;
}

if (import.meta.main) {
  try {
    process.exit(await main(Bun.argv.slice(2)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
