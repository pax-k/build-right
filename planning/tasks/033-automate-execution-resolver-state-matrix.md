# 033: Automate Execution Resolver State Matrix

Status: complete
Type: testing/tooling
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove execution never advances through unsafe task, ownership, conflict, release, stale, or source-mismatch states
Source under test: repo-local path

## Goal

Expand execution resolver fixture coverage for every stop/ask gate in the E2E
oracle.

## Non-Goals

- Weaken any stop gate.
- Treat malformed fixtures as resolver evidence.
- Execute implementation code in resolver fixtures.

## Required Reading

- skills/build-right-execution/scripts/continue-check.ts
- skills/build-right-execution/references/gates.md
- scripts/todo-trial.ts
- tests/skill-trials.test.ts

## Acceptance Criteria

- [x] No preflight docs/tracker returns `create-blocker`.
- [x] Ready AI task returns `execute-task`.
- [x] Active AI task returns `continue-active-task`.
- [x] All tasks complete returns `no-ready-task`.
- [x] Missing task file returns `invalid-state`.
- [x] Missing task contract fields block before edit.
- [x] Founder-owned task returns `ask-founder`.
- [x] External-owned task returns `wait-external`.
- [x] Founder, external, and AI conflicts route to their correct gates.
- [x] Failed, stale, source-mismatch, and release-claim gates block execution.
- [x] Append failures to `planning/failed-tests.md` if any fixture fails.

## Baseline Evidence

Sprint 003 covers the negative gate matrix and malformed conflict fixtures, but
Sprint 004 should make the full resolver state matrix the required E2E gate.

## Verification

- `bun scripts/todo-trial.ts negative-gates`
- `bun scripts/todo-trial.ts negative-gates-malformed-conflict`
- `bun test`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts negative-gates` | pass | Resolver gate matrix covers founder, external, AI conflict, stale, failed, source mismatch, and release-claim gates. |
| 2026-06-24 | `bun scripts/todo-trial.ts negative-gates-malformed-conflict` | pass | Malformed conflict fixtures are classified as fixture errors, not crashes. |
| 2026-06-24 | `bun test` | pass | Continue/execution helper fixture regressions pass. |

## Files Changed

- `scripts/todo-trial.ts` - negative gate and malformed-conflict checks retained as E2E gates.
- `tests/skill-trials.test.ts` - resolver state matrix regression coverage.
- `planning/e2e-workflow-oracle.md` - resolver matrix expectations.

## Verification Summary

- `bun scripts/todo-trial.ts negative-gates` - pass.
- `bun scripts/todo-trial.ts negative-gates-malformed-conflict` - pass.
- `bun test` - pass.

## Learning Notes

- Proved: resolver state matrix gates route to expected decisions and stop conditions.
- Simulated: fixture-only resolver states.
- Test next: add fixtures for any new resolver decision before using it in a manual trial.

## Skill Trial Notes

- Source under test: repo-local `skills/build-right-execution`.
- Source comparison: pass.
- Contract markers checked: continue resolver decisions, task contract missing fields, stop gates.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
