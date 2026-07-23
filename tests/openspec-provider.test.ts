import { describe, expect, test } from "bun:test";
import { OpenSpecAdapter, validChangeName, validWorkItemId } from "../src/openspec/adapter";
import { OpenSpecOrchestrator } from "../src/openspec/orchestrator";
import { atomicSwapDirectories } from "../src/openspec/atomic-install";
import type { ProcessRunner } from "../src/openspec/contracts";
import { tmpdir } from "node:os";
import { chmodSync } from "node:fs";
import { chmod, mkdir, mkdtemp, realpath, rename, rm } from "node:fs/promises";
import { join } from "node:path";

function runnerFor(payload: unknown): ProcessRunner {
  return async ({ command }) => {
    const version = command.at(-1) === "--version";
    return {
      ok: true,
      stdout: version ? "1.6.0\n" : JSON.stringify(payload),
      stderr: "",
      evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
    };
  };
}

const status = {
  changeName: "safe-change",
  schemaName: "spec-driven",
  isComplete: false,
  artifacts: [
    { id: "proposal", outputPath: "proposal.md", status: "ready" },
    { id: "design", outputPath: "design.md", status: "blocked", missingDeps: ["proposal"] },
    { id: "specs", outputPath: "specs/**/*.md", status: "blocked", missingDeps: ["proposal"] },
    { id: "tasks", outputPath: "tasks.md", status: "blocked", missingDeps: ["design", "specs"] },
  ],
};

async function finalizationFixture() {
  const cwd = await mkdtemp(join(tmpdir(), "build-right-finalization-control-"));
  await mkdir(join(cwd, "docs"));
  await mkdir(join(cwd, "tasks"));
  await mkdir(join(cwd, "openspec", "changes", "safe-change"), { recursive: true });
  await mkdir(join(cwd, "openspec", "specs"));
  await Bun.write(join(cwd, "openspec", "config.yaml"), "schema: spec-driven\n");
  await Bun.write(
    join(cwd, "openspec", "changes", "safe-change", ".openspec.yaml"),
    "schema: spec-driven\ncreated: 2026-07-23\n",
  );
  const canonicalCwd = await realpath(cwd);
  return {
    cwd,
    canonicalCwd,
    readiness: {
      decision: "archive-ready" as const,
      repositoryRoot: canonicalCwd,
      change: "safe-change",
      checkedAt: new Date().toISOString(),
      checks: {
        openspecValidation: "pass" as const,
        tasksComplete: true as const,
        buildRightEvidenceComplete: true as const,
        projectVerification: "pass" as const,
        conflictsClosed: true as const,
        releaseGatesSatisfied: true as const,
        specSyncState: "sync-ready" as const,
      },
      blockingGates: [] as [],
    },
  };
}

describe("OpenSpec provider boundary", () => {
  test("normalizes status, artifact instructions, and strict validation", async () => {
    const inspected = await new OpenSpecAdapter(runnerFor(status)).inspect({ cwd: ".", change: "safe-change" });
    expect(inspected.ok).toBeTrue();
    if (inspected.ok) {
      expect(inspected.state).toBe("blocked");
      expect(inspected.artifacts[1]?.missingDependencies).toEqual(["proposal"]);
    }

    const instructions = await new OpenSpecAdapter(runnerFor({
      changeName: "safe-change", artifactId: "proposal", outputPath: "proposal.md",
      instruction: "write proposal", template: "## Why", dependencies: [],
    })).instructions({ cwd: ".", change: "safe-change", artifact: "proposal" });
    expect(instructions.ok).toBeTrue();

    const dependentInstructions = await new OpenSpecAdapter(runnerFor({
      changeName: "safe-change", artifactId: "design", outputPath: "design.md",
      instruction: "write design", template: "## Context",
      dependencies: [{ id: "proposal", done: true, path: "proposal.md", description: "Proposal" }],
    })).instructions({ cwd: ".", change: "safe-change", artifact: "design" });
    expect(dependentInstructions.ok).toBeTrue();
    if (dependentInstructions.ok) expect(dependentInstructions.dependencies).toEqual(["proposal"]);

    const validated = await new OpenSpecAdapter(runnerFor({
      items: [{ id: "safe-change", valid: false, issues: [{ message: "missing delta" }] }],
    })).validate({ cwd: ".", change: "safe-change" });
    expect(validated.ok).toBeTrue();
    if (validated.ok) expect(validated.issues).toEqual(["missing delta"]);

    const apply = await new OpenSpecAdapter(runnerFor({
      changeName: "safe-change", schemaName: "spec-driven", state: "ready",
      tasks: [{ id: "1", description: "2.1 Implement behavior", done: false }],
    })).applyInstructions({ cwd: ".", change: "safe-change" });
    expect(apply.ok).toBeTrue();
    if (apply.ok) expect(apply.workItems[0]?.id).toBe("1");

    const completedApply = await new OpenSpecAdapter(runnerFor({
      changeName: "safe-change", schemaName: "spec-driven", state: "all_done",
      tasks: [{ id: "1", description: "2.1 Implement behavior", done: true }],
    })).applyInstructions({ cwd: ".", change: "safe-change" });
    expect(completedApply.ok).toBeTrue();
    if (completedApply.ok) expect(completedApply.state).toBe("all-done");
  });

  test("rejects identifiers and every malformed consumed shape", async () => {
    expect(validChangeName("../escape")).toBeFalse();
    expect(validChangeName("safe-change")).toBeTrue();
    expect(validWorkItemId("2.1")).toBeTrue();
    expect(validWorkItemId("$(bad)")).toBeFalse();

    const cases = [
      "not json",
      JSON.stringify({ ...status, schemaName: 7 }),
      JSON.stringify({ ...status, isComplete: "yes" }),
      JSON.stringify({ ...status, artifacts: [{ id: "proposal", outputPath: 4, status: "ready" }] }),
      JSON.stringify({ ...status, artifacts: [{ id: "proposal", outputPath: "proposal.md", status: "ready", missingDeps: [3] }] }),
    ];
    for (const stdout of cases) {
      const runner: ProcessRunner = async ({ command }) => ({
        ok: true,
        stdout: command.at(-1) === "--version" ? "1.6.0" : stdout,
        stderr: "",
        evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
      });
      const result = await new OpenSpecAdapter(runner).inspect({ cwd: ".", change: "safe-change" });
      expect(result.ok).toBeFalse();
      if (!result.ok) expect(result.code).toBe("invalid-output");
    }

    const unsafeArtifact = await new OpenSpecAdapter(runnerFor({})).instructions({
      cwd: ".",
      change: "safe-change",
      artifact: "../../archive" as "proposal",
    });
    expect(unsafeArtifact.ok).toBeFalse();

    const unsafePath = await new OpenSpecAdapter(runnerFor({
      changeName: "safe-change", artifactId: "proposal", outputPath: "../../outside.md",
      instruction: "write", template: "template", dependencies: [],
    })).instructions({ cwd: ".", change: "safe-change", artifact: "proposal" });
    expect(unsafePath.ok).toBeFalse();

    const incompleteDependency = await new OpenSpecAdapter(runnerFor({
      changeName: "safe-change", artifactId: "design", outputPath: "design.md",
      instruction: "write", template: "template",
      dependencies: [{ id: "proposal", done: false }],
    })).instructions({ cwd: ".", change: "safe-change", artifact: "design" });
    expect(incompleteDependency.ok).toBeFalse();

    const badApply = await new OpenSpecAdapter(runnerFor({
      changeName: "safe-change", schemaName: "spec-driven", state: "surprise", tasks: [],
    })).applyInstructions({ cwd: ".", change: "safe-change" });
    expect(badApply.ok).toBeFalse();

    const missingArtifacts = await new OpenSpecAdapter(runnerFor({
      ...status, artifacts: [],
    })).inspect({ cwd: ".", change: "safe-change" });
    expect(missingArtifacts.ok).toBeFalse();

    const contradictoryApply = await new OpenSpecAdapter(runnerFor({
      changeName: "safe-change", schemaName: "spec-driven", state: "all-done",
      tasks: [{ id: "1", description: "pending", status: "pending" }],
    })).applyInstructions({ cwd: ".", change: "safe-change" });
    expect(contradictoryApply.ok).toBeFalse();

    const duplicateWorkItems = await new OpenSpecAdapter(runnerFor({
      changeName: "safe-change", schemaName: "spec-driven", state: "ready",
      tasks: [
        { id: "1", description: "First", done: false },
        { id: "1", description: "Duplicate", done: false },
      ],
    })).applyInstructions({ cwd: ".", change: "safe-change" });
    expect(duplicateWorkItems.ok).toBeFalse();

  });

  test("normalizes process failure, timeout, and version mismatch", async () => {
    const failed: ProcessRunner = async ({ command }) => command.at(-1) === "--version"
      ? { ok: true, stdout: "1.6.0", stderr: "", evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" } }
      : { ok: false, code: "timeout", message: "timeout", evidence: { command, exitCode: null, durationMs: 1, stdoutSummary: "", stderrSummary: "" } };
    const timeout = await new OpenSpecAdapter(failed).inspect({ cwd: ".", change: "safe-change" });
    expect(timeout.ok).toBeFalse();
    if (!timeout.ok) expect(timeout.code).toBe("timeout");

    const missing: ProcessRunner = async ({ command }) => command.at(-1) === "--version"
      ? { ok: true, stdout: "1.6.0", stderr: "", evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" } }
      : { ok: false, code: "command-failed", message: "failed", evidence: { command, exitCode: 1, durationMs: 1, stdoutSummary: "", stderrSummary: "Change not found" } };
    const notFound = await new OpenSpecAdapter(missing).inspect({ cwd: ".", change: "safe-change" });
    expect(notFound.ok).toBeFalse();
    if (!notFound.ok) expect(notFound.code).toBe("change-not-found");

    const mismatched: ProcessRunner = async ({ command }) => ({
      ok: true,
      stdout: "2.0.0",
      stderr: "",
      evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
    });
    const version = await new OpenSpecAdapter(mismatched).inspect({ cwd: ".", change: "safe-change" });
    expect(version.ok).toBeFalse();
    if (!version.ok) expect(version.code).toBe("unsupported-version");

    const partialValidation = JSON.stringify({
      items: [{ id: "safe-change", valid: true, issues: [] }],
    });
    for (const code of ["timeout", "output-limit"] as const) {
      const interrupted: ProcessRunner = async ({ command }) => command.at(-1) === "--version"
        ? { ok: true, stdout: "1.6.0", stderr: "", evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" } }
        : {
            ok: false,
            code,
            message: `provider ${code}`,
            stdout: partialValidation,
            stderr: "",
            evidence: { command, exitCode: null, durationMs: 30_000, stdoutSummary: partialValidation, stderrSummary: "" },
          };
      const interruptedValidation = await new OpenSpecAdapter(interrupted).validate({
        cwd: ".",
        change: "safe-change",
      });
      expect(interruptedValidation.ok).toBeFalse();
      if (!interruptedValidation.ok) {
        expect(interruptedValidation.code).toBe(code === "timeout" ? "timeout" : "command-failed");
      }
    }

    const completedInvalid: ProcessRunner = async ({ command }) => command.at(-1) === "--version"
      ? { ok: true, stdout: "1.6.0", stderr: "", evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" } }
      : {
          ok: false,
          code: "command-failed",
          message: "strict validation found issues",
          stdout: JSON.stringify({ items: [{ id: "safe-change", valid: false, issues: [{ message: "missing delta" }] }] }),
          stderr: "",
          evidence: { command, exitCode: 1, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
    const invalid = await new OpenSpecAdapter(completedInvalid).validate({ cwd: ".", change: "safe-change" });
    expect(invalid.ok).toBeTrue();
    if (invalid.ok) {
      expect(invalid.valid).toBeFalse();
      expect(invalid.issues).toEqual(["missing delta"]);
    }

    const failedButClaimsValid: ProcessRunner = async ({ command }) => command.at(-1) === "--version"
      ? { ok: true, stdout: "1.6.0", stderr: "", evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" } }
      : {
          ok: false,
          code: "command-failed",
          message: "validator crashed",
          stdout: JSON.stringify({ items: [{ id: "safe-change", valid: true, issues: [] }] }),
          stderr: "fatal",
          evidence: { command, exitCode: 1, durationMs: 1, stdoutSummary: "", stderrSummary: "fatal" },
        };
    const falseSuccess = await new OpenSpecAdapter(failedButClaimsValid).validate({ cwd: ".", change: "safe-change" });
    expect(falseSuccess).toMatchObject({ ok: false, code: "command-failed" });
  });
});

describe("OpenSpec mutation orchestrator", () => {
  test("permits only validated create and readiness-gated archive commands", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "build-right-orchestrator-"));
    await mkdir(join(cwd, "docs"));
    await mkdir(join(cwd, "tasks"));
    await mkdir(join(cwd, "openspec", "changes"), { recursive: true });
    await mkdir(join(cwd, "openspec", "specs"));
    await Bun.write(join(cwd, "openspec", "config.yaml"), "schema: spec-driven\n");
    const canonicalCwd = await realpath(cwd);
    const commands: string[][] = [];
    const processCwds: string[] = [];
    const runner: ProcessRunner = async ({ command, cwd: processCwd }) => {
      commands.push(command);
      processCwds.push(processCwd);
      if (command.includes("new")) {
        const changeRoot = join(processCwd, "openspec", "changes", "safe-change");
        await mkdir(changeRoot);
        await Bun.write(join(changeRoot, ".openspec.yaml"), "schema: spec-driven\ncreated: 2026-07-23\n");
      }
      if (command.includes("archive")) {
        const archiveRoot = join(processCwd, "openspec", "changes", "archive");
        await mkdir(archiveRoot, { recursive: true });
        await rename(
          join(processCwd, "openspec", "changes", "safe-change"),
          join(archiveRoot, "2026-07-23-safe-change"),
        );
        await mkdir(join(processCwd, "openspec", "specs", "capability"), { recursive: true });
        await Bun.write(join(processCwd, "openspec", "specs", "capability", "spec.md"), "# Capability\n");
      }
      const stdout = command.at(-1) === "--version"
        ? "1.6.0"
        : command.includes("archive")
          ? JSON.stringify({ archive: {
              change: "safe-change",
              archivedAs: "2026-07-23-safe-change",
              path: `${await realpath(processCwd)}/openspec/changes/archive/2026-07-23-safe-change`,
              specsUpdated: true,
            } })
          : command.includes("validate")
            ? JSON.stringify({ items: [{ id: "capability", valid: true, issues: [] }] })
          : "{}";
      return { ok: true, stdout, stderr: "", evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" } };
    };
    const orchestrator = new OpenSpecOrchestrator(runner);
    const readiness = {
      decision: "archive-ready" as const,
      repositoryRoot: canonicalCwd,
      change: "safe-change",
      checkedAt: new Date().toISOString(),
      checks: {
        openspecValidation: "pass" as const,
        tasksComplete: true as const,
        buildRightEvidenceComplete: true as const,
        projectVerification: "pass" as const,
        conflictsClosed: true as const,
        releaseGatesSatisfied: true as const,
        specSyncState: "synced" as const,
      },
      blockingGates: [] as [],
    };
    expect((await orchestrator.createChange({ cwd, change: "../bad" })).ok).toBeFalse();
    expect((await orchestrator.finalize({
      cwd,
      change: "safe-change",
      readiness: { ...readiness, decision: "archive-ready", checkedAt: new Date(0).toISOString() },
      refreshReadiness: async () => readiness,
    })).ok).toBeFalse();
    expect((await orchestrator.finalize({
      cwd: tmpdir(),
      change: "safe-change",
      readiness,
      refreshReadiness: async () => readiness,
    })).ok).toBeFalse();
    expect(commands).toHaveLength(0);
    expect((await orchestrator.createChange({ cwd, change: "safe-change" })).ok).toBeTrue();
    expect(processCwds[1]).not.toBe(cwd);
    expect((await orchestrator.finalize({
      cwd, change: "safe-change", readiness, refreshReadiness: async () => readiness,
    })).ok).toBeTrue();
    expect(commands[1]).toEqual(["bunx", "--bun", "@fission-ai/openspec@1.6.0", "new", "change", "safe-change"]);
    expect(commands[3]).toEqual(["bunx", "--bun", "@fission-ai/openspec@1.6.0", "archive", "safe-change", "--yes", "--json"]);
    expect(commands.flat()).not.toContain("--no-validate");
    expect(commands.flat()).not.toContain("--skip-specs");

    const malformedRunner: ProcessRunner = async ({ command }) => ({
      ok: true,
      stdout: command.at(-1) === "--version" ? "1.6.0" : "not-json",
      stderr: "",
      evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
    });
    expect((await new OpenSpecOrchestrator(malformedRunner).finalize({
      cwd,
      change: "safe-change",
      readiness,
      refreshReadiness: async () => readiness,
    })).ok).toBeFalse();

    const confined = await mkdtemp(join(tmpdir(), "build-right-orchestrator-confined-"));
    await mkdir(join(confined, "openspec", "changes"), { recursive: true });
    await mkdir(join(confined, "openspec", "specs"));
    await Bun.write(join(confined, "openspec", "config.yaml"), "schema: spec-driven\n");
    const malicious: ProcessRunner = async ({ command, cwd: processCwd }) => {
      if (command.at(-1) === "--version") {
        return { ok: true, stdout: "1.6.0", stderr: "", evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" } };
      }
      const changeRoot = join(processCwd, "openspec", "changes", "safe-change");
      await mkdir(changeRoot);
      await Bun.write(join(changeRoot, ".openspec.yaml"), "schema: spec-driven\ncreated: 2026-07-23\n");
      await mkdir(join(processCwd, "src"));
      await Bun.write(join(processCwd, "src", "provider-write.ts"), "malicious\n");
      return { ok: true, stdout: "created", stderr: "", evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" } };
    };
    const confinedResult = await new OpenSpecOrchestrator(malicious).createChange({ cwd: confined, change: "safe-change" });
    expect(confinedResult.ok).toBeFalse();
    expect(await Bun.file(join(confined, "src", "provider-write.ts")).exists()).toBeFalse();
    expect(await Bun.file(join(confined, "openspec", "changes", "safe-change")).exists()).toBeFalse();
  });

  test("rejects successful archive output when the provider did not perform the mutation", async () => {
    const { cwd, canonicalCwd, readiness } = await finalizationFixture();
    const runner: ProcessRunner = async ({ command, cwd: processCwd }) => ({
      ok: true,
      stdout: command.at(-1) === "--version"
        ? "1.6.0"
        : JSON.stringify({ archive: {
            change: "safe-change",
            archivedAs: "2026-07-23-safe-change",
            path: `${await realpath(processCwd)}/openspec/changes/archive/2026-07-23-safe-change`,
            specsUpdated: false,
          } }),
      stderr: "",
      evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
    });
    const result = await new OpenSpecOrchestrator(runner).finalize({
      cwd, change: "safe-change", readiness, refreshReadiness: async () => readiness,
    });
    expect(result).toMatchObject({ ok: false, code: "archive-postcondition-failed" });
  });

  test("fails closed when strict main-spec validation fails after archive", async () => {
    const { cwd, canonicalCwd, readiness } = await finalizationFixture();
    const runner: ProcessRunner = async ({ command, cwd: processCwd }) => {
      if (command.at(-1) === "--version") {
        return {
          ok: true, stdout: "1.6.0", stderr: "",
          evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
      }
      if (command.includes("archive")) {
        const archived = join(processCwd, "openspec", "changes", "archive", "2026-07-23-safe-change");
        await mkdir(join(processCwd, "openspec", "changes", "archive"), { recursive: true });
        await rename(join(processCwd, "openspec", "changes", "safe-change"), archived);
        await mkdir(join(processCwd, "openspec", "specs", "capability"), { recursive: true });
        await Bun.write(join(processCwd, "openspec", "specs", "capability", "spec.md"), "# Capability\n");
        return {
          ok: true,
          stdout: JSON.stringify({ archive: {
            change: "safe-change",
            archivedAs: "2026-07-23-safe-change",
            path: `${await realpath(processCwd)}/openspec/changes/archive/2026-07-23-safe-change`,
            specsUpdated: true,
          } }),
          stderr: "",
          evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
      }
      return {
        ok: false, code: "command-failed", message: "strict validation failed",
        stdout: JSON.stringify({ items: [{ id: "capability", valid: false }] }), stderr: "",
        evidence: { command, exitCode: 1, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
      };
    };
    const result = await new OpenSpecOrchestrator(runner).finalize({
      cwd, change: "safe-change", readiness, refreshReadiness: async () => readiness,
    });
    expect(result).toMatchObject({ ok: false, code: "archive-postcondition-failed" });
    if (!result.ok) expect(result.evidence).toHaveLength(2);
    expect(await Bun.file(join(cwd, "openspec", "changes", "safe-change", ".openspec.yaml")).exists()).toBeTrue();
    expect(await Bun.file(join(
      cwd,
      "openspec",
      "changes",
      "archive",
      "2026-07-23-safe-change",
      ".openspec.yaml",
    )).exists()).toBeFalse();
  });

  test("confines archive execution and rejects unrelated scratch writes", async () => {
    const { cwd, readiness } = await finalizationFixture();
    const runner: ProcessRunner = async ({ command, cwd: processCwd }) => {
      if (command.at(-1) === "--version") {
        return {
          ok: true, stdout: "1.6.0", stderr: "",
          evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
      }
      const archiveRoot = join(processCwd, "openspec", "changes", "archive");
      await mkdir(archiveRoot, { recursive: true });
      await rename(
        join(processCwd, "openspec", "changes", "safe-change"),
        join(archiveRoot, "2026-07-23-safe-change"),
      );
      await Bun.write(join(processCwd, "UNRELATED-WRITE.txt"), "untrusted write\n");
      return {
        ok: true,
        stdout: JSON.stringify({ archive: {
          change: "safe-change",
          archivedAs: "2026-07-23-safe-change",
          path: `${await realpath(processCwd)}/openspec/changes/archive/2026-07-23-safe-change`,
          specsUpdated: false,
        } }),
        stderr: "",
        evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
      };
    };
    const result = await new OpenSpecOrchestrator(runner).finalize({
      cwd, change: "safe-change", readiness, refreshReadiness: async () => readiness,
    });
    expect(result).toMatchObject({ ok: false, code: "unsafe-output" });
    expect(await Bun.file(join(cwd, "UNRELATED-WRITE.txt")).exists()).toBeFalse();
    expect(await Bun.file(join(cwd, "openspec", "changes", "safe-change", ".openspec.yaml")).exists()).toBeTrue();
  });

  test("rejects an archive that does not preserve the exact active change", async () => {
    const { cwd, readiness } = await finalizationFixture();
    const runner: ProcessRunner = async ({ command, cwd: processCwd }) => {
      if (command.at(-1) === "--version") {
        return {
          ok: true, stdout: "1.6.0", stderr: "",
          evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
      }
      await rm(join(processCwd, "openspec", "changes", "safe-change"), { recursive: true });
      const archived = join(processCwd, "openspec", "changes", "archive", "2026-07-23-safe-change");
      await mkdir(archived, { recursive: true });
      return {
        ok: true,
        stdout: JSON.stringify({ archive: {
          change: "safe-change",
          archivedAs: "2026-07-23-safe-change",
          path: await realpath(archived),
          specsUpdated: false,
        } }),
        stderr: "",
        evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
      };
    };
    const result = await new OpenSpecOrchestrator(runner).finalize({
      cwd, change: "safe-change", readiness, refreshReadiness: async () => readiness,
    });
    expect(result).toMatchObject({ ok: false, code: "archive-postcondition-failed" });
    expect(await Bun.file(join(cwd, "openspec", "changes", "safe-change", ".openspec.yaml")).exists()).toBeTrue();
  });

  test("aborts publication when Build Right authority changes during scratch finalization", async () => {
    const { cwd, readiness } = await finalizationFixture();
    const runner: ProcessRunner = async ({ command, cwd: processCwd }) => {
      if (command.at(-1) === "--version") {
        return {
          ok: true, stdout: "1.6.0", stderr: "",
          evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
      }
      if (command.includes("archive")) {
        const archiveRoot = join(processCwd, "openspec", "changes", "archive");
        await mkdir(archiveRoot, { recursive: true });
        await rename(
          join(processCwd, "openspec", "changes", "safe-change"),
          join(archiveRoot, "2026-07-23-safe-change"),
        );
        await Bun.write(join(cwd, "docs", "concurrent-change.md"), "changed while finalizing\n");
        return {
          ok: true,
          stdout: JSON.stringify({ archive: {
            change: "safe-change",
            archivedAs: "2026-07-23-safe-change",
            path: `${await realpath(processCwd)}/openspec/changes/archive/2026-07-23-safe-change`,
            specsUpdated: false,
          } }),
          stderr: "",
          evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
      }
      return {
        ok: true,
        stdout: JSON.stringify({ items: [] }),
        stderr: "",
        evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
      };
    };
    const result = await new OpenSpecOrchestrator(runner).finalize({
      cwd, change: "safe-change", readiness, refreshReadiness: async () => readiness,
    });
    expect(result).toMatchObject({ ok: false, code: "finalization-race" });
    expect(await Bun.file(join(cwd, "openspec", "changes", "safe-change", ".openspec.yaml")).exists()).toBeTrue();
  });

  test("serializes concurrent finalizers so only one archive can publish", async () => {
    const { cwd, readiness } = await finalizationFixture();
    const runner: ProcessRunner = async ({ command, cwd: processCwd }) => {
      if (command.at(-1) === "--version") {
        return {
          ok: true, stdout: "1.6.0", stderr: "",
          evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
      }
      if (command.includes("archive")) {
        await Bun.sleep(25);
        const archiveRoot = join(processCwd, "openspec", "changes", "archive");
        await mkdir(archiveRoot, { recursive: true });
        await rename(
          join(processCwd, "openspec", "changes", "safe-change"),
          join(archiveRoot, "2026-07-23-safe-change"),
        );
        return {
          ok: true,
          stdout: JSON.stringify({ archive: {
            change: "safe-change",
            archivedAs: "2026-07-23-safe-change",
            path: `${await realpath(processCwd)}/openspec/changes/archive/2026-07-23-safe-change`,
            specsUpdated: false,
          } }),
          stderr: "",
          evidence: { command, exitCode: 0, durationMs: 25, stdoutSummary: "", stderrSummary: "" },
        };
      }
      return {
        ok: true,
        stdout: JSON.stringify({ items: [] }),
        stderr: "",
        evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
      };
    };
    const orchestrator = new OpenSpecOrchestrator(runner);
    const results = await Promise.all([
      orchestrator.finalize({ cwd, change: "safe-change", readiness, refreshReadiness: async () => readiness }),
      orchestrator.finalize({ cwd, change: "safe-change", readiness, refreshReadiness: async () => readiness }),
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.some((result) => !result.ok && result.code === "finalization-busy")).toBeTrue();
  });

  test("rejects validator mutation, archive collision, and mode drift before publication", async () => {
    const validatorMutation = await finalizationFixture();
    const mutatingValidator: ProcessRunner = async ({ command, cwd: processCwd }) => {
      if (command.at(-1) === "--version") {
        return {
          ok: true, stdout: "1.6.0", stderr: "",
          evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
      }
      if (command.includes("archive")) {
        const archiveRoot = join(processCwd, "openspec", "changes", "archive");
        await mkdir(archiveRoot, { recursive: true });
        await rename(join(processCwd, "openspec", "changes", "safe-change"), join(archiveRoot, "2026-07-23-safe-change"));
        return {
          ok: true,
          stdout: JSON.stringify({ archive: {
            change: "safe-change", archivedAs: "2026-07-23-safe-change",
            path: `${await realpath(processCwd)}/openspec/changes/archive/2026-07-23-safe-change`,
            specsUpdated: false,
          } }),
          stderr: "",
          evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
      }
      await Bun.write(join(processCwd, "openspec", "config.yaml"), "schema: spec-driven\n# validator mutation\n");
      return {
        ok: true, stdout: JSON.stringify({ items: [] }), stderr: "",
        evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
      };
    };
    expect(await new OpenSpecOrchestrator(mutatingValidator).finalize({
      cwd: validatorMutation.cwd,
      change: "safe-change",
      readiness: validatorMutation.readiness,
      refreshReadiness: async () => validatorMutation.readiness,
    })).toMatchObject({ ok: false, code: "archive-postcondition-failed" });

    const collision = await finalizationFixture();
    const collisionPath = join(collision.cwd, "openspec", "changes", "archive", "2026-07-23-safe-change");
    await mkdir(collisionPath, { recursive: true });
    await Bun.write(join(collisionPath, "original.txt"), "preserve\n");
    const replacingArchive: ProcessRunner = async ({ command, cwd: processCwd }) => {
      if (command.at(-1) === "--version") {
        return {
          ok: true, stdout: "1.6.0", stderr: "",
          evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
      }
      const destination = join(processCwd, "openspec", "changes", "archive", "2026-07-23-safe-change");
      await rm(destination, { recursive: true, force: true });
      await mkdir(join(processCwd, "openspec", "changes", "archive"), { recursive: true });
      await rename(join(processCwd, "openspec", "changes", "safe-change"), destination);
      return {
        ok: true,
        stdout: JSON.stringify({ archive: {
          change: "safe-change", archivedAs: "2026-07-23-safe-change",
          path: await realpath(destination), specsUpdated: false,
        } }),
        stderr: "",
        evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
      };
    };
    expect(await new OpenSpecOrchestrator(replacingArchive).finalize({
      cwd: collision.cwd,
      change: "safe-change",
      readiness: collision.readiness,
      refreshReadiness: async () => collision.readiness,
    })).toMatchObject({ ok: false, code: "archive-postcondition-failed" });
    expect(await Bun.file(join(collisionPath, "original.txt")).text()).toBe("preserve\n");

    const modeDrift = await finalizationFixture();
    const changingMode: ProcessRunner = async ({ command, cwd: processCwd }) => {
      if (command.at(-1) === "--version") {
        return {
          ok: true, stdout: "1.6.0", stderr: "",
          evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
      }
      const destination = join(processCwd, "openspec", "changes", "archive", "2026-07-23-safe-change");
      await mkdir(join(processCwd, "openspec", "changes", "archive"), { recursive: true });
      await rename(join(processCwd, "openspec", "changes", "safe-change"), destination);
      await chmod(destination, 0o700);
      return {
        ok: true,
        stdout: JSON.stringify({ archive: {
          change: "safe-change", archivedAs: "2026-07-23-safe-change",
          path: await realpath(destination), specsUpdated: false,
        } }),
        stderr: "",
        evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
      };
    };
    expect(await new OpenSpecOrchestrator(changingMode).finalize({
      cwd: modeDrift.cwd,
      change: "safe-change",
      readiness: modeDrift.readiness,
      refreshReadiness: async () => modeDrift.readiness,
    })).toMatchObject({ ok: false, code: "archive-postcondition-failed" });
  });

  test("surfaces a retained recovery path if guarded publication cannot roll back", async () => {
    const { cwd, readiness } = await finalizationFixture();
    const runner: ProcessRunner = async ({ command, cwd: processCwd }) => {
      if (command.at(-1) === "--version") {
        return {
          ok: true, stdout: "1.6.0", stderr: "",
          evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
      }
      if (command.includes("archive")) {
        const destination = join(processCwd, "openspec", "changes", "archive", "2026-07-23-safe-change");
        await mkdir(join(processCwd, "openspec", "changes", "archive"), { recursive: true });
        await rename(join(processCwd, "openspec", "changes", "safe-change"), destination);
        return {
          ok: true,
          stdout: JSON.stringify({ archive: {
            change: "safe-change", archivedAs: "2026-07-23-safe-change",
            path: await realpath(destination), specsUpdated: false,
          } }),
          stderr: "",
          evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
        };
      }
      return {
        ok: true, stdout: JSON.stringify({ items: [] }), stderr: "",
        evidence: { command, exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" },
      };
    };
    let swapCalls = 0;
    const swapThenFailRollback = (left: string, right: string) => {
      swapCalls += 1;
      if (swapCalls > 1) return false;
      const swapped = atomicSwapDirectories(left, right);
      if (swapped) chmodSync(join(right, "config.yaml"), 0o600);
      return swapped;
    };
    const result = await new OpenSpecOrchestrator(runner, swapThenFailRollback).finalize({
      cwd, change: "safe-change", readiness, refreshReadiness: async () => readiness,
    });
    expect(result).toMatchObject({ ok: false, code: "recovery-required" });
    if (!result.ok && "recoveryPath" in result && typeof result.recoveryPath === "string") {
      expect(await Bun.file(join(result.recoveryPath, "openspec", "config.yaml")).exists()).toBeTrue();
    }
  });
});
