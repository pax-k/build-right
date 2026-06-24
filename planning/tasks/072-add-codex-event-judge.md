# 072: Add Codex Event Judge And Assertions

Status: complete
Type: automation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: judge native Codex replies and execution loops from JSONL events, files, and helper results
Source under test: native Codex event stream and scratch artifacts

## Goal

Extend the native step runner with a deterministic judge. The judge must inspect
Codex JSONL events, last message, generated files, helper command output, and
source parity before deciding whether a step passed.

## Non-Goals

- Let the native agent self-grade.
- Encode brittle prose-only expectations that ignore artifacts.
- Run every step batch.

## Required Reading

- planning/codex-native-step-trial-protocol.md
- scripts/codex-native-step-trials.ts
- scripts/codex-native-skill-replay.ts
- tests/skill-trials.test.ts

## Acceptance Criteria

- [x] Parse `codex-events.jsonl` without crashing on warning or non-agent events.
- [x] Assert the selected skill `SKILL.md` was read.
- [x] Assert required references for the selected skill were read.
- [x] Assert expected helper commands ran when the step requires helpers.
- [x] Assert final agent message contains the required step closeout markers.
- [x] Assert planning-only steps do not create product implementation files.
- [x] Assert execution implementation steps keep changes inside the scratch repo.
- [x] Assert required proof artifacts exist and mention what was proved, simulated, and unproven.
- [x] Append a failure row immediately when any judge expectation fails.
- [x] Add regression coverage for pass, missing skill read, missing helper command, and forbidden write cases.
- [x] Update task 073 to `ready` after evidence is recorded.

## Baseline Evidence

Task 069 checked native replay smoke proof manually through the runner, but a
per-step judge does not yet exist.

## Verification

- `bun test`
- `bun scripts/codex-native-step-trials.ts --task 041`
- `bun scripts/todo-trial.ts failure-summary`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun test` | pass | 28 tests passed, including native event parser and judge regression coverage. |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --task 041` | pass | Live native Codex run passed deterministic judge; scratch repo `/tmp/build-right-native-step-trials/041-preflight-inspect-project-state-1782290642761-8954-fcc1e79f-22e9-4e86-8c89-b161782b683c`. |
| 2026-06-24 | `planning/codex-native-step-trials.md` | pass | Summary reports step 041 as pass with JSONL, proof, helper, and failure status. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | Failure summary regenerated without a new task 072 failure row. |
| 2026-06-24 | `git diff --check` | pass | No whitespace errors. |

## Files Changed

- `scripts/codex-native-step-trials.ts` - adds JSONL event parsing, helper-event assertions, artifact checks, post-run helper logs, failure routing, and pass/fail judgment.
- `tests/skill-trials.test.ts` - adds parser and judge regression fixtures for pass, missing skill read, missing helper command, and forbidden product-file creation.
- `planning/codex-native-step-trials.md` - records live native step 041 pass evidence.
- `planning/tasks/072-add-codex-event-judge.md` - completed task evidence.
- `planning/tasks/073-run-native-preflight-step-trials.md` - moved to ready.
- `planning/sprints/006-codex-native-step-validation.md` - task 072 complete and task 073 ready.

## Verification Summary

- `bun scripts/codex-native-step-trials.ts --help` - pass.
- `bun scripts/codex-native-step-trials.ts --task 041 --dry-run` - pass after judge changes.
- `bun test` - pass, 28 tests.
- `bun scripts/codex-native-step-trials.ts --task 041` - pass, live native Codex step proof.
- `bun scripts/todo-trial.ts failure-summary` - pass.
- `git diff --check` - pass.

## Learning Notes

- Proved: the runner now judges native command-execution events, final agent markers, proof/manual artifacts, post-run helper status, planning-only product-file boundaries, and source-repo write references.
- Simulated: judge negative cases use fixtures; task 073 runs the full preflight native batch.
- Test next: task 073 native preflight steps.

## Blockers

- None.

## Follow-Ups

- None.
