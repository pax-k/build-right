export const OPENSPEC_PACKAGE = "@fission-ai/openspec@1.6.0";
export const OPENSPEC_VERSION = "1.6.0";
export const OPENSPEC_SCHEMA = "spec-driven";
export const OPENSPEC_TIMEOUT_MS = 30_000;
export const OPENSPEC_OUTPUT_LIMIT = 128 * 1024;
export const BUILD_RIGHT_VERSION = "0.1.7";

export type ProcessEvidence = {
  command: string[];
  exitCode: number | null;
  durationMs: number;
  stdoutSummary: string;
  stderrSummary: string;
};

export type ProcessResult =
  | { ok: true; stdout: string; stderr: string; evidence: ProcessEvidence }
  | {
      ok: false;
      code: "command-failed" | "timeout" | "output-limit";
      message: string;
      evidence: ProcessEvidence;
      stdout?: string;
      stderr?: string;
    };

export type ProcessRunner = (input: {
  command: string[];
  cwd: string;
  timeoutMs?: number;
  outputLimit?: number;
}) => Promise<ProcessResult>;

export type SetupEvidence = {
  buildRightVersion: string;
  provider: "openspec";
  providerVersion: string;
  command: string[];
  result: "created" | "preserved" | "race-preserved" | "failed";
  createdPaths: string[];
  process?: ProcessEvidence;
};

export type SetupResult =
  | { ok: true; state: Exclude<SetupEvidence["result"], "failed">; root: string; evidence: SetupEvidence[] }
  | {
      ok: false;
      code:
        | "provider-unavailable"
        | "unsupported-version"
        | "malformed-root"
        | "externalized-root"
        | "unsafe-output"
        | "setup-failed"
        | "timeout";
      message: string;
      evidence: SetupEvidence[];
    };
