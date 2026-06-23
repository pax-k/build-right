# 010: Run the Execution Todo App Trial

Status: blocked
Type: manual-trial
Owner: AI

Assumption basis: founder-claimed
Reversibility: easy
Learning objective: verify that execution takes one ready task, builds the Todo app narrowly, verifies it, records evidence, and stops at gates
Source under test: repo-local path

## Goal

Run `build-right-execution` against the ready task produced by the preflight
trial and build the demo Bun-served React + TypeScript Todo app.

## Non-Goals

- Add backend persistence.
- Add auth, accounts, collaboration, deployment, or paid services.
- Continue through unrelated tasks.
- Hide failed verification behind a green closeout.

## Required Reading

- planning/tasks/009-run-preflight-first-user-todo-trial.md
- skills/build-right-execution/SKILL.md
- skills/build-right-execution/references/workflow.md
- skills/build-right-execution/references/gates.md
- skills/build-right-execution/references/evidence-contract.md
- AGENTS.md
- planning/failed-tests.md

## Acceptance Criteria

- [ ] The agent runs `continue-check.ts --strict` before selecting work.
- [ ] The agent reports resolver decision, confidence, next action, next task,
  blocking gates, and external follow-ups.
- [ ] The agent runs `execution-check.ts --mode next-task`.
- [ ] The agent prints task intake with done means, non-goals, assumption
  basis, reversibility, learning hook, source under test, baseline evidence,
  verification ladder, and evidence destination.
- [ ] The agent runs task-contract checking before editing.
- [ ] Baseline evidence records missing app files or failing/missing tests
  before implementation.
- [ ] Implementation uses Bun-compatible React + TypeScript with `Bun.serve()`
  and HTML imports.
- [ ] Implementation does not use Vite, npm, pnpm, yarn, npx, Express, dotenv,
  or forbidden runtime dependencies.
- [ ] Todo behavior supports add, complete, delete, filter, and localStorage
  restore.
- [ ] Verification includes `bun install` when dependencies are introduced,
  `bun test`, and browser proof when required by the task.
- [ ] Evidence is recorded before the task status changes.
- [ ] Stop-gate checks run before any next task is selected.
- [ ] Manual-trial evidence records proved, simulated, unproven, blockers, and
  follow-ups.
- [ ] Any failed command or failed expectation is appended to
  `planning/failed-tests.md`.

## Baseline Evidence

The preflight-generated first task should be ready, AI-owned, bounded, and
verifiable.

## Verification

- Inspect execution transcript markers.
- Inspect generated app files in the scratch repo.
- Run scratch-repo `bun test`.
- Run browser proof against the scratch app when the task requires UI proof.
- Run this source repo `bun test`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Learning Notes

- Proved: <what evidence supports>
- Simulated: <what remains unproven>
- Test next: whether automation can detect the same contract markers.

## Blockers

- Blocked until task 009 produces a ready preflight-generated task.

## Follow-Ups

- 012: Automate execution and browser proof verification.

