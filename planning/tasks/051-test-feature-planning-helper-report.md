# 051: Test Feature Planning Helper Report

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove feature planning reports helper findings before writing
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-feature-planning` step 2: run the planning helper and
report decision, confidence, feature request, destination, gates, questions,
research triggers, ready candidates, and next action.

## Non-Goals

- Treat helper output as unreviewable authority.
- Update artifacts before the helper report.
- Implement the requested feature.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-feature-planning/SKILL.md
- skills/build-right-feature-planning/references/workflow.md
- skills/build-right-feature-planning/references/gates.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/051-feature-planning-helper-report-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Invoke `$build-right-feature-planning` with feature request `Add due dates to todos`.
- [x] Helper command runs with `--feature "Add due dates to todos" --format markdown`.
- [x] Transcript reports every required planning-helper field before writes.
- [x] Agent reconciles the helper decision against repo evidence and founder intent.
- [x] Any missing report field, premature write, or ignored helper decision is appended to `planning/failed-tests.md`.

## Baseline Evidence

The planning helper exists, but there is no per-step task proving its report
contract is followed by the agent.

## Verification

- `bun <scratch>/skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd <scratch> --feature "Add due dates to todos" --format markdown`
- Inspect transcript ordering.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/051-feature-planning-helper-report-1782283900113-98333-d04a7517-9820-480e-b733-5c716e688f9b` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/051-feature-planning-helper-report-1782283900113-98333-d04a7517-9820-480e-b733-5c716e688f9b/docs/evidence/build-right-feature-planning-051-transcript.md`. |

## Files Changed

- `planning/tasks/051-test-feature-planning-helper-report.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/051-feature-planning-helper-report-1782283900113-98333-d04a7517-9820-480e-b733-5c716e688f9b` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/051-feature-planning-helper-report-1782283900113-98333-d04a7517-9820-480e-b733-5c716e688f9b/skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd /tmp/build-right-step-trials/051-feature-planning-helper-report-1782283900113-98333-d04a7517-9820-480e-b733-5c716e688f9b --feature Add due dates to todos --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/051-feature-planning-helper-report-1782283900113-98333-d04a7517-9820-480e-b733-5c716e688f9b/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 051.
- Simulated: provider-native autonomous invocation of `build-right-feature-planning`.
- Test next: 052.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/051-feature-planning-helper-report-1782283900113-98333-d04a7517-9820-480e-b733-5c716e688f9b/skills/build-right-feature-planning`.
- Source comparison: pass.
- Contract markers checked: Planning decision:, Confidence:, Feature request:, Recommended destination:, Blocking gates:, Founder questions:, Research triggers:, Ready task candidates:, Next action:.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/051-feature-planning-helper-report-1782283900113-98333-d04a7517-9820-480e-b733-5c716e688f9b/docs/evidence/build-right-feature-planning-051-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/051-feature-planning-helper-report-1782283900113-98333-d04a7517-9820-480e-b733-5c716e688f9b/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
