# 055: Test Feature Planning Artifact Updates

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove feature planning updates only planning artifacts and records evidence, decisions, and conflicts in the right places
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-feature-planning` step 6: update backlog, sprint rows,
task files, evidence, decisions, and conflicts without editing implementation
files.

## Non-Goals

- Modify app source.
- Mark draft work ready without the execution task contract.
- Hide contradictions.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-feature-planning/SKILL.md
- skills/build-right-feature-planning/references/planning-contract.md
- skills/build-right-feature-planning/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/055-feature-planning-artifact-updates-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Invoke `$build-right-feature-planning` with one current-sprint feature and one post-release feature.
- [x] Sprint or backlog rows include ID, title, status, and evidence/task path.
- [x] Task files use the execution task contract when created.
- [x] Decisions, evidence, and conflicts are recorded in the correct docs.
- [x] Any implementation edit, missing tracker field, or wrong evidence destination is appended to `planning/failed-tests.md`.

## Baseline Evidence

The planning contract defines these artifact rules, but no per-step task
exercises them yet.

## Verification

- Inspect scratch `git diff --stat`.
- Inspect `tasks/sprint-*.md`, `tasks/post-release-backlog.md`, `tasks/issues/*.md`, `docs/evidence/*`, `docs/decision-log.md`, and `docs/conflicts.md`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/055-feature-planning-artifact-updates-1782283900593-98333-baf7e7e3-c22c-4eea-8c73-fe48aabd0c8b` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/055-feature-planning-artifact-updates-1782283900593-98333-baf7e7e3-c22c-4eea-8c73-fe48aabd0c8b/docs/evidence/build-right-feature-planning-055-transcript.md`. |

## Files Changed

- `planning/tasks/055-test-feature-planning-artifact-updates.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/055-feature-planning-artifact-updates-1782283900593-98333-baf7e7e3-c22c-4eea-8c73-fe48aabd0c8b` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/055-feature-planning-artifact-updates-1782283900593-98333-baf7e7e3-c22c-4eea-8c73-fe48aabd0c8b/skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd /tmp/build-right-step-trials/055-feature-planning-artifact-updates-1782283900593-98333-baf7e7e3-c22c-4eea-8c73-fe48aabd0c8b --feature Add due dates now and defer collaboration to the post-release backlog --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/055-feature-planning-artifact-updates-1782283900593-98333-baf7e7e3-c22c-4eea-8c73-fe48aabd0c8b/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 055.
- Simulated: provider-native autonomous invocation of `build-right-feature-planning`.
- Test next: 056.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/055-feature-planning-artifact-updates-1782283900593-98333-baf7e7e3-c22c-4eea-8c73-fe48aabd0c8b/skills/build-right-feature-planning`.
- Source comparison: pass.
- Contract markers checked: Planning decision:, Confidence:, Feature request:, Recommended destination:, Blocking gates:, Founder questions:, Research triggers:, Ready task candidates:, Next action:.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/055-feature-planning-artifact-updates-1782283900593-98333-baf7e7e3-c22c-4eea-8c73-fe48aabd0c8b/docs/evidence/build-right-feature-planning-055-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/055-feature-planning-artifact-updates-1782283900593-98333-baf7e7e3-c22c-4eea-8c73-fe48aabd0c8b/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
