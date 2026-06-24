# 047: Test Preflight MVP And Prototype Scope Extraction

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove preflight extracts a bounded MVP or reversible prototype without durable overcommitment
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-preflight` step 7: extract primary customer, workflow,
value moment, exclusions, risk reduction, manual delivery path, and validation
requirements.

## Non-Goals

- Commit to irreversible architecture from public-first prototype evidence.
- Add pricing, onboarding, or schema commitments without a task requiring them.
- Treat a prototype as product-feature readiness.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-preflight/SKILL.md
- skills/build-right-preflight/references/artifact-contract.md
- skills/build-right-preflight/references/founder-gates.md
- skills/build-right-preflight/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/047-preflight-mvp-prototype-scope-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Invoke `$build-right-preflight` once with founder-fed scope and once with public-first prototype constraints if feasible.
- [x] `docs/mvp-scope.md` names one primary customer, one workflow, one value moment, explicit exclusions, and manual-before-automation choices.
- [x] Prototype assumptions are labeled and include validation required before product truth.
- [x] Durable commitments are absent unless evidence-backed.
- [x] Any overbroad MVP, unlabeled prototype assumption, or irreversible unsupported commitment is appended to `planning/failed-tests.md`.

## Baseline Evidence

Sprint 004 has a Todo app oracle, but it does not isolate MVP/prototype scope
extraction quality.

## Verification

- Inspect `<scratch>/docs/mvp-scope.md`.
- Inspect `<scratch>/docs/evidence/evidence-notes.md`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/047-preflight-mvp-prototype-scope-1782283899579-98333-39bd0d69-218b-4bc1-b453-ccd92f8965ad` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/047-preflight-mvp-prototype-scope-1782283899579-98333-39bd0d69-218b-4bc1-b453-ccd92f8965ad/docs/evidence/build-right-preflight-047-transcript.md`. |

## Files Changed

- `planning/tasks/047-test-preflight-mvp-prototype-scope.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/047-preflight-mvp-prototype-scope-1782283899579-98333-39bd0d69-218b-4bc1-b453-ccd92f8965ad` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/047-preflight-mvp-prototype-scope-1782283899579-98333-39bd0d69-218b-4bc1-b453-ccd92f8965ad/skills/build-right-preflight/scripts/preflight-check.ts --cwd /tmp/build-right-step-trials/047-preflight-mvp-prototype-scope-1782283899579-98333-39bd0d69-218b-4bc1-b453-ccd92f8965ad --mode all --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/047-preflight-mvp-prototype-scope-1782283899579-98333-39bd0d69-218b-4bc1-b453-ccd92f8965ad/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 047.
- Simulated: provider-native autonomous invocation of `build-right-preflight`.
- Test next: 048.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/047-preflight-mvp-prototype-scope-1782283899579-98333-39bd0d69-218b-4bc1-b453-ccd92f8965ad/skills/build-right-preflight`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, Project type signal:, ## Next Action.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/047-preflight-mvp-prototype-scope-1782283899579-98333-39bd0d69-218b-4bc1-b453-ccd92f8965ad/docs/evidence/build-right-preflight-047-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/047-preflight-mvp-prototype-scope-1782283899579-98333-39bd0d69-218b-4bc1-b453-ccd92f8965ad/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
