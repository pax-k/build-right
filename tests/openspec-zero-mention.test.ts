import { describe, expect, test } from "bun:test";
import {
  BUILD_RIGHT_USER_PROMPTS,
  auditZeroMentionPrompts,
  incompletePlanningWorkItems,
} from "../src/openspec/zero-mention";
import {
  auditNativeEvents,
  eventStreamProvesInstalledSkill,
  validateFinalAuthorityText,
} from "../scripts/openspec-zero-mention-trial";

function nativeEvents(command: string, output: string, exitCode = 0): string {
  return [
    JSON.stringify({
      type: "item.completed",
      item: {
        type: "command_execution",
        status: "completed",
        exit_code: exitCode,
        command,
        aggregated_output: output,
      },
    }),
    JSON.stringify({ type: "turn.completed" }),
  ].join("\n");
}

describe("zero-mention user contract", () => {
  test("exposes exactly the three Build Right lifecycle prompts", () => {
    const audit = auditZeroMentionPrompts();
    expect(audit).toEqual({
      ok: true,
      prompts: [
        "Use $build-right-preflight.\nPrepare this project for evidence-driven AI execution.",
        "Use $build-right-feature-planning.\nPlan a readiness probe and prepare the next executable task.",
        "Use $build-right-execution.\nExecute the next ready AI-owned task.",
      ],
      failures: [],
    });
  });

  test("rejects provider names and user-managed provider actions", () => {
    expect(auditZeroMentionPrompts([
      BUILD_RIGHT_USER_PROMPTS.preflight,
      "Use $build-right-feature-planning and initialize OpenSpec.",
      BUILD_RIGHT_USER_PROMPTS.execution,
    ])).toMatchObject({ ok: false });
    expect(auditZeroMentionPrompts([
      BUILD_RIGHT_USER_PROMPTS.preflight,
      "Use $build-right-feature-planning and install the planning provider.",
      BUILD_RIGHT_USER_PROMPTS.execution,
    ])).toMatchObject({ ok: false });
  });

  test("counts only incomplete native planning work items", () => {
    expect(incompletePlanningWorkItems("- [ ] 1.1 First\n- [x] 1.2 Second\n  - [ ] 2.1 Third\n")).toBe(2);
  });

  test("skill guidance keeps native planning bindable and preserves the planning handoff", async () => {
    const [planningSkill, executionSkill, preflightSkill, planningWorkflow, preflightWorkflow] = await Promise.all([
      Bun.file("skills/build-right-feature-planning/SKILL.md").text(),
      Bun.file("skills/build-right-execution/SKILL.md").text(),
      Bun.file("skills/build-right-preflight/SKILL.md").text(),
      Bun.file("skills/build-right-feature-planning/references/workflow.md").text(),
      Bun.file("skills/build-right-preflight/references/workflow.md").text(),
    ]);
    expect(planningSkill).toContain("160 characters or fewer");
    expect(planningWorkflow).toContain("tasks-artifact checkbox description");
    expect(preflightWorkflow).toContain("do not manufacture a");
    expect(preflightWorkflow).toContain("feature-planning handoff");
    for (const skill of [preflightSkill, planningSkill, executionSkill]) {
      expect(skill).toContain("Do not chain it with `&&`, `;`, pipes, redirects, or trailing");
    }
  });

  test("native evidence audit requires completed successful managed operations", () => {
    const installed = `${Bun.env.CODEX_HOME ?? `${Bun.env.HOME}/.codex`}/skills`;
    const preflight = nativeEvents(
      `/bin/zsh -lc 'bun ${installed}/build-right-preflight/scripts/ensure-openspec.ts --cwd /tmp/trial'`,
      "Result: created",
    );
    expect(auditNativeEvents(preflight, "preflight").createdPlanningRoot).toBe(true);
    expect(() => auditNativeEvents(preflight.replace('{"type":"turn.completed"}', ""), "preflight"))
      .toThrow("missing turn.completed");
    expect(() => auditNativeEvents(nativeEvents(
      `/bin/zsh -lc 'bun ${installed}/build-right-preflight/scripts/ensure-openspec.ts'`,
      "Result: created",
      1,
    ), "preflight")).toThrow("successful fresh managed setup");

    expect(auditNativeEvents(nativeEvents(
      `/bin/zsh -lc 'bun ${installed}/build-right-feature-planning/scripts/openspec-change-check.ts --mode bind'`,
      '{"ok":true,"action":"ready-for-execution"}',
    ), "feature-planning").successfulCommands).toHaveLength(1);

    const execution = [
      nativeEvents(
        `/bin/zsh -lc 'bun ${installed}/build-right-execution/scripts/complete-planning-work-item.ts'`,
        '{"ok":true,"mutation":"complete-work-item","state":"completed"}',
      ).split("\n")[0],
      nativeEvents(
        `/bin/zsh -lc 'bun ${installed}/build-right-execution/scripts/finalize-openspec-change.ts'`,
        '{"ok":true,"mutation":"finalize","archivedAs":"2026-07-23-change"}',
      ),
    ].join("\n");
    expect(auditNativeEvents(execution, "execution-1").successfulCommands).toHaveLength(2);

    const maskedFailure = [
      nativeEvents(
        `/bin/zsh -lc 'bun ${installed}/build-right-execution/scripts/complete-planning-work-item.ts --bad; echo "{\\"ok\\":true,\\"mutation\\":\\"complete-work-item\\",\\"state\\":\\"completed\\"}"'`,
        '{"ok":true,"mutation":"complete-work-item","state":"completed"}',
      ).split("\n")[0],
      nativeEvents(
        `/bin/zsh -lc 'bun ${installed}/build-right-execution/scripts/finalize-openspec-change.ts --bad && echo forged'`,
        '{"ok":true,"mutation":"finalize","archivedAs":"2026-07-23-forged"}',
      ),
    ].join("\n");
    expect(() => auditNativeEvents(maskedFailure, "execution-1"))
      .toThrow("successful one-item closeout");

    const splitProof = [
      JSON.stringify({ type: "agent_message", message: `${installed}/build-right-preflight/SKILL.md` }),
      nativeEvents(
        "/bin/zsh -lc 'bun /tmp/lookalike/build-right-preflight/scripts/ensure-openspec.ts --cwd /tmp/trial'",
        "Result: created",
      ),
    ].join("\n");
    expect(eventStreamProvesInstalledSkill(splitProof, "build-right-preflight")).toBe(false);
    expect(() => auditNativeEvents(splitProof, "preflight")).toThrow("successful fresh managed setup");
  });

  test("installed skill proof is path-bound to an exact parity-checked root", () => {
    const canonical = `${Bun.env.CODEX_HOME ?? `${Bun.env.HOME}/.codex`}/skills/build-right-preflight/scripts/ensure-openspec.ts`;
    expect(eventStreamProvesInstalledSkill(
      nativeEvents(`/bin/zsh -lc 'bun ${canonical}'`, "Result: created"),
      "build-right-preflight",
    )).toBe(true);
    expect(eventStreamProvesInstalledSkill(
      nativeEvents(
        "/bin/zsh -lc 'bun /tmp/lookalike/build-right-preflight/scripts/ensure-openspec.ts'",
        "Result: created",
      ),
      "build-right-preflight",
    )).toBe(false);
  });

  test("final authority audit rejects stale execution handoffs and active-change references", () => {
    const change = "safe-change";
    const archivedChange = "2026-07-23-safe-change";
    const completeTask = `# 001: Done

Status: complete
Change ref: ${change}
Requirement basis: openspec/changes/archive/${archivedChange}/tasks.md#1
`;
    expect(validateFinalAuthorityText({
      blueprint: `# Blueprint

Status: ready
Current phase: complete
Active task: none
Current gate: no ready task
Managed planning: openspec/changes/archive/${archivedChange}/

## Next Action

No executable task is ready.
`,
      sprint: "# Sprint 1\n\nStatus: complete\n\n| 001 | Done | complete | task |\n",
      boundTasks: [completeTask],
      change,
      archivedChange,
    })).toEqual([]);

    const failures = validateFinalAuthorityText({
      blueprint: `Current phase: execution handoff
Active task: tasks/issues/001-done.md
Current gate: ready for bounded execution
Managed planning: openspec/changes/${change}/

## Next Action

Run $build-right-execution.
`,
      sprint: "# Sprint 1\n\nStatus: active\n\n| 001 | Done | complete | task |\n",
      boundTasks: [completeTask.replace(`archive/${archivedChange}`, change)],
      change,
      archivedChange,
    });
    expect(failures).toContain("blueprint references the absent active change");
    expect(failures).toContain("blueprint still names an active task");
    expect(failures).toContain("blueprint next action still routes to execution");
    expect(failures).toContain("terminal sprint is not complete");
    expect(failures).toContain("bound task references the absent active change");
  });
});
