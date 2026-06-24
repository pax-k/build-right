# 053: Test Feature Planning Founder Questions

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove feature planning asks only founder-owned questions that change the plan
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-feature-planning` step 4: ask founder questions only when
priority, scope, user promise, product truth, or acceptance criteria require a
founder decision.

## Non-Goals

- Convert founder-owned decisions into AI-owned tasks.
- Ask broad discovery questions unrelated to the feature decision.
- Implement the feature.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-feature-planning/SKILL.md
- skills/build-right-feature-planning/references/gates.md
- skills/build-right-feature-planning/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/053-feature-planning-founder-questions-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Invoke `$build-right-feature-planning` with a feature whose acceptance criteria affect product promise.
- [x] Transcript asks a small focused founder-question batch before planning changes.
- [x] If prompt or repo docs already answer the question, transcript records the evidence path instead of asking again.
- [x] No task is marked ready while the founder-owned decision is unresolved.
- [x] Any skipped founder gate, overbroad batch, or AI-owned conversion is appended to `planning/failed-tests.md`.

## Baseline Evidence

Founder-question handling exists in the gates reference, but it needs a
dedicated feature-planning trial.

## Verification

- Inspect transcript.
- Inspect scratch sprint/backlog/task statuses.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/053-feature-planning-founder-questions-1782283900354-98333-35db254c-0c6f-4ad5-9d78-5494a2c20487` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/053-feature-planning-founder-questions-1782283900354-98333-35db254c-0c6f-4ad5-9d78-5494a2c20487/docs/evidence/build-right-feature-planning-053-transcript.md`. |

## Files Changed

- `planning/tasks/053-test-feature-planning-founder-questions.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/053-feature-planning-founder-questions-1782283900354-98333-35db254c-0c6f-4ad5-9d78-5494a2c20487` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/053-feature-planning-founder-questions-1782283900354-98333-35db254c-0c6f-4ad5-9d78-5494a2c20487/skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd /tmp/build-right-step-trials/053-feature-planning-founder-questions-1782283900354-98333-35db254c-0c6f-4ad5-9d78-5494a2c20487 --feature Should we launch paid shared Todo workspaces in the MVP? --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/053-feature-planning-founder-questions-1782283900354-98333-35db254c-0c6f-4ad5-9d78-5494a2c20487/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 053.
- Simulated: provider-native autonomous invocation of `build-right-feature-planning`.
- Test next: 054.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/053-feature-planning-founder-questions-1782283900354-98333-35db254c-0c6f-4ad5-9d78-5494a2c20487/skills/build-right-feature-planning`.
- Source comparison: pass.
- Contract markers checked: Planning decision:, Confidence:, Feature request:, Recommended destination:, Blocking gates:, Founder questions:, Research triggers:, Ready task candidates:, Next action:.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/053-feature-planning-founder-questions-1782283900354-98333-35db254c-0c6f-4ad5-9d78-5494a2c20487/docs/evidence/build-right-feature-planning-053-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/053-feature-planning-founder-questions-1782283900354-98333-35db254c-0c6f-4ad5-9d78-5494a2c20487/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
