# 025: Fix Source Parity Mismatch Remediation Guidance

Status: ready
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

- [ ] Keep intentional source-parity negative controls logged as expected.
- [ ] For real source mismatch, emit a `partial-needs-rerun` or blocker result
  with the exact mismatched source path.
- [ ] Include a remediation hint that tells the agent whether to use repo-local
  skill source, reinstall/update installed skill source, or rerun the trial.
- [ ] Ensure mismatch status is visible in the failed-test summary.
- [ ] Append any failed verifier command from this task to
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

## Learning Notes

- Proved: pending.
- Simulated: pending.
- Test next: real mismatch fixture and clean parity fixture.

## Skill Trial Notes

- Source comparison: pending
- Contract markers checked: partial-needs-rerun, mismatch path, remediation
  hint
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- planning/tasks/026-test-source-parity-remediation.md

