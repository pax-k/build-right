# 004: Tighten Decision Log and Lean State Contracts

Status: complete
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

- [x] Decision log guidance says what belongs there: MVP boundary, source mode,
  architecture choice, deployment choice, workflow customization, and stop-gate
  decisions.
- [x] Decision log guidance says what does not belong there: routine command
  results, transient implementation notes, and every file edit.
- [x] The lean state contract identifies current phase, source mode, prototype
  confidence, active task, current gate, last evidence, current file plan, and
  next action.
- [x] The existing `blueprint-status.md` template is used or evolved instead
  of introducing a redundant state file.
- [x] Tests assert required markers for the updated templates.

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
| 2026-06-23 | Inspect existing templates | pass | `decision-log.md` was table-only; `blueprint-status.md` already carried source mode, file plan, readiness, and next action. |
| 2026-06-23 | `bun test` | pass | 14 tests passed after adding decision-log and lean-state markers. |
| 2026-06-23 | `bun run verify:skill-trials` | pass | 14 tests passed through the compatibility wrapper after syncing the installed preflight skill copy. |
| 2026-06-23 | Installed skill parity sync | pass | Synced `skills/build-right-preflight/` to `$HOME/.codex/skills/build-right-preflight/` because this task changed installed skill source files. |
| 2026-06-23 | Required review trigger check | skipped | Skill templates/contracts changed; subagent review tooling requires explicit user-requested delegation, so substituted marker tests, direct inspection, and both verification commands. |

## Files Changed

- `skills/build-right-preflight/assets/templates/docs/decision-log.md` - adds durable-decision guidance and non-goals.
- `skills/build-right-preflight/assets/templates/docs/blueprint-status.md` - evolves the existing resume file with lean state fields.
- `skills/build-right-preflight/references/artifact-contract.md` - documents lean state and decision log contracts.
- `tests/skill-trials.test.ts` - asserts the new contract markers.
- `planning/sprints/001-workflow-backbone-foundation.md` - marks task 004 complete.
- `planning/tasks/004-tighten-decision-log-and-state-contracts.md` - records evidence and completion state.

## Verification Summary

- `bun test` - pass, 14 tests.
- `bun run verify:skill-trials` - pass, 14 tests through compatibility wrapper.

## Learning Notes

- Proved: `blueprint-status.md` can carry the lean master-state contract without adding a second state file.
- Simulated: no state-writing helper exists; state updates remain agent-authored Markdown.
- Test next: whether the state contract is enough for a later continue/resume helper.

## Blockers

- None.

## Follow-Ups

- None yet.
