# 077: Add Native Step Summary And Failure Feedback Loop

Status: complete
Type: automation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: turn native per-step run results into durable summaries, task statuses, and failure-log feedback
Source under test: native step trial outputs and planning failure log

## Goal

Add summary and feedback automation for native step trials. The summary must
show which native steps passed, failed, were partial, or were blocked, and it
must route failures to actionable follow-up tasks without deleting historical
rows.

## Non-Goals

- Fix failures discovered by steps 041-067.
- Remove expected/control or historical failure rows.
- Mark Sprint 006 complete before final audit.

## Required Reading

- planning/codex-native-step-trial-protocol.md
- planning/failed-tests.md
- planning/failed-test-summary.md
- scripts/codex-native-step-trials.ts
- scripts/todo-trial.ts

## Acceptance Criteria

- [x] Runner writes or updates `planning/codex-native-step-trials.md`.
- [x] Summary lists tasks 041-067 with status, scratch repo, JSONL evidence, proof file, and failure follow-up.
- [x] Summary distinguishes deterministic Sprint 005 proof from native Sprint 006 proof.
- [x] Failure rows are appended immediately for native judge failures.
- [x] Resolution rows are appended only when a rerun proves the same failure class is fixed.
- [x] Add or update a helper command to audit native step statuses if useful.
- [x] Regenerate `planning/failed-test-summary.md`.
- [x] Update task 078 to `ready` after evidence is recorded.

## Baseline Evidence

Task 069 has a native skill replay summary, but there is no per-step native
summary for tasks 041-067.

## Verification

- `bun scripts/codex-native-step-trials.ts --summary`
- `bun scripts/todo-trial.ts failure-summary`
- `bun test`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --summary` | pass | Rebuilt summary with native-vs-deterministic scope note and failure follow-up column. |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --status-audit` | pass | Verified 27 native step rows and evidence artifacts. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | Regenerated failure summary with eleven actionable native rows. |
| 2026-06-24 | `bun test` | pass | 28 tests passed. |
| 2026-06-24 | `git diff --check` | pass | No whitespace errors. |

## Files Changed

- `scripts/codex-native-step-trials.ts` - adds summary follow-up routing, native-vs-deterministic scope text, and `--status-audit`.
- `planning/codex-native-step-trials.md` - regenerated native step summary for all steps 041-067.
- `planning/failed-test-summary.md` - regenerated failure summary after all native batches.
- `planning/tasks/077-add-native-step-summary-and-failure-feedback.md` - completed task evidence.
- `planning/tasks/078-close-native-step-validation-sprint.md` - moved to ready.
- `planning/sprints/006-codex-native-step-validation.md` - task 077 complete and task 078 ready.

## Verification Summary

- `bun scripts/codex-native-step-trials.ts --summary` - pass.
- `bun scripts/codex-native-step-trials.ts --status-audit` - pass, 27 steps.
- `bun scripts/todo-trial.ts failure-summary` - pass.
- `bun test` - pass, 28 tests.
- `git diff --check` - pass.

## Learning Notes

- Proved: summary and audit helper now account for every native step 041-067, evidence paths, statuses, and failure follow-up routing.
- Simulated: no native steps were rerun in task 077; it summarized existing native evidence.
- Test next: task 078 final native sprint audit.

## Blockers

- None.

## Follow-Ups

- None.
