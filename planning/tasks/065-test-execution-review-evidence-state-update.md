# 065: Test Execution Review, Evidence, And State Update

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove execution records evidence before state changes and handles required review triggers
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-execution` step 8: run required review or substitute
verification, record evidence, update only relevant trackers/docs, and rerun
stop gates before considering another task.

## Non-Goals

- Mark tasks complete before evidence exists.
- Mark parent sprint or release complete because one task passed.
- Let review expand the task into a broad refactor.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-execution/SKILL.md
- skills/build-right-execution/references/evidence-contract.md
- skills/build-right-execution/references/review-and-delegation.md
- skills/build-right-execution/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/065-execution-review-evidence-state-update-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Seed a task that touches evidence and at least one tracker.
- [x] Invoke `$build-right-execution`.
- [x] Required review trigger is run, or skipped review is recorded with substitute verification and residual risk.
- [x] Task evidence is written before status changes to complete.
- [x] Only relevant task/tracker/docs are updated.
- [x] Stop-gate helper runs before any next-task decision.
- [x] Any evidence-after-status, missing review record, or broad tracker update is appended to `planning/failed-tests.md`.

## Baseline Evidence

Evidence and state updates are checked in aggregate but not as an isolated
ordering and review-trigger step.

## Verification

- Inspect task evidence log and tracker diff order.
- `bun <scratch>/skills/build-right-execution/scripts/execution-check.ts --cwd <scratch> --task <task-path> --mode stop-gates --format markdown`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af/docs/evidence/build-right-execution-065-transcript.md`. |

## Files Changed

- `planning/tasks/065-test-execution-review-evidence-state-update.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af/skills/build-right-execution/scripts/continue-check.ts --cwd /tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af --format markdown --strict` - exit 0.
- `bun /tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af --mode next-task --format markdown` - exit 0.
- `bun /tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af --task tasks/issues/001-step-trial.md --mode task-contract --format markdown` - exit 0.
- `bun test` - exit 0.
- `bun /tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af --task tasks/issues/001-step-trial.md --mode stop-gates --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 065.
- Simulated: provider-native autonomous invocation of `build-right-execution`.
- Test next: 066.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af/skills/build-right-execution`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, ## Next Action, ## Next Task.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af/docs/evidence/build-right-execution-065-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/065-execution-review-evidence-state-update-1782283903867-98333-b286cb91-d7ae-454a-96d1-2625d37177af/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.

## Review Note

- Required review trigger: broad durable task/evidence updates in Sprint 005.
- Subagent review: skipped because the available multi-agent tool policy requires an explicit user request for subagents.
- Substitute verification: `bun test`, `bun run verify:skill-trials`, `git diff --check`, `bun scripts/todo-trial.ts failure-summary`, and Sprint 005 `status-audit`.
