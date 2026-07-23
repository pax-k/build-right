import {
  OPENSPEC_OUTPUT_LIMIT,
  OPENSPEC_TIMEOUT_MS,
  type ProcessResult,
  type ProcessRunner,
} from "./contracts";

function sanitized(text: string): string {
  return text
    .replace(/\x1B(?:\[[0-?]*[ -/]*[@-~]|\][^\x07]*(?:\x07|\x1B\\))/g, "")
    .replace(/(token|password|secret|api[_-]?key)\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[^\S\r\n]+/g, " ")
    .trim()
    .slice(0, 2_000);
}

async function readBounded(
  stream: ReadableStream<Uint8Array>,
  limit: number,
  captured: { bytes: number },
  onExceeded: () => void,
): Promise<{ text: string; exceeded: boolean }> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const item = await reader.read();
    if (item.done) break;
    captured.bytes += item.value.byteLength;
    if (captured.bytes > limit) {
      onExceeded();
      await reader.cancel();
      return { text: `${text}${decoder.decode(item.value, { stream: true })}`.slice(0, limit), exceeded: true };
    }
    text += decoder.decode(item.value, { stream: true });
  }
  text += decoder.decode();
  return { text, exceeded: false };
}

export const runBoundedProcess: ProcessRunner = async (input): Promise<ProcessResult> => {
  const started = performance.now();
  const timeoutMs = input.timeoutMs ?? OPENSPEC_TIMEOUT_MS;
  const outputLimit = input.outputLimit ?? OPENSPEC_OUTPUT_LIMIT;
  let child: ReturnType<typeof Bun.spawn>;
  try {
    child = Bun.spawn(input.command, {
      cwd: input.cwd,
      stdout: "pipe",
      stderr: "pipe",
      detached: process.platform !== "win32",
    });
  } catch {
    return {
      ok: false,
      code: "command-failed",
      message: "managed provider process could not be started",
      evidence: {
        command: [...input.command],
        exitCode: null,
        durationMs: Math.round(performance.now() - started),
        stdoutSummary: "",
        stderrSummary: "",
      },
    };
  }
  const killGroup = (signal: NodeJS.Signals | number) => {
    try {
      if (process.platform !== "win32") process.kill(-child.pid, signal);
      else child.kill(signal);
    } catch {
      try {
        child.kill(signal);
      } catch {
        // The bounded process has already exited.
      }
    }
  };
  let timedOut = false;
  let escalation: ReturnType<typeof setTimeout> | undefined;
  const timer = setTimeout(() => {
    timedOut = true;
    killGroup("SIGTERM");
    escalation = setTimeout(() => killGroup(9), 50);
  }, timeoutMs);
  const captured = { bytes: 0 };

  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    readBounded(child.stdout as ReadableStream<Uint8Array>, outputLimit, captured, () => killGroup(9)),
    readBounded(child.stderr as ReadableStream<Uint8Array>, outputLimit, captured, () => killGroup(9)),
  ]);
  clearTimeout(timer);
  if (escalation) clearTimeout(escalation);
  killGroup(9);

  const evidence = {
    command: [...input.command],
    exitCode,
    durationMs: Math.round(performance.now() - started),
    stdoutSummary: sanitized(stdout.text),
    stderrSummary: sanitized(stderr.text),
  };
  if (timedOut) {
    return { ok: false, code: "timeout", message: `managed provider timed out after ${timeoutMs}ms`, evidence, stdout: stdout.text, stderr: stderr.text };
  }
  if (stdout.exceeded || stderr.exceeded) {
    return { ok: false, code: "output-limit", message: `managed provider exceeded ${outputLimit} captured bytes`, evidence, stdout: stdout.text, stderr: stderr.text };
  }
  if (exitCode !== 0) {
    return { ok: false, code: "command-failed", message: "managed provider command failed", evidence, stdout: stdout.text, stderr: stderr.text };
  }
  return { ok: true, stdout: stdout.text, stderr: stderr.text, evidence };
};
