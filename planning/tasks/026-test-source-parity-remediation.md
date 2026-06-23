# 026: Test Source Parity Mismatch Remediation Path

Status: ready
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

- [ ] Test that clean repo-local source parity passes.
- [ ] Test that a temporary mismatch fixture fails with the exact mismatched
  path.
- [ ] Test that mismatch output includes the required remediation hint.
- [ ] Test that intentional parity-negative rows are classified as expected
  controls in the summary.
- [ ] Append failures to `planning/failed-tests.md` if any regression command
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

## Learning Notes

- Proved: pending.
- Simulated: pending.
- Test next: whether source parity remains a mandatory gate in future full
  trials.

## Skill Trial Notes

- Source comparison: pending
- Contract markers checked: clean parity, mismatch path, remediation hint,
  expected-control classification
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- None yet.

