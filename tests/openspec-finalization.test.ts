import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rename, symlink, unlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { inspectArchiveReadiness } from "../skills/build-right-execution/scripts/lib/archive-readiness";
import { inspectMarkdownRepository } from "../skills/build-right-execution/scripts/lib/markdown-provider";
import { reconcilePlanningState } from "../skills/build-right-execution/scripts/lib/planning-reconciliation";

const evidence = [{ command: ["fixture"], exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" }];

function provider(options: { valid?: boolean; complete?: boolean } = {}) {
  const complete = options.complete ?? true;
  return {
    inspect: async () => ({
      ok: true as const,
      provider: "openspec" as const,
      providerVersion: "1.6.0",
      change: "safe-change",
      schema: "spec-driven",
      state: "all-done" as const,
      artifacts: [],
      workItems: [],
      evidence,
    }),
    validate: async () => ({
      ok: true as const,
      provider: "openspec" as const,
      change: "safe-change",
      valid: options.valid ?? true,
      issues: options.valid === false ? ["invalid delta"] : [],
      evidence,
    }),
    applyInstructions: async () => ({
      ok: true as const,
      provider: "openspec" as const,
      providerVersion: "1.6.0",
      change: "safe-change",
      schema: "spec-driven",
      state: complete ? "all-done" as const : "ready" as const,
      artifacts: [],
      workItems: [{ id: "1", title: "1.1 Implement", complete, sourcePath: "openspec/changes/safe-change/tasks.md" }],
      evidence,
    }),
  };
}

async function fixture(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), "build-right-archive-readiness-"));
  await mkdir(join(cwd, "docs"), { recursive: true });
  await mkdir(join(cwd, "tasks", "issues"), { recursive: true });
  await mkdir(join(cwd, "openspec", "changes", "safe-change", "specs", "capability"), { recursive: true });
  await mkdir(join(cwd, "openspec", "specs"), { recursive: true });
  await Bun.write(join(cwd, "openspec", "config.yaml"), "schema: spec-driven\n");
  await Bun.write(join(cwd, "openspec", "changes", "safe-change", ".openspec.yaml"), "schema: spec-driven\ncreated: 2026-07-23\n");
  await Bun.write(join(cwd, "openspec", "changes", "safe-change", "specs", "capability", "spec.md"), "## ADDED Requirements\n");
  await Bun.write(join(cwd, "docs", "execution-rules.md"), "# Execution Rules\n\nStatus: ready\n");
  await Bun.write(join(cwd, "docs", "release-gates.md"), `# Release Gates

Status: ready

## Gates

| Gate | Status | Command or Proof |
| --- | --- | --- |
| Project verification | pass | \`bun test\` |
`);
  await Bun.write(join(cwd, "docs", "conflicts.md"), `# Conflicts

Status: resolved

## Conflicts

| Conflict | Status | Owner |
| --- | --- | --- |
| None | none | AI |
`);
  await Bun.write(join(cwd, "tasks", "sprint-0.md"), `# Sprint 0

Status: active

## Tasks

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| 001 | Complete binding | complete | tasks/issues/001-complete.md |
`);
  await Bun.write(join(cwd, "tasks", "issues", "001-complete.md"), `# 001: Complete binding

Status: complete
Type: implementation
Owner: AI

Planning provider: openspec
Change ref: safe-change
Work item ref: 1
Assumption basis: repo-evidence-backed
Requirement basis: openspec/changes/safe-change/tasks.md#1
Reversibility: moderate
Learning objective: prove finalization
Source under test: repo-local path

## Goal

Complete the binding.

## Non-Goals

- None.

## Required Reading

- openspec/changes/safe-change/tasks.md

## Acceptance Criteria

- [x] The work item is implemented.

## Baseline Evidence

- Captured.

## Verification

- \`bun test\`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-07-23 | \`bun test\` | pass | project proof |

## Verification Summary

- \`bun test\` - passed.

## Blockers

- None.

## Follow-Ups

- None.
`);
  return cwd;
}

async function snapshot(cwd: string): Promise<string> {
  const files = [...new Bun.Glob("**/*").scanSync({ cwd, onlyFiles: true, dot: true })].sort();
  const entries = await Promise.all(files.map(async (path) => [path, await Bun.file(join(cwd, path)).text()]));
  return JSON.stringify(entries);
}

describe("archive readiness", () => {
  test("returns a fresh structured ready proof without mutating the repository", async () => {
    const cwd = await fixture();
    const before = await snapshot(cwd);
    const result = await inspectArchiveReadiness({ cwd, change: "safe-change" }, provider());
    expect(result.decision).toBe("archive-ready");
    if (result.decision === "archive-ready") {
      expect(result.checks.specSyncState).toBe("sync-ready");
      expect(result.boundTaskPaths).toEqual(["tasks/issues/001-complete.md"]);
      expect(result.blockingGates).toHaveLength(0);
    }
    expect(await snapshot(cwd)).toBe(before);
  });

  test("reconciles completed bindings from one validated archived change without provider calls", async () => {
    const cwd = await fixture();
    const archiveRoot = join(cwd, "openspec", "changes", "archive");
    await mkdir(archiveRoot);
    const archived = join(archiveRoot, "2026-07-23-safe-change");
    await rename(join(cwd, "openspec", "changes", "safe-change"), archived);
    await Bun.write(join(archived, "tasks.md"), "# Tasks\n\n- [x] 1.1 Implement\n");
    let calls = 0;
    const unavailable = {
      inspect: async () => { calls += 1; return provider().inspect(); },
      validate: async () => { calls += 1; return provider().validate(); },
      applyInstructions: async () => { calls += 1; return provider().applyInstructions(); },
    };
    const markdown = await inspectMarkdownRepository({ cwd, strict: true });
    const reconciled = await reconcilePlanningState(markdown, { provider: unavailable });
    expect(reconciled.invalidGates).toHaveLength(0);
    expect(reconciled.completedTasks[0]?.planningWorkItemComplete).toBeTrue();
    expect(reconciled.evidence.at(-1)?.summary).toContain("archived");
    expect(calls).toBe(0);
  });

  test("fails closed when an archived Build Right binding names no archived work item", async () => {
    const cwd = await fixture();
    const archiveRoot = join(cwd, "openspec", "changes", "archive");
    await mkdir(archiveRoot);
    const archived = join(archiveRoot, "2026-07-23-safe-change");
    await rename(join(cwd, "openspec", "changes", "safe-change"), archived);
    await Bun.write(join(archived, "tasks.md"), "# Tasks\n\n- [x] 1.1 Implement\n");
    const taskPath = join(cwd, "tasks", "issues", "001-complete.md");
    await Bun.write(taskPath, (await Bun.file(taskPath).text()).replace("Work item ref: 1", "Work item ref: 9"));
    let calls = 0;
    const unavailable = {
      inspect: async () => { calls += 1; return provider().inspect(); },
      validate: async () => { calls += 1; return provider().validate(); },
      applyInstructions: async () => { calls += 1; return provider().applyInstructions(); },
    };
    const markdown = await inspectMarkdownRepository({ cwd, strict: true });
    const reconciled = await reconcilePlanningState(markdown, { provider: unavailable });
    expect(reconciled.invalidGates.some((gate) =>
      gate.type === "planning-drift" && gate.reason.includes("absent from the archived change"))).toBeTrue();
    expect(calls).toBe(0);
  });

  test("fails every validation, completion, evidence, release, conflict, and sync gate", async () => {
    const invalid = await fixture();
    expect((await inspectArchiveReadiness({ cwd: invalid, change: "safe-change" }, provider({ valid: false }))).decision)
      .toBe("archive-blocked");

    const incomplete = await fixture();
    const incompleteResult = await inspectArchiveReadiness(
      { cwd: incomplete, change: "safe-change" },
      provider({ complete: false }),
    );
    expect(incompleteResult.decision).toBe("archive-blocked");

    const missingEvidence = await fixture();
    const taskPath = join(missingEvidence, "tasks", "issues", "001-complete.md");
    await Bun.write(taskPath, (await Bun.file(taskPath).text()).replace("| `bun test` | pass |", "| `bun test` | pending |"));
    expect((await inspectArchiveReadiness({ cwd: missingEvidence, change: "safe-change" }, provider())).decision)
      .toBe("archive-blocked");

    const failedRelease = await fixture();
    const releasePath = join(failedRelease, "docs", "release-gates.md");
    await Bun.write(releasePath, (await Bun.file(releasePath).text()).replace("| pass |", "| failed |"));
    expect((await inspectArchiveReadiness({ cwd: failedRelease, change: "safe-change" }, provider())).decision)
      .toBe("archive-blocked");

    const conflict = await fixture();
    const conflictPath = join(conflict, "docs", "conflicts.md");
    await Bun.write(conflictPath, (await Bun.file(conflictPath).text()).replace("| None | none |", "| Authority conflict | open |"));
    expect((await inspectArchiveReadiness({ cwd: conflict, change: "safe-change" }, provider())).decision)
      .toBe("archive-blocked");

    const badSync = await fixture();
    await Bun.write(join(badSync, "openspec", "changes", "safe-change", "specs", "unexpected.md"), "bad\n");
    const badSyncResult = await inspectArchiveReadiness({ cwd: badSync, change: "safe-change" }, provider());
    expect(badSyncResult.decision).toBe("archive-blocked");
    expect(badSyncResult.checks.specSyncState).toBe("contradictory");

    const externalSync = await fixture();
    await symlink(
      join(externalSync, "docs", "execution-rules.md"),
      join(externalSync, "openspec", "changes", "safe-change", "specs", "external.md"),
    );
    expect((await inspectArchiveReadiness({ cwd: externalSync, change: "safe-change" }, provider())).decision)
      .toBe("archive-blocked");

    const externalEvidence = await fixture();
    const externalRoot = await mkdtemp(join(tmpdir(), "build-right-external-evidence-"));
    const externalRelease = join(externalRoot, "release-gates.md");
    await Bun.write(externalRelease, await Bun.file(join(externalEvidence, "docs", "release-gates.md")).text());
    await unlink(join(externalEvidence, "docs", "release-gates.md"));
    await symlink(externalRelease, join(externalEvidence, "docs", "release-gates.md"));
    expect((await inspectArchiveReadiness({ cwd: externalEvidence, change: "safe-change" }, provider())).decision)
      .toBe("archive-blocked");

    const externalTaskEvidence = await fixture();
    const externalTaskRoot = await mkdtemp(join(tmpdir(), "build-right-external-task-"));
    const externalTask = join(externalTaskRoot, "001-complete.md");
    const boundTask = join(externalTaskEvidence, "tasks", "issues", "001-complete.md");
    await Bun.write(externalTask, await Bun.file(boundTask).text());
    await unlink(boundTask);
    await symlink(externalTask, boundTask);
    expect((await inspectArchiveReadiness({ cwd: externalTaskEvidence, change: "safe-change" }, provider())).decision)
      .toBe("archive-blocked");
  });
});
