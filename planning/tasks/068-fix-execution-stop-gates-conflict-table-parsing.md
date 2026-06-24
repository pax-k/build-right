# 068: Fix Execution Stop-Gates Conflict Table Parsing

Status: complete
Type: bugfix
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove execution stop-gates ignore Markdown table separator rows when scanning conflicts
Source under test: repo-local path

## Goal

Fix `skills/build-right-execution/scripts/execution-check.ts --mode stop-gates`
so a standard resolved `docs/conflicts.md` Markdown table does not produce the
false gate `open conflict: ---`.

## Non-Goals

- Delete or rewrite the original Sprint 005 failure rows.
- Redesign conflict tracking.
- Suppress real open conflicts.

## Required Reading

- planning/failed-tests.md
- planning/sprints/005-skill-step-validation.md
- skills/build-right-execution/scripts/execution-check.ts
- skills/build-right-execution/references/gates.md

## Acceptance Criteria

- [x] Add or update coverage proving separator rows are ignored.
- [x] Preserve detection of real open conflicts.
- [x] Rerun the affected Sprint 005 execution-step trials or a focused equivalent.
- [x] Append resolution rows to `planning/failed-tests.md`; do not delete original failure rows.
- [x] Regenerate `planning/failed-test-summary.md`.

## Baseline Evidence

Sprint 005 step trials for tasks 058-067 logged that
`execution-check.ts --mode stop-gates` reported `open conflict: ---` for a
resolved conflicts table.

## Verification

- `bun test`
- `bun scripts/sprint005-step-trials.ts` or focused stop-gates fixture
- `bun scripts/todo-trial.ts failure-summary`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `skills/build-right-execution/scripts/execution-check.ts` | complete | Stop-gates now parses only the `## Conflicts` table, skips Markdown separator rows, and evaluates conflicts by header name. |
| 2026-06-24 | `tests/skill-trials.test.ts` | pass | Added stop-gates regression coverage for resolved conflict tables and real open conflicts. |
| 2026-06-24 | `bun scripts/sprint005-step-trials.ts` | pass | Reran tasks 041-067; execution tasks 058-067 produced `simulated-only` without `open conflict: ---`. |
| 2026-06-24 | `planning/failed-tests.md` | resolved | Appended resolution rows for the original 058-067 `execution-stop-gates` failures. |
| 2026-06-24 | `planning/failed-test-summary.md` | pass | Regenerated summary reports 0 actionable open rows. |

## Files Changed

- `skills/build-right-execution/scripts/execution-check.ts` - fixed stop-gates conflict table parsing.
- `/Users/pax/.codex/skills/build-right-execution/scripts/execution-check.ts` - synced installed user-scope execution skill for parity.
- `tests/skill-trials.test.ts` - added separator-row and real-open-conflict regressions.
- `planning/failed-tests.md` - appended resolution rows for tasks 058-067.
- `planning/failed-test-summary.md` - regenerated after resolution rows.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 now complete after rerun.
- `planning/tasks/058-test-execution-task-selection.md` through `planning/tasks/067-test-execution-closeout.md` - refreshed execution-step evidence from the passing rerun.
- `planning/tasks/068-fix-execution-stop-gates-conflict-table-parsing.md` - closed this fix task.

## Verification Summary

- `bun test tests/skill-trials.test.ts` - pass, 26 pass / 0 fail.
- `bun scripts/sprint005-step-trials.ts` - pass, tasks 041-067 all `simulated-only`.
- `bun scripts/todo-trial.ts failure-summary` - pass, regenerated summary with 0 actionable open rows.
- `git diff --check` - pass.
- `bun test` - pass, 26 pass / 0 fail.
- `bun run verify:skill-trials` - pass, 26 pass / 0 fail.
- `bun scripts/todo-trial.ts status-audit --sprint planning/sprints/005-skill-step-validation.md --task-start 041 --task-end 067 --allowed-statuses complete` - pass.

## Learning Notes

- Proved: the stop-gates helper no longer misclassifies the Markdown separator row as `open conflict: ---`.
- Proved: real open conflict rows still produce `open conflict: <name>`.
- Simulated: provider-native skill invocation remains outside Sprint 005 proof; scratch transcripts are agent-agnostic fixtures.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
