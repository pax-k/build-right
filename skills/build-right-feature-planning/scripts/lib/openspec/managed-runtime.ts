import {
  BUILD_RIGHT_VERSION,
  OPENSPEC_PACKAGE,
  OPENSPEC_VERSION,
  type ProcessRunner,
  type SetupResult,
} from "./contracts";
import { runBoundedProcess } from "./process-runner";

export const managedOpenSpecCommand = (...args: string[]): string[] => [
  "bunx",
  "--bun",
  OPENSPEC_PACKAGE,
  ...args,
];

export async function verifyManagedOpenSpec(
  cwd: string,
  runner: ProcessRunner = runBoundedProcess,
): Promise<
  | { ok: true; command: string[]; process: Extract<Awaited<ReturnType<ProcessRunner>>, { ok: true }> }
  | { ok: false; result: Extract<SetupResult, { ok: false }> }
> {
  const command = managedOpenSpecCommand("--version");
  let process: Awaited<ReturnType<ProcessRunner>>;
  try {
    process = await runner({ command, cwd });
  } catch {
    return {
      ok: false,
      result: {
        ok: false,
        code: "provider-unavailable",
        message: "managed provider boundary failed",
        evidence: [],
      },
    };
  }
  if (!process.ok) {
    return {
      ok: false,
      result: {
        ok: false,
        code: process.code === "timeout" ? "timeout" : "provider-unavailable",
        message: process.message,
        evidence: [{
          provider: "openspec",
          buildRightVersion: BUILD_RIGHT_VERSION,
          providerVersion: OPENSPEC_VERSION,
          command,
          result: "failed",
          createdPaths: [],
          process: process.evidence,
        }],
      },
    };
  }
  if (process.stdout.trim() !== OPENSPEC_VERSION) {
    return {
      ok: false,
      result: {
        ok: false,
        code: "unsupported-version",
        message: `managed provider reported an unsupported version; expected ${OPENSPEC_VERSION}`,
        evidence: [{
          provider: "openspec",
          buildRightVersion: BUILD_RIGHT_VERSION,
          providerVersion: process.stdout.trim() || "unknown",
          command,
          result: "failed",
          createdPaths: [],
          process: process.evidence,
        }],
      },
    };
  }
  return { ok: true, command, process };
}
