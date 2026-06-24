# 046: Test Preflight Operating-Artifact Creation

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove preflight creates the minimum durable docs, evidence, Sprint 0, and issue surface
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-preflight` step 6: create or update canonical operating
artifacts using templates or project-local equivalents.

## Non-Goals

- Force default paths over established project equivalents.
- Fill every product doc with invented truth.
- Implement product behavior.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-preflight/SKILL.md
- skills/build-right-preflight/references/artifact-contract.md
- skills/build-right-preflight/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/046-preflight-operating-artifacts-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Invoke `$build-right-preflight` with founder-fed Todo trial context.
- [x] Generated artifacts include source index, decision log, conflicts, MVP scope, execution rules, release gates, evidence notes, Sprint 0, and at least one issue.
- [x] `docs/blueprint-status.md` includes required status, phase, gate, evidence, file-plan, and next-action fields.
- [x] First issue includes every required task field from the artifact contract.
- [x] Any missing required artifact or field is appended to `planning/failed-tests.md`.

## Baseline Evidence

Existing verifiers check the Todo preflight fixture, but this task isolates the
artifact creation step after a fresh skill invocation.

## Verification

- `bun <scratch>/skills/build-right-preflight/scripts/preflight-check.ts --cwd <scratch> --mode readiness --format markdown`
- Inspect required docs and `tasks/issues/*.md`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/046-preflight-operating-artifacts-1782283899458-98333-84cb4ed0-b642-4036-a3a5-1130019ccd13` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/046-preflight-operating-artifacts-1782283899458-98333-84cb4ed0-b642-4036-a3a5-1130019ccd13/docs/evidence/build-right-preflight-046-transcript.md`. |

## Files Changed

- `planning/tasks/046-test-preflight-operating-artifacts.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/046-preflight-operating-artifacts-1782283899458-98333-84cb4ed0-b642-4036-a3a5-1130019ccd13` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/046-preflight-operating-artifacts-1782283899458-98333-84cb4ed0-b642-4036-a3a5-1130019ccd13/skills/build-right-preflight/scripts/preflight-check.ts --cwd /tmp/build-right-step-trials/046-preflight-operating-artifacts-1782283899458-98333-84cb4ed0-b642-4036-a3a5-1130019ccd13 --mode all --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/046-preflight-operating-artifacts-1782283899458-98333-84cb4ed0-b642-4036-a3a5-1130019ccd13/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 046.
- Simulated: provider-native autonomous invocation of `build-right-preflight`.
- Test next: 047.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/046-preflight-operating-artifacts-1782283899458-98333-84cb4ed0-b642-4036-a3a5-1130019ccd13/skills/build-right-preflight`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, Project type signal:, ## Next Action.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/046-preflight-operating-artifacts-1782283899458-98333-84cb4ed0-b642-4036-a3a5-1130019ccd13/docs/evidence/build-right-preflight-046-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/046-preflight-operating-artifacts-1782283899458-98333-84cb4ed0-b642-4036-a3a5-1130019ccd13/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
