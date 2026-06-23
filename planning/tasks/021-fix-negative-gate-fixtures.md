# 021: Fix Negative Gate Fixtures And Conflict Diagnostics

Status: complete
Type: tooling/fix
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: make gate failures diagnose workflow behavior instead of malformed test fixtures
Source under test: repo-local path

## Goal

Harden negative gate fixtures so conflict cases include the expected schema and
fixture-shape errors fail before they are mistaken for resolver bugs.

## Non-Goals

- Weaken founder, conflict, external, source mismatch, or release gates.
- Treat malformed fixtures as passing resolver evidence.
- Change gate ownership rules without a separate decision.

## Required Reading

- planning/failed-tests.md
- planning/tasks/013-automate-negative-gate-case-trials.md
- skills/build-right-execution/references/gates.md
- scripts/todo-trial.ts

## Acceptance Criteria

- [x] Validate that conflict fixtures include the required `## Conflicts`
  section before resolver assertions run.
- [x] Keep founder-owned open conflicts classified as `ask-founder`.
- [x] Keep AI-owned open conflicts classified as a blocker.
- [x] Emit clear diagnostics when a fixture is malformed.
- [x] Append any failed verifier command from this task to
  `planning/failed-tests.md`.

## Baseline Evidence

Sprint 002 logged `open founder conflict` returning `execute-task` because the
fixture lacked the conflict heading required by the parser.

## Verification

- `bun scripts/todo-trial.ts negative-gates`
- `bun test`
- `bun run verify:skill-trials`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts negative-gates` | pass | Full negative gate matrix passes. |
| 2026-06-24 | `bun scripts/todo-trial.ts negative-gates-malformed-conflict` | pass | Malformed conflict fixture is rejected as a fixture error before resolver assertions. |
| 2026-06-24 | `bun test` | pass | Malformed conflict and gate matrix regression is covered. |

## Files Changed

- `scripts/todo-trial.ts` - added conflict fixture schema validation and malformed-conflict control command.
- `planning/failed-tests.md` - appended same-cluster resolution evidence for the historical gate row.

## Verification Summary

- `bun scripts/todo-trial.ts negative-gates` - pass.
- `bun scripts/todo-trial.ts negative-gates-malformed-conflict` - pass.
- `bun test` - pass.

## Learning Notes

- Proved: conflict fixtures must include `## Conflicts`, founder conflicts ask founder, and AI conflicts block execution.
- Simulated: no live founder/external interaction is required for these resolver fixtures.
- Test next: add fixture validation before any new gate class is added.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: conflict heading, founder-owned conflict,
  AI-owned conflict
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- Completed: planning/tasks/022-test-negative-gate-regressions.md
