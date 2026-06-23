# 015: Fix Failure-Log Status Semantics And Stale-Open Rollups

Status: complete
Type: tooling/fix
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: distinguish real unresolved bugs from expected negative controls and historical rows that already have appended resolutions
Source under test: repo-local path

## Goal

Update the failure-log summary workflow so open counts represent actionable
unresolved failures, while expected controls and separately resolved historical
rows remain visible.

## Non-Goals

- Delete or rewrite old `planning/failed-tests.md` rows.
- Hide forced failure controls from the history.
- Treat every `open` historical row as fixed without evidence.

## Required Reading

- planning/failed-tests.md
- planning/failed-test-summary.md
- scripts/todo-trial.ts
- planning/tasks/014-add-failed-test-log-feedback-loop.md

## Acceptance Criteria

- [x] Define a small status taxonomy for `open`, `resolved`, `expected`,
  `forced-control`, and `needs-triage` style rows.
- [x] Update summary generation to group expected negative controls separately
  from actionable open bugs.
- [x] Pair resolution rows with their original failure cluster without deleting
  either row.
- [x] Preserve append-only failure history and include a clear count of
  historical unresolved rows.
- [x] Append any failed verifier command from this task to
  `planning/failed-tests.md`.

## Baseline Evidence

`planning/failed-test-summary.md` reports 11 open rows even though several rows
are deliberate negative controls or have later appended resolution evidence.

## Verification

- `bun scripts/todo-trial.ts failure-summary`
- `bun test`
- Inspect `planning/failed-test-summary.md` for separate actionable-open and
  expected-control counts.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | Regenerated summary with actionable-open, historical-resolved, expected/control, and resolved totals. |
| 2026-06-24 | `bun test` | pass | 21 tests passed, including fixture-backed summary semantics. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | Follow-up cleanup: candidate improvements now list only actionable groups; closed/control history moved to a separate inventory. |

## Files Changed

- `scripts/todo-trial.ts` - added failure status taxonomy, same-cluster resolution pairing, and fixture paths for summary generation.
- `scripts/todo-trial.ts` - follow-up cleanup keeps closed/control groups out of the candidate improvement queue.
- `planning/failed-test-summary.md` - regenerated with the new status groups.
- `planning/failed-tests.md` - appended same-cluster resolution rows for historical Sprint 002 failures.

## Verification Summary

- `bun scripts/todo-trial.ts failure-summary` - pass.
- `bun test` - pass.
- `bun run verify:skill-trials` - pass.

## Learning Notes

- Proved: expected controls and historical rows with later same-cluster resolution no longer inflate actionable-open counts or candidate-improvement output.
- Simulated: none for the live log; fixture tests cover additional status combinations.
- Test next: future failure rows should include either an explicit expected-control status or a same-cluster resolution row.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: failed-test log fields and summary groups
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- Completed: planning/tasks/016-test-failure-log-status-semantics.md
