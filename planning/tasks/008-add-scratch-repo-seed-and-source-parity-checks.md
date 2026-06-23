# 008: Add Scratch Repo Seed and Source Parity Checks

Status: blocked
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

- [ ] A seed fixture or script creates `/tmp/build-right-todo-trial` with
  Bun-only `AGENTS.md`, optional blank `README.md`, and `git init`.
- [ ] The setup path removes or isolates previous scratch output without
  touching this source repository.
- [ ] Source-under-test parity checks compare repo-local skill files with the
  installed or invoked skill source when applicable.
- [ ] A mismatch records the trial as `partial-needs-rerun`, not pass.
- [ ] Any setup or parity failure appends a row to `planning/failed-tests.md`.

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

## Learning Notes

- Proved: <what evidence supports>
- Simulated: <what remains unproven>
- Test next: whether the preflight skill uses the seeded repo correctly.

## Blockers

- Blocked until task 007 defines the protocol.

## Follow-Ups

- 009: Run the preflight first-user Todo trial.

