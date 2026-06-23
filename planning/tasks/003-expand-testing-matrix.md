# 003: Expand the Script and Markdown Testing Matrix

Status: ready
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

- [ ] Tests cover preflight states: blank/new, existing, existing without source
  index, missing core docs, missing task surface, ready for execution.
- [ ] Tests cover source modes: `founder-fed`, `web-assisted`, and
  `public-first-prototype`.
- [ ] Tests cover founder, external, AI-owned, source-mismatch, stale,
  failed-verification, release-claim, and open-conflict gates.
- [ ] Tests cover execution states: active task, ready task, no ready task,
  missing tracker, missing task evidence path, and non-AI-owned tasks.
- [ ] Tests cover required task contract fields and required Markdown sections.
- [ ] Tests cover template markers for blueprint status, decision log,
  execution rules, release gates, MVP scope, issue templates, and not-ready
  blocker templates.
- [ ] Tests cover malformed or partial Markdown tables without crashing.
- [ ] Tests define the expected behavior for additive workflow customization
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

## Learning Notes

- Proved: pending
- Simulated: pending
- Test next: whether importable helper modules are needed for readable coverage

## Blockers

- planning/tasks/002-convert-verifier-to-bun-tests.md should land first.

## Follow-Ups

- None yet.
