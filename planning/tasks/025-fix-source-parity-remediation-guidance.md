# 025: Fix Source Parity Mismatch Remediation Guidance

Status: complete
Type: tooling/fix
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: make source-under-test drift produce a clear stop condition and remediation instruction
Source under test: repo-local path

## Goal

Improve source parity failure handling so an actual repo-local versus installed
skill mismatch blocks execution with clear remediation steps instead of only
recording a raw diff signal.

## Non-Goals

- Treat the intentional parity-negative control as a bug.
- Auto-overwrite installed skills.
- Allow execution to continue after unreviewed source drift.

## Required Reading

- planning/failed-tests.md
- planning/tasks/008-add-scratch-repo-seed-and-source-parity-checks.md
- scripts/todo-trial.ts
- skills/build-right-preflight/SKILL.md
- skills/build-right-execution/SKILL.md

## Acceptance Criteria

- [x] Keep intentional source-parity negative controls logged as expected.
- [x] For real source mismatch, emit a `partial-needs-rerun` or blocker result
  with the exact mismatched source path.
- [x] Include a remediation hint that tells the agent whether to use repo-local
  skill source, reinstall/update installed skill source, or rerun the trial.
- [x] Ensure mismatch status is visible in the failed-test summary.
- [x] Append any failed verifier command from this task to
  `planning/failed-tests.md`.

## Baseline Evidence

Sprint 002 proved the parity-negative path logs a forced mismatch, but the
follow-up guidance is still too thin for a future real drift event.

## Verification

- `bun scripts/todo-trial.ts parity`
- `bun scripts/todo-trial.ts parity-negative`
- `bun scripts/todo-trial.ts failure-summary`
- `bun test`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts parity` | pass | Repo-local skill source parity is clean. |
| 2026-06-24 | `bun scripts/todo-trial.ts parity-negative` | pass | Forced mismatch reports `partial-needs-rerun`, mismatched source path, and remediation hint. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | Source parity negative rows classify as expected/control. |
| 2026-06-24 | `bun test` | pass | Parity remediation regression is covered. |

## Files Changed

- `scripts/todo-trial.ts` - added parity remediation output and expected-control-compatible mismatch logging.
- `tests/skill-trials.test.ts` - added clean parity, mismatch, remediation, and parity-negative summary regression coverage.
- `planning/failed-tests.md` - appended parity-negative expected-control evidence with remediation text.

## Verification Summary

- `bun scripts/todo-trial.ts parity` - pass.
- `bun scripts/todo-trial.ts parity-negative` - pass.
- `bun scripts/todo-trial.ts failure-summary` - pass.
- `bun test` - pass.

## Learning Notes

- Proved: source drift blocks with `partial-needs-rerun`, an exact mismatched path, and a remediation hint.
- Simulated: the mismatch is forced in a temporary copied skill source.
- Test next: rerun parity before every full manual trial.

## Skill Trial Notes

- Source comparison: pending
- Contract markers checked: partial-needs-rerun, mismatch path, remediation
  hint
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- Completed: planning/tasks/026-test-source-parity-remediation.md
