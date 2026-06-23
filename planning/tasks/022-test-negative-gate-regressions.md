# 022: Test Negative Gate Resolver Matrix Regressions

Status: ready
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

- [ ] Test blank repo execution returns a blocker.
- [ ] Test founder-owned work returns `ask-founder`.
- [ ] Test external-provider ownership returns `wait-external`.
- [ ] Test founder-owned conflict returns `ask-founder`.
- [ ] Test AI-owned conflict returns a blocker.
- [ ] Test failed release gate and source mismatch block execution.
- [ ] Test malformed conflict fixtures fail as fixture errors, not
  `execute-task`.
- [ ] Append failures to `planning/failed-tests.md` if any regression command
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

## Learning Notes

- Proved: pending.
- Simulated: pending.
- Test next: whether future gate fixtures fail before resolver assertions when
  malformed.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: blank, founder, external, conflict, release,
  source mismatch gates
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- None yet.

