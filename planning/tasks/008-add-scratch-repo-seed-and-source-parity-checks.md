# 008: Add Scratch Repo Seed and Source Parity Checks

Status: complete
Type: testing/tooling
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove manual trials run against the intended repo-local skill source and a clean external target
Source under test: repo-local path

## Goal

Add a repeatable setup path for `/tmp/build-right-todo-trial` and a source
parity check that confirms the invoked Build Right skills match the repo-local
skill source before manual trials run.

## Non-Goals

- Run the full manual trial.
- Build the Todo app.
- Require generated `docs/` or `tasks/` in this source repository.

## Required Reading

- planning/tasks/007-define-todo-trial-protocol.md
- README.md
- RELEASE_CHECKLIST.md
- tests/skill-trials.test.ts
- skills/build-right-preflight/scripts/preflight-check.ts
- skills/build-right-execution/scripts/continue-check.ts

## Acceptance Criteria

- [x] A seed fixture or script creates `/tmp/build-right-todo-trial` with
  Bun-only `AGENTS.md`, optional blank `README.md`, and `git init`.
- [x] The setup path removes or isolates previous scratch output without
  touching this source repository.
- [x] Source-under-test parity checks compare repo-local skill files with the
  installed or invoked skill source when applicable.
- [x] A mismatch records the trial as `partial-needs-rerun`, not pass.
- [x] Any setup or parity failure appends a row to `planning/failed-tests.md`.

## Baseline Evidence

Manual trial setup is currently described but not scripted.

## Verification

- Run the seed path twice and confirm it is repeatable.
- Run the source parity check against the repo-local skill source.
- Force one parity mismatch and confirm the failure is logged.
- Run `bun test`.
- Run `bun run verify:skill-trials`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts seed && bun scripts/todo-trial.ts seed` | pass | Seeded `/tmp/build-right-todo-trial` twice with `AGENTS.md`, `README.md`, and Git initialized. |
| 2026-06-24 | `bun scripts/todo-trial.ts parity` | pass | Repo-local preflight and execution skill sources matched the invoked compare root. |
| 2026-06-24 | `bun scripts/todo-trial.ts parity-negative` | pass | Forced mismatch returned `partial-needs-rerun` and appended an expected source-under-test row to `planning/failed-tests.md`. |
| 2026-06-24 | `bun run todo-trial -- parity` | pass | Package script route invokes the helper and passes source parity. |

## Learning Notes

- Proved: the scratch repo setup is repeatable, source parity can be checked,
  and forced source mismatch is logged.
- Simulated: no full preflight or execution trial has run yet.
- Test next: whether the preflight skill uses the seeded repo correctly.

## Blockers

- None.

## Follow-Ups

- 009: Run the preflight first-user Todo trial.
