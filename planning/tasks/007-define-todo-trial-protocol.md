# 007: Define the Todo Trial Protocol

Status: complete
Type: planning/testing
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: define the first-user manual trial before building automation around it
Source under test: repo-local path

## Goal

Create the exact protocol for testing `build-right-preflight` and
`build-right-execution` with a blank Bun-only React + TypeScript Todo app
scratch repository.

## Non-Goals

- Run the manual trial.
- Implement the Todo app.
- Build the verifier.
- Commit generated scratch-repo artifacts into this source repository.

## Required Reading

- planning/sprints/002-todo-skill-trial-automation.md
- skills/build-right-preflight/SKILL.md
- skills/build-right-preflight/references/workflow.md
- skills/build-right-preflight/references/artifact-contract.md
- skills/build-right-execution/SKILL.md
- skills/build-right-execution/references/workflow.md
- skills/build-right-execution/references/evidence-contract.md
- AGENTS.md

## Acceptance Criteria

- [x] The protocol names the scratch repo path and seed files.
- [x] The protocol includes the exact human prompt for preflight.
- [x] The protocol includes the recommended founder reply batch.
- [x] The protocol includes the expected preflight questions, helper commands,
  artifact writes, and stop state.
- [x] The protocol includes the exact human prompt for execution.
- [x] The protocol includes the expected execution resolver, task intake,
  baseline, implementation, verification, evidence update, and stop-gate
  behavior.
- [x] The protocol names pass/fail criteria for every major expectation.
- [x] The protocol says any failed expectation must be logged in
  `planning/failed-tests.md`.

## Baseline Evidence

Current trial plan exists only as conversational guidance. Durable sprint and
task files are being created in `planning/`.

## Verification

- Inspect the protocol for all acceptance criteria.
- Run `bun test`.
- Run `bun run verify:skill-trials`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun skills/build-right-execution/scripts/continue-check.ts --cwd . --format markdown --strict` | advisory | Helper returned `create-blocker` because this source repo uses `planning/` trackers instead of generated root `tasks/`; reconciled against Sprint 002 task 007. |
| 2026-06-24 | `bun skills/build-right-execution/scripts/execution-check.ts --cwd . --task planning/tasks/007-define-todo-trial-protocol.md --mode task-contract --format markdown` | advisory | Helper did not select planning task paths; manual contract check confirmed required fields. |
| 2026-06-24 | `planning/todo-trial-protocol.md` inspection | pass | Protocol names target, seed files, prompts, founder reply, expected preflight/execution behavior, pass/fail criteria, and failed-test logging. |

## Learning Notes

- Proved: the first-user Todo trial has a durable protocol covering both
  skills and failure logging.
- Simulated: no manual trial or automation has run yet.
- Test next: whether a real agent follows the protocol without extra prompting.

## Blockers

- None.

## Follow-Ups

- 008: Add scratch repo seed and source parity checks.
