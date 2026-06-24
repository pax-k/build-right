# 043: Test Preflight Founder-Context Capture

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove preflight asks the smallest useful founder-question batch and records answers as raw context
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-preflight` step 3: capture founder context without
promoting it to validated product truth.

## Non-Goals

- Treat public research as customer validation.
- Ask every possible product question at once.
- Implement the product.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-preflight/SKILL.md
- skills/build-right-preflight/references/founder-gates.md
- skills/build-right-preflight/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/043-preflight-founder-context-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Invoke `$build-right-preflight` with thin founder context and wait for its question batch.
- [x] Transcript asks only focused founder questions that unblock intent, customer, promise, MVP, or evidence.
- [x] Founder reply is recorded in `docs/raw/founder-dump.md` or `docs/raw/founder-interview.md`.
- [x] Affected claims remain `founder-claimed`, `needs-founder`, `prototype-assumption`, or `unknown` until validated.
- [x] Any overbroad question batch, skipped founder gate, or unsupported truth claim is appended to `planning/failed-tests.md`.

## Baseline Evidence

The Todo trial protocol has a founder reply batch, but this task tests the
question/capture step directly.

## Verification

- Inspect `<scratch>/docs/evidence/build-right-preflight-043-transcript.md`.
- Inspect `<scratch>/docs/raw/founder-dump.md` and `<scratch>/docs/raw/founder-interview.md`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/043-preflight-founder-context-1782283899100-98333-bea20d56-4937-4f89-9e2c-f3aec87326b7` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/043-preflight-founder-context-1782283899100-98333-bea20d56-4937-4f89-9e2c-f3aec87326b7/docs/evidence/build-right-preflight-043-transcript.md`. |

## Files Changed

- `planning/tasks/043-test-preflight-founder-context.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/043-preflight-founder-context-1782283899100-98333-bea20d56-4937-4f89-9e2c-f3aec87326b7` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/043-preflight-founder-context-1782283899100-98333-bea20d56-4937-4f89-9e2c-f3aec87326b7/skills/build-right-preflight/scripts/preflight-check.ts --cwd /tmp/build-right-step-trials/043-preflight-founder-context-1782283899100-98333-bea20d56-4937-4f89-9e2c-f3aec87326b7 --mode all --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/043-preflight-founder-context-1782283899100-98333-bea20d56-4937-4f89-9e2c-f3aec87326b7/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 043.
- Simulated: provider-native autonomous invocation of `build-right-preflight`.
- Test next: 044.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/043-preflight-founder-context-1782283899100-98333-bea20d56-4937-4f89-9e2c-f3aec87326b7/skills/build-right-preflight`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, Project type signal:, ## Next Action.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/043-preflight-founder-context-1782283899100-98333-bea20d56-4937-4f89-9e2c-f3aec87326b7/docs/evidence/build-right-preflight-043-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/043-preflight-founder-context-1782283899100-98333-bea20d56-4937-4f89-9e2c-f3aec87326b7/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
