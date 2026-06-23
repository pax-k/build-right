# 027: Define The E2E Workflow Oracle

Status: complete
Type: planning/testing
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: define one durable oracle for expected preflight, execution, shared gates, and agentic workflow behavior
Source under test: repo-local path

## Goal

Create the canonical E2E workflow oracle that future automation and manual
reviews use to decide whether the Build Right skills behaved correctly.

## Non-Goals

- Implement the automation.
- Change skill instructions.
- Run a fresh full agentic replay.

## Required Reading

- planning/todo-trial-protocol.md
- planning/sprints/004-end-to-end-workflow-test-matrix.md
- skills/build-right-preflight/SKILL.md
- skills/build-right-execution/SKILL.md
- planning/failed-test-summary.md

## Acceptance Criteria

- [x] Document shared gate expectations for source parity, failure logging,
  failure summary, Bun compliance, scratch isolation, and concurrency.
- [x] Document preflight happy path, state matrix, artifacts, and transcript
  oracle.
- [x] Document execution happy path, resolver state matrix, Todo behavior, and
  transcript oracle.
- [x] Document expected negative controls and how they must be classified.
- [x] Append failures to `planning/failed-tests.md` if any verification command
  fails during execution.

## Baseline Evidence

Sprint 002 and Sprint 003 created a Todo trial protocol and verifier commands,
but the full E2E workflow oracle is still spread across chat, task files, and
script tests.

## Verification

- Inspect the new oracle artifact.
- `bun test`
- `bun scripts/todo-trial.ts failure-summary`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-e2e-oracle` | pass | `planning/e2e-workflow-oracle.md` covers shared gates, preflight, execution, negative controls, and report oracle. |
| 2026-06-24 | `bun test` | pass | 25 tests include Sprint 004 oracle regression coverage. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | Summary reports 0 actionable open rows after logged Sprint 004 failures/resolutions. |

## Files Changed

- `planning/e2e-workflow-oracle.md` - canonical E2E workflow oracle.
- `scripts/todo-trial.ts` - `verify-e2e-oracle` command.
- `tests/skill-trials.test.ts` - oracle regression coverage.

## Verification Summary

- `bun scripts/todo-trial.ts verify-e2e-oracle` - pass.
- `bun test` - pass.
- `bun scripts/todo-trial.ts failure-summary` - pass, 0 actionable open rows.

## Learning Notes

- Proved: the oracle is a durable artifact with machine-checked markers for every Sprint 004 lane.
- Simulated: no fresh external agent run is embedded in the oracle itself.
- Test next: use the oracle to validate report/replay output on each future skill change.

## Skill Trial Notes

- Source under test: repo-local `skills/build-right-preflight` and `skills/build-right-execution`.
- Source comparison: pass via `bun scripts/todo-trial.ts parity`.
- Contract markers checked: shared gates, preflight, execution, negative controls, report oracle.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
