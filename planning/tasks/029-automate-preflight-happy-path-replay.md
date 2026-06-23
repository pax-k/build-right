# 029: Automate Preflight Happy-Path Replay

Status: complete
Type: testing/e2e
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove a first-time human preflight flow produces the right docs, questions, and handoff without app implementation
Source under test: repo-local path

## Goal

Automate the preflight happy path for the blank Bun Todo trial.

## Non-Goals

- Implement the Todo app.
- Run execution skill behavior.
- Treat generated prose as product truth beyond the trial.

## Required Reading

- planning/todo-trial-protocol.md
- planning/tasks/027-define-e2e-workflow-oracle.md
- skills/build-right-preflight/references/workflow.md
- skills/build-right-preflight/references/artifact-contract.md

## Acceptance Criteria

- [x] Seed a blank scratch repo with Bun-only `AGENTS.md`.
- [x] Assert helper output includes decision, confidence, project type, next
  action, missing artifacts, readiness warnings, and founder gaps.
- [x] Assert focused founder questions happen before product truth is claimed.
- [x] Assert the founder reply is recorded with user, pain, promise, MVP,
  non-goals, constraints, and validation.
- [x] Assert a file plan appears before writes.
- [x] Assert preflight creates only docs/tasks/evidence and no app files.
- [x] Assert closeout names the first executable AI task.
- [x] Append failures to `planning/failed-tests.md` if any check fails.

## Baseline Evidence

The current preflight verifier checks generated artifacts, but not a complete
happy-path agentic replay transcript.

## Verification

- `bun test`
- `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight` | pass | Preflight scratch has required docs/tasks/evidence and no app files. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-transcripts --target /tmp/build-right-todo-trial --preflight-target /tmp/build-right-todo-trial-preflight` | pass | Transcript proves helper report, founder questions, founder reply, file plan, and closeout ordering. |
| 2026-06-24 | `bun test` | pass | Fixture replay and transcript-order checks pass. |

## Files Changed

- `scripts/todo-trial.ts` - added `verify-transcripts`.
- `tests/skill-trials.test.ts` - added preflight transcript ordering coverage.
- `planning/e2e-workflow-oracle.md` - documented preflight happy path oracle.

## Verification Summary

- `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight` - pass.
- `bun scripts/todo-trial.ts verify-transcripts --target /tmp/build-right-todo-trial --preflight-target /tmp/build-right-todo-trial-preflight` - pass.
- `bun test` - pass.

## Learning Notes

- Proved: the canonical preflight scratch and transcript satisfy the expected first-user happy path.
- Simulated: transcript is durable reconstructed evidence rather than provider-native export.
- Test next: keep state-matrix fixtures aligned with this happy path.

## Skill Trial Notes

- Source under test: repo-local `skills/build-right-preflight`.
- Source comparison: pass.
- Contract markers checked: helper report, founder questions, file plan, first executable task, no app files.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
