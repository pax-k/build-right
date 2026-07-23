import { lstat } from "node:fs/promises";
import { bindFeatureTasks, prepareFeaturePlanning, advanceFeaturePlanning, writeFeatureArtifact } from "./lib/openspec/feature-planning";

type Mode = "prepare" | "advance" | "write" | "bind";
const args = Bun.argv.slice(2);
const value = (flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] ?? "" : "";
};
const values = (flag: string) => args.flatMap((arg, index) => arg === flag && args[index + 1] ? [args[index + 1]!] : []);

async function readContentFile(path: string): Promise<string> {
  const info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink() || info.size > 256 * 1024) {
    throw new Error("content file must be a regular file no larger than 256 KiB");
  }
  return Bun.file(path).text();
}

if (args.includes("--help")) {
  console.log("Usage: bun openspec-change-check.ts --mode prepare|advance|write|bind --cwd <project> [--feature <request>] [--change <ref>] [--artifact proposal|specs|design|tasks] [--content-file <path>] [--spec <capability>=<content-file> ...] [--sprint tasks/sprint-N.md] [--format json|markdown]");
  process.exit(0);
}

const mode = value("--mode") as Mode;
const cwd = value("--cwd") || ".";
const format = value("--format") || "markdown";
if (!["prepare", "advance", "write", "bind"].includes(mode) || !["json", "markdown"].includes(format)) {
  throw new Error("invalid mode or format");
}

const result = mode === "prepare"
  ? await prepareFeaturePlanning({ cwd, feature: value("--feature") })
  : mode === "advance"
    ? await advanceFeaturePlanning({ cwd, change: value("--change") })
    : mode === "write"
      ? await (async () => {
          const artifact = value("--artifact") as "proposal" | "specs" | "design" | "tasks";
          const specs = artifact === "specs"
            ? await Promise.all(values("--spec").map(async (entry) => {
                const separator = entry.indexOf("=");
                if (separator <= 0 || separator === entry.length - 1) throw new Error("--spec requires <capability>=<content-file>");
                return {
                  capability: entry.slice(0, separator),
                  content: await readContentFile(entry.slice(separator + 1)),
                };
              }))
            : undefined;
          return writeFeatureArtifact({
            cwd,
            change: value("--change"),
            artifact,
            specs,
            content: artifact === "specs" ? undefined : await readContentFile(value("--content-file")),
          });
        })()
      : await bindFeatureTasks({ cwd, change: value("--change"), sprint: value("--sprint") });

if (format === "json") {
  console.log(JSON.stringify(result, null, 2));
} else if (!result.ok) {
  console.log(`Planning engine decision: blocked\nReason: ${result.code}: ${result.message}`);
} else {
  console.log(`Planning engine action: ${result.action}\nChange ref: ${result.change}`);
  if (result.action === "write-artifact") {
    console.log(`Artifact: ${result.artifact}\nOutput path: ${result.outputPath}\nDependencies: ${result.dependencies.join(", ") || "none"}\nInstruction:\n${result.instruction}\nTemplate:\n${result.template}`);
  } else if (result.action === "ready-for-execution") {
    console.log(`Task paths: ${result.taskPaths.join(", ")}`);
  }
}

if (!result.ok) process.exitCode = 1;
