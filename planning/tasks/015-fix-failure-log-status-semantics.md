# 015: Fix Failure-Log Status Semantics And Stale-Open Rollups

Status: ready
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

- [ ] Define a small status taxonomy for `open`, `resolved`, `expected`,
  `forced-control`, and `needs-triage` style rows.
- [ ] Update summary generation to group expected negative controls separately
  from actionable open bugs.
- [ ] Pair resolution rows with their original failure cluster without deleting
  either row.
- [ ] Preserve append-only failure history and include a clear count of
  historical unresolved rows.
- [ ] Append any failed verifier command from this task to
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

## Learning Notes

- Proved: pending.
- Simulated: pending.
- Test next: whether fixture-based rollup tests catch stale-open regressions.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: failed-test log fields and summary groups
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- planning/tasks/016-test-failure-log-status-semantics.md

