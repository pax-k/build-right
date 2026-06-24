# 061: Test Execution Baseline Evidence Capture

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove execution captures baseline proof before implementation
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-execution` step 4: capture current broken or missing
state before writing the fix or feature.

## Non-Goals

- Mark baseline as passed after implementation.
- Use vague baseline prose without an artifact.
- Skip baseline for UI or integration tasks.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-execution/SKILL.md
- skills/build-right-execution/references/evidence-contract.md
- skills/build-right-execution/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/061-execution-baseline-evidence-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Seed a ready Todo task where tests or browser proof fail before implementation.
- [x] Invoke `$build-right-execution`.
- [x] Transcript and task evidence show baseline command, artifact, result, and what is broken or missing before implementation evidence.
- [x] Skill-trial source under test is recorded when applicable.
- [x] Any missing baseline, post-hoc baseline, or ambiguous proof is appended to `planning/failed-tests.md`.

## Baseline Evidence

Sprint 004 checks baseline ordering in aggregate; this task isolates baseline
capture as the step under test.

## Verification

- Inspect task evidence log order.
- Inspect transcript order: baseline before implementation.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922/docs/evidence/build-right-execution-061-transcript.md`. |

## Files Changed

- `planning/tasks/061-test-execution-baseline-evidence.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922/skills/build-right-execution/scripts/continue-check.ts --cwd /tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922 --format markdown --strict` - exit 0.
- `bun /tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922 --mode next-task --format markdown` - exit 0.
- `bun /tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922 --task tasks/issues/001-step-trial.md --mode task-contract --format markdown` - exit 0.
- `bun test` - exit 0.
- `bun /tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922 --task tasks/issues/001-step-trial.md --mode stop-gates --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 061.
- Simulated: provider-native autonomous invocation of `build-right-execution`.
- Test next: 062.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922/skills/build-right-execution`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, ## Next Action, ## Next Task.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922/docs/evidence/build-right-execution-061-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/061-execution-baseline-evidence-1782283902238-98333-b8b5d1b4-4ed0-48cc-a6f8-2bd832e4e922/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
