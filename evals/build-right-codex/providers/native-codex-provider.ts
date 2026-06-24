import { join } from "node:path";

type EvalRequest = {
  caseId?: string;
  mode?: "native" | "dry-run" | "fixture" | string;
  step?: string;
  expectedStatus?: string;
  negativeFixture?: string;
  expectedFailureIncludes?: string;
};

const repoRoot = join(import.meta.dir, "../../..");

function parseRequest(): EvalRequest {
  for (const raw of Bun.argv.slice(2)) {
    try {
      const parsed = JSON.parse(raw) as EvalRequest;
      if ("step" in parsed || "caseId" in parsed || "expectedStatus" in parsed) {
        return parsed;
      }
    } catch {
      // Promptfoo exec providers may pass non-JSON helper args before the prompt.
    }
  }
  throw new Error("provider prompt was not JSON or did not include eval request fields");
}

function expectedFailures(value: string | undefined): string[] {
  return String(value ?? "")
    .split("||")
    .map((item) => item.trim())
    .filter(Boolean);
}

function blockedResult(input: {
  request: EvalRequest;
  command?: string[];
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  failures: string[];
}): Record<string, unknown> {
  return {
    status: "blocked",
    step: input.request.step ?? "",
    skill: "",
    target: "",
    eventsPath: "",
    proofPath: "",
    lastMessagePath: "",
    failures: input.failures,
    checks: {
      codexExitZero: false,
      validJsonl: false,
      turnCompleted: false,
      skillRead: false,
      referenceReads: false,
      helperObserved: false,
      helpersPassed: false,
      finalMarkers: false,
      proofMarkers: false,
      manualPacket: false,
      forbiddenWrites: false,
    },
    expectedStatus: input.request.expectedStatus ?? "pass",
    expectedFailureIncludes: expectedFailures(input.request.expectedFailureIncludes),
    mode: input.request.mode ?? "native",
    caseId: input.request.caseId ?? "",
    provider: {
      command: input.command?.join(" ") ?? "",
      exitCode: input.exitCode ?? 1,
      stderr: input.stderr ?? "",
      stdout: input.stdout ?? "",
    },
  };
}

async function run(): Promise<Record<string, unknown>> {
  const request = parseRequest();
  const step = request.step?.trim();
  if (!step) {
    return blockedResult({ request, failures: ["missing required eval var: step"] });
  }

  const mode = request.mode || (request.negativeFixture ? "fixture" : "native");
  const command = [
    "bun",
    "scripts/codex-native-step-trials.ts",
    "--task",
    step,
    "--json-output",
    "--no-planning-writes",
  ];
  if (mode === "dry-run") {
    command.push("--dry-run");
  }
  if (request.negativeFixture) {
    command.push("--negative-fixture", request.negativeFixture);
  }

  const proc = Bun.spawn(command, {
    cwd: repoRoot,
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(stdout.trim()) as Record<string, unknown>;
  } catch (error) {
    return blockedResult({
      request,
      command,
      exitCode,
      stdout,
      stderr,
      failures: [`runner stdout was not JSON: ${error instanceof Error ? error.message : String(error)}`],
    });
  }

  const failures = Array.isArray(parsed.failures) ? [...parsed.failures] : [];
  if (exitCode !== 0) {
    failures.push(`runner exited ${exitCode}`);
  }

  return {
    ...parsed,
    failures,
    expectedStatus: request.expectedStatus || "pass",
    expectedFailureIncludes: expectedFailures(request.expectedFailureIncludes),
    mode,
    negativeFixture: request.negativeFixture || "",
    caseId: request.caseId || "",
    provider: {
      command: command.join(" "),
      exitCode,
      stderr: stderr.trim(),
    },
  };
}

run()
  .then((result) => {
    console.log(JSON.stringify(result));
  })
  .catch((error) => {
    const request: EvalRequest = {};
    console.log(JSON.stringify(blockedResult({
      request,
      failures: [error instanceof Error ? error.message : String(error)],
    })));
  });
