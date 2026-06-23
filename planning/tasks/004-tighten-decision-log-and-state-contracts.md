# 004: Tighten Decision Log and Lean State Contracts

Status: ready
Type: docs/contract
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove decision logging and state tracking improve agentic work without adding unnecessary artifacts
Source under test: repo-local path

## Goal

Clarify how Build Right projects should use a durable decision log and a lean
state/resume file.

## Non-Goals

- Add a database.
- Add a state-writing script.
- Log every tactical implementation step.
- Create a second mandatory master state artifact if `blueprint-status.md`
  can carry the contract.

## Required Reading

- skills/build-right-preflight/assets/templates/docs/decision-log.md
- skills/build-right-preflight/assets/templates/docs/blueprint-status.md
- skills/build-right-preflight/references/artifact-contract.md
- skills/build-right-preflight/references/workflow.md
- skills/build-right-execution/references/evidence-contract.md

## Acceptance Criteria

- [ ] Decision log guidance says what belongs there: MVP boundary, source mode,
  architecture choice, deployment choice, workflow customization, and stop-gate
  decisions.
- [ ] Decision log guidance says what does not belong there: routine command
  results, transient implementation notes, and every file edit.
- [ ] The lean state contract identifies current phase, source mode, prototype
  confidence, active task, current gate, last evidence, current file plan, and
  next action.
- [ ] The existing `blueprint-status.md` template is used or evolved instead
  of introducing a redundant state file.
- [ ] Tests assert required markers for the updated templates.

## Baseline Evidence

Inspect current templates:

- skills/build-right-preflight/assets/templates/docs/decision-log.md
- skills/build-right-preflight/assets/templates/docs/blueprint-status.md

## Verification

- `bun test`
- `bun run verify:skill-trials`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Learning Notes

- Proved: pending
- Simulated: pending
- Test next: whether the state contract is enough for a later continue/resume helper

## Blockers

- None yet.

## Follow-Ups

- None yet.
