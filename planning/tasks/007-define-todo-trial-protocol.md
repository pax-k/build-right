# 007: Define the Todo Trial Protocol

Status: ready
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

- [ ] The protocol names the scratch repo path and seed files.
- [ ] The protocol includes the exact human prompt for preflight.
- [ ] The protocol includes the recommended founder reply batch.
- [ ] The protocol includes the expected preflight questions, helper commands,
  artifact writes, and stop state.
- [ ] The protocol includes the exact human prompt for execution.
- [ ] The protocol includes the expected execution resolver, task intake,
  baseline, implementation, verification, evidence update, and stop-gate
  behavior.
- [ ] The protocol names pass/fail criteria for every major expectation.
- [ ] The protocol says any failed expectation must be logged in
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

## Learning Notes

- Proved: <what evidence supports>
- Simulated: <what remains unproven>
- Test next: whether a real agent follows the protocol without extra prompting.

## Blockers

- None yet.

## Follow-Ups

- 008: Add scratch repo seed and source parity checks.

