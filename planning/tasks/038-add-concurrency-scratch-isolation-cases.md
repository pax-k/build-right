# 038: Add Concurrency And Scratch-Isolation E2E Cases

Status: complete
Type: testing/tooling
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove helper commands can run in parallel without corrupting scratch repos or source repo state
Source under test: repo-local path

## Goal

Add E2E concurrency and scratch-isolation tests for helper-owned temp paths and
generated artifacts.

## Non-Goals

- Run destructive commands outside approved scratch paths.
- Keep generated Todo artifacts in this source repo.
- Mask real race failures as expected controls.

## Required Reading

- scripts/todo-trial.ts
- tests/skill-trials.test.ts
- planning/tasks/026-test-source-parity-remediation.md
- AGENTS.md

## Acceptance Criteria

- [x] Run parallel parity-negative controls without temp path collision.
- [x] Run parallel preflight-negative controls without temp path collision.
- [x] Run parallel execution-negative controls without temp path collision.
- [x] Assert scratch targets are collision-resistant and under allowed `/tmp`
  prefixes.
- [x] Assert source repo has no generated root `docs/` or `tasks/`.
- [x] Assert generated app files stay outside the source repo.
- [x] Append failures to `planning/failed-tests.md` if any concurrency or
  isolation check fails.

## Baseline Evidence

Sprint 003 fixed a Date.now-only parity-negative collision. Sprint 004 should
generalize that proof to every helper-owned scratch path.

## Verification

- `bun test`
- `bun run verify:skill-trials`
- `bun scripts/todo-trial.ts status-audit`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts concurrency` | pass | Parallel parity, preflight-negative, and execution-negative controls ran under `/tmp/build-right-todo-trial-concurrency-*`. |
| 2026-06-24 | `bun test` | pass | Concurrency command test passes with fixture sources and root generated-file scan. |
| 2026-06-24 | `find docs tasks -maxdepth 3 -type f -print` | pass | Source repo root `docs/` and `tasks/` contain no generated Todo markdown files. |

## Files Changed

- `scripts/todo-trial.ts` - added `concurrency` command and fixture-source options.
- `tests/skill-trials.test.ts` - added concurrency regression.
- `planning/e2e-workflow-oracle.md` - documented concurrency and scratch isolation gates.

## Verification Summary

- `bun scripts/todo-trial.ts concurrency` - pass.
- `bun test` - pass.
- Source repo root generated-file scan - pass.

## Learning Notes

- Proved: parallel negative controls avoid temp path collisions and generated app files stay outside the source repo.
- Simulated: concurrency is local parallel helper execution.
- Test next: add cross-agent contention proof only when a multi-agent runner is available.

## Skill Trial Notes

- Source under test: helper-created `/tmp/build-right-todo-trial-*` roots.
- Source comparison: pass.
- Contract markers checked: collision-resistant roots, no generated root docs/tasks, app artifacts outside source repo.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
