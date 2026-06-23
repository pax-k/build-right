# 002: Define Manual Trial Evidence Paths

Status: complete
Type: release
Owner: AI

## Goal

Define where manual trial evidence should be recorded for blank-project preflight, ready-task execution, and not-ready execution. Existing-project preflight evidence exists from the self-adoption run and needs a durable summary path.

## Non-Goals

- Run the remaining manual trials.
- Publish a new release.
- Change skill behavior.

## Required Reading

- RELEASE_CHECKLIST.md
- docs/open-questions.md
- docs/release-gates.md
- tasks/issues/001-establish-execution-baseline.md

## Acceptance Criteria

- [x] Evidence paths are defined for blank-project preflight, existing-project preflight summary, ready-task execution, and not-ready execution in `docs/release-gates.md`.
- [x] `RELEASE_CHECKLIST.md` is updated only if the evidence destination needs to be durable outside `docs/release-gates.md`.
- [x] Sprint 0 next state is updated.

## Baseline Evidence

Record the current release evidence and the manual-trial evidence destination decision.

## Verification

- Inspect `docs/release-gates.md`.
- Inspect `tasks/sprint-0.md`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | Existing-project self-adoption run | partial | Existing-project preflight trial ran against this repo; durable summary still needs a home. |
| 2026-06-23 | `git status --short docs tasks RELEASE_CHECKLIST.md` | baseline | Existing docs/tasks and release checklist had uncommitted changes before this task; task edits stayed within release/manual-trial tracking. |
| 2026-06-23 | `docs/evidence/manual-trials.md` | pass | Durable manual-trial evidence home created with sections for blank-project preflight, existing-project preflight, ready-task execution, and not-ready execution. |
| 2026-06-23 | `docs/release-gates.md` | pass | Manual-trial gates now point to durable evidence sections and follow-up task files. |
| 2026-06-23 | `RELEASE_CHECKLIST.md` | pass | Manual-trial checklist rows now name the durable evidence sections. |
| 2026-06-23 | `tasks/sprint-0.md` | pass | Task 002 marked complete and tasks 004-006 added as ready follow-up trials. |
| 2026-06-23 | `rg 'Manual evidence path to be defined|path to be defined' docs RELEASE_CHECKLIST.md tasks -g '!tasks/issues/002-define-manual-trial-evidence.md'` | pass | No stale undefined-path markers remain outside this task's own evidence text. |
| 2026-06-23 | `rg 'blank-project-preflight|existing-project-preflight|ready-task-execution|not-ready-execution' docs/evidence/manual-trials.md docs/release-gates.md RELEASE_CHECKLIST.md` | pass | All four durable evidence anchors are referenced in the evidence file, release gates, and release checklist. |
| 2026-06-23 | `git diff --check` | pass | No whitespace errors. |

## Files Changed

- `docs/evidence/manual-trials.md` - durable evidence home for manual release trials.
- `docs/release-gates.md` - manual-trial gates now point at durable evidence sections and follow-up task files.
- `RELEASE_CHECKLIST.md` - manual trial checklist rows now name the evidence sections.
- `tasks/sprint-0.md` - task 002 marked complete and trial tasks 004-006 added.
- `tasks/issues/002-define-manual-trial-evidence.md` - task evidence and completion state updated.
- `tasks/issues/004-run-blank-project-preflight-trial.md` - follow-up trial task.
- `tasks/issues/005-run-ready-task-execution-trial.md` - follow-up trial task.
- `tasks/issues/006-run-not-ready-execution-trial.md` - follow-up trial task.

## Verification Summary

- `rg 'Manual evidence path to be defined|path to be defined' docs RELEASE_CHECKLIST.md tasks -g '!tasks/issues/002-define-manual-trial-evidence.md'` - pass, no stale undefined-path markers outside this task's own evidence text.
- `rg 'blank-project-preflight|existing-project-preflight|ready-task-execution|not-ready-execution' docs/evidence/manual-trials.md docs/release-gates.md RELEASE_CHECKLIST.md` - pass, all four evidence anchors are wired.
- `git diff --check` - pass.

## Blockers

- None.

## Follow-Ups

- tasks/issues/004-run-blank-project-preflight-trial.md
- tasks/issues/005-run-ready-task-execution-trial.md
- tasks/issues/006-run-not-ready-execution-trial.md
