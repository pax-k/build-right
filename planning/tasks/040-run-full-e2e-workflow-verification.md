# 040: Run Full E2E Workflow Verification And Close Gates

Status: complete
Type: validation/release
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove the complete Build Right workflow test matrix is green and ready for repeated review
Source under test: repo-local path

## Goal

Run the full Sprint 004 verification suite, update all evidence, and close the
E2E workflow test matrix only when every gate is green.

## Non-Goals

- Ignore failed commands.
- Mark Sprint 004 complete with unchecked task criteria.
- Delete failure history.

## Required Reading

- planning/sprints/004-end-to-end-workflow-test-matrix.md
- planning/tasks/027-define-e2e-workflow-oracle.md
- planning/tasks/028-automate-shared-workflow-gates.md
- planning/tasks/029-automate-preflight-happy-path-replay.md
- planning/tasks/030-automate-preflight-state-matrix.md
- planning/tasks/031-automate-preflight-artifact-contracts.md
- planning/tasks/032-automate-execution-happy-path-replay.md
- planning/tasks/033-automate-execution-resolver-state-matrix.md
- planning/tasks/034-automate-todo-app-browser-proof.md
- planning/tasks/035-automate-agentic-transcript-evidence-checks.md
- planning/tasks/036-build-fresh-scratch-replay-harness.md
- planning/tasks/037-add-failure-injection-log-cases.md
- planning/tasks/038-add-concurrency-scratch-isolation-cases.md
- planning/tasks/039-add-e2e-report-artifact.md

## Acceptance Criteria

- [x] Tasks 027-039 are complete with evidence.
- [x] Sprint 004 task queue is complete.
- [x] `planning/failed-test-summary.md` reports zero actionable open rows.
- [x] Full final verification passes.
- [x] Any new failure encountered is appended to `planning/failed-tests.md`.
- [x] Any fixed failure has a separate resolution row.
- [x] The final response names changed files, verification commands, remaining
  open failures, and residual risk.

## Baseline Evidence

Sprint 003 verification is green and the current failure summary reports no
actionable open rows, but Sprint 004 E2E replay and reporting tasks are not yet
implemented.

## Verification

- `bun test`
- `bun run verify:skill-trials`
- `bun scripts/todo-trial.ts failure-summary`
- `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight`
- `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial`
- `bun scripts/todo-trial.ts negative-gates`
- `bun scripts/todo-trial.ts negative-gates-malformed-conflict`
- `bun scripts/todo-trial.ts parity`
- `bun scripts/todo-trial.ts parity-negative`
- `bun scripts/todo-trial.ts status-audit`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun test` | pass | 25 tests pass, including Sprint 004 E2E oracle/report/failure/concurrency coverage. |
| 2026-06-24 | `bun run verify:skill-trials` | pass | Repo-local skill trial verifier passes. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | 41 total rows, 0 actionable open rows, 16 expected/control rows, 12 resolved rows. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight` | pass | Preflight scratch contract passes. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial` | pass | Execution scratch contract, scratch tests, live server, and browser proof pass. |
| 2026-06-24 | `bun scripts/todo-trial.ts negative-gates` | pass | Stop/ask gate matrix passes. |
| 2026-06-24 | `bun scripts/todo-trial.ts negative-gates-malformed-conflict` | pass | Malformed conflict fixture returns expected fixture error. |
| 2026-06-24 | `bun scripts/todo-trial.ts parity` | pass | Repo-local skill source parity passes. |
| 2026-06-24 | `bun scripts/todo-trial.ts parity-negative` | pass/expected-control | Forced source mismatch appended as expected-logged with remediation. |
| 2026-06-24 | `bun scripts/todo-trial.ts status-audit` | pass | Sprint 004 and tasks 027-040 are complete with no unchecked criteria. |
| 2026-06-24 | `git diff --check` | pass | No whitespace errors. |

## Files Changed

- `planning/sprints/004-end-to-end-workflow-test-matrix.md` - Sprint 004 tracker closeout.
- `planning/tasks/027-define-e2e-workflow-oracle.md` through `planning/tasks/040-run-full-e2e-workflow-verification.md` - completed task evidence.
- `planning/e2e-workflow-oracle.md` - E2E oracle.
- `planning/e2e-workflow-report.md` - E2E report.
- `scripts/todo-trial.ts` - E2E helper commands and Sprint 004 audit defaults.
- `tests/skill-trials.test.ts` - Sprint 004 regression coverage.
- `planning/failed-tests.md` - appended failure and resolution rows.
- `planning/failed-test-summary.md` - regenerated summary.

## Verification Summary

- `bun test` - pass.
- `bun run verify:skill-trials` - pass.
- `bun scripts/todo-trial.ts failure-summary` - pass, 0 actionable open rows.
- `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight` - pass.
- `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial` - pass.
- `bun scripts/todo-trial.ts negative-gates` - pass.
- `bun scripts/todo-trial.ts negative-gates-malformed-conflict` - pass.
- `bun scripts/todo-trial.ts parity` - pass.
- `bun scripts/todo-trial.ts parity-negative` - pass as expected control.
- `bun scripts/todo-trial.ts status-audit` - pass.
- `git diff --check` - pass.

## Learning Notes

- Proved: tasks 027-039 have evidence and the final verification suite passes after Sprint 004 tracker closeout.
- Simulated: provider-native agent transcript remains represented by durable transcript markdown.
- Test next: use the E2E report to review actual agentic work after each workflow change.

## Skill Trial Notes

- Source under test: repo-local Build Right skills plus canonical `/tmp/build-right-todo-trial*` scratch artifacts.
- Source comparison: pass.
- Contract markers checked: all Sprint 004 acceptance criteria and final verifier list.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
