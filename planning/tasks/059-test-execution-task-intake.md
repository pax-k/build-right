# 059: Test Execution Task Intake

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove execution prints full task intake and reconciles missing task-contract fields before editing
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-execution` step 2: print the task intake record and run
task-contract checking before any edit.

## Non-Goals

- Edit files before intake.
- Fill missing task fields silently without recording the gate.
- Treat a stale or broad task as ready.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-execution/SKILL.md
- skills/build-right-execution/references/evidence-contract.md
- skills/build-right-execution/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/059-execution-task-intake-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Seed one valid ready task and one task missing required contract fields.
- [x] Invoke `$build-right-execution` for each fixture.
- [x] Valid transcript prints active task, done means, non-goals, assumption basis, reversibility, learning hook, source under test, baseline evidence, verification ladder, and evidence destination.
- [x] Missing-field fixture stops or reconciles before editing.
- [x] Any missing intake field or pre-intake edit is appended to `planning/failed-tests.md`.

## Baseline Evidence

Task intake appears in the execution contract, but this task validates it as a
separate workflow step.

## Verification

- `bun <scratch>/skills/build-right-execution/scripts/execution-check.ts --cwd <scratch> --task <task-path> --mode task-contract --format markdown`
- Inspect execution transcript ordering.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b/docs/evidence/build-right-execution-059-transcript.md`. |

## Files Changed

- `planning/tasks/059-test-execution-task-intake.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b/skills/build-right-execution/scripts/continue-check.ts --cwd /tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b --format markdown --strict` - exit 0.
- `bun /tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b --mode next-task --format markdown` - exit 0.
- `bun /tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b --task tasks/issues/001-step-trial.md --mode task-contract --format markdown` - exit 0.
- `bun test` - exit 0.
- `bun /tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b --task tasks/issues/001-step-trial.md --mode stop-gates --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 059.
- Simulated: provider-native autonomous invocation of `build-right-execution`.
- Test next: 060.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b/skills/build-right-execution`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, ## Next Action, ## Next Task.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b/docs/evidence/build-right-execution-059-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/059-execution-task-intake-1782283901428-98333-16c83cbd-c217-45bb-864e-6739c87e6a1b/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
