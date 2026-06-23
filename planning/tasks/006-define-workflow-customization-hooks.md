# 006: Define Workflow Customization Hooks

Status: complete
Type: docs/contract
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: moderate
Learning objective: allow users to change workflow policy, such as atomic commits after each task, without weakening the backbone gates
Source under test: repo-local path

## Goal

Define a small hook vocabulary for user-customizable workflow policy.

## Non-Goals

- Build a workflow DSL.
- Execute hooks automatically.
- Let customization bypass stop/ask gates, ownership checks, evidence capture,
  source-under-test checks, or verification.
- Add opinionated defaults for every possible team workflow.

## Required Reading

- planning/tasks/001-define-workflow-backbone-contract.md
- planning/tasks/003-expand-testing-matrix.md
- skills/build-right-preflight/assets/templates/docs/execution-rules.md
- skills/build-right-execution/references/gates.md
- skills/build-right-execution/references/workflow.md
- README.md

## Acceptance Criteria

- [x] A reference or template section defines supported customization points:
  `before-task-select`, `after-task-intake`, `before-edit`, `after-verify`,
  `after-evidence-recorded`, `after-task-complete`, and `before-next-task`.
- [x] The hook model includes examples:
  atomic commits after each task, screenshot proof for UI work, no web research,
  stronger verification for release tasks, and mandatory decision-log entries
  for architecture changes.
- [x] The hook model marks forbidden changes:
  skip resolver, skip founder gate, ignore external-state gate, skip evidence,
  skip verification, auto-publish, or widen task scope.
- [x] Existing `docs/execution-rules.md` guidance explains where project-local
  workflow customization should live.
- [x] Tests assert that customization language is additive and still names the
  invariant gates.

## Baseline Evidence

Current customization behavior is implicit in:

- skills/build-right-preflight/assets/templates/docs/execution-rules.md
- skills/build-right-execution/references/workflow.md
- skills/build-right-execution/references/gates.md

## Verification

- `bun test`
- `bun run verify:skill-trials`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | Gate check for tasks 002 and 003 | pass | Both prerequisite tasks were marked complete and verified before implementing hooks. |
| 2026-06-23 | `workflow-backbone.md` inspection | pass | Defines the seven hook names, additive examples, and forbidden gate-bypass changes. |
| 2026-06-23 | `skills/build-right-preflight/assets/templates/docs/execution-rules.md` inspection | pass | Adds project-local Workflow Customization section and supported hook table. |
| 2026-06-23 | `bun test` | pass | 14 tests passed after adding hook marker assertions. |
| 2026-06-23 | `bun run verify:skill-trials` | pass | 14 tests passed through the compatibility wrapper after syncing the installed preflight skill copy. |
| 2026-06-23 | Installed skill parity sync | pass | Synced `skills/build-right-preflight/` to `$HOME/.codex/skills/build-right-preflight/` because this task changed an installed skill template. |
| 2026-06-23 | Required review trigger check | skipped | Skill template/workflow contract changed; subagent review tooling requires explicit user-requested delegation, so substituted marker tests, direct inspection, and both verification commands. |

## Files Changed

- `workflow-backbone.md` - defines supported hooks, additive examples, and forbidden changes.
- `skills/build-right-preflight/assets/templates/docs/execution-rules.md` - documents where project-local workflow customization lives.
- `tests/skill-trials.test.ts` - asserts hook vocabulary and invariant gate markers.
- `planning/sprints/001-workflow-backbone-foundation.md` - marks task 006 complete.
- `planning/tasks/006-define-workflow-customization-hooks.md` - records evidence and completion state.

## Verification Summary

- `bun test` - pass, 14 tests.
- `bun run verify:skill-trials` - pass, 14 tests through compatibility wrapper.

## Learning Notes

- Proved: project-local workflow customization can be expressed as additive hook policy without weakening the invariant gates.
- Simulated: hooks are documented policy only; no automatic hook executor or DSL was added.
- Test next: whether a later helper should lint customization hooks.

## Blockers

- None.

## Follow-Ups

- None yet.
