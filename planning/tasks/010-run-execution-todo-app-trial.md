# 010: Run the Execution Todo App Trial

Status: complete
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

- [x] The agent runs `continue-check.ts --strict` before selecting work.
- [x] The agent reports resolver decision, confidence, next action, next task,
  blocking gates, and external follow-ups.
- [x] The agent runs `execution-check.ts --mode next-task`.
- [x] The agent prints task intake with done means, non-goals, assumption
  basis, reversibility, learning hook, source under test, baseline evidence,
  verification ladder, and evidence destination.
- [x] The agent runs task-contract checking before editing.
- [x] Baseline evidence records missing app files or failing/missing tests
  before implementation.
- [x] Implementation uses Bun-compatible React + TypeScript with `Bun.serve()`
  and HTML imports.
- [x] Implementation does not use Vite, npm, pnpm, yarn, npx, Express, dotenv,
  or forbidden runtime dependencies.
- [x] Todo behavior supports add, complete, delete, filter, and localStorage
  restore.
- [x] Verification includes `bun install` when dependencies are introduced,
  `bun test`, and browser proof when required by the task.
- [x] Evidence is recorded before the task status changes.
- [x] Stop-gate checks run before any next task is selected.
- [x] Manual-trial evidence records proved, simulated, unproven, blockers, and
  follow-ups.
- [x] Any failed command or failed expectation is appended to
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
| 2026-06-24 | `bun /Users/pax/Documents/Repos/build-right/skills/build-right-execution/scripts/continue-check.ts --cwd /tmp/build-right-todo-trial --format markdown --strict` | pass | Resolver selected `tasks/issues/001-build-bun-react-todo-app.md` with no blocking gates. |
| 2026-06-24 | `bun /Users/pax/Documents/Repos/build-right/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-todo-trial --mode next-task --format markdown` | pass | Execution helper selected the same task. |
| 2026-06-24 | `bun /Users/pax/Documents/Repos/build-right/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-todo-trial --task tasks/issues/001-build-bun-react-todo-app.md --mode task-contract --format markdown` | pass | Task contract check passed. |
| 2026-06-24 | baseline file check and baseline `bun test` | expected-baseline | App files were absent; `bun test` failed with `No tests found` and was logged in `planning/failed-tests.md`. |
| 2026-06-24 | `bun install` in `/tmp/build-right-todo-trial` | pass | Installed React, React DOM, TypeScript, and created `bun.lock`. |
| 2026-06-24 | `bun test` in `/tmp/build-right-todo-trial` | pass | 4 tests and 9 assertions passed. |
| 2026-06-24 | Browser proof at `http://localhost:3007` | pass | Add, complete, delete, filter, and localStorage restore verified; screenshot saved at `/tmp/build-right-todo-trial/docs/evidence/browser-proof.png`. |
| 2026-06-24 | forbidden runtime scan | pass | Scoped scan found no forbidden runtime references. Initial overbroad scan failure was logged as a verifier-gap row. |
| 2026-06-24 | `bun /Users/pax/Documents/Repos/build-right/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-todo-trial --task tasks/issues/001-build-bun-react-todo-app.md --mode stop-gates --format markdown` before status update | pass | Stop-gate helper recommended proceeding after scratch doc wording was reconciled. |
| 2026-06-24 | `bun /Users/pax/Documents/Repos/build-right/skills/build-right-execution/scripts/continue-check.ts --cwd /tmp/build-right-todo-trial --format markdown --strict` after completion | pass | Resolver returned `no-ready-task`, expected after completing the only scratch task. |

## Learning Notes

- Proved: execution selected one ready task, built the Bun React Todo app,
  verified tests and browser behavior, recorded evidence before completion,
  and stopped after the only task completed.
- Simulated: transcript is durable reconstructed evidence, not a provider
  conversation export.
- Test next: whether automation can detect the same contract markers.

## Blockers

- None.

## Follow-Ups

- 012: Automate execution and browser proof verification.
