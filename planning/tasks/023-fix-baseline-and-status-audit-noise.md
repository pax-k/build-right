# 023: Fix Baseline And Status-Audit Environment Noise Handling

Status: complete
Type: tooling/fix
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: separate expected baseline failures and shell glob mistakes from real workflow regressions
Source under test: repo-local path

## Goal

Make baseline and status-audit checks Bun-native and shell-independent, and
define how expected baseline failures such as "No tests found" are logged
without being mistaken for final verification failures.

## Non-Goals

- Ignore final verification failures.
- Remove baseline evidence collection.
- Depend on zsh-specific glob behavior.

## Required Reading

- planning/failed-tests.md
- planning/tasks/010-run-execution-todo-app-trial.md
- planning/tasks/014-add-failed-test-log-feedback-loop.md
- scripts/todo-trial.ts

## Acceptance Criteria

- [x] Define baseline status handling for expected pre-implementation command
  failures.
- [x] Ensure final verification still requires green commands after
  implementation.
- [x] Replace shell glob status audits with a Bun-native path enumeration or
  explicit path list.
- [x] Keep environment failures visible in the failed-test log.
- [x] Append any failed verifier command from this task to
  `planning/failed-tests.md`.

## Baseline Evidence

Sprint 002 logged a baseline `bun test` failure with "No tests found" and a
final status audit failure caused by zsh expanding a nonexistent task glob.

## Verification

- `bun scripts/todo-trial.ts failure-summary`
- `bun test`
- Any new Bun-native status-audit command added by this task.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts baseline-check --target /tmp/build-right-todo-trial --phase final` | pass | Implemented Todo scratch repo passes final Bun test classification. |
| 2026-06-24 | `bun test` | pass | Baseline no-tests and shell-independent status-audit fixtures pass. |
| 2026-06-24 | `bun scripts/todo-trial.ts status-audit` | pass | Live Sprint 003 tracker and tasks 015-026 are complete with no unchecked acceptance criteria. |

## Files Changed

- `scripts/todo-trial.ts` - added `baseline-check` and Bun-native `status-audit` commands.
- `tests/skill-trials.test.ts` - added fixture coverage for expected baseline failures and status-audit failures.

## Verification Summary

- `bun scripts/todo-trial.ts baseline-check --target /tmp/build-right-todo-trial --phase final` - pass.
- `bun scripts/todo-trial.ts status-audit` - pass.
- `bun test` - pass.

## Learning Notes

- Proved: no-tests can be an expected baseline signal, final no-tests still fails, and task audits no longer depend on zsh glob expansion.
- Simulated: no shell glob behavior remains in the audit path.
- Test next: run live `status-audit` after future sprint tracker closeout.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: baseline expected failure, final verification,
  status audit
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- Completed: planning/tasks/024-test-baseline-and-status-audit-regressions.md
