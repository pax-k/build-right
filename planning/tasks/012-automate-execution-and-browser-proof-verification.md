# 012: Automate Execution and Browser Proof Verification

Status: blocked
Type: testing/tooling
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: moderate
Learning objective: prove the executed Todo app and task evidence match the execution workflow contract
Source under test: repo-local path

## Goal

Add automation that verifies the scratch Todo app, execution transcript markers,
task evidence, Bun compliance, and browser-visible Todo behavior.

## Non-Goals

- Require production deployment.
- Add backend services.
- Replace manual review of the agent's reasoning quality.

## Required Reading

- planning/tasks/010-run-execution-todo-app-trial.md
- skills/build-right-execution/references/workflow.md
- skills/build-right-execution/references/gates.md
- skills/build-right-execution/references/evidence-contract.md
- tests/skill-trials.test.ts
- planning/failed-tests.md

## Acceptance Criteria

- [ ] Automation checks the execution transcript for resolver report, task
  intake, baseline evidence, task-contract check, verification ladder, evidence
  update, and stop-gate report.
- [ ] Automation checks generated code for Bun-compatible frontend serving with
  `Bun.serve()` and HTML imports.
- [ ] Automation rejects forbidden tools or dependencies: Vite, npm, pnpm,
  yarn, npx, Express, dotenv, and unrelated server libraries.
- [ ] Automation runs scratch-repo `bun test`.
- [ ] Automation starts the scratch app and verifies add, complete, delete,
  filter, and localStorage restore behavior with browser proof.
- [ ] Automation checks task evidence for files changed, commands, exit status
  or key output, proved, simulated, unproven, blockers, and follow-ups.
- [ ] Automation appends failures to `planning/failed-tests.md`.

## Baseline Evidence

Manual execution trial evidence should exist in the scratch repo before this
automation is built.

## Verification

- Run the execution verifier against a passing scratch app.
- Force one UI failure and confirm the verifier fails and logs it.
- Run `bun test`.
- Run `bun run verify:skill-trials`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Learning Notes

- Proved: <what evidence supports>
- Simulated: <what remains unproven>
- Test next: whether negative gate-case fixtures detect unsafe continuation.

## Blockers

- Blocked until task 010 completes the manual execution trial.

## Follow-Ups

- 013: Automate negative gate-case trials.

