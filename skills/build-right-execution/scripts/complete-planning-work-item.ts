import { resolve } from "node:path";
import { lstat } from "node:fs/promises";
import {
  completePlanningWorkItem,
  type WorkItemCompletionProof,
} from "./lib/openspec/execution-progress";

async function main(argv: string[]): Promise<number> {
  let cwd = ".";
  let proofPath = "";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg !== "--cwd" && arg !== "--proof") throw new Error(`unknown argument: ${arg}`);
    const value = argv[index + 1];
    if (!value) throw new Error(`${arg} requires a value`);
    index += 1;
    if (arg === "--cwd") cwd = value;
    else proofPath = value;
  }
  if (!proofPath) throw new Error("--proof is required");
  const proofInfo = await lstat(resolve(proofPath));
  if (!proofInfo.isFile() || proofInfo.isSymbolicLink() || proofInfo.size > 256 * 1024) {
    throw new Error("proof file must be a regular file no larger than 256 KiB");
  }
  const proof = await Bun.file(resolve(proofPath)).json() as WorkItemCompletionProof;
  const result = await completePlanningWorkItem({ cwd: resolve(cwd), proof });
  console.log(JSON.stringify(result, null, 2));
  return result.ok ? 0 : 1;
}

try {
  process.exit(await main(Bun.argv.slice(2)));
} catch {
  console.error("managed planning closeout failed at the CLI boundary");
  process.exit(1);
}
