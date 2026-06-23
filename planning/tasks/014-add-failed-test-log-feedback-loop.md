# 014: Add Failed-Test Log Feedback Loop

Status: blocked
Type: testing/tooling
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: make failed tests durable inputs for improving the skills, helpers, templates, and agent instructions
Source under test: repo-local path

## Goal

Wire manual-trial and automation failures into an append-only failure log and a
review workflow that turns repeated failures into follow-up tasks.

## Non-Goals

- Automatically fix failures.
- Delete or rewrite historical failure rows.
- Treat every environmental failure as a skill defect without triage.

## Required Reading

- planning/failed-tests.md
- planning/sprints/002-todo-skill-trial-automation.md
- planning/tasks/011-automate-preflight-artifact-verification.md
- planning/tasks/012-automate-execution-and-browser-proof-verification.md
- planning/tasks/013-automate-negative-gate-case-trials.md
- skills/build-right-execution/references/evidence-contract.md

## Acceptance Criteria

- [ ] Verifier scripts append failed assertions to `planning/failed-tests.md`
  with task, phase, command or test, expected, actual, class, artifact,
  follow-up, and status.
- [ ] Manual-trial instructions require appending failed expectations to the
  same log.
- [ ] Failure classes are documented and usable for later analysis.
- [ ] The feedback loop groups repeated failures into candidate follow-up tasks
  without erasing the original rows.
- [ ] A deliberately forced failure creates a durable log row.
- [ ] A resolved failure can be marked resolved by appending resolution context
  without deleting the original row.

## Baseline Evidence

`planning/failed-tests.md` exists as the shared append-only log, but verifier
scripts do not yet append to it automatically.

## Verification

- Force a verifier assertion failure and inspect the appended log row.
- Run the feedback grouping path on the log.
- Run `bun test`.
- Run `bun run verify:skill-trials`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Learning Notes

- Proved: <what evidence supports>
- Simulated: <what remains unproven>
- Test next: whether repeated failures produce high-quality skill improvement tasks.

## Blockers

- Blocked until at least one verifier exists and one forced failure path is
  available.

## Follow-Ups

- None yet.

