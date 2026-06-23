# 020: Test Execution Verifier And Browser Proof Regressions

Status: complete
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

- [x] Test that forbidden terms inside docs or dependencies do not fail runtime
  source scanning.
- [x] Test that forbidden terms inside runtime source still fail.
- [x] Test that browser proof missing `localStorage restore` fails with a clear
  message.
- [x] Test that filter behavior can pass without the literal
  `filter-completed` string.
- [x] Append failures to `planning/failed-tests.md` if any regression command
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
| 2026-06-24 | `bun test` | pass | Added `execution verifier scan is scoped and browser proof failures stay isolated`. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial` | pass | Live scratch execution verifier remains green. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-execution-negative` | pass | Browser-proof corruption remains isolated as an expected failing control. |

## Files Changed

- `tests/skill-trials.test.ts` - added scoped scan fixtures, runtime-source negative, browser-proof negative, and absence check for the old filter marker.
- `scripts/todo-trial.ts` - added `scan-runtime` command for focused verifier coverage.

## Verification Summary

- `bun test` - pass.
- `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial` - pass.
- `bun scripts/todo-trial.ts verify-execution-negative` - pass.

## Learning Notes

- Proved: docs/dependency forbidden terms are ignored by runtime scans, runtime-source forbidden terms fail, and browser proof corruption fails clearly.
- Simulated: full Playwright-style browser replay is not part of this regression; the persisted browser-proof artifact remains the end-to-end proof.
- Test next: add browser replay only if the manual proof artifact becomes insufficient.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: scoped forbidden scan, runtime negative, browser
  proof negative, filter behavior
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- None yet.
