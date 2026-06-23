# 006: Define Workflow Customization Hooks

Status: ready
Type: docs/contract
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: moderate
Learning objective: allow users to change workflow policy, such as atomic commits after each task, without weakening the backbone gates
Source under test: repo-local path

## Goal

Define a small hook vocabulary for user-customizable workflow policy.

## Non-Goals

- Build a workflow DSL.
- Execute hooks automatically.
- Let customization bypass stop/ask gates, ownership checks, evidence capture,
  source-under-test checks, or verification.
- Add opinionated defaults for every possible team workflow.

## Required Reading

- planning/tasks/001-define-workflow-backbone-contract.md
- planning/tasks/003-expand-testing-matrix.md
- skills/build-right-preflight/assets/templates/docs/execution-rules.md
- skills/build-right-execution/references/gates.md
- skills/build-right-execution/references/workflow.md
- README.md

## Acceptance Criteria

- [ ] A reference or template section defines supported customization points:
  `before-task-select`, `after-task-intake`, `before-edit`, `after-verify`,
  `after-evidence-recorded`, `after-task-complete`, and `before-next-task`.
- [ ] The hook model includes examples:
  atomic commits after each task, screenshot proof for UI work, no web research,
  stronger verification for release tasks, and mandatory decision-log entries
  for architecture changes.
- [ ] The hook model marks forbidden changes:
  skip resolver, skip founder gate, ignore external-state gate, skip evidence,
  skip verification, auto-publish, or widen task scope.
- [ ] Existing `docs/execution-rules.md` guidance explains where project-local
  workflow customization should live.
- [ ] Tests assert that customization language is additive and still names the
  invariant gates.

## Baseline Evidence

Current customization behavior is implicit in:

- skills/build-right-preflight/assets/templates/docs/execution-rules.md
- skills/build-right-execution/references/workflow.md
- skills/build-right-execution/references/gates.md

## Verification

- `bun test`
- `bun run verify:skill-trials`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Learning Notes

- Proved: pending
- Simulated: pending
- Test next: whether a later helper should lint customization hooks

## Blockers

- planning/tasks/002-convert-verifier-to-bun-tests.md should land first.
- planning/tasks/003-expand-testing-matrix.md should land first.

## Follow-Ups

- None yet.
