# 021: Fix Negative Gate Fixtures And Conflict Diagnostics

Status: ready
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

- [ ] Validate that conflict fixtures include the required `## Conflicts`
  section before resolver assertions run.
- [ ] Keep founder-owned open conflicts classified as `ask-founder`.
- [ ] Keep AI-owned open conflicts classified as a blocker.
- [ ] Emit clear diagnostics when a fixture is malformed.
- [ ] Append any failed verifier command from this task to
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

## Learning Notes

- Proved: pending.
- Simulated: pending.
- Test next: isolated resolver matrix fixtures.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: conflict heading, founder-owned conflict,
  AI-owned conflict
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- planning/tasks/022-test-negative-gate-regressions.md

