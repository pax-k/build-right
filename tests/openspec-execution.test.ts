import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, realpath } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { resolveState } from "../skills/build-right-execution/scripts/lib/resolver";
import { orchestrateExecutionPlanning } from "../skills/build-right-execution/scripts/lib/execution-orchestration";
import { inspectMarkdownRepository } from "../skills/build-right-execution/scripts/lib/markdown-provider";
import type { ResolverInput, TaskSummary } from "../skills/build-right-execution/scripts/lib/contracts";
import {
  completePlanningWorkItem,
  type WorkItemCompletionProof,
} from "../src/openspec/execution-progress";

const processEvidence = [{ command: ["fixture"], exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" }];

function task(status: string, complete = false): TaskSummary {
  return {
    id: "001",
    title: "Bound task",
    status,
    path: "tasks/issues/001-bound.md",
    tracker: "tasks/sprint-0.md",
    evidence: "tasks/issues/001-bound.md",
    order: 0,
    owner: "AI",
    missingContractFields: [],
    planningBinding: { provider: "openspec", change: "safe-change", workItem: "1.1" },
    planningWorkItemComplete: complete,
    completionEvidenceValid: status === "complete",
  };
}

function input(boundTask?: TaskSummary): ResolverInput {
  return {
    cwd: "/fixture",
    invalidGates: [],
    founderGates: [],
    externalFollowUps: [],
    aiBlockingGates: [],
    readyTasks: boundTask?.status === "ready" ? [boundTask] : [],
    activeTasks: boundTask?.status === "active" ? [boundTask] : [],
    plannedTasks: boundTask?.status === "planned" ? [boundTask] : [],
    completedTasks: boundTask?.status === "complete" ? [boundTask] : [],
    evidence: [],
    missingExecutionSurface: false,
  };
}

function provider(options: {
  itemComplete?: boolean;
  missing?: boolean;
  validation?: boolean;
  failure?: "provider-unavailable" | "invalid-output";
} = {}) {
  const failed = options.failure
    ? { ok: false as const, provider: "openspec" as const, code: options.failure, message: "fixture failure", evidence: [] }
    : null;
  return {
    inspect: async () => failed ?? ({
      ok: true as const,
      provider: "openspec" as const,
      providerVersion: "1.6.0",
      change: "safe-change",
      schema: "spec-driven",
      state: "all-done" as const,
      artifacts: [],
      workItems: [],
      evidence: processEvidence,
    }),
    validate: async () => failed ?? ({
      ok: true as const,
      provider: "openspec" as const,
      change: "safe-change",
      valid: options.validation ?? true,
      issues: options.validation === false ? ["invalid delta"] : [],
      evidence: processEvidence,
    }),
    applyInstructions: async () => failed ?? ({
      ok: true as const,
      provider: "openspec" as const,
      providerVersion: "1.6.0",
      change: "safe-change",
      schema: "spec-driven",
      state: options.itemComplete ? "all-done" as const : "ready" as const,
      artifacts: [],
      workItems: options.missing ? [] : [{
        id: "1.1",
        title: "Implement",
        complete: options.itemComplete ?? false,
        sourcePath: "openspec/changes/safe-change/tasks.md",
      }],
      evidence: processEvidence,
    }),
  };
}

const ensured = async () => ({
  ok: true as const,
  state: "preserved" as const,
  root: "/fixture/openspec",
  evidence: [],
});

describe("managed execution reconciliation", () => {
  test("preserves legacy resolver behavior and makes zero provider calls", async () => {
    let calls = 0;
    const legacy = task("ready");
    delete legacy.planningBinding;
    const state = input(legacy);
    const reconciled = await orchestrateExecutionPlanning(state, {
      ensure: async () => {
        calls += 1;
        return ensured();
      },
      provider: {
        inspect: async () => { calls += 1; return provider().inspect(); },
        validate: async () => { calls += 1; return provider().validate(); },
        applyInstructions: async () => { calls += 1; return provider().applyInstructions(); },
      },
    });
    expect(reconciled).toBe(state);
    expect(calls).toBe(0);
    expect(resolveState(reconciled).decision).toBe("execute-task");
  });

  test("ignores planning-field examples outside the task metadata block", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "build-right-execution-binding-example-"));
    await mkdir(join(cwd, "tasks", "issues"), { recursive: true });
    await Bun.write(join(cwd, "docs-execution-rules-placeholder"), "");
    await Bun.write(join(cwd, "tasks", "sprint-0.md"), `# Sprint 0

Status: active

## Tasks

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| 001 | Legacy | ready | tasks/issues/001-legacy.md |
`);
    await Bun.write(join(cwd, "tasks", "issues", "001-legacy.md"), `# 001: Legacy

Status: ready
Type: implementation
Owner: AI
Assumption basis: repo-evidence-backed
Requirement basis: docs/example.md
Reversibility: easy
Learning objective: preserve compatibility
Source under test: repo-local path

## Goal

\`\`\`md
Planning provider: openspec
Change ref: example-change
Work item ref: 1.1
\`\`\`

## Non-Goals

- None.

## Required Reading

- docs/example.md

## Acceptance Criteria

- [ ] Legacy behavior remains.

## Baseline Evidence

- Fixture.

## Verification

- Fixture.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Blockers

- None.

## Follow-Ups

- None.
`);
    const state = await inspectMarkdownRepository({ cwd, strict: false });
    expect(state.readyTasks[0]?.planningBinding).toBeUndefined();
    let ensureCalls = 0;
    const orchestrated = await orchestrateExecutionPlanning(state, {
      ensure: async () => {
        ensureCalls += 1;
        return ensured();
      },
    });
    expect(orchestrated).toBe(state);
    expect(ensureCalls).toBe(0);
  });

  test("selects one pending binding after automatic setup and strict inspection", async () => {
    const reconciled = await orchestrateExecutionPlanning(input(task("ready")), { ensure: ensured, provider: provider() });
    const result = resolveState(reconciled);
    expect(result.decision).toBe("execute-task");
    expect(result.nextTask?.planningWorkItemComplete).toBeFalse();
    expect(reconciled.evidence.at(-1)?.summary).toContain("all-done");
  });

  test("maps provider, validation, missing-item, malformed-binding, and drift failures", async () => {
    const unavailable = await orchestrateExecutionPlanning(input(task("ready")), {
      ensure: ensured,
      provider: provider({ failure: "provider-unavailable" }),
    });
    expect(unavailable.invalidGates[0]?.type).toBe("planning-provider-unavailable");

    const malformedOutput = await orchestrateExecutionPlanning(input(task("ready")), {
      ensure: ensured,
      provider: provider({ failure: "invalid-output" }),
    });
    expect(malformedOutput.invalidGates[0]?.type).toBe("planning-provider-invalid");

    const invalidSpec = await orchestrateExecutionPlanning(input(task("ready")), {
      ensure: ensured,
      provider: provider({ validation: false }),
    });
    expect(invalidSpec.invalidGates[0]?.type).toBe("spec-validation-failed");

    const missing = await orchestrateExecutionPlanning(input(task("ready")), {
      ensure: ensured,
      provider: provider({ missing: true }),
    });
    expect(missing.invalidGates[0]?.type).toBe("planning-drift");

    const incomplete = task("ready");
    delete incomplete.planningBinding;
    incomplete.planningBindingError = "planning binding fields must appear exactly once and together";
    const malformedBinding = await orchestrateExecutionPlanning(input(incomplete), { ensure: ensured, provider: provider() });
    expect(malformedBinding.invalidGates[0]?.type).toBe("planning-provider-invalid");

    for (const [status, providerComplete] of [["ready", true], ["active", true], ["planned", true], ["complete", false]] as const) {
      const reconciled = await orchestrateExecutionPlanning(input(task(status)), {
        ensure: ensured,
        provider: provider({ itemComplete: providerComplete }),
      });
      expect(resolveState(reconciled).decision).toBe("invalid-state");
      expect(reconciled.invalidGates[0]?.type).toBe("planning-drift");
    }
  });

  test("keeps founder precedence unchanged when planning state is valid", async () => {
    const state = input(task("ready"));
    state.founderGates.push({ type: "founder-owned", status: "needs-founder", source: "fixture", reason: "decide" });
    const reconciled = await orchestrateExecutionPlanning(state, { ensure: ensured, provider: provider() });
    expect(resolveState(reconciled).decision).toBe("ask-founder");
  });
});

async function closeoutFixture(): Promise<{ cwd: string; proof: WorkItemCompletionProof }> {
  const cwd = await mkdtemp(join(tmpdir(), "build-right-execution-closeout-"));
  await mkdir(join(cwd, "openspec", "changes", "safe-change"), { recursive: true });
  await mkdir(join(cwd, "openspec", "specs"), { recursive: true });
  await mkdir(join(cwd, "tasks", "issues"), { recursive: true });
  await Bun.write(join(cwd, "openspec", "config.yaml"), "schema: spec-driven\n");
  await Bun.write(join(cwd, "openspec", "changes", "safe-change", ".openspec.yaml"), "schema: spec-driven\ncreated: 2026-07-23\n");
  await Bun.write(join(cwd, "openspec", "changes", "safe-change", "tasks.md"), "# Tasks\n\n- [ ] Implement\n- [ ] Verify\n");
  await Bun.write(join(cwd, "tasks", "issues", "001-bound.md"), `# 001: Bound

Status: active
Type: implementation
Owner: AI

Planning provider: openspec
Change ref: safe-change
Work item ref: 1.1

## Acceptance Criteria

- [x] The referenced work item is implemented and verified.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-07-23 | bun test | pass | focused implementation proof |

## Verification Summary

- \`bun test\` - passed focused integration checks.
`);
  await Bun.write(join(cwd, "tasks", "issues", "002-next.md"), `# 002: Next

Status: planned
Planning provider: openspec
Change ref: safe-change
Work item ref: 1.2
`);
  await Bun.write(join(cwd, "tasks", "sprint-0.md"), `# Sprint 0

Status: active

## Tasks

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| 001 | Bound | active | tasks/issues/001-bound.md |
| 002 | Next | planned | tasks/issues/002-next.md |
`);
  const root = await realpath(cwd);
  return {
    cwd,
    proof: {
      decision: "work-item-ready-for-closeout",
      repositoryRoot: root,
      taskPath: "tasks/issues/001-bound.md",
      sprintPath: "tasks/sprint-0.md",
      change: "safe-change",
      workItem: "1.1",
      checkedAt: new Date().toISOString(),
      checks: { implementation: "pass", verification: "pass", evidenceComplete: true },
      verificationCommands: ["bun test"],
      evidenceRefs: ["tasks/issues/001-bound.md#evidence-log"],
    },
  };
}

function filesystemProvider(cwd: string) {
  return {
    inspect: async () => ({
      ok: true as const, provider: "openspec" as const, providerVersion: "1.6.0",
      change: "safe-change", schema: "spec-driven", state: "all-done" as const,
      artifacts: [], workItems: [], evidence: processEvidence,
    }),
    validate: async () => ({
      ok: true as const, provider: "openspec" as const, change: "safe-change",
      valid: true, issues: [], evidence: processEvidence,
    }),
    applyInstructions: async () => {
      const text = await Bun.file(join(cwd, "openspec", "changes", "safe-change", "tasks.md")).text();
      const boxes = [...text.matchAll(/^\s*-\s+\[([ xX])\]\s+(.+)$/gm)];
      const workItems = boxes.map((match, index) => ({
        id: `1.${index + 1}`,
        title: match[2]!,
        complete: match[1]!.toLowerCase() === "x",
        sourcePath: "openspec/changes/safe-change/tasks.md",
      }));
      return {
        ok: true as const, provider: "openspec" as const, providerVersion: "1.6.0",
        change: "safe-change", schema: "spec-driven",
        state: workItems.every((item) => item.complete) ? "all-done" as const : "ready" as const,
        artifacts: [], workItems, evidence: processEvidence,
      };
    },
  };
}

function contentHash(content: string): string {
  return new Bun.CryptoHasher("sha256").update(content).digest("hex");
}

async function installValidRecoveryJournal(
  fixture: Awaited<ReturnType<typeof closeoutFixture>>,
): Promise<{ paths: string[]; before: string[]; after: string[] }> {
  const paths = [
    "openspec/changes/safe-change/tasks.md",
    "tasks/issues/001-bound.md",
    "tasks/sprint-0.md",
    "tasks/issues/002-next.md",
  ];
  const before = await Promise.all(paths.map((path) => Bun.file(join(fixture.cwd, path)).text()));
  const after = [
    before[0]!.replace("[ ] Implement", "[x] Implement"),
    before[1]!.replace("Status: active", "Status: complete"),
    before[2]!
      .replace("| 001 | Bound | active |", "| 001 | Bound | complete |")
      .replace("| 002 | Next | planned |", "| 002 | Next | ready |"),
    before[3]!.replace("Status: planned", "Status: ready"),
  ];
  const journal = {
    version: 1,
    repositoryRoot: await realpath(fixture.cwd),
    taskPath: fixture.proof.taskPath,
    sprintPath: fixture.proof.sprintPath,
    change: fixture.proof.change,
    workItem: fixture.proof.workItem,
    itemTitle: "Implement",
    nextTaskPath: paths[3],
    nextWorkItem: "1.2",
    files: paths.map((path, index) => ({
      path,
      beforeHash: contentHash(before[index]!),
      afterHash: contentHash(after[index]!),
      before: before[index]!,
      after: after[index]!,
    })),
  };
  await Bun.write(
    join(fixture.cwd, "tasks", ".build-right-openspec-progress-journal.json"),
    `${JSON.stringify(journal)}\n`,
  );
  return { paths, before, after };
}

describe("managed execution closeout", () => {
  test("does not check progress when proof or recorded evidence fails", async () => {
    const fixture = await closeoutFixture();
    fixture.proof.checks.verification = "pass";
    fixture.proof.checkedAt = new Date(Date.now() - 10 * 60_000).toISOString();
    const before = await Bun.file(join(fixture.cwd, "openspec", "changes", "safe-change", "tasks.md")).text();
    const result = await completePlanningWorkItem(
      { cwd: fixture.cwd, proof: fixture.proof },
      filesystemProvider(fixture.cwd),
    );
    expect(result.ok).toBeFalse();
    expect(await Bun.file(join(fixture.cwd, "openspec", "changes", "safe-change", "tasks.md")).text()).toBe(before);

    const weak = await closeoutFixture();
    const weakTaskPath = join(weak.cwd, weak.proof.taskPath);
    const weakTask = (await Bun.file(weakTaskPath).text())
      .replace("| 2026-07-23 | bun test | pass | focused implementation proof |", "| 2026-07-23 | docs review only | pass | documentation only |")
      .replace("- `bun test` - passed focused integration checks.", "- `docs review` - passed documentation review only.")
      .replace("## Evidence Log", "## Verification\n\n- bun test\n\n## Evidence Log");
    await Bun.write(weakTaskPath, weakTask);
    const weakResult = await completePlanningWorkItem(
      { cwd: weak.cwd, proof: weak.proof },
      filesystemProvider(weak.cwd),
    );
    expect(weakResult.ok).toBeFalse();
    expect(await Bun.file(join(weak.cwd, "openspec", "changes", "safe-change", "tasks.md")).text())
      .toContain("- [ ] Implement");

    weak.proof.evidenceRefs = [`${weak.proof.taskPath}#nonexistent`];
    const badReference = await completePlanningWorkItem(
      { cwd: weak.cwd, proof: weak.proof },
      filesystemProvider(weak.cwd),
    );
    expect(badReference.ok).toBeFalse();

    const echoed = await closeoutFixture();
    const echoedTaskPath = join(echoed.cwd, echoed.proof.taskPath);
    const echoedTask = (await Bun.file(echoedTaskPath).text())
      .replace("| 2026-07-23 | bun test |", "| 2026-07-23 | echo bun test |")
      .replace("- `bun test` -", "- `echo bun test` -");
    await Bun.write(echoedTaskPath, echoedTask);
    const echoedResult = await completePlanningWorkItem(
      { cwd: echoed.cwd, proof: echoed.proof },
      filesystemProvider(echoed.cwd),
    );
    expect(echoedResult.ok).toBeFalse();
    expect(await Bun.file(join(echoed.cwd, "openspec", "changes", "safe-change", "tasks.md")).text())
      .toContain("- [ ] Implement");
  });

  test("checks one item, completes its Build Right task, promotes one successor, and re-inspects", async () => {
    const fixture = await closeoutFixture();
    const result = await completePlanningWorkItem(
      { cwd: fixture.cwd, proof: fixture.proof },
      filesystemProvider(fixture.cwd),
    );
    expect(result.ok).toBeTrue();
    if (result.ok) expect(result.nextTaskPath).toBe("tasks/issues/002-next.md");
    expect(await Bun.file(join(fixture.cwd, "openspec", "changes", "safe-change", "tasks.md")).text())
      .toBe("# Tasks\n\n- [x] Implement\n- [ ] Verify\n");
    expect(await Bun.file(join(fixture.cwd, "tasks", "issues", "001-bound.md")).text()).toContain("Status: complete");
    const sprint = await Bun.file(join(fixture.cwd, "tasks", "sprint-0.md")).text();
    expect(sprint).toContain("| 001 | Bound | complete | tasks/issues/001-bound.md |");
    expect(sprint).toContain("| 002 | Next | ready | tasks/issues/002-next.md |");
    expect(await Bun.file(join(fixture.cwd, "tasks", "issues", "002-next.md")).text()).toContain("Status: ready");
    expect(await Bun.file(join(fixture.cwd, "tasks", ".build-right-openspec-progress-journal.json")).exists()).toBeFalse();
    const retry = await completePlanningWorkItem(
      { cwd: fixture.cwd, proof: fixture.proof },
      filesystemProvider(fixture.cwd),
    );
    expect(retry.ok).toBeTrue();
    if (retry.ok) expect(retry.state).toBe("preserved");
  });

  test("serializes concurrent closeout attempts so exactly one mutation wins", async () => {
    const fixture = await closeoutFixture();
    const results = await Promise.all([
      completePlanningWorkItem({ cwd: fixture.cwd, proof: fixture.proof }, filesystemProvider(fixture.cwd)),
      completePlanningWorkItem({ cwd: fixture.cwd, proof: fixture.proof }, filesystemProvider(fixture.cwd)),
    ]);
    expect(results.filter((result) => result.ok && result.state === "completed")).toHaveLength(1);
    expect(results.filter((result) => !result.ok || result.state === "preserved")).toHaveLength(1);
    const tasks = await Bun.file(join(fixture.cwd, "openspec", "changes", "safe-change", "tasks.md")).text();
    expect(tasks.match(/- \[x\] Implement/g)).toHaveLength(1);
  });

  test("recovers a durable partial closeout journal before re-evaluating state", async () => {
    const fixture = await closeoutFixture();
    const { paths, after } = await installValidRecoveryJournal(fixture);
    await Bun.write(join(fixture.cwd, paths[0]!), after[0]!);

    const result = await completePlanningWorkItem(
      { cwd: fixture.cwd, proof: fixture.proof },
      filesystemProvider(fixture.cwd),
    );
    expect(result.ok).toBeTrue();
    if (result.ok) expect(result.state).toBe("preserved");
    for (let index = 0; index < paths.length; index += 1) {
      expect(await Bun.file(join(fixture.cwd, paths[index]!)).text()).toBe(after[index]!);
    }
    expect(await Bun.file(join(fixture.cwd, "tasks", ".build-right-openspec-progress-journal.json")).exists()).toBeFalse();
  });

  test("does not recover a valid journal through an invalid managed root", async () => {
    const fixture = await closeoutFixture();
    const { paths, before } = await installValidRecoveryJournal(fixture);
    await Bun.write(join(fixture.cwd, "openspec", "config.yaml"), "schema: wrong\n");
    const result = await completePlanningWorkItem(
      { cwd: fixture.cwd, proof: fixture.proof },
      filesystemProvider(fixture.cwd),
    );
    expect(result.ok).toBeFalse();
    for (let index = 0; index < paths.length; index += 1) {
      expect(await Bun.file(join(fixture.cwd, paths[index]!)).text()).toBe(before[index]!);
    }
    expect(await Bun.file(join(fixture.cwd, "tasks", ".build-right-openspec-progress-journal.json")).exists()).toBeTrue();
  });

  test("does not recover a valid journal when fresh strict validation fails", async () => {
    const fixture = await closeoutFixture();
    const { paths, before } = await installValidRecoveryJournal(fixture);
    const invalidProvider = {
      ...filesystemProvider(fixture.cwd),
      validate: async () => ({
        ok: true as const,
        provider: "openspec" as const,
        change: "safe-change",
        valid: false,
        issues: ["invalid delta"],
        evidence: processEvidence,
      }),
    };
    const result = await completePlanningWorkItem(
      { cwd: fixture.cwd, proof: fixture.proof },
      invalidProvider,
    );
    expect(result.ok).toBeFalse();
    for (let index = 0; index < paths.length; index += 1) {
      expect(await Bun.file(join(fixture.cwd, paths[index]!)).text()).toBe(before[index]!);
    }
  });

  test("rejects a forged recovery journal without applying repository-authored replacement content", async () => {
    const fixture = await closeoutFixture();
    const providerPath = "openspec/changes/safe-change/tasks.md";
    const before = await Bun.file(join(fixture.cwd, providerPath)).text();
    const forged = before.replace("- [ ] Implement", "- [x] Rewrite unrelated authority");
    const journal = {
      version: 1,
      repositoryRoot: await realpath(fixture.cwd),
      taskPath: fixture.proof.taskPath,
      sprintPath: fixture.proof.sprintPath,
      change: fixture.proof.change,
      workItem: fixture.proof.workItem,
      itemTitle: "Implement",
      nextTaskPath: null,
      nextWorkItem: null,
      files: [{
        path: providerPath,
        beforeHash: contentHash(before),
        afterHash: contentHash(forged),
        before,
        after: forged,
      }],
    };
    await Bun.write(
      join(fixture.cwd, "tasks", ".build-right-openspec-progress-journal.json"),
      `${JSON.stringify(journal)}\n`,
    );
    const result = await completePlanningWorkItem(
      { cwd: fixture.cwd, proof: fixture.proof },
      filesystemProvider(fixture.cwd),
    );
    expect(result.ok).toBeFalse();
    expect(await Bun.file(join(fixture.cwd, providerPath)).text()).toBe(before);
  });

  test("completes a last provider item without promoting an unrelated planned sprint row", async () => {
    const fixture = await closeoutFixture();
    await Bun.write(
      join(fixture.cwd, "openspec", "changes", "safe-change", "tasks.md"),
      "# Tasks\n\n- [ ] Implement\n",
    );
    await Bun.write(
      join(fixture.cwd, "tasks", "issues", "002-next.md"),
      "# 002: Unrelated\n\nStatus: planned\n",
    );
    const result = await completePlanningWorkItem(
      { cwd: fixture.cwd, proof: fixture.proof },
      filesystemProvider(fixture.cwd),
    );
    expect(result.ok).toBeTrue();
    if (result.ok) expect(result.nextTaskPath).toBeNull();
    expect(await Bun.file(join(fixture.cwd, "tasks", "issues", "002-next.md")).text())
      .toContain("Status: planned");
    expect(await Bun.file(join(fixture.cwd, "tasks", "sprint-0.md")).text())
      .toContain("| 002 | Next | planned | tasks/issues/002-next.md |");
  });

  test("retains the recovery journal when post-closeout reinspection detects file drift", async () => {
    const fixture = await closeoutFixture();
    const base = filesystemProvider(fixture.cwd);
    let applyCalls = 0;
    const mutatingProvider = {
      ...base,
      applyInstructions: async () => {
        applyCalls += 1;
        if (applyCalls === 2) {
          const sprintPath = join(fixture.cwd, fixture.proof.sprintPath);
          const sprint = await Bun.file(sprintPath).text();
          await Bun.write(
            sprintPath,
            sprint.replace("| 001 | Bound | complete |", "| 001 | Bound | active |"),
          );
        }
        return base.applyInstructions();
      },
    };
    const result = await completePlanningWorkItem(
      { cwd: fixture.cwd, proof: fixture.proof },
      mutatingProvider,
    );
    expect(result.ok).toBeFalse();
    expect(await Bun.file(join(fixture.cwd, "tasks", ".build-right-openspec-progress-journal.json")).exists()).toBeTrue();
  });

  test("rejects reordered provider work items before mutating a source checkbox", async () => {
    const fixture = await closeoutFixture();
    const base = filesystemProvider(fixture.cwd);
    const reorderedProvider = {
      ...base,
      applyInstructions: async () => {
        const result = await base.applyInstructions();
        return { ...result, workItems: [...result.workItems].reverse() };
      },
    };
    const before = await Bun.file(join(fixture.cwd, "openspec", "changes", "safe-change", "tasks.md")).text();
    const result = await completePlanningWorkItem(
      { cwd: fixture.cwd, proof: fixture.proof },
      reorderedProvider,
    );
    expect(result.ok).toBeFalse();
    expect(await Bun.file(join(fixture.cwd, "openspec", "changes", "safe-change", "tasks.md")).text()).toBe(before);
  });
});
