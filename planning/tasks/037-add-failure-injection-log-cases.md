# 037: Add Failure-Injection And Failure-Log E2E Cases

Status: complete
Type: testing/tooling
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove every meaningful E2E failure path becomes durable improvement input
Source under test: repo-local path

## Goal

Add E2E failure-injection cases that prove failures append to
`planning/failed-tests.md` and summaries classify them correctly.

## Non-Goals

- Delete historical failure rows.
- Treat expected controls as actionable failures.
- Create noisy duplicate rows when a fixture can use a temporary failure log.

## Required Reading

- planning/failed-tests.md
- planning/failed-test-summary.md
- scripts/todo-trial.ts
- planning/tasks/015-fix-failure-log-status-semantics.md

## Acceptance Criteria

- [x] Inject missing preflight artifact failure.
- [x] Inject preflight app-file failure.
- [x] Inject execution browser-proof corruption.
- [x] Inject runtime forbidden-source failure.
- [x] Inject malformed conflict fixture failure.
- [x] Inject source parity mismatch.
- [x] Assert each failure row has task, phase, command/test, expected, actual,
  class, artifact, follow-up, and status.
- [x] Assert fixed failures require separate resolution rows.
- [x] Append real unexpected failures to `planning/failed-tests.md`.

## Baseline Evidence

Sprint 003 added failure summary semantics and several negative controls; this
task makes failure injection an explicit E2E suite.

## Verification

- `bun test`
- `bun scripts/todo-trial.ts failure-summary`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-injection` | pass/expected-control | Injected missing preflight artifact, preflight app file, browser proof corruption, forbidden runtime source, malformed conflict, and source parity mismatch. |
| 2026-06-24 | `planning/failed-tests.md` | pass | Six task 037 expected/control rows were appended with full row fields. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | Expected/control rows do not count as actionable open failures. |
| 2026-06-24 | `bun test` | pass | Failure-injection command is covered with temporary failure logs. |

## Files Changed

- `scripts/todo-trial.ts` - added `failure-injection` and row-shape assertions.
- `tests/skill-trials.test.ts` - added temp-log failure-injection regression.
- `planning/failed-tests.md` - appended task 037 expected-control and expected-logged rows.
- `planning/failed-test-summary.md` - regenerated with task 037 controls grouped.

## Verification Summary

- `bun scripts/todo-trial.ts failure-injection` - pass.
- `bun scripts/todo-trial.ts failure-summary` - pass, 0 actionable open rows.
- `bun test` - pass.

## Learning Notes

- Proved: expected failures are appended with task, phase, command/test, expected, actual, class, artifact, follow-up, and status.
- Simulated: unit tests use temporary failure logs; the task run also appended real expected-control rows.
- Test next: add new failure classes only with summary-classification tests.

## Skill Trial Notes

- Source under test: failure-injected copies of canonical scratch artifacts.
- Source comparison: pass; source parity mismatch is expected-logged.
- Contract markers checked: expected-control classification, row shape, separate resolution requirement.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
