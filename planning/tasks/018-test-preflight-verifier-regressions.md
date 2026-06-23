# 018: Test Preflight Verifier Regressions

Status: ready
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

- [ ] Test that a positive preflight fixture with nested `docs/raw` and
  `docs/evidence` passes.
- [ ] Test that lowercase `bun` wording satisfies the Bun-only execution rule.
- [ ] Test that a missing required artifact fails with a clear message.
- [ ] Test that an app implementation file in a preflight-only repo fails.
- [ ] Append failures to `planning/failed-tests.md` if any regression command
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

## Learning Notes

- Proved: pending.
- Simulated: pending.
- Test next: whether semantic marker checks stay stable after copy edits.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: nested preflight docs, lowercase bun marker,
  missing artifact, preflight app-file ban
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- None yet.

