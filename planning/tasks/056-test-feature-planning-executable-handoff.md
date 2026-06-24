# 056: Test Feature Planning Executable Handoff

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove feature planning reruns helpers and confirms a ready task is visible to execution
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-feature-planning` step 7: rerun planning helper and, when
a task should be executable, run the execution resolver to confirm handoff.

## Non-Goals

- Execute the task.
- Claim handoff while execution resolver cannot find the task.
- Ignore blocking gates.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-feature-planning/SKILL.md
- skills/build-right-feature-planning/references/gates.md
- skills/build-right-feature-planning/references/workflow.md
- skills/build-right-execution/references/gates.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/056-feature-planning-executable-handoff-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Invoke `$build-right-feature-planning` to create a ready AI-owned task.
- [x] Planning helper reruns after artifact updates.
- [x] Execution resolver runs with `--strict` and returns `execute-task` or `continue-active-task` for the expected task.
- [x] Closeout uses `Ready for execution: <task path>`.
- [x] Any false-ready task, resolver mismatch, or skipped rerun is appended to `planning/failed-tests.md`.

## Baseline Evidence

Feature-to-execution handoff is not covered by the Sprint 004 preflight and
execution aggregate tasks.

## Verification

- `bun <scratch>/skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd <scratch> --feature "<feature>" --format markdown`
- `bun <scratch>/skills/build-right-execution/scripts/continue-check.ts --cwd <scratch> --format markdown --strict`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/056-feature-planning-executable-handoff-1782283900708-98333-9018159e-74c8-4a41-80bc-72642d8ead01` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/056-feature-planning-executable-handoff-1782283900708-98333-9018159e-74c8-4a41-80bc-72642d8ead01/docs/evidence/build-right-feature-planning-056-transcript.md`. |

## Files Changed

- `planning/tasks/056-test-feature-planning-executable-handoff.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/056-feature-planning-executable-handoff-1782283900708-98333-9018159e-74c8-4a41-80bc-72642d8ead01` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/056-feature-planning-executable-handoff-1782283900708-98333-9018159e-74c8-4a41-80bc-72642d8ead01/skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd /tmp/build-right-step-trials/056-feature-planning-executable-handoff-1782283900708-98333-9018159e-74c8-4a41-80bc-72642d8ead01 --feature Add due dates to todos as a ready AI-owned task --format markdown` - exit 0.
- `bun /tmp/build-right-step-trials/056-feature-planning-executable-handoff-1782283900708-98333-9018159e-74c8-4a41-80bc-72642d8ead01/skills/build-right-execution/scripts/continue-check.ts --cwd /tmp/build-right-step-trials/056-feature-planning-executable-handoff-1782283900708-98333-9018159e-74c8-4a41-80bc-72642d8ead01 --format markdown --strict` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/056-feature-planning-executable-handoff-1782283900708-98333-9018159e-74c8-4a41-80bc-72642d8ead01/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 056.
- Simulated: provider-native autonomous invocation of `build-right-feature-planning`.
- Test next: 057.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/056-feature-planning-executable-handoff-1782283900708-98333-9018159e-74c8-4a41-80bc-72642d8ead01/skills/build-right-feature-planning`.
- Source comparison: pass.
- Contract markers checked: Planning decision:, Confidence:, Feature request:, Recommended destination:, Blocking gates:, Founder questions:, Research triggers:, Ready task candidates:, Next action:.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/056-feature-planning-executable-handoff-1782283900708-98333-9018159e-74c8-4a41-80bc-72642d8ead01/docs/evidence/build-right-feature-planning-056-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/056-feature-planning-executable-handoff-1782283900708-98333-9018159e-74c8-4a41-80bc-72642d8ead01/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
