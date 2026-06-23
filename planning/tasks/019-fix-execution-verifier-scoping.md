# 019: Fix Execution Verifier Scoping And Browser Proof Semantics

Status: complete
Type: tooling/fix
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: make execution verification prove runtime behavior without false positives from docs, dependencies, or brittle source strings
Source under test: repo-local path

## Goal

Harden execution verification so forbidden-tool scans are scoped to runtime
source, browser proof checks are behavior-grounded, and filter verification does
not depend on one brittle marker such as `filter-completed`.

## Non-Goals

- Remove the browser proof requirement.
- Accept generated apps that only pass source-string checks.
- Scan `node_modules` or evidence docs for runtime compliance.

## Required Reading

- planning/failed-tests.md
- planning/tasks/010-run-execution-todo-app-trial.md
- planning/tasks/012-automate-execution-and-browser-proof-verification.md
- scripts/todo-trial.ts
- planning/todo-trial-protocol.md

## Acceptance Criteria

- [x] Scope forbidden runtime scans to implementation files only.
- [x] Keep forbidden Bun-rule checks active for runtime code and package
  scripts.
- [x] Replace brittle filter markers with behavior or stable test-id evidence.
- [x] Keep browser-proof markdown checks for add, complete, delete, filter, and
  localStorage restore.
- [x] Append any failed verifier command from this task to
  `planning/failed-tests.md`.

## Baseline Evidence

Sprint 002 logged a forbidden-tool scan that searched docs and dependencies,
and execution verifier failures around a brittle `filter-completed` marker.

## Verification

- `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial`
- `bun test`
- `bun run verify:skill-trials`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial` | pass | Scratch Todo app execution artifacts, Bun tests, server response, and browser proof pass. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-execution-negative` | pass | Corrupted localStorage restore proof fails as an expected-control row. |
| 2026-06-24 | `bun test` | pass | Runtime scan scoping and browser-proof negative regressions pass. |

## Files Changed

- `scripts/todo-trial.ts` - exposed scoped runtime scan command and expected-control execution negative logging.
- `planning/failed-tests.md` - appended execution expected-control and same-cluster resolution evidence.

## Verification Summary

- `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial` - pass.
- `bun scripts/todo-trial.ts verify-execution-negative` - pass.
- `bun test` - pass.

## Learning Notes

- Proved: runtime compliance scanning is source-file scoped, browser proof still gates localStorage restore, and the old `filter-completed` literal is gone.
- Simulated: UI interaction itself remains covered by the existing browser-proof artifact, not rerun inside the unit test.
- Test next: browser proof should be refreshed whenever Todo UI behavior changes.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: runtime scan scope, behavior markers, browser proof
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- Completed: planning/tasks/020-test-execution-verifier-regressions.md
