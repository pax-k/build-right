# 036: Build Fresh Scratch-Repo Prompt Replay Harness

Status: complete
Type: testing/e2e
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: moderate
Learning objective: prove the skills can be tested from prompts in a fresh scratch repo, not only static fixtures
Source under test: repo-local path

## Goal

Build a replay harness that seeds a fresh scratch repo, runs the preflight and
execution prompts, captures transcript/evidence, and feeds the generated
artifacts into the verifiers.

## Non-Goals

- Depend on network access.
- Commit generated scratch artifacts to this source repo.
- Hide failed agentic behavior behind fixture-only tests.

## Required Reading

- planning/todo-trial-protocol.md
- scripts/todo-trial.ts
- planning/tasks/029-automate-preflight-happy-path-replay.md
- planning/tasks/032-automate-execution-happy-path-replay.md

## Acceptance Criteria

- [x] Seed a new collision-resistant scratch repo path.
- [x] Capture the exact human preflight and execution prompts.
- [x] Capture agent transcript or an agent-agnostic replay log.
- [x] Capture generated docs, tasks, app files, browser proof, and manual trial
  evidence.
- [x] Run preflight, execution, gate, parity, failure-summary, and status
  verifiers against the replay output.
- [x] Produce a durable report path for later review.
- [x] Append failures to `planning/failed-tests.md` if replay or verification
  fails.

## Baseline Evidence

Current automation verifies existing scratch artifacts. It does not yet own a
fresh prompt replay harness.

## Verification

- `bun test`
- New replay command or documented equivalent
- Existing `todo-trial` verifier commands

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts e2e-replay --target /tmp/build-right-todo-trial --preflight-target /tmp/build-right-todo-trial-preflight` | pass | Replay root `/tmp/build-right-todo-trial-e2e-replay-1782253696650-45480-9cbea643-8cf3-4928-b072-572747c7a2c5` copied prompts/artifacts and reran verifiers. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-preflight ...` inside replay | pass | Copied preflight artifacts still satisfy contract. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-execution ...` inside replay | pass | Copied execution artifacts, tests, live server, and browser proof still satisfy contract. |
| 2026-06-24 | `bun test` | pass | Replay/report command surface is covered by helper tests. |

## Files Changed

- `scripts/todo-trial.ts` - added `e2e-replay` with prompt capture, scratch copy, verifier run, and report generation.
- `tests/skill-trials.test.ts` - command exposure and report coverage.
- `planning/e2e-workflow-report.md` - durable report path produced by replay/report commands.

## Verification Summary

- `bun scripts/todo-trial.ts e2e-replay --target /tmp/build-right-todo-trial --preflight-target /tmp/build-right-todo-trial-preflight` - pass.
- `bun test` - pass.

## Learning Notes

- Proved: replay harness seeds a collision-resistant `/tmp` root, captures prompts, copies artifacts, and reruns preflight/execution/transcript/report checks.
- Simulated: replay revalidates canonical artifacts rather than invoking a fresh autonomous agent.
- Test next: add provider-native prompt execution when an agent runner API is available.

## Skill Trial Notes

- Source under test: replayed copies of `/tmp/build-right-todo-trial` and `/tmp/build-right-todo-trial-preflight`.
- Source comparison: pass.
- Contract markers checked: prompts, generated docs/tasks/app files, browser proof, manual trial evidence, report.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
