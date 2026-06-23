# 024: Test Baseline And Status-Audit Regressions

Status: ready
Type: testing/regression
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove expected baseline failures and task status audits behave deterministically across shells
Source under test: repo-local path

## Goal

Add regression tests for baseline failure classification and shell-independent
task status audits.

## Non-Goals

- Make failing final verification pass.
- Depend on the user's interactive shell.
- Require manual inspection for routine status checks.

## Required Reading

- planning/tasks/023-fix-baseline-and-status-audit-noise.md
- planning/failed-tests.md
- scripts/todo-trial.ts
- tests/skill-trials.test.ts

## Acceptance Criteria

- [ ] Test that a pre-implementation repo with no tests can be logged as an
  expected baseline signal.
- [ ] Test that the same repo must pass final verification after tests are
  added.
- [ ] Test status audits through Bun-native enumeration, not zsh globs.
- [ ] Test that missing acceptance criteria or incomplete statuses are reported
  clearly.
- [ ] Append failures to `planning/failed-tests.md` if any regression command
  fails during execution.

## Baseline Evidence

The final Sprint 002 audit succeeded only after replacing a brittle shell glob
with explicit paths by hand.

## Verification

- `bun test`
- Any new Bun-native status-audit command added by task 023.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Learning Notes

- Proved: pending.
- Simulated: pending.
- Test next: whether task audit output is stable when new task files are added.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: expected baseline, final verification, status audit
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- None yet.

