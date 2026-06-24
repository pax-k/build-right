# 078: Close Native Step Validation Sprint

Status: complete
Type: validation/release
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove Sprint 006 native per-step validation is complete or explicitly closed with logged blockers
Source under test: native per-step scratch evidence and planning summaries

## Goal

Run the final Sprint 006 audit. Close the sprint only when every native step has
evidence and every failure is resolved, expected/control, or explicitly left as
an actionable blocker.

## Non-Goals

- Delete or rewrite failed-test history.
- Claim customer, production, or external-state validation.
- Mark native per-step proof complete if any step lacks JSONL evidence.

## Required Reading

- planning/sprints/006-codex-native-step-validation.md
- planning/codex-native-step-trial-protocol.md
- planning/codex-native-step-trials.md
- planning/failed-tests.md
- planning/failed-test-summary.md
- planning/tasks/070-define-native-step-trial-protocol.md
- planning/tasks/077-add-native-step-summary-and-failure-feedback.md

## Acceptance Criteria

- [x] Tasks 070-077 are complete with checked acceptance criteria.
- [x] Native step trials 041-067 all have scratch repo evidence.
- [x] `planning/codex-native-step-trials.md` reports every step status.
- [x] `planning/failed-test-summary.md` reports zero actionable open rows, or Sprint 006 is explicitly closed as `failures-logged`.
- [x] Final verification suite passes.
- [x] Sprint 006 task queue and evidence log are updated.
- [x] Final closeout names passed steps, failed/partial steps, verification commands, failure-log changes, blockers, and next fix task if needed.

## Baseline Evidence

Sprint 006 is planned and has no native per-step closeout yet.

## Verification

- `git diff --check`
- `bun test`
- `bun run verify:skill-trials`
- `bun scripts/todo-trial.ts failure-summary`
- `bun scripts/codex-native-step-trials.ts --summary`
- Any native status-audit helper added by task 077

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `git diff --check` | pass | No whitespace errors. |
| 2026-06-24 | `bun test` | pass | 28 tests passed. |
| 2026-06-24 | `bun run verify:skill-trials` | pass | Runs `scripts/verify-skill-trials.ts`; 28 tests passed. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | Failure summary regenerated; eleven actionable native rows remain. |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --summary` | pass | Native summary regenerated for all 27 steps. |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --status-audit` | pass | Audited all 27 native step rows and artifacts. |

## Files Changed

- `planning/tasks/078-close-native-step-validation-sprint.md` - final task closeout evidence.
- `planning/sprints/006-codex-native-step-validation.md` - sprint closed as `failures-logged`.
- `planning/failed-test-summary.md` - final regenerated failure summary.
- `planning/codex-native-step-trials.md` - final native summary.

## Verification Summary

- `git diff --check` - pass.
- `bun test` - pass, 28 tests.
- `bun run verify:skill-trials` - pass, 28 tests.
- `bun scripts/todo-trial.ts failure-summary` - pass.
- `bun scripts/codex-native-step-trials.ts --summary` - pass.
- `bun scripts/codex-native-step-trials.ts --status-audit` - pass, 27 steps.

## Learning Notes

- Proved: every documented Build Right workflow step 041-067 has native Codex JSONL evidence, proof artifacts, and summary status.
- Simulated: none for native invocation; deterministic Sprint 005 fixtures remain separate evidence and are not counted as native proof.
- Test next: fix native manual-trial packet marker failures and rerun affected steps.

## Blockers

- Sprint 006 closes as `failures-logged` because eleven actionable native rows remain: 048, 050-057, 064, and 065.

## Follow-Ups

- Create a fix task to make native Build Right skill runs consistently write manual-trial packets with `Run label:` and `Unproven:` markers before final judgment, then rerun affected steps.
