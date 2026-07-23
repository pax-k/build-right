import { afterEach, describe, expect, test } from "bun:test";
import { chmod, mkdir, mkdtemp, readFile, rm, symlink, utimes, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  OPENSPEC_VERSION,
  type ProcessEvidence,
  type ProcessRunner,
} from "../src/openspec/contracts";
import { managedOpenSpecCommand } from "../src/openspec/managed-runtime";
import { runBoundedProcess } from "../src/openspec/process-runner";
import { ensureOpenSpec } from "../src/openspec/safe-setup";
import { atomicRenameNoReplace } from "../src/openspec/atomic-install";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function freshRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "build-right-openspec-test-"));
  roots.push(root);
  return root;
}

function evidence(command: string[]): ProcessEvidence {
  return { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" };
}

function fixtureRunner(options: { extra?: boolean; delayMs?: number } = {}): ProcessRunner {
  return async ({ command }) => {
    if (command.at(-1) === "--version") {
      return { ok: true, stdout: `${OPENSPEC_VERSION}\n`, stderr: "", evidence: evidence(command) };
    }
    const initIndex = command.indexOf("init");
    const scratch = command[initIndex + 1];
    if (!scratch) throw new Error("fixture init command omitted scratch path");
    if (options.delayMs) await Bun.sleep(options.delayMs);
    await mkdir(join(scratch, "openspec", "changes", "archive"), { recursive: true });
    await mkdir(join(scratch, "openspec", "specs"), { recursive: true });
    await writeFile(join(scratch, "openspec", "config.yaml"), "schema: spec-driven\n");
    if (options.extra) await writeFile(join(scratch, "unexpected.txt"), "unsafe");
    return { ok: true, stdout: "initialized", stderr: "", evidence: evidence(command) };
  };
}

describe("managed OpenSpec runtime", () => {
  test("pins the Bun command exactly", () => {
    expect(managedOpenSpecCommand("--version")).toEqual([
      "bunx",
      "--bun",
      "@fission-ai/openspec@1.6.0",
      "--version",
    ]);
  });

  test("bounds output and execution time", async () => {
    const output = await runBoundedProcess({
      command: ["bun", "-e", "console.log('x'.repeat(2048))"],
      cwd: process.cwd(),
      outputLimit: 100,
    });
    expect(output.ok).toBeFalse();
    if (!output.ok) expect(output.code).toBe("output-limit");

    const timeout = await runBoundedProcess({
      command: ["bun", "-e", "await Bun.sleep(5000)"],
      cwd: process.cwd(),
      timeoutMs: 20,
    });
    expect(timeout.ok).toBeFalse();
    if (!timeout.ok) expect(timeout.code).toBe("timeout");

    const missing = await runBoundedProcess({
      command: ["build-right-command-that-does-not-exist"],
      cwd: process.cwd(),
    });
    expect(missing.ok).toBeFalse();
    if (!missing.ok) expect(missing.code).toBe("command-failed");

    const aggregate = await runBoundedProcess({
      command: ["bun", "-e", "console.log('o'.repeat(70)); console.error('e'.repeat(70))"],
      cwd: process.cwd(),
      outputLimit: 100,
    });
    expect(aggregate.ok).toBeFalse();
    if (!aggregate.ok) expect(aggregate.code).toBe("output-limit");

    const started = performance.now();
    const resistant = await runBoundedProcess({
      command: ["bun", "-e", "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000)"],
      cwd: process.cwd(),
      timeoutMs: 20,
    });
    expect(resistant.ok).toBeFalse();
    if (!resistant.ok) expect(resistant.code).toBe("timeout");
    expect(performance.now() - started).toBeLessThan(500);
  });
});

describe("safe managed OpenSpec setup", () => {
  test("installs only openspec and preserves unrelated files idempotently", async () => {
    const root = await freshRoot();
    await writeFile(join(root, "keep.txt"), "unchanged");
    const first = await ensureOpenSpec({ cwd: root, runner: fixtureRunner() });
    expect(first.ok).toBeTrue();
    if (!first.ok) return;
    expect(first.state).toBe("created");
    expect(await readFile(join(root, "keep.txt"), "utf8")).toBe("unchanged");
    expect(await readFile(join(root, "openspec", "config.yaml"), "utf8")).toBe("schema: spec-driven\n");
    const before = await readFile(join(root, "openspec", "config.yaml"), "utf8");
    const second = await ensureOpenSpec({ cwd: root, runner: fixtureRunner() });
    expect(second.ok).toBeTrue();
    if (second.ok) expect(second.state).toBe("preserved");
    expect(await readFile(join(root, "openspec", "config.yaml"), "utf8")).toBe(before);
  });

  test("blocks malformed and externalized roots", async () => {
    const malformed = await freshRoot();
    await mkdir(join(malformed, "openspec"));
    await writeFile(join(malformed, "openspec", "config.yaml"), "schema: wrong\n");
    const malformedResult = await ensureOpenSpec({ cwd: malformed, runner: fixtureRunner() });
    expect(malformedResult.ok).toBeFalse();
    if (!malformedResult.ok) expect(malformedResult.code).toBe("malformed-root");

    const wrongTypes = await freshRoot();
    await mkdir(join(wrongTypes, "openspec"));
    await writeFile(join(wrongTypes, "openspec", "config.yaml"), "schema: spec-driven\nschema: spec-driven\n");
    await writeFile(join(wrongTypes, "openspec", "changes"), "");
    await writeFile(join(wrongTypes, "openspec", "specs"), "");
    const wrongTypeResult = await ensureOpenSpec({ cwd: wrongTypes, runner: fixtureRunner() });
    expect(wrongTypeResult.ok).toBeFalse();
    if (!wrongTypeResult.ok) expect(wrongTypeResult.code).toBe("malformed-root");

    const externalized = await freshRoot();
    const external = await freshRoot();
    await mkdir(join(external, "changes", "archive"), { recursive: true });
    await mkdir(join(external, "specs"));
    await writeFile(join(external, "config.yaml"), "schema: spec-driven\n");
    await symlink(external, join(externalized, "openspec"));
    const externalizedResult = await ensureOpenSpec({ cwd: externalized, runner: fixtureRunner() });
    expect(externalizedResult.ok).toBeFalse();
    if (!externalizedResult.ok) expect(externalizedResult.code).toBe("externalized-root");
  });

  test("fails closed for offline/runtime failure and unsafe init output", async () => {
    const offline = await freshRoot();
    const offlineRunner: ProcessRunner = async ({ command }) => ({
      ok: false,
      code: "command-failed",
      message: "registry unavailable",
      evidence: { ...evidence(command), exitCode: 1 },
    });
    const offlineResult = await ensureOpenSpec({ cwd: offline, runner: offlineRunner });
    expect(offlineResult.ok).toBeFalse();
    if (!offlineResult.ok) expect(offlineResult.code).toBe("provider-unavailable");

    const incompatible = await freshRoot();
    const incompatibleRunner: ProcessRunner = async ({ command }) => ({
      ok: true,
      stdout: "2.0.0\n",
      stderr: "",
      evidence: evidence(command),
    });
    const incompatibleResult = await ensureOpenSpec({ cwd: incompatible, runner: incompatibleRunner });
    expect(incompatibleResult.ok).toBeFalse();
    if (!incompatibleResult.ok) expect(incompatibleResult.code).toBe("unsupported-version");

    const unsafe = await freshRoot();
    const unsafeResult = await ensureOpenSpec({ cwd: unsafe, runner: fixtureRunner({ extra: true }) });
    expect(unsafeResult.ok).toBeFalse();
    if (!unsafeResult.ok) expect(unsafeResult.code).toBe("unsafe-output");
    expect(await Bun.file(join(unsafe, "openspec")).exists()).toBeFalse();

    const linked = await freshRoot();
    const linkedRunner: ProcessRunner = async ({ command, cwd }) => {
      if (command.at(-1) === "--version") {
        return { ok: true, stdout: `${OPENSPEC_VERSION}\n`, stderr: "", evidence: evidence(command) };
      }
      const scratch = command[command.indexOf("init") + 1]!;
      await mkdir(join(scratch, "openspec", "changes", "archive"), { recursive: true });
      await mkdir(join(scratch, "openspec", "specs"), { recursive: true });
      await writeFile(join(scratch, "openspec", "config.yaml"), "schema: spec-driven\n");
      await symlink("/tmp", join(scratch, "openspec", "specs", "external"));
      return { ok: true, stdout: "initialized", stderr: "", evidence: evidence(command) };
    };
    const linkedResult = await ensureOpenSpec({ cwd: linked, runner: linkedRunner });
    expect(linkedResult.ok).toBeFalse();
    if (!linkedResult.ok) expect(linkedResult.code).toBe("unsafe-output");
  });

  test("serializes concurrent setup without overwriting the winner", async () => {
    const root = await freshRoot();
    const runner = fixtureRunner({ delayMs: 60 });
    const results = await Promise.all([
      ensureOpenSpec({ cwd: root, runner, timeoutMs: 2_000 }),
      ensureOpenSpec({ cwd: root, runner, timeoutMs: 2_000 }),
    ]);
    expect(results.every((result) => result.ok)).toBeTrue();
    expect(results.map((result) => result.ok ? result.state : "failed").sort()).toEqual([
      "created",
      "race-preserved",
    ]);
    expect(await readFile(join(root, "openspec", "config.yaml"), "utf8")).toBe("schema: spec-driven\n");
  });

  test("reports target filesystem permission failures without partial install", async () => {
    const root = await freshRoot();
    await chmod(root, 0o500);
    try {
      const result = await ensureOpenSpec({ cwd: root, runner: fixtureRunner(), timeoutMs: 50 });
      if (process.getuid?.() === 0) {
        expect(result.ok || (!result.ok && result.code === "setup-failed")).toBeTrue();
      } else {
        expect(result.ok).toBeFalse();
        if (!result.ok) expect(result.code).toBe("setup-failed");
      }
    } finally {
      await chmod(root, 0o700);
    }
    const installed = await Bun.file(join(root, "openspec")).exists();
    if (process.getuid?.() !== 0) expect(installed).toBeFalse();
  });

  test("recovers a stale setup lock and uses atomic no-replace publication", async () => {
    const root = await freshRoot();
    const lock = join(root, ".build-right-openspec-setup.lock");
    await writeFile(lock, "stale");
    await utimes(lock, new Date(0), new Date(0));
    const result = await ensureOpenSpec({ cwd: root, runner: fixtureRunner(), timeoutMs: 50 });
    expect(result.ok).toBeTrue();

    const source = await freshRoot();
    const destination = await freshRoot();
    await writeFile(join(source, "sentinel"), "source");
    expect(atomicRenameNoReplace(source, destination)).toBeFalse();
    expect(await readFile(join(source, "sentinel"), "utf8")).toBe("source");

    const activeRoot = await freshRoot();
    const activeLock = join(activeRoot, ".build-right-openspec-setup.lock");
    await writeFile(activeLock, JSON.stringify({ pid: process.pid, nonce: "active" }));
    await utimes(activeLock, new Date(0), new Date(0));
    const activeResult = await ensureOpenSpec({ cwd: activeRoot, runner: fixtureRunner(), timeoutMs: 30 });
    expect(activeResult.ok).toBeFalse();
    if (!activeResult.ok) expect(activeResult.code).toBe("timeout");
    expect(await Bun.file(activeLock).exists()).toBeTrue();
  });

  test("never gives the provider the target repository as its working directory", async () => {
    const root = await freshRoot();
    const runner: ProcessRunner = async (input) => {
      await writeFile(join(input.cwd, "provider-write"), "isolated");
      return fixtureRunner()(input);
    };
    const result = await ensureOpenSpec({ cwd: root, runner });
    expect(result.ok).toBeFalse();
    expect(await Bun.file(join(root, "provider-write")).exists()).toBeFalse();
  });
});
