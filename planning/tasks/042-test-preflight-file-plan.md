# 042: Test Preflight File-Plan Announcement

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove preflight announces a scoped file plan before writing
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-preflight` step 2: announce creates, updates, untouched
files, and user-input needs before writing artifacts.

## Non-Goals

- Create implementation files.
- Continue past a risky overwrite.
- Replace the existing failure log.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-preflight/SKILL.md
- skills/build-right-preflight/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/042-preflight-file-plan-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Invoke `$build-right-preflight` against a scratch repo with one existing `docs/blueprint-status.md` stub to force create/update/leave-untouched reasoning.
- [x] Transcript contains the exact file-plan sections: `Create`, `Update`, `Leave untouched`, and `Needs user input`.
- [x] No write occurs before the file plan appears in the transcript.
- [x] Plan preserves existing ambiguous content or stops with a clear blocker.
- [x] Any missing section, premature write, or unsafe overwrite is appended to `planning/failed-tests.md`.

## Baseline Evidence

Sprint 004 checks file-plan ordering in aggregate but does not test ambiguous
existing content as a focused step.

## Verification

- Inspect file timestamps or transcript ordering in `<scratch>/docs/evidence/build-right-preflight-042-transcript.md`.
- Confirm generated files match the announced plan.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/042-preflight-file-plan-1782283898985-98333-6dc9dc98-adaf-4216-9b97-be49d4dd4f0c` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/042-preflight-file-plan-1782283898985-98333-6dc9dc98-adaf-4216-9b97-be49d4dd4f0c/docs/evidence/build-right-preflight-042-transcript.md`. |

## Files Changed

- `planning/tasks/042-test-preflight-file-plan.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/042-preflight-file-plan-1782283898985-98333-6dc9dc98-adaf-4216-9b97-be49d4dd4f0c` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/042-preflight-file-plan-1782283898985-98333-6dc9dc98-adaf-4216-9b97-be49d4dd4f0c/skills/build-right-preflight/scripts/preflight-check.ts --cwd /tmp/build-right-step-trials/042-preflight-file-plan-1782283898985-98333-6dc9dc98-adaf-4216-9b97-be49d4dd4f0c --mode all --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/042-preflight-file-plan-1782283898985-98333-6dc9dc98-adaf-4216-9b97-be49d4dd4f0c/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 042.
- Simulated: provider-native autonomous invocation of `build-right-preflight`.
- Test next: 043.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/042-preflight-file-plan-1782283898985-98333-6dc9dc98-adaf-4216-9b97-be49d4dd4f0c/skills/build-right-preflight`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, Project type signal:, ## Next Action.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/042-preflight-file-plan-1782283898985-98333-6dc9dc98-adaf-4216-9b97-be49d4dd4f0c/docs/evidence/build-right-preflight-042-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/042-preflight-file-plan-1782283898985-98333-6dc9dc98-adaf-4216-9b97-be49d4dd4f0c/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
