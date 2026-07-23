import { describe, expect, test } from "bun:test";
import { lstat, mkdir, mkdtemp, open, symlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { tryAdvisoryFileLock } from "../src/openspec/atomic-install";
import {
  advanceFeaturePlanning,
  bindFeatureTasks,
  deriveChangeName,
  prepareFeaturePlanning,
  writeFeatureArtifact,
} from "../src/openspec/feature-planning";
import type { PlanningArtifact, PlanningWorkItem } from "../src/openspec/provider-contracts";

const evidence = [{ command: ["test"], exitCode: 0, durationMs: 1, stdoutSummary: "", stderrSummary: "" }];
const artifacts = (statuses: Record<PlanningArtifact["id"], PlanningArtifact["status"]>) =>
  (["proposal", "specs", "design", "tasks"] as const).map((id) => ({
    id,
    outputPath: id === "proposal" ? "proposal.md" : id === "specs" ? "specs/**/*.md" : `${id}.md`,
    status: statuses[id],
    missingDependencies: [],
  }));

function adapter(input: {
  state?: "blocked" | "ready" | "all-done";
  artifacts?: PlanningArtifact[];
  valid?: boolean;
  workItems?: PlanningWorkItem[];
}) {
  return {
    inspect: async ({ change }: { cwd: string; change: string }) => ({
      ok: true as const,
      provider: "openspec" as const,
      providerVersion: "1.6.0",
      change,
      schema: "spec-driven",
      state: input.state ?? "ready",
      artifacts: input.artifacts ?? artifacts({ proposal: "ready", specs: "blocked", design: "blocked", tasks: "blocked" }),
      workItems: [],
      evidence,
    }),
    instructions: async ({ change, artifact }: { cwd: string; change: string; artifact: PlanningArtifact["id"] }) => ({
      ok: true as const,
      provider: "openspec" as const,
      change,
      artifact,
      outputPath: artifact === "specs" ? "specs/**/*.md" : artifact === "proposal" ? "proposal.md" : `${artifact}.md`,
      instruction: `write ${artifact}`,
      template: `# ${artifact}`,
      dependencies: [],
      evidence,
    }),
    validate: async ({ change }: { cwd: string; change: string }) => ({
      ok: true as const,
      provider: "openspec" as const,
      change,
      valid: input.valid ?? true,
      issues: input.valid === false ? ["invalid delta"] : [],
      evidence,
    }),
    applyInstructions: async ({ change }: { cwd: string; change: string }) => ({
      ok: true as const,
      provider: "openspec" as const,
      providerVersion: "1.6.0",
      change,
      schema: "spec-driven",
      state: "ready" as const,
      artifacts: [],
      workItems: input.workItems ?? [{ id: "1.1", title: "Implement behavior", complete: false, sourcePath: `openspec/changes/${change}/tasks.md` }],
      evidence,
    }),
  };
}

async function fixture(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), "build-right-feature-planning-"));
  await mkdir(join(cwd, "openspec", "changes"), { recursive: true });
  await mkdir(join(cwd, "openspec", "specs"));
  await Bun.write(join(cwd, "openspec", "config.yaml"), "schema: spec-driven\n");
  await mkdir(join(cwd, "tasks", "issues"), { recursive: true });
  await Bun.write(join(cwd, "tasks", "sprint-0.md"), "# Sprint 0\n\nStatus: active\n\n## Tasks\n\n| ID | Title | Status | Evidence |\n| --- | --- | --- | --- |\n");
  return cwd;
}

describe("managed feature planning", () => {
  test("derives stable bounded names and rejects empty, control, and oversized requests", () => {
    const first = deriveChangeName("Passwordless authentication");
    expect(first).toBe(deriveChangeName("Passwordless authentication"));
    expect(first).toMatch(/^passwordless-authentication-[a-f0-9]{10}$/);
    expect(deriveChangeName("")).toBeNull();
    expect(deriveChangeName("bad\u0000request")).toBeNull();
    expect(deriveChangeName("x".repeat(2_001))).toBeNull();
  });

  test("prepares a missing change once and resumes an existing deterministic change", async () => {
    const cwd = await fixture();
    let creates = 0;
    const orchestrator = {
      createChange: async ({ change }: { cwd: string; change: string }) => {
        creates += 1;
        await mkdir(join(cwd, "openspec", "changes", change));
        return { ok: true as const, mutation: "create-change" as const, change, state: "created" as const, evidence: [] };
      },
    };
    const first = await prepareFeaturePlanning({ cwd, feature: "Add exports" }, { adapter: adapter({}), orchestrator });
    const second = await prepareFeaturePlanning({ cwd, feature: "Add exports" }, { adapter: adapter({}), orchestrator });
    expect(first.ok && first.action).toBe("write-artifact");
    expect(second.ok && second.action).toBe("write-artifact");
    expect(creates).toBe(1);
  });

  test("fails closed for missing roots, incomplete graphs, and invalid strict validation", async () => {
    const missing = await prepareFeaturePlanning({ cwd: await mkdtemp(join(tmpdir(), "br-missing-")), feature: "Feature" }, { adapter: adapter({}) });
    expect(missing.ok).toBeFalse();
    const cwd = await fixture();
    const incomplete = await advanceFeaturePlanning({
      cwd,
      change: "safe-change",
    }, adapter({ state: "blocked", artifacts: artifacts({ proposal: "blocked", specs: "blocked", design: "blocked", tasks: "blocked" }) }));
    expect(incomplete.ok).toBeFalse();
    const invalid = await advanceFeaturePlanning({ cwd, change: "safe-change" }, adapter({
      state: "all-done",
      artifacts: artifacts({ proposal: "done", specs: "done", design: "done", tasks: "done" }),
      valid: false,
    }));
    expect(invalid.ok).toBeFalse();
    if (!invalid.ok) expect(invalid.code).toBe("validation-failed");

    const externalRoot = await mkdtemp(join(tmpdir(), "br-external-openspec-"));
    await mkdir(join(externalRoot, "changes"));
    await mkdir(join(externalRoot, "specs"));
    await Bun.write(join(externalRoot, "config.yaml"), "schema: spec-driven\n");
    const externalized = await mkdtemp(join(tmpdir(), "br-externalized-project-"));
    await symlink(externalRoot, join(externalized, "openspec"));
    const externalizedResult = await prepareFeaturePlanning(
      { cwd: externalized, feature: "Feature" },
      { adapter: adapter({}) },
    );
    expect(externalizedResult.ok).toBeFalse();
  });

  test("creates thin ordered bindings idempotently and makes only the first task ready", async () => {
    const cwd = await fixture();
    await mkdir(join(cwd, "src"), { recursive: true });
    await Bun.write(join(cwd, "src", "product.ts"), "export const untouched = true;\n");
    const workItems = [
      { id: "1.1", title: "Implement behavior", complete: false, sourcePath: "tasks.md" },
      { id: "1.2", title: "Verify behavior", complete: false, sourcePath: "tasks.md" },
    ];
    const readyAdapter = adapter({
      state: "all-done",
      artifacts: artifacts({ proposal: "done", specs: "done", design: "done", tasks: "done" }),
      workItems,
    });
    const first = await bindFeatureTasks({ cwd, change: "safe-change", sprint: "tasks/sprint-0.md" }, readyAdapter);
    const second = await bindFeatureTasks({ cwd, change: "safe-change", sprint: "tasks/sprint-0.md" }, readyAdapter);
    expect(first.ok && first.action).toBe("ready-for-execution");
    expect(second.ok && second.action).toBe("ready-for-execution");
    const files = [...new Bun.Glob("tasks/issues/*.md").scanSync({ cwd })].sort();
    expect(files).toHaveLength(2);
    const texts = await Promise.all(files.map((path) => Bun.file(join(cwd, path)).text()));
    expect(texts[0]).toContain("Status: ready");
    expect(texts[1]).toContain("Status: planned");
    expect(texts[0]).toContain("Planning provider: openspec\nChange ref: safe-change\nWork item ref: 1.1");
    const sprint = await Bun.file(join(cwd, "tasks", "sprint-0.md")).text();
    expect(sprint.match(/tasks\/issues\//g)).toHaveLength(2);
    expect(await Bun.file(join(cwd, "src", "product.ts")).text()).toBe("export const untouched = true;\n");
  });

  test("publishes only the dependency-ready canonical artifact atomically", async () => {
    const cwd = await fixture();
    const change = "safe-change";
    await mkdir(join(cwd, "openspec", "changes", change));
    await Bun.write(join(cwd, "src-product.ts"), "untouched\n");
    const stateful = adapter({});
    stateful.inspect = async () => {
      const proposalExists = await Bun.file(join(cwd, "openspec", "changes", change, "proposal.md")).exists();
      return {
        ok: true as const,
        provider: "openspec" as const,
        providerVersion: "1.6.0",
        change,
        schema: "spec-driven",
        state: "ready" as const,
        artifacts: proposalExists
          ? artifacts({ proposal: "done", specs: "ready", design: "ready", tasks: "blocked" })
          : artifacts({ proposal: "ready", specs: "blocked", design: "blocked", tasks: "blocked" }),
        workItems: [],
        evidence,
      };
    };
    const written = await writeFeatureArtifact({
      cwd,
      change,
      artifact: "proposal",
      content: "## Why\n\nBounded planning content.\n",
    }, stateful);
    expect(written.ok).toBeTrue();
    if (written.ok) expect(written.action).toBe("write-artifact");
    expect(await Bun.file(join(cwd, "openspec", "changes", change, "proposal.md")).text()).toContain("Bounded planning content");
    expect(await Bun.file(join(cwd, "src-product.ts")).text()).toBe("untouched\n");

    const repeated = await writeFeatureArtifact({
      cwd,
      change,
      artifact: "proposal",
      content: "overwrite",
    }, stateful);
    expect(repeated.ok).toBeFalse();
  });

  test("artifact writer rejects symlink outputs and concurrent overwrites", async () => {
    const cwd = await fixture();
    const change = "safe-change";
    const changeRoot = join(cwd, "openspec", "changes", change);
    await mkdir(changeRoot);
    const external = join(await mkdtemp(join(tmpdir(), "br-artifact-external-")), "proposal.md");
    await Bun.write(external, "external\n");
    await symlink(external, join(changeRoot, "proposal.md"));
    const linked = await writeFeatureArtifact({ cwd, change, artifact: "proposal", content: "malicious" }, adapter({}));
    expect(linked.ok).toBeFalse();
    expect(await Bun.file(external).text()).toBe("external\n");

    const raceCwd = await fixture();
    await mkdir(join(raceCwd, "openspec", "changes", change));
    const results = await Promise.all([
      writeFeatureArtifact({ cwd: raceCwd, change, artifact: "proposal", content: "first" }, adapter({})),
      writeFeatureArtifact({ cwd: raceCwd, change, artifact: "proposal", content: "second" }, adapter({})),
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    const content = await Bun.file(join(raceCwd, "openspec", "changes", change, "proposal.md")).text();
    expect(["first", "second"]).toContain(content);
  });

  test("spec writer permits only proposal-declared capability paths", async () => {
    const cwd = await fixture();
    const change = "safe-change";
    const changeRoot = join(cwd, "openspec", "changes", change);
    await mkdir(changeRoot);
    await Bun.write(join(changeRoot, "proposal.md"), "### New Capabilities\n\n- `health-status`: Health behavior\n");
    const specsReady = adapter({
      state: "ready",
      artifacts: artifacts({ proposal: "done", specs: "ready", design: "ready", tasks: "blocked" }),
    });
    const written = await writeFeatureArtifact({
      cwd,
      change,
      artifact: "specs",
      capability: "health-status",
      content: "## ADDED Requirements\n",
    }, specsReady);
    expect(written.ok).toBeTrue();
    expect(await Bun.file(join(changeRoot, "specs", "health-status", "spec.md")).exists()).toBeTrue();

    const rejected = await writeFeatureArtifact({
      cwd,
      change,
      artifact: "specs",
      capability: "undeclared",
      content: "## ADDED Requirements\n",
    }, specsReady);
    expect(rejected.ok).toBeFalse();
    expect(await Bun.file(join(changeRoot, "specs", "undeclared")).exists()).toBeFalse();
  });

  test("publishes zero, partial, and complete multi-capability spec sets fail-closed/atomically", async () => {
    const specsReady = adapter({
      state: "ready",
      artifacts: artifacts({ proposal: "done", specs: "ready", design: "ready", tasks: "blocked" }),
    });

    const zeroCwd = await fixture();
    await mkdir(join(zeroCwd, "openspec", "changes", "zero-change"));
    await Bun.write(join(zeroCwd, "openspec", "changes", "zero-change", "proposal.md"), "### New Capabilities\n\nNone.\n");
    expect((await writeFeatureArtifact({
      cwd: zeroCwd,
      change: "zero-change",
      artifact: "specs",
      specs: [],
    }, specsReady)).ok).toBeFalse();

    const cwd = await fixture();
    const changeRoot = join(cwd, "openspec", "changes", "multi-change");
    await mkdir(changeRoot);
    await Bun.write(join(changeRoot, "proposal.md"), "- `alpha-capability`: Alpha\n- `beta-capability`: Beta\n");
    const partial = await writeFeatureArtifact({
      cwd,
      change: "multi-change",
      artifact: "specs",
      specs: [{ capability: "alpha-capability", content: "alpha" }],
    }, specsReady);
    expect(partial.ok).toBeFalse();
    expect(await Bun.file(join(changeRoot, "specs")).exists()).toBeFalse();

    const complete = await writeFeatureArtifact({
      cwd,
      change: "multi-change",
      artifact: "specs",
      specs: [
        { capability: "alpha-capability", content: "alpha" },
        { capability: "beta-capability", content: "beta" },
      ],
    }, specsReady);
    expect(complete.ok).toBeTrue();
    expect(await Bun.file(join(changeRoot, "specs", "alpha-capability", "spec.md")).text()).toBe("alpha");
    expect(await Bun.file(join(changeRoot, "specs", "beta-capability", "spec.md")).text()).toBe("beta");
  });

  test("enforces per-spec bounds in UTF-8 bytes at the exact multibyte boundary", async () => {
    const specsReady = adapter({
      state: "ready",
      artifacts: artifacts({ proposal: "done", specs: "ready", design: "ready", tasks: "blocked" }),
    });
    const exactCwd = await fixture();
    const exactRoot = join(exactCwd, "openspec", "changes", "exact-change");
    await mkdir(exactRoot);
    await Bun.write(join(exactRoot, "proposal.md"), "- `emoji-capability`: Emoji\n");
    const exact = await writeFeatureArtifact({
      cwd: exactCwd,
      change: "exact-change",
      artifact: "specs",
      specs: [{ capability: "emoji-capability", content: "😀".repeat(65_536) }],
    }, specsReady);
    expect(exact.ok).toBeTrue();

    const overCwd = await fixture();
    const overRoot = join(overCwd, "openspec", "changes", "over-change");
    await mkdir(overRoot);
    await Bun.write(join(overRoot, "proposal.md"), "- `emoji-capability`: Emoji\n");
    const over = await writeFeatureArtifact({
      cwd: overCwd,
      change: "over-change",
      artifact: "specs",
      specs: [{ capability: "emoji-capability", content: "😀".repeat(65_537) }],
    }, specsReady);
    expect(over.ok).toBeFalse();
    expect(await Bun.file(join(overRoot, "specs")).exists()).toBeFalse();
  });

  test("rejects unsafe sprint paths, duplicate bindings, and unsafe provider titles", async () => {
    const cwd = await fixture();
    const ready = {
      state: "all-done" as const,
      artifacts: artifacts({ proposal: "done", specs: "done", design: "done", tasks: "done" }),
    };
    expect((await bindFeatureTasks({ cwd, change: "safe-change", sprint: "../outside.md" }, adapter(ready))).ok).toBeFalse();
    await Bun.write(join(cwd, "tasks", "issues", "001-one.md"), "# 001: One\n\nStatus: ready\nChange ref: safe-change\nWork item ref: 1.1\n");
    await Bun.write(join(cwd, "tasks", "issues", "002-two.md"), "# 002: Two\n\nStatus: planned\nChange ref: safe-change\nWork item ref: 1.1\n");
    const duplicate = await bindFeatureTasks({ cwd, change: "safe-change", sprint: "tasks/sprint-0.md" }, adapter(ready));
    expect(duplicate.ok).toBeFalse();

    const other = await fixture();
    const unsafe = await bindFeatureTasks({ cwd: other, change: "safe-change", sprint: "tasks/sprint-0.md" }, adapter({
      ...ready,
      workItems: [{ id: "1.1", title: "bad | title", complete: false, sourcePath: "tasks.md" }],
    }));
    expect(unsafe.ok).toBeFalse();

    const partial = await fixture();
    await Bun.write(join(partial, "tasks", "issues", "001-partial.md"), "# 001: Partial\n\nStatus: ready\nChange ref: safe-change\nWork item ref: 1\n");
    expect((await bindFeatureTasks({ cwd: partial, change: "safe-change", sprint: "tasks/sprint-0.md" }, adapter(ready))).ok).toBeFalse();

    const multipleReady = await fixture();
    await Bun.write(join(multipleReady, "tasks", "sprint-0.md"), "# Sprint 0\n\nStatus: active\n\n## Tasks\n\n| ID | Title | Status | Evidence |\n| --- | --- | --- | --- |\n| 001 | One | ready | tasks/issues/001-one.md |\n| 002 | Two | active | tasks/issues/002-two.md |\n");
    expect((await bindFeatureTasks({ cwd: multipleReady, change: "safe-change", sprint: "tasks/sprint-0.md" }, adapter(ready))).ok).toBeFalse();

    const untrackedReadyBinding = await fixture();
    await Bun.write(join(untrackedReadyBinding, "tasks", "sprint-0.md"), "# Sprint 0\n\nStatus: active\n\n## Tasks\n\n| ID | Title | Status | Evidence |\n| --- | --- | --- | --- |\n| 099 | Other | ready | tasks/issues/099-other.md |\n");
    await Bun.write(join(untrackedReadyBinding, "tasks", "issues", "001-bound.md"), "# 001: Bound\n\nStatus: ready\nPlanning provider: openspec\nChange ref: safe-change\nWork item ref: 1\n");
    expect((await bindFeatureTasks({
      cwd: untrackedReadyBinding,
      change: "safe-change",
      sprint: "tasks/sprint-0.md",
    }, adapter(ready))).ok).toBeFalse();
  });

  test("rejects externalized task surfaces", async () => {
    const cwd = await fixture();
    const external = await mkdtemp(join(tmpdir(), "br-external-"));
    const taskRoot = join(cwd, "tasks", "issues");
    await Bun.$`rm -r ${taskRoot}`.quiet();
    await symlink(external, taskRoot);
    const result = await bindFeatureTasks({ cwd, change: "safe-change", sprint: "tasks/sprint-0.md" }, adapter({
      state: "all-done",
      artifacts: artifacts({ proposal: "done", specs: "done", design: "done", tasks: "done" }),
    }));
    expect(result.ok).toBeFalse();

    const missingIssues = await fixture();
    const missingTaskRoot = join(missingIssues, "tasks", "issues");
    await Bun.$`rm -r ${missingTaskRoot}`.quiet();
    const missingResult = await bindFeatureTasks({
      cwd: missingIssues,
      change: "safe-change",
      sprint: "tasks/sprint-0.md",
    }, adapter({
      state: "all-done",
      artifacts: artifacts({ proposal: "done", specs: "done", design: "done", tasks: "done" }),
    }));
    expect(missingResult.ok).toBeFalse();
    expect(await lstat(missingTaskRoot).then(() => true).catch(() => false)).toBeFalse();

    const lockSymlink = await fixture();
    const externalLock = join(external, "external-lock");
    await Bun.write(externalLock, "unchanged\n");
    await symlink(externalLock, join(lockSymlink, "tasks", ".build-right-feature-planning.lock"));
    const lockResult = await bindFeatureTasks({
      cwd: lockSymlink,
      change: "safe-change",
      sprint: "tasks/sprint-0.md",
    }, adapter({
      state: "all-done",
      artifacts: artifacts({ proposal: "done", specs: "done", design: "done", tasks: "done" }),
    }));
    expect(lockResult.ok).toBeFalse();
    expect(await Bun.file(externalLock).text()).toBe("unchanged\n");
  });

  test("serializes concurrent cross-change bindings and preserves one sprint-ready task", async () => {
    const cwd = await fixture();
    const ready = {
      state: "all-done" as const,
      artifacts: artifacts({ proposal: "done", specs: "done", design: "done", tasks: "done" }),
      workItems: [{ id: "1", title: "Implement one behavior", complete: false, sourcePath: "tasks.md" }],
    };
    const slow = adapter(ready);
    const originalInspect = slow.inspect;
    slow.inspect = async (input) => {
      await Bun.sleep(25);
      return originalInspect(input);
    };
    const [left, right] = await Promise.all([
      bindFeatureTasks({ cwd, change: "first-change", sprint: "tasks/sprint-0.md" }, slow),
      bindFeatureTasks({ cwd, change: "second-change", sprint: "tasks/sprint-0.md" }, slow),
    ]);
    expect([left.ok, right.ok].filter(Boolean)).toHaveLength(1);
    const failedChange = left.ok ? "second-change" : "first-change";
    const retried = await bindFeatureTasks({ cwd, change: failedChange, sprint: "tasks/sprint-0.md" }, adapter(ready));
    expect(retried.ok).toBeTrue();
    const sprint = await Bun.file(join(cwd, "tasks", "sprint-0.md")).text();
    expect(sprint.match(/\|\s*ready\s*\|/g)).toHaveLength(1);
    expect(sprint.match(/tasks\/issues\//g)).toHaveLength(2);
  });

  test("recovers binding availability when an advisory lock owner exits", async () => {
    const cwd = await fixture();
    const lock = await open(join(cwd, "tasks", ".build-right-feature-planning.lock"), "a+", 0o600);
    expect(tryAdvisoryFileLock(lock.fd)).toBeTrue();
    const ready = adapter({
      state: "all-done",
      artifacts: artifacts({ proposal: "done", specs: "done", design: "done", tasks: "done" }),
    });
    const blocked = await bindFeatureTasks({ cwd, change: "safe-change", sprint: "tasks/sprint-0.md" }, ready);
    expect(blocked.ok).toBeFalse();
    await lock.close();
    const recovered = await bindFeatureTasks({ cwd, change: "safe-change", sprint: "tasks/sprint-0.md" }, ready);
    expect(recovered.ok).toBeTrue();
  });
});
