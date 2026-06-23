# 013: Automate Negative Gate-Case Trials

Status: blocked
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

- [ ] Blank repo execution request routes to preflight or creates the smallest
  baseline blocker.
- [ ] Ready task with `Owner: Founder` returns `ask-founder`.
- [ ] Ready task with external ownership returns `wait-external`.
- [ ] Open founder-owned conflict returns `ask-founder`.
- [ ] Open AI-owned conflict returns `create-blocker`.
- [ ] Failed release gate returns `create-blocker`.
- [ ] Source-under-test mismatch returns `partial-needs-rerun` or an equivalent
  source-mismatch blocker.
- [ ] Each negative trial records expected decision and actual decision.
- [ ] Unexpected negative-trial behavior appends to `planning/failed-tests.md`.

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

## Learning Notes

- Proved: <what evidence supports>
- Simulated: <what remains unproven>
- Test next: whether failed-test aggregation produces useful improvement input.

## Blockers

- Blocked until tasks 011 and 012 establish the shared verifier and logging
  surface.

## Follow-Ups

- 014: Add failed-test log feedback loop.

