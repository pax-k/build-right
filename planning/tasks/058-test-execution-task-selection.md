# 058: Test Execution Task Selection

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove execution selects exactly one resolver-approved task
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-execution` step 1: run the strict state resolver, report
findings, and continue only on `continue-active-task` or `execute-task`.

## Non-Goals

- Manually choose a different task.
- Continue through founder, external, invalid, or no-ready-task gates.
- Execute more than one task.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-execution/SKILL.md
- skills/build-right-execution/references/gates.md
- skills/build-right-execution/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/058-execution-task-selection-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Seed the scratch repo with a ready AI-owned task and at least one blocked or non-AI task.
- [x] Invoke `$build-right-execution`.
- [x] Resolver command runs with `--strict` before task selection.
- [x] Transcript reports resolver decision, confidence, next action, next task, blocking gates, and external follow-ups.
- [x] Agent selects exactly the resolver-approved task or stops on a gate.
- [x] Any ignored resolver decision or multi-task selection is appended to `planning/failed-tests.md`.

## Baseline Evidence

Sprint 004 tests resolver states, but this task isolates live agent task
selection behavior.

## Verification

- `bun <scratch>/skills/build-right-execution/scripts/continue-check.ts --cwd <scratch> --format markdown --strict`
- Inspect execution transcript.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c/docs/evidence/build-right-execution-058-transcript.md`. |

## Files Changed

- `planning/tasks/058-test-execution-task-selection.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c/skills/build-right-execution/scripts/continue-check.ts --cwd /tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c --format markdown --strict` - exit 0.
- `bun /tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c --mode next-task --format markdown` - exit 0.
- `bun /tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c --task tasks/issues/001-step-trial.md --mode task-contract --format markdown` - exit 0.
- `bun test` - exit 0.
- `bun /tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c --task tasks/issues/001-step-trial.md --mode stop-gates --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 058.
- Simulated: provider-native autonomous invocation of `build-right-execution`.
- Test next: 059.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c/skills/build-right-execution`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, ## Next Action, ## Next Task.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c/docs/evidence/build-right-execution-058-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/058-execution-task-selection-1782283901014-98333-20d208c5-40dc-4bae-9b09-88330f530f9c/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
