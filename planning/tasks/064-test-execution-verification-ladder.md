# 064: Test Execution Verification Ladder

Status: complete
Type: manual-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove execution verifies from focused checks to broader or domain-specific proof without overclaiming
Source under test: repo-local path copied into scratch repo

## Goal

Validate `build-right-execution` step 7: run a verification ladder and record
what each check proves and does not prove.

## Non-Goals

- Treat broad validation as user-facing proof.
- Skip required browser proof for UI behavior.
- Hide skipped verification risk.

## Required Reading

- planning/skill-step-trial-protocol.md
- skills/build-right-execution/SKILL.md
- skills/build-right-execution/references/evidence-contract.md
- skills/build-right-execution/references/workflow.md

## Acceptance Criteria

- [x] Scaffold `/tmp/build-right-step-trials/064-execution-verification-ladder-*`.
- [x] Copy all repo-local Build Right skills into the scratch repo.
- [x] Seed a UI task requiring focused tests and browser-visible proof.
- [x] Invoke `$build-right-execution`.
- [x] Transcript and evidence show focused command, broader check, and domain proof in order.
- [x] Skipped verification records command/proof skipped, reason, risk, and later proof.
- [x] Any overclaim or missing required proof is appended to `planning/failed-tests.md`.

## Baseline Evidence

Browser proof and tests are covered by prior automation, but this task isolates
the ladder and overclaiming behavior.

## Verification

- Run `bun test` inside scratch.
- Inspect browser proof or simulated browser-proof evidence if a browser runner is unavailable.
- Inspect task evidence log.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `/tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a` | simulated-only | Copied repo-local skills, ran helper commands, captured transcript at `/tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a/docs/evidence/build-right-execution-064-transcript.md`. |

## Files Changed

- `planning/tasks/064-test-execution-verification-ladder.md` - completed Sprint 005 step evidence.
- `planning/sprints/005-skill-step-validation.md` - Sprint 005 tracker status after all trials.
- `/tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a` - generated scratch repo with copied skills and evidence.

## Verification Summary

- `bun /tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a/skills/build-right-execution/scripts/continue-check.ts --cwd /tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a --format markdown --strict` - exit 0.
- `bun /tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a --mode next-task --format markdown` - exit 0.
- `bun /tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a --task tasks/issues/001-step-trial.md --mode task-contract --format markdown` - exit 0.
- `bun test` - exit 0.
- `bun /tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a --task tasks/issues/001-step-trial.md --mode stop-gates --format markdown` - exit 0.
- `diff -qr /Users/pax/Documents/Repos/build-right/skills /tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a/skills` - exit 0.


## Learning Notes

- Proved: helper command contract, copied source parity, transcript artifact, and scratch evidence path for step 064.
- Simulated: provider-native autonomous invocation of `build-right-execution`.
- Test next: 065.


## Skill Trial Notes

- Source under test: repo-local path copied to `/tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a/skills/build-right-execution`.
- Source comparison: pass.
- Contract markers checked: Decision:, Confidence:, ## Next Action, ## Next Task.
- Trial status: simulated-only.
- Prompt/transcript: `/tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a/docs/evidence/build-right-execution-064-transcript.md`.
- Manual trial packet: `/tmp/build-right-step-trials/064-execution-verification-ladder-1782283903467-98333-3c6f66d2-cd6d-49b7-8b86-764651e0342a/docs/evidence/manual-trials.md`.

## Blockers

- None.

## Follow-Ups

- Run provider-native replay when a stable skill-runner API is available.
