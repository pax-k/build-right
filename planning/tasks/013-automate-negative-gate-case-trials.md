# 013: Automate Negative Gate-Case Trials

Status: complete
Type: testing/tooling
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: moderate
Learning objective: prove the system stops or blocks when a first-user workflow is not safe to continue
Source under test: repo-local path

## Goal

Automate negative trials that verify Build Right does not continue through
not-ready, founder-owned, external, conflict, failed-verification, or
source-mismatch states.

## Non-Goals

- Implement product features in negative fixtures.
- Treat failure states as release blockers unless the release checklist says so.
- Hide expected negative failures from the failed-tests log when assertions
  fail unexpectedly.

## Required Reading

- planning/tasks/011-automate-preflight-artifact-verification.md
- planning/tasks/012-automate-execution-and-browser-proof-verification.md
- skills/build-right-execution/references/gates.md
- skills/build-right-execution/scripts/continue-check.ts
- skills/build-right-execution/scripts/execution-check.ts
- planning/failed-tests.md

## Acceptance Criteria

- [x] Blank repo execution request routes to preflight or creates the smallest
  baseline blocker.
- [x] Ready task with `Owner: Founder` returns `ask-founder`.
- [x] Ready task with external ownership returns `wait-external`.
- [x] Open founder-owned conflict returns `ask-founder`.
- [x] Open AI-owned conflict returns `create-blocker`.
- [x] Failed release gate returns `create-blocker`.
- [x] Source-under-test mismatch returns `partial-needs-rerun` or an equivalent
  source-mismatch blocker.
- [x] Each negative trial records expected decision and actual decision.
- [x] Unexpected negative-trial behavior appends to `planning/failed-tests.md`.

## Baseline Evidence

Current fixture tests cover helper decisions, but not an end-to-end trial matrix
connected to the Todo scratch workflow and failed-test log.

## Verification

- Run all negative gate-case trials.
- Force one unexpected decision and confirm the failure is logged.
- Run `bun test`.
- Run `bun run verify:skill-trials`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts negative-gates` | pass | Verified blank repo, founder owner, external owner, founder conflict, AI conflict, failed release gate, and source mismatch resolver decisions. |
| 2026-06-24 | `planning/failed-tests.md` | pass | Initial founder-conflict fixture shape failure was logged and followed by a resolution row. |

## Learning Notes

- Proved: negative gate fixtures stop or block with expected resolver decisions.
- Simulated: fixtures are minimal Markdown states, not full app repos.
- Test next: whether failed-test aggregation produces useful improvement input.

## Blockers

- None.

## Follow-Ups

- 014: Add failed-test log feedback loop.
