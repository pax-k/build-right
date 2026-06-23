# 016: Test Failure-Log Status Semantics And Rollups

Status: complete
Type: testing/regression
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove failure-summary behavior with controlled log fixtures instead of relying only on the live append-only log
Source under test: repo-local path

## Goal

Add Bun regression tests that prove the failure summary separates actionable
open failures, expected negative controls, forced controls, and resolved
historical rows.

## Non-Goals

- Snapshot-test the whole summary markdown.
- Require editing historical failure rows.
- Convert the failure log into a database.

## Required Reading

- planning/tasks/015-fix-failure-log-status-semantics.md
- planning/failed-tests.md
- scripts/todo-trial.ts
- tests/skill-trials.test.ts

## Acceptance Criteria

- [x] Add a fixture or helper path that runs summary logic against a temporary
  failure log.
- [x] Test at least one unresolved row, one expected negative row, one forced
  control row, and one resolved row pair.
- [x] Test that actionable-open counts exclude expected controls.
- [x] Test that the live `planning/failed-tests.md` can still generate a
  summary.
- [x] Append failures to `planning/failed-tests.md` if any regression command
  fails during execution.

## Baseline Evidence

The current summary path is exercised through the live log, but it does not have
isolated fixtures for status semantics.

## Verification

- `bun test`
- `bun scripts/todo-trial.ts failure-summary`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun test` | pass | Added `failure summary separates actionable, expected, forced, and resolved rows` fixture regression. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | Live summary still generates after fixture support was added. |

## Files Changed

- `tests/skill-trials.test.ts` - added temporary failure-log fixture regression coverage.
- `scripts/todo-trial.ts` - exposed `--failure-log` and `--summary-output` fixture paths.

## Verification Summary

- `bun test` - pass.
- `bun scripts/todo-trial.ts failure-summary` - pass.

## Learning Notes

- Proved: temporary logs can exercise actionable, expected, forced, resolved, and historical-resolved summary behavior without mutating the live log.
- Simulated: none.
- Test next: add new fixture statuses only when the failure-log taxonomy expands.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: actionable-open, expected-control, resolved-pair
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- None yet.
