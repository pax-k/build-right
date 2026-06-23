# 001: Define the Workflow Backbone Contract

Status: complete
Type: docs/contract
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove the stable Build Right loop can be named without turning it into a heavy runtime
Source under test: repo-local path

## Goal

Create a concise reference that names the Build Right workflow backbone and
separates invariant safety behavior from customizable workflow policy.

## Non-Goals

- Build a workflow DSL.
- Change helper script behavior.
- Add new runtime state mutation.
- Remove any existing stop/ask, ownership, evidence, or verification gate.

## Required Reading

- skills/build-right-preflight/SKILL.md
- skills/build-right-preflight/references/workflow.md
- skills/build-right-execution/SKILL.md
- skills/build-right-execution/references/workflow.md
- skills/build-right-execution/references/gates.md
- README.md

## Acceptance Criteria

- [x] A repo-local reference file documents the backbone loop:
  `observe state -> classify -> choose one next action -> run gates -> act -> verify -> record -> stop/continue`.
- [x] The reference identifies invariant gates that workflow customization must
  not bypass.
- [x] The reference explains customization as additive hooks around the stable
  loop.
- [x] README or an existing design document links to the new reference.
- [x] No helper script behavior changes in this task.

## Baseline Evidence

Record current references that already encode the loop:

- skills/build-right-preflight/references/workflow.md
- skills/build-right-execution/references/workflow.md
- skills/build-right-execution/scripts/continue-check.ts

## Verification

- `bun run verify:skill-trials`
- Inspect the new reference for clear invariant/customizable separation.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `bun run verify:skill-trials` before edits | pass | 9 verifier checks passed. |
| 2026-06-23 | Inspect `workflow-backbone.md` and `README.md` | pass | New reference names the loop, invariant gates, additive customization, and helper-script boundary. |
| 2026-06-23 | Required review trigger check | skipped | More than three durable docs/task files changed; subagent review tooling exists but requires explicit user-requested delegation, so substituted direct diff inspection plus verifier run. |
| 2026-06-23 | `bun run verify:skill-trials` after edits | pass | 9 verifier checks passed. |

## Files Changed

- `workflow-backbone.md` - new workflow backbone contract.
- `README.md` - links the backbone reference from the Notes section.
- `planning/sprints/001-workflow-backbone-foundation.md` - marks task 001 complete.
- `planning/tasks/001-define-workflow-backbone-contract.md` - records evidence and completion state.

## Verification Summary

- `bun run verify:skill-trials` - pass, 9 verifier checks passed.

## Learning Notes

- Proved: the workflow backbone can be documented as a repo-local contract without changing helper script behavior.
- Simulated: automatic enforcement of customization hooks remains future work.
- Test next: whether customization hooks can be documented and tested without changing resolver behavior.

## Blockers

- None.

## Follow-Ups

- planning/tasks/006-define-workflow-customization-hooks.md
