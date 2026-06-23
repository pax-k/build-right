# 018: Test Preflight Verifier Regressions

Status: complete
Type: testing/regression
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove the preflight verifier catches real missing artifacts without failing on valid nested directories or lowercase Bun wording
Source under test: repo-local path

## Goal

Add regression tests for the preflight verifier failure modes discovered during
Sprint 002.

## Non-Goals

- Snapshot every generated markdown file.
- Require exact prose in founder answers.
- Treat app implementation files as valid during preflight.

## Required Reading

- planning/tasks/017-fix-preflight-snapshot-and-markers.md
- planning/tasks/011-automate-preflight-artifact-verification.md
- scripts/todo-trial.ts
- tests/skill-trials.test.ts

## Acceptance Criteria

- [x] Test that a positive preflight fixture with nested `docs/raw` and
  `docs/evidence` passes.
- [x] Test that lowercase `bun` wording satisfies the Bun-only execution rule.
- [x] Test that a missing required artifact fails with a clear message.
- [x] Test that an app implementation file in a preflight-only repo fails.
- [x] Append failures to `planning/failed-tests.md` if any regression command
  fails during execution.

## Baseline Evidence

The Sprint 002 verifier exercised positive and negative cases manually, but the
exact directory-copy and marker regressions are not isolated as durable tests.

## Verification

- `bun test`
- `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight`
- `bun scripts/todo-trial.ts verify-preflight-negative --kind missing`
- `bun scripts/todo-trial.ts verify-preflight-negative --kind app-file`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun test` | pass | Added `preflight verifier accepts nested fixtures and lowercase bun while rejecting bad preflight state`. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight` | pass | Live preflight snapshot still satisfies verifier. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-preflight-negative --kind missing` | pass | Missing artifact regression remains a failing control. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-preflight-negative --kind app-file` | pass | Preflight app-file ban remains enforced. |

## Files Changed

- `tests/skill-trials.test.ts` - added positive preflight fixture, missing artifact negative, and app-file negative checks.
- `scripts/todo-trial.ts` - added fixture-friendly expected-control logging.

## Verification Summary

- `bun test` - pass.
- `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight` - pass.
- `bun scripts/todo-trial.ts verify-preflight-negative --kind missing` - pass.
- `bun scripts/todo-trial.ts verify-preflight-negative --kind app-file` - pass.

## Learning Notes

- Proved: the original directory-copy and marker regressions are now isolated as Bun tests.
- Simulated: generated prose remains fixture-level, not a fresh human preflight run.
- Test next: rerun positive and negative checks after any preflight artifact contract change.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: nested preflight docs, lowercase bun marker,
  missing artifact, preflight app-file ban
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- None yet.
