import { lstat } from "node:fs/promises";
import { resolve } from "node:path";
import {
  OpenSpecOrchestrator,
  type ArchiveReadinessProof,
} from "./lib/openspec/orchestrator";
import { inspectArchiveReadiness } from "./lib/archive-readiness";

async function main(argv: string[]): Promise<number> {
  let cwd = ".";
  let change = "";
  let readinessPath = "";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!["--cwd", "--change", "--readiness"].includes(arg ?? "")) {
      throw new Error(`unknown argument: ${arg}`);
    }
    const value = argv[index + 1];
    if (!value) throw new Error(`${arg} requires a value`);
    index += 1;
    if (arg === "--cwd") cwd = value;
    else if (arg === "--change") change = value;
    else readinessPath = value;
  }
  if (!change || !readinessPath) throw new Error("--change and --readiness are required");
  const info = await lstat(resolve(readinessPath));
  if (!info.isFile() || info.isSymbolicLink() || info.size > 256 * 1024) {
    throw new Error("readiness proof must be a bounded regular file");
  }
  const submittedReadiness = await Bun.file(resolve(readinessPath)).json() as ArchiveReadinessProof;
  const canonicalCwd = resolve(cwd);
  if (submittedReadiness.decision !== "archive-ready"
    || submittedReadiness.change !== change) {
    throw new Error("submitted readiness proof does not authorize this change");
  }
  const result = await new OpenSpecOrchestrator().finalize({
    cwd: canonicalCwd,
    change,
    readiness: submittedReadiness,
    refreshReadiness: async () => {
      const readiness = await inspectArchiveReadiness({ cwd: canonicalCwd, change });
      return readiness.decision === "archive-ready"
        && readiness.repositoryRoot === submittedReadiness.repositoryRoot
        ? readiness
        : null;
    },
  });
  console.log(JSON.stringify(result, null, 2));
  return result.ok ? 0 : 1;
}

try {
  process.exit(await main(Bun.argv.slice(2)));
} catch {
  console.error("managed planning finalization failed at the CLI boundary");
  process.exit(1);
}
