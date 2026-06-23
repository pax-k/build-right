# 032: Automate Execution Happy-Path Replay

Status: complete
Type: testing/e2e
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove execution takes exactly one ready AI-owned task from baseline through verified evidence
Source under test: repo-local path

## Goal

Automate the execution happy path for the Todo trial after preflight handoff.

## Non-Goals

- Execute multiple ready tasks in one run.
- Skip baseline evidence.
- Skip stop-gate checks after completion.

## Required Reading

- planning/todo-trial-protocol.md
- skills/build-right-execution/references/workflow.md
- skills/build-right-execution/references/evidence-contract.md
- scripts/todo-trial.ts

## Acceptance Criteria

- [x] Assert resolver output reports decision, confidence, next action, next
  task, blocking gates, and external follow-ups.
- [x] Assert `execute-task` for the prepared ready AI-owned task.
- [x] Assert task intake includes done means, non-goals, assumption basis,
  reversibility, learning hook, source under test, baseline, verification
  ladder, and evidence destination.
- [x] Assert task-contract check runs before edits.
- [x] Assert baseline evidence exists before implementation evidence.
- [x] Assert only the selected Todo task is implemented.
- [x] Assert verification and stop gates run before next-task selection.
- [x] Append failures to `planning/failed-tests.md` if any check fails.

## Baseline Evidence

Current execution verification checks artifacts and browser proof, but Sprint
004 needs an explicit happy-path replay oracle for the execution workflow steps.

## Verification

- `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial`
- `bun test`
- `bun run verify:skill-trials`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial` | pass | Execution scratch has app files, tests, browser proof, and completed task evidence. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-transcripts --target /tmp/build-right-todo-trial --preflight-target /tmp/build-right-todo-trial-preflight` | pass | Resolver, task intake, baseline, implementation, verification, and stop-gate ordering pass. |
| 2026-06-24 | `bun test` | pass | Execution verifier and transcript regressions pass. |

## Files Changed

- `scripts/todo-trial.ts` - execution and transcript checks compose into E2E replay/report flow.
- `tests/skill-trials.test.ts` - execution transcript and verifier coverage.
- `planning/e2e-workflow-oracle.md` - execution happy-path oracle.

## Verification Summary

- `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial` - pass.
- `bun scripts/todo-trial.ts verify-transcripts --target /tmp/build-right-todo-trial --preflight-target /tmp/build-right-todo-trial-preflight` - pass.
- `bun test` - pass.

## Learning Notes

- Proved: the canonical execution scratch satisfies the happy-path execution oracle.
- Simulated: provider-native transcript export is represented by durable transcript markdown.
- Test next: keep resolver and stop-gate fixtures synchronized with execution workflow changes.

## Skill Trial Notes

- Source under test: repo-local `skills/build-right-execution`.
- Source comparison: pass.
- Contract markers checked: resolver report, task intake, baseline, implementation, verification, stop gates.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
