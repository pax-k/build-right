# 023: Fix Baseline And Status-Audit Environment Noise Handling

Status: ready
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

- [ ] Define baseline status handling for expected pre-implementation command
  failures.
- [ ] Ensure final verification still requires green commands after
  implementation.
- [ ] Replace shell glob status audits with a Bun-native path enumeration or
  explicit path list.
- [ ] Keep environment failures visible in the failed-test log.
- [ ] Append any failed verifier command from this task to
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

## Learning Notes

- Proved: pending.
- Simulated: pending.
- Test next: fixture coverage for no-tests baseline and explicit task path
  audit.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: baseline expected failure, final verification,
  status audit
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- planning/tasks/024-test-baseline-and-status-audit-regressions.md

