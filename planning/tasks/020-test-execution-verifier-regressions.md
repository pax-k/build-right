# 020: Test Execution Verifier And Browser Proof Regressions

Status: ready
Type: testing/regression
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove execution verification fails for broken runtime evidence while ignoring irrelevant docs and dependency text
Source under test: repo-local path

## Goal

Add regression tests for execution verifier scoping, browser-proof corruption,
and filter behavior evidence.

## Non-Goals

- Replace in-browser proof with unit tests only.
- Require exact React component names.
- Depend on generated dependency contents.

## Required Reading

- planning/tasks/019-fix-execution-verifier-scoping.md
- planning/tasks/012-automate-execution-and-browser-proof-verification.md
- scripts/todo-trial.ts
- tests/skill-trials.test.ts

## Acceptance Criteria

- [ ] Test that forbidden terms inside docs or dependencies do not fail runtime
  source scanning.
- [ ] Test that forbidden terms inside runtime source still fail.
- [ ] Test that browser proof missing `localStorage restore` fails with a clear
  message.
- [ ] Test that filter behavior can pass without the literal
  `filter-completed` string.
- [ ] Append failures to `planning/failed-tests.md` if any regression command
  fails during execution.

## Baseline Evidence

The current automation has live positive and negative execution checks, but it
does not isolate docs/dependency scan noise or literal marker brittleness as
unit-level regressions.

## Verification

- `bun test`
- `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial`
- `bun scripts/todo-trial.ts verify-execution-negative`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Learning Notes

- Proved: pending.
- Simulated: pending.
- Test next: whether browser proof corruption remains isolated to browser
  evidence.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: scoped forbidden scan, runtime negative, browser
  proof negative, filter behavior
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- None yet.

