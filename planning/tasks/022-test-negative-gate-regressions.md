# 022: Test Negative Gate Resolver Matrix Regressions

Status: complete
Type: testing/regression
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove every negative gate decision remains stable and malformed fixtures fail distinctly
Source under test: repo-local path

## Goal

Add regression coverage for the negative gate matrix and the malformed-conflict
fixture failure discovered during Sprint 002.

## Non-Goals

- Test every prose variant of every generated task.
- Replace task-level gate evidence with only script tests.
- Accept `execute-task` for unresolved ownership or conflict gates.

## Required Reading

- planning/tasks/021-fix-negative-gate-fixtures.md
- planning/tasks/013-automate-negative-gate-case-trials.md
- scripts/todo-trial.ts
- tests/skill-trials.test.ts

## Acceptance Criteria

- [x] Test blank repo execution returns a blocker.
- [x] Test founder-owned work returns `ask-founder`.
- [x] Test external-provider ownership returns `wait-external`.
- [x] Test founder-owned conflict returns `ask-founder`.
- [x] Test AI-owned conflict returns a blocker.
- [x] Test failed release gate and source mismatch block execution.
- [x] Test malformed conflict fixtures fail as fixture errors, not
  `execute-task`.
- [x] Append failures to `planning/failed-tests.md` if any regression command
  fails during execution.

## Baseline Evidence

The negative gate command passes after fixture repair, but there is no dedicated
regression proving malformed conflict fixtures are rejected distinctly.

## Verification

- `bun test`
- `bun scripts/todo-trial.ts negative-gates`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun test` | pass | Added `negative gate matrix rejects malformed conflict fixtures distinctly`. |
| 2026-06-24 | `bun scripts/todo-trial.ts negative-gates` | pass | Blank, founder, external, conflict, release, and source-mismatch gates pass. |
| 2026-06-24 | `bun scripts/todo-trial.ts negative-gates-malformed-conflict` | pass | Malformed conflict fixture fails distinctly as a fixture error. |

## Files Changed

- `tests/skill-trials.test.ts` - added regression coverage for the gate matrix command and malformed conflict control.
- `scripts/todo-trial.ts` - added the malformed fixture control path.

## Verification Summary

- `bun test` - pass.
- `bun scripts/todo-trial.ts negative-gates` - pass.
- `bun scripts/todo-trial.ts negative-gates-malformed-conflict` - pass.

## Learning Notes

- Proved: malformed conflict fixtures fail before resolver assertions and cannot silently become `execute-task`.
- Simulated: only fixture-owned gate states are covered.
- Test next: keep malformed-fixture controls beside every parser-sensitive gate fixture.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: blank, founder, external, conflict, release,
  source mismatch gates
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- None yet.
