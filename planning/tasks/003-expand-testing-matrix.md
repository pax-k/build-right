# 003: Expand the Script and Markdown Testing Matrix

Status: complete
Type: testing
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: moderate
Learning objective: identify and cover the states, gates, conditions, outcomes, templates, and edge cases that define Build Right behavior
Source under test: repo-local path

## Goal

Expand Bun test coverage across the full decision matrix for preflight,
execution, templates, Markdown parsing, and customization safety.

## Non-Goals

- Implement customization hooks.
- Add mutable project state writes to helper scripts.
- Test every possible Markdown prose variant.
- Require root generated `docs/` or `tasks/` in this repository.

## Required Reading

- planning/sprints/001-workflow-backbone-foundation.md
- skills/build-right-preflight/references/artifact-contract.md
- skills/build-right-preflight/scripts/preflight-check.ts
- skills/build-right-execution/references/gates.md
- skills/build-right-execution/references/evidence-contract.md
- skills/build-right-execution/scripts/continue-check.ts
- skills/build-right-execution/scripts/execution-check.ts
- skills/build-right-preflight/assets/templates/
- skills/build-right-execution/assets/templates/

## Acceptance Criteria

- [x] Tests cover preflight states: blank/new, existing, existing without source
  index, missing core docs, missing task surface, ready for execution.
- [x] Tests cover source modes: `founder-fed`, `web-assisted`, and
  `public-first-prototype`.
- [x] Tests cover founder, external, AI-owned, source-mismatch, stale,
  failed-verification, release-claim, and open-conflict gates.
- [x] Tests cover execution states: active task, ready task, no ready task,
  missing tracker, missing task evidence path, and non-AI-owned tasks.
- [x] Tests cover required task contract fields and required Markdown sections.
- [x] Tests cover template markers for blueprint status, decision log,
  execution rules, release gates, MVP scope, issue templates, and not-ready
  blocker templates.
- [x] Tests cover malformed or partial Markdown tables without crashing.
- [x] Tests define the expected behavior for additive workflow customization
  markers without allowing gate bypass.

## Baseline Evidence

Use the current testing matrix in:

- planning/sprints/001-workflow-backbone-foundation.md

## Verification

- `bun test`
- `bun run verify:skill-trials`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `bun test` before matrix expansion | pass | 9 tests passed from task 002 baseline. |
| 2026-06-23 | `bun test` after matrix expansion | pass | 14 tests passed, including preflight matrix, execution contract, malformed Markdown, template markers, and customization safety markers. |
| 2026-06-23 | `bun run verify:skill-trials` | pass | Wrapper ran the same 14-test suite successfully. |
| 2026-06-23 | Required review trigger check | skipped | Verifier behavior changed; subagent review tooling requires explicit user-requested delegation, so substituted focused test review plus both verification commands. |

## Files Changed

- `tests/skill-trials.test.ts` - expands the Bun test matrix for preflight states, source modes, gates, task contracts, malformed Markdown, template markers, and workflow customization safety.
- `planning/sprints/001-workflow-backbone-foundation.md` - marks task 003 complete.
- `planning/tasks/003-expand-testing-matrix.md` - records evidence and completion state.

## Verification Summary

- `bun test` - pass, 14 tests.
- `bun run verify:skill-trials` - pass, 14 tests through compatibility wrapper.

## Learning Notes

- Proved: the current CLI-level fixture harness can cover the requested state, gate, template, Markdown, and customization-safety matrix.
- Simulated: direct unit imports of helper decision functions remain future work; current coverage exercises script behavior through Bun subprocess fixtures.
- Test next: whether importable helper modules are needed for more readable coverage.

## Blockers

- None.

## Follow-Ups

- None yet.
