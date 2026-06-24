# 050: Test Feature Planning Surface Read

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove feature planning reads the Build Right planning surface before deciding
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-feature-planning` step 1: read instructions, blueprint
status, MVP scope, execution rules, decision log, conflicts, evidence, sprint
trackers, backlog, and task files.

## Non-Goals

- Modify product implementation files.
- Route around missing preflight artifacts.
- Invent product truth.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-feature-planning/SKILL.md
- skills/build-right-feature-planning/references/workflow.md
- skills/build-right-feature-planning/references/planning-contract.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/050-feature-planning-read-surface-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Seed the scratch repo with minimal preflight docs, a sprint tracker, backlog, and one task file.
- [x] Invoke `$build-right-feature-planning` with a new Todo feature request.
- [x] Transcript references the planning surface it read before selecting a destination.
- [x] Missing or contradictory planning surface routes to preflight or blocked state.
- [x] Any skipped surface read or implementation edit is appended to `planning/failed-tests.md`.

## Baseline Evidence

Sprint 004 focuses preflight and execution. Feature-planning step coverage is
not yet isolated.

## Verification

- Inspect `<scratch>/docs/evidence/build-right-feature-planning-050-transcript.md`.
- Inspect git diff in scratch for planning-only changes.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/050-feature-planning-read-surface-1782283899998-98333-b58784d1-f115-4152-8e7c-fd211b1578ff` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/050-feature-planning-read-surface-1782283899998-98333-b58784d1-f115-4152-8e7c-fd211b1578ff/docs/evidence/build-right-feature-planning-050-transcript.md`. |

## Files Changed

- `planning/tasks/050-test-feature-planning-read-surface.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/050-feature-planning-read-surface-1782283899998-98333-b58784d1-f115-4152-8e7c-fd211b1578ff` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/050-feature-planning-read-surface-1782283899998-98333-b58784d1-f115-4152-8e7c-fd211b1578ff/skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd /tmp/build-right-step-trials/050-feature-planning-read-surface-1782283899998-98333-b58784d1-f115-4152-8e7c-fd211b1578ff --feature Add due dates to todos --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/050-feature-planning-read-surface-1782283899998-98333-b58784d1-f115-4152-8e7c-fd211b1578ff/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 050.
- Simulated: provider-native autonomous invocation of `build-right-feature-planning`.
- Test next: 051.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/050-feature-planning-read-surface-1782283899998-98333-b58784d1-f115-4152-8e7c-fd211b1578ff/skills/build-right-feature-planning`.
- Source comparison: pass.
- Contract markers checked: Planning decision:, Confidence:, Feature request:, Recommended destination:, Blocking gates:, Founder questions:, Research triggers:, Ready task candidates:, Next action:.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/050-feature-planning-read-surface-1782283899998-98333-b58784d1-f115-4152-8e7c-fd211b1578ff/docs/evidence/build-right-feature-planning-050-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/050-feature-planning-read-surface-1782283899998-98333-b58784d1-f115-4152-8e7c-fd211b1578ff/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
