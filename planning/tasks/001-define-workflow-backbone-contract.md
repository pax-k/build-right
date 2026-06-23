# 001: Define the Workflow Backbone Contract

Status: ready
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

- [ ] A repo-local reference file documents the backbone loop:
  `observe state -> classify -> choose one next action -> run gates -> act -> verify -> record -> stop/continue`.
- [ ] The reference identifies invariant gates that workflow customization must
  not bypass.
- [ ] The reference explains customization as additive hooks around the stable
  loop.
- [ ] README or an existing design document links to the new reference.
- [ ] No helper script behavior changes in this task.

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

## Learning Notes

- Proved: pending
- Simulated: pending
- Test next: whether customization hooks can be documented without changing resolver behavior

## Blockers

- None yet.

## Follow-Ups

- planning/tasks/006-define-workflow-customization-hooks.md
