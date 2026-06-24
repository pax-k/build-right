# 052: Test Feature Classification

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove feature planning classifies feature requests into the correct planning destination
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-feature-planning` step 3: classify a feature as product
intent, sprint candidate, backlog item, research-first item, review candidate,
blocked, or contradictory.

## Non-Goals

- Collapse all requests into ready implementation tasks.
- Skip unresolved conflicts.
- Change implementation files.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-feature-planning/SKILL.md
- skills/build-right-feature-planning/references/workflow.md
- skills/build-right-feature-planning/references/gates.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/052-feature-planning-classification-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Run classification prompts for at least three requests: current-sprint Todo due dates, post-MVP collaboration, and a feature conflicting with MVP scope.
- [x] Transcript names the classification and recommended destination for each request.
- [x] Contradictory or founder-owned requests stop at the right gate.
- [x] Backlog items are not marked ready unless they satisfy the execution task contract.
- [x] Any wrong destination or false ready state is appended to `planning/failed-tests.md`.

## Baseline Evidence

Feature classification is described in the skill docs but has no dedicated task
or trial evidence.

## Verification

- Inspect transcript classification table or sections.
- Inspect scratch `tasks/post-release-backlog.md`, sprint tracker, and conflicts file.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/052-feature-planning-classification-1782283900228-98333-b944dd13-9a52-4744-8e70-9712d206ccdf` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/052-feature-planning-classification-1782283900228-98333-b944dd13-9a52-4744-8e70-9712d206ccdf/docs/evidence/build-right-feature-planning-052-transcript.md`. |

## Files Changed

- `planning/tasks/052-test-feature-planning-classification.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/052-feature-planning-classification-1782283900228-98333-b944dd13-9a52-4744-8e70-9712d206ccdf` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/052-feature-planning-classification-1782283900228-98333-b944dd13-9a52-4744-8e70-9712d206ccdf/skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd /tmp/build-right-step-trials/052-feature-planning-classification-1782283900228-98333-b944dd13-9a52-4744-8e70-9712d206ccdf --feature Classify due dates, collaboration, and MVP-conflicting realtime sync --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/052-feature-planning-classification-1782283900228-98333-b944dd13-9a52-4744-8e70-9712d206ccdf/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 052.
- Simulated: provider-native autonomous invocation of `build-right-feature-planning`.
- Test next: 053.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/052-feature-planning-classification-1782283900228-98333-b944dd13-9a52-4744-8e70-9712d206ccdf/skills/build-right-feature-planning`.
- Source comparison: pass.
- Contract markers checked: Planning decision:, Confidence:, Feature request:, Recommended destination:, Blocking gates:, Founder questions:, Research triggers:, Ready task candidates:, Next action:.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/052-feature-planning-classification-1782283900228-98333-b944dd13-9a52-4744-8e70-9712d206ccdf/docs/evidence/build-right-feature-planning-052-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/052-feature-planning-classification-1782283900228-98333-b944dd13-9a52-4744-8e70-9712d206ccdf/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
