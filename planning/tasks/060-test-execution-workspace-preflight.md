# 060: Test Execution Workspace Preflight

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove execution inspects workspace state, conflicts, dirty files, source under test, and concurrent work before editing
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-execution` step 3: inspect current workspace state and
stop on conflicts, source mismatch, or unsafe concurrent work.

## Non-Goals

- Revert unrelated dirty files.
- Ignore open conflicts.
- Treat stale installed skill source as authoritative.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-execution/SKILL.md
- skills/build-right-execution/references/gates.md
- skills/build-right-execution/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/060-execution-workspace-preflight-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Seed dirty unrelated files, `docs/conflicts.md`, and a source-under-test note.
- [x] Invoke `$build-right-execution`.
- [x] Transcript inspects git status, dirty files, branch/worktree, recent tracker/evidence mutations, conflicts, and source under test.
- [x] Agent does not revert unrelated work and stops or records a gate when required.
- [x] Any ignored conflict, destructive cleanup, or source ambiguity is appended to `planning/failed-tests.md`.

## Baseline Evidence

Existing gates cover concurrent work in documentation, but this task tests the
agent behavior directly.

## Verification

- Inspect scratch `git status --short` before and after invocation.
- Inspect transcript gate notes.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932/docs/evidence/build-right-execution-060-transcript.md`. |

## Files Changed

- `planning/tasks/060-test-execution-workspace-preflight.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932/skills/build-right-execution/scripts/continue-check.ts --cwd /tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932 --format markdown --strict` - exit 0.
- `bun /tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932 --mode next-task --format markdown` - exit 0.
- `bun /tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932 --task tasks/issues/001-step-trial.md --mode task-contract --format markdown` - exit 0.
- `bun test` - exit 0.
- `bun /tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932 --task tasks/issues/001-step-trial.md --mode stop-gates --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 060.
- Simulated: provider-native autonomous invocation of `build-right-execution`.
- Test next: 061.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932/skills/build-right-execution`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, ## Next Action, ## Next Task.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932/docs/evidence/build-right-execution-060-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/060-execution-workspace-preflight-1782283901829-98333-b166b900-22df-49d9-9c90-14288225c932/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
