# 034: Automate Todo App Behavior And Browser Proof Checks

Status: complete
Type: testing/e2e
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove the generated Todo app works in runtime-visible behavior, not only source markers
Source under test: repo-local path

## Goal

Automate the Todo app behavior and browser proof checks required by the
execution workflow.

## Non-Goals

- Replace unit tests with browser proof only.
- Accept source-only proof for UI behavior.
- Add deployment or backend persistence.

## Required Reading

- planning/todo-trial-protocol.md
- scripts/todo-trial.ts
- tests/skill-trials.test.ts
- AGENTS.md

## Acceptance Criteria

- [x] Verify `Bun.serve()` and HTML imports.
- [x] Verify React + TypeScript UI exists.
- [x] Verify add, complete, delete, all, active, completed, and localStorage
  restore behavior.
- [x] Verify `bun test` passes inside the scratch repo.
- [x] Verify browser-proof markdown and screenshot exist.
- [x] Verify corrupted browser proof fails as an expected control.
- [x] Verify forbidden runtime scan excludes docs/dependencies but catches
  runtime source violations.
- [x] Append failures to `planning/failed-tests.md` if any check fails.

## Baseline Evidence

Sprint 002 produced browser proof and Sprint 003 hardened execution verifier
scope. Sprint 004 should make Todo runtime behavior a first-class E2E gate.

## Verification

- `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial`
- `bun scripts/todo-trial.ts verify-execution-negative`
- `bun test`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial` | pass | Verifies Bun.serve, HTML imports, React/TypeScript UI markers, Todo behavior proof, scratch tests, and browser proof artifacts. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-injection` | pass/expected-control | Corrupted browser proof and forbidden runtime source were logged as expected controls. |
| 2026-06-24 | `bun test` | pass | Runtime scan and browser-proof negative regressions pass. |

## Files Changed

- `scripts/todo-trial.ts` - execution verifier, runtime scan, and failure-injection cases cover Todo proof.
- `tests/skill-trials.test.ts` - scoped runtime scan and browser proof regression coverage.
- `planning/failed-tests.md` - expected browser/runtime failure-injection rows.

## Verification Summary

- `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial` - pass.
- `bun scripts/todo-trial.ts failure-injection` - pass with expected-control rows.
- `bun test` - pass.

## Learning Notes

- Proved: Todo runtime behavior, browser proof, localStorage restore, and Bun-only source scan are automated.
- Simulated: failure-injection browser proof uses copied markdown corruption instead of driving a second browser session.
- Test next: rerun live browser proof when Todo UI behavior changes.

## Skill Trial Notes

- Source under test: `/tmp/build-right-todo-trial` generated from repo-local execution workflow.
- Source comparison: pass.
- Contract markers checked: Bun.serve, HTML import, React UI, tests, browser proof, localStorage restore.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
