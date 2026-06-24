# 044: Test Preflight Claim And Evidence Tagging

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove preflight tags important claims with the correct evidence basis
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-preflight` step 4: separate assumptions, founder claims,
repo evidence, public evidence, and customer evidence.

## Non-Goals

- Upgrade public research into customer validation.
- Hide unsupported claims.
- Resolve founder-owned decisions.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-preflight/SKILL.md
- skills/build-right-preflight/references/artifact-contract.md
- skills/build-right-preflight/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/044-preflight-claim-evidence-tagging-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Invoke `$build-right-preflight` with mixed founder claims, repo facts, and unsupported market claims.
- [x] Generated evidence docs use only valid claim statuses from the artifact contract.
- [x] Repository facts are tagged `repo-evidence-backed`; unsupported market claims remain assumptions or unknown.
- [x] No claim is marked `customer-evidence-backed` without direct customer evidence.
- [x] Any missing claim status, invalid status, or evidence-type inflation is appended to `planning/failed-tests.md`.

## Baseline Evidence

Existing aggregate tests check required artifacts, not claim-by-claim evidence
status correctness.

## Verification

- Inspect `<scratch>/docs/evidence/evidence-notes.md`.
- Inspect `<scratch>/docs/mvp-scope.md` and `<scratch>/docs/source-index.md`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/044-preflight-claim-evidence-tagging-1782283899214-98333-e8e586e3-161b-4a52-84ce-fb97970e6a4a` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/044-preflight-claim-evidence-tagging-1782283899214-98333-e8e586e3-161b-4a52-84ce-fb97970e6a4a/docs/evidence/build-right-preflight-044-transcript.md`. |

## Files Changed

- `planning/tasks/044-test-preflight-claim-evidence-tagging.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/044-preflight-claim-evidence-tagging-1782283899214-98333-e8e586e3-161b-4a52-84ce-fb97970e6a4a` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/044-preflight-claim-evidence-tagging-1782283899214-98333-e8e586e3-161b-4a52-84ce-fb97970e6a4a/skills/build-right-preflight/scripts/preflight-check.ts --cwd /tmp/build-right-step-trials/044-preflight-claim-evidence-tagging-1782283899214-98333-e8e586e3-161b-4a52-84ce-fb97970e6a4a --mode all --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/044-preflight-claim-evidence-tagging-1782283899214-98333-e8e586e3-161b-4a52-84ce-fb97970e6a4a/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 044.
- Simulated: provider-native autonomous invocation of `build-right-preflight`.
- Test next: 045.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/044-preflight-claim-evidence-tagging-1782283899214-98333-e8e586e3-161b-4a52-84ce-fb97970e6a4a/skills/build-right-preflight`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, Project type signal:, ## Next Action.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/044-preflight-claim-evidence-tagging-1782283899214-98333-e8e586e3-161b-4a52-84ce-fb97970e6a4a/docs/evidence/build-right-preflight-044-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/044-preflight-claim-evidence-tagging-1782283899214-98333-e8e586e3-161b-4a52-84ce-fb97970e6a4a/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
