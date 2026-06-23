# 016: Test Failure-Log Status Semantics And Rollups

Status: ready
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

- [ ] Add a fixture or helper path that runs summary logic against a temporary
  failure log.
- [ ] Test at least one unresolved row, one expected negative row, one forced
  control row, and one resolved row pair.
- [ ] Test that actionable-open counts exclude expected controls.
- [ ] Test that the live `planning/failed-tests.md` can still generate a
  summary.
- [ ] Append failures to `planning/failed-tests.md` if any regression command
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

## Learning Notes

- Proved: pending.
- Simulated: pending.
- Test next: whether summary semantics remain stable after future forced
  failures.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: actionable-open, expected-control, resolved-pair
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- None yet.

