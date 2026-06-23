# 030: Automate Preflight State Matrix

Status: complete
Type: testing/tooling
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove every important preflight helper state routes to the correct next action
Source under test: repo-local path

## Goal

Expand preflight fixture coverage across blank, existing, missing-artifact,
research, founder-gate, and malformed-markdown states.

## Non-Goals

- Replace human founder validation with fixture data.
- Make public research claims.
- Implement execution behavior.

## Required Reading

- skills/build-right-preflight/scripts/preflight-check.ts
- tests/skill-trials.test.ts
- planning/tasks/027-define-e2e-workflow-oracle.md
- skills/build-right-preflight/references/founder-gates.md

## Acceptance Criteria

- [x] Blank repo without founder context returns `ask-founder`.
- [x] Existing repo with meaningful docs/code returns `delegate-inventory`.
- [x] Missing core docs returns `write-artifacts`.
- [x] Docs without task tracker returns `create-sprint0`.
- [x] `web-assisted` or `public-first-prototype` without evidence returns
  `run-research`.
- [x] Public/prototype evidence can allow `ready-for-execution`.
- [x] Unresolved founder/product questions stop at founder gate.
- [x] Malformed markdown tables do not crash helper scripts.
- [x] Append failures to `planning/failed-tests.md` if any fixture fails.

## Baseline Evidence

Some matrix states are covered in `tests/skill-trials.test.ts`, but Sprint 004
requires explicit coverage aligned to the E2E oracle.

## Verification

- `bun test`
- `bun run verify:skill-trials`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun test` | pass | Preflight helper fixture decisions cover blank, existing, missing docs, missing task surface, source modes, public evidence, and malformed tables. |
| 2026-06-24 | `bun run verify:skill-trials` | pass | Repo-local verifier confirms skill contracts and state helper behavior. |

## Files Changed

- `tests/skill-trials.test.ts` - state matrix tests remain green and are tied to Sprint 004 oracle.
- `planning/e2e-workflow-oracle.md` - documented preflight matrix expectations.

## Verification Summary

- `bun test` - pass.
- `bun run verify:skill-trials` - pass.

## Learning Notes

- Proved: preflight state decisions are covered by deterministic fixtures.
- Simulated: fixture-only state transitions.
- Test next: add new source modes only with explicit matrix rows and fixtures.

## Skill Trial Notes

- Source under test: repo-local `skills/build-right-preflight`.
- Source comparison: pass.
- Contract markers checked: `ask-founder`, `delegate-inventory`, `write-artifacts`, `create-sprint0`, `run-research`, `ready-for-execution`.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
