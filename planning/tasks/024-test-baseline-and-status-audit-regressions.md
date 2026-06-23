# 024: Test Baseline And Status-Audit Regressions

Status: complete
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

- [x] Test that a pre-implementation repo with no tests can be logged as an
  expected baseline signal.
- [x] Test that the same repo must pass final verification after tests are
  added.
- [x] Test status audits through Bun-native enumeration, not zsh globs.
- [x] Test that missing acceptance criteria or incomplete statuses are reported
  clearly.
- [x] Append failures to `planning/failed-tests.md` if any regression command
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
| 2026-06-24 | `bun test` | pass | Added `baseline and status audit commands are shell independent`. |
| 2026-06-24 | `bun scripts/todo-trial.ts baseline-check --target /tmp/build-right-todo-trial --phase final` | pass | Final scratch Todo tests classify as pass. |
| 2026-06-24 | `bun scripts/todo-trial.ts status-audit` | pass | Live Sprint 003 status audit passes after tracker closeout. |

## Files Changed

- `tests/skill-trials.test.ts` - added no-tests baseline fixture, final failure fixture, positive status audit fixture, and incomplete-task status audit fixture.
- `scripts/todo-trial.ts` - added commands under test.

## Verification Summary

- `bun test` - pass.
- `bun scripts/todo-trial.ts baseline-check --target /tmp/build-right-todo-trial --phase final` - pass.
- `bun scripts/todo-trial.ts status-audit` - pass.

## Learning Notes

- Proved: baseline and status-audit behavior is deterministic through Bun commands and temporary fixtures.
- Simulated: none for Sprint 003; live audit passes.
- Test next: if task numbering changes, update `status-audit` task range options.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: expected baseline, final verification, status audit
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- None yet.
