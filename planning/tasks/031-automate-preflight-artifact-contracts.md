# 031: Automate Preflight Artifact Contract Checks

Status: complete
Type: testing/tooling
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove preflight artifacts satisfy the Build Right artifact contract before execution starts
Source under test: repo-local path

## Goal

Make preflight artifact verification complete and contract-aligned.

## Non-Goals

- Snapshot every generated sentence.
- Accept app implementation files during preflight.
- Add root generated `docs/` or `tasks/` to this source repo.

## Required Reading

- skills/build-right-preflight/references/artifact-contract.md
- planning/todo-trial-protocol.md
- scripts/todo-trial.ts
- tests/skill-trials.test.ts

## Acceptance Criteria

- [x] Verify blueprint status fields and readiness gates.
- [x] Verify source-index claim status separation.
- [x] Verify MVP scope includes included/excluded scope and source mode.
- [x] Verify execution rules include authority order, stop gates, and Bun rule.
- [x] Verify release gates include source parity, preflight artifacts, local
  validation, and browser proof.
- [x] Verify first task includes all required task fields.
- [x] Verify app files during preflight fail as expected controls.
- [x] Append failures to `planning/failed-tests.md` if any verifier fails.

## Baseline Evidence

Sprint 003 hardened preflight verification; Sprint 004 should finish the
artifact contract as the formal pre-execution gate.

## Verification

- `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight`
- `bun scripts/todo-trial.ts verify-preflight-negative --kind missing`
- `bun scripts/todo-trial.ts verify-preflight-negative --kind app-file`
- `bun test`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight` | pass | Blueprint, source index, MVP scope, execution rules, release gates, and first task fields pass. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-injection` | pass/expected-control | Missing artifact and preflight app-file controls were logged under task 037. |
| 2026-06-24 | `bun test` | pass | Preflight verifier regression tests pass. |

## Files Changed

- `scripts/todo-trial.ts` - preflight checks reused by failure-injection and transcript/report flow.
- `tests/skill-trials.test.ts` - preflight positive/negative verifier coverage.
- `planning/failed-tests.md` - expected preflight failure-injection rows.

## Verification Summary

- `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight` - pass.
- `bun scripts/todo-trial.ts failure-injection` - pass with expected-control rows.
- `bun test` - pass.

## Learning Notes

- Proved: preflight artifact contract and app-file stop gate are automated.
- Simulated: negative controls use copied scratch fixtures.
- Test next: keep the preflight artifact list synchronized with template changes.

## Skill Trial Notes

- Source under test: repo-local `skills/build-right-preflight`.
- Source comparison: pass.
- Contract markers checked: blueprint status, source index, MVP scope, execution rules, release gates, first task.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
