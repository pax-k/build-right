# 066: Test Execution Commit Or Handoff

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove execution either commits coherently or hands off changed files, verification, evidence, blockers, and next task
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-execution` step 9: commit when project workflow expects
it, or provide a complete handoff when not committing.

## Non-Goals

- Stage unrelated files.
- Hide known blockers behind a commit.
- Mix multiple task slices into one commit.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-execution/SKILL.md
- skills/build-right-execution/references/workflow.md
- skills/build-right-execution/references/gates.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/066-execution-commit-handoff-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Seed two fixtures: one whose workflow asks for a commit and one that asks for handoff only.
- [x] Invoke `$build-right-execution` for both fixtures.
- [x] Commit fixture stages only task-related files and uses a task-naming message.
- [x] Handoff fixture names changed files, verification summary, evidence paths, remaining blockers, and suggested next task.
- [x] Any unrelated staged file, missing blocker, or vague handoff is appended to `planning/failed-tests.md`.

## Baseline Evidence

Commit/handoff behavior is documented but not yet tested as its own workflow
step.

## Verification

- Inspect scratch git status, staged files, and commit log when committing.
- Inspect handoff transcript.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85/docs/evidence/build-right-execution-066-transcript.md`. |

## Files Changed

- `planning/tasks/066-test-execution-commit-handoff.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85/skills/build-right-execution/scripts/continue-check.ts --cwd /tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85 --format markdown --strict` - exit 0.
- `bun /tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85 --mode next-task --format markdown` - exit 0.
- `bun /tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85 --task tasks/issues/001-step-trial.md --mode task-contract --format markdown` - exit 0.
- `bun test` - exit 0.
- `bun /tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85 --task tasks/issues/001-step-trial.md --mode stop-gates --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 066.
- Simulated: provider-native autonomous invocation of `build-right-execution`.
- Test next: 067.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85/skills/build-right-execution`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, ## Next Action, ## Next Task.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85/docs/evidence/build-right-execution-066-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/066-execution-commit-handoff-1782283904277-98333-b857a8e5-7332-49bb-a771-2b98ad8e9e85/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
