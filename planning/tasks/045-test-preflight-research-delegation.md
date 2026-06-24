# 045: Test Preflight Research And Delegation Routing

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove preflight triggers research or delegation only when the gate requires it
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-preflight` step 5: route to bounded research or
subagent-style review when public evidence, inventory, conflict review, or
readiness audit triggers apply.

## Non-Goals

- Run broad unfocused market research.
- Let a subagent make final product decisions.
- Skip a required review without recording the skip.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-preflight/SKILL.md
- skills/build-right-preflight/references/research-and-delegation.md
- skills/build-right-preflight/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/045-preflight-research-delegation-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Invoke `$build-right-preflight` in `web-assisted` or existing-project mode with a narrow public-evidence gap.
- [x] Transcript announces the research or delegation lane, its purpose, and what it will not prove.
- [x] Evidence is recorded in the right `docs/evidence/` file or the skipped-subagent review is recorded with confidence impact.
- [x] Public evidence is not treated as customer validation.
- [x] Any silent skipped trigger, broad research drift, or wrong evidence destination is appended to `planning/failed-tests.md`.

## Baseline Evidence

Sprint 004 validates shared research/gate markers indirectly, not this routing
step in isolation.

## Verification

- Inspect `<scratch>/docs/evidence/*`.
- Inspect `<scratch>/docs/conflicts.md` and `<scratch>/docs/decision-log.md` when research changes a durable decision.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/045-preflight-research-delegation-1782283899336-98333-6517e258-4249-4bc6-954f-83bc6f9017ae` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/045-preflight-research-delegation-1782283899336-98333-6517e258-4249-4bc6-954f-83bc6f9017ae/docs/evidence/build-right-preflight-045-transcript.md`. |

## Files Changed

- `planning/tasks/045-test-preflight-research-delegation.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/045-preflight-research-delegation-1782283899336-98333-6517e258-4249-4bc6-954f-83bc6f9017ae` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/045-preflight-research-delegation-1782283899336-98333-6517e258-4249-4bc6-954f-83bc6f9017ae/skills/build-right-preflight/scripts/preflight-check.ts --cwd /tmp/build-right-step-trials/045-preflight-research-delegation-1782283899336-98333-6517e258-4249-4bc6-954f-83bc6f9017ae --mode all --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/045-preflight-research-delegation-1782283899336-98333-6517e258-4249-4bc6-954f-83bc6f9017ae/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 045.
- Simulated: provider-native autonomous invocation of `build-right-preflight`.
- Test next: 046.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/045-preflight-research-delegation-1782283899336-98333-6517e258-4249-4bc6-954f-83bc6f9017ae/skills/build-right-preflight`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, Project type signal:, ## Next Action.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/045-preflight-research-delegation-1782283899336-98333-6517e258-4249-4bc6-954f-83bc6f9017ae/docs/evidence/build-right-preflight-045-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/045-preflight-research-delegation-1782283899336-98333-6517e258-4249-4bc6-954f-83bc6f9017ae/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
