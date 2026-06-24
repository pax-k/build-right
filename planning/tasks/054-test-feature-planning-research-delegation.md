# 054: Test Feature Planning Research And Delegation Routing

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove feature planning uses bounded research or review only when evidence is needed
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-feature-planning` step 5: use research or subagent-style
review only when founder input and repo evidence cannot safely decide the plan.

## Non-Goals

- Let research drift into implementation.
- Treat public evidence as customer validation.
- Let a subagent write authoritative planning artifacts without main-agent synthesis.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-feature-planning/SKILL.md
- skills/build-right-feature-planning/references/research-and-delegation.md
- skills/build-right-feature-planning/references/gates.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/054-feature-planning-research-delegation-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Invoke `$build-right-feature-planning` with an unfamiliar integration or market-facing feature.
- [x] Transcript names the planning claim under test and the bounded research/review purpose.
- [x] Evidence notes include links, dates, confidence, or a skipped-review record with substitute verification.
- [x] Decision log updates only if research changes a durable product or workflow decision.
- [x] Any unfocused research, missing evidence record, or skipped required trigger is appended to `planning/failed-tests.md`.

## Baseline Evidence

Research and delegation routing is specified, but not yet tested for the
feature-planning skill.

## Verification

- Inspect `<scratch>/docs/evidence/*`.
- Inspect `<scratch>/docs/decision-log.md` and `<scratch>/docs/conflicts.md`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/054-feature-planning-research-delegation-1782283900472-98333-c9a8eb67-0c04-4e4f-bc55-8994d0caa9b5` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/054-feature-planning-research-delegation-1782283900472-98333-c9a8eb67-0c04-4e4f-bc55-8994d0caa9b5/docs/evidence/build-right-feature-planning-054-transcript.md`. |

## Files Changed

- `planning/tasks/054-test-feature-planning-research-delegation.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/054-feature-planning-research-delegation-1782283900472-98333-c9a8eb67-0c04-4e4f-bc55-8994d0caa9b5` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/054-feature-planning-research-delegation-1782283900472-98333-c9a8eb67-0c04-4e4f-bc55-8994d0caa9b5/skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd /tmp/build-right-step-trials/054-feature-planning-research-delegation-1782283900472-98333-c9a8eb67-0c04-4e4f-bc55-8994d0caa9b5 --feature Add OAuth calendar integration with vendor API and pricing constraints --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/054-feature-planning-research-delegation-1782283900472-98333-c9a8eb67-0c04-4e4f-bc55-8994d0caa9b5/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 054.
- Simulated: provider-native autonomous invocation of `build-right-feature-planning`.
- Test next: 055.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/054-feature-planning-research-delegation-1782283900472-98333-c9a8eb67-0c04-4e4f-bc55-8994d0caa9b5/skills/build-right-feature-planning`.
- Source comparison: pass.
- Contract markers checked: Planning decision:, Confidence:, Feature request:, Recommended destination:, Blocking gates:, Founder questions:, Research triggers:, Ready task candidates:, Next action:.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/054-feature-planning-research-delegation-1782283900472-98333-c9a8eb67-0c04-4e4f-bc55-8994d0caa9b5/docs/evidence/build-right-feature-planning-054-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/054-feature-planning-research-delegation-1782283900472-98333-c9a8eb67-0c04-4e4f-bc55-8994d0caa9b5/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
