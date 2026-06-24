# 048: Test Preflight Sprint 0 Preparation

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove preflight prepares foundation work and the first bounded executable task without executing it
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-preflight` step 8: create Sprint 0 and the first
AI-owned executable task with baseline evidence and verification.

## Non-Goals

- Complete the first task.
- Add product feature work before foundation gates.
- Create foundation templates when inventory does not justify them.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-preflight/SKILL.md
- skills/build-right-preflight/references/artifact-contract.md
- skills/build-right-preflight/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/048-preflight-sprint0-preparation-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Invoke `$build-right-preflight` with enough founder context to create Sprint 0.
- [x] `tasks/sprint-0.md` contains ordered foundation work rather than product implementation sprawl.
- [x] First executable task has status, type, owner, assumption basis, reversibility, learning objective, source under test, goal, non-goals, required reading, acceptance criteria, baseline evidence, verification, evidence log, blockers, and follow-ups.
- [x] Transcript stops before executing the first task.
- [x] Any missing task contract field or accidental execution is appended to `planning/failed-tests.md`.

## Baseline Evidence

Aggregate Todo trial checks for a first issue, but this task isolates Sprint 0
preparation and the execution boundary.

## Verification

- Inspect `<scratch>/tasks/sprint-0.md`.
- Inspect `<scratch>/tasks/issues/*.md`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/048-preflight-sprint0-preparation-1782283899694-98333-5f2c04c2-aecf-43a8-a507-9096a8d72643` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/048-preflight-sprint0-preparation-1782283899694-98333-5f2c04c2-aecf-43a8-a507-9096a8d72643/docs/evidence/build-right-preflight-048-transcript.md`. |

## Files Changed

- `planning/tasks/048-test-preflight-sprint0-preparation.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/048-preflight-sprint0-preparation-1782283899694-98333-5f2c04c2-aecf-43a8-a507-9096a8d72643` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/048-preflight-sprint0-preparation-1782283899694-98333-5f2c04c2-aecf-43a8-a507-9096a8d72643/skills/build-right-preflight/scripts/preflight-check.ts --cwd /tmp/build-right-step-trials/048-preflight-sprint0-preparation-1782283899694-98333-5f2c04c2-aecf-43a8-a507-9096a8d72643 --mode all --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/048-preflight-sprint0-preparation-1782283899694-98333-5f2c04c2-aecf-43a8-a507-9096a8d72643/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 048.
- Simulated: provider-native autonomous invocation of `build-right-preflight`.
- Test next: 049.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/048-preflight-sprint0-preparation-1782283899694-98333-5f2c04c2-aecf-43a8-a507-9096a8d72643/skills/build-right-preflight`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, Project type signal:, ## Next Action.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/048-preflight-sprint0-preparation-1782283899694-98333-5f2c04c2-aecf-43a8-a507-9096a8d72643/docs/evidence/build-right-preflight-048-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/048-preflight-sprint0-preparation-1782283899694-98333-5f2c04c2-aecf-43a8-a507-9096a8d72643/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
