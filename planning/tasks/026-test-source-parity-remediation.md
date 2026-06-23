# 026: Test Source Parity Mismatch Remediation Path

Status: complete
Type: testing/regression
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove clean parity passes and source drift blocks with actionable remediation evidence
Source under test: repo-local path

## Goal

Add regression coverage for source parity success and mismatch remediation
output.

## Non-Goals

- Require network access or external installs.
- Mutate the real installed skill during tests.
- Skip source parity before full manual trials.

## Required Reading

- planning/tasks/025-fix-source-parity-remediation-guidance.md
- planning/tasks/008-add-scratch-repo-seed-and-source-parity-checks.md
- scripts/todo-trial.ts
- tests/skill-trials.test.ts

## Acceptance Criteria

- [x] Test that clean repo-local source parity passes.
- [x] Test that a temporary mismatch fixture fails with the exact mismatched
  path.
- [x] Test that mismatch output includes the required remediation hint.
- [x] Test that intentional parity-negative rows are classified as expected
  controls in the summary.
- [x] Append failures to `planning/failed-tests.md` if any regression command
  fails during execution.

## Baseline Evidence

The parity-negative command creates durable evidence, but no dedicated
regression asserts the remediation text or summary classification.

## Verification

- `bun test`
- `bun scripts/todo-trial.ts parity`
- `bun scripts/todo-trial.ts parity-negative`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun test` | pass | Added `source parity mismatch output includes remediation guidance`. |
| 2026-06-24 | `bun scripts/todo-trial.ts parity` | pass | Clean repo-local parity passes. |
| 2026-06-24 | `bun scripts/todo-trial.ts parity-negative` | pass | Intentional mismatch remains an expected control with remediation output. |
| 2026-06-24 | `bun run verify:skill-trials` | fail | Final verifier exposed Date.now-only parity-negative scratch root collision under concurrent verification; logged in `planning/failed-tests.md`. |
| 2026-06-24 | `bun test` | pass | Added concurrent parity-negative regression after switching scratch roots to process id plus `crypto.randomUUID()`. |
| 2026-06-24 | `bun run verify:skill-trials` | pass | Final verifier passes after collision-resistant scratch roots. |

## Files Changed

- `tests/skill-trials.test.ts` - added clean parity, temporary mismatch, remediation text, expected-control summary assertions, and concurrent parity-negative regression.
- `scripts/todo-trial.ts` - added remediation output and collision-resistant helper scratch roots under test.

## Verification Summary

- `bun test` - pass.
- `bun run verify:skill-trials` - pass after fixing the logged final-verification failure.
- `bun scripts/todo-trial.ts parity` - pass.
- `bun scripts/todo-trial.ts parity-negative` - pass.

## Learning Notes

- Proved: clean parity passes, temporary source drift fails with the exact mismatched path, parity-negative rows remain expected controls, and parallel parity-negative runs no longer collide.
- Simulated: mismatch uses a temporary copied skill source, not a real installed-skill drift event.
- Test next: source parity remains a mandatory gate before future full trials.

## Skill Trial Notes

- Source comparison: pending
- Contract markers checked: clean parity, mismatch path, remediation hint,
  expected-control classification
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- None yet.
