# 035: Automate Agentic Transcript And Evidence Ordering Checks

Status: complete
Type: testing/e2e
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove agents follow workflow order and evidence rules, not just final artifact shape
Source under test: repo-local path

## Goal

Add transcript and evidence-ordering checks for both preflight and execution.

## Non-Goals

- Require exact prose for every sentence.
- Depend on an agent-specific conversation handle.
- Let scripts pass when the workflow order was skipped.

## Required Reading

- skills/build-right-preflight/references/workflow.md
- skills/build-right-execution/references/workflow.md
- skills/build-right-execution/references/evidence-contract.md
- planning/todo-trial-protocol.md

## Acceptance Criteria

- [x] Preflight transcript proves helper report before file plan.
- [x] Preflight transcript proves founder questions before product truth.
- [x] Preflight transcript proves no app implementation during preflight.
- [x] Execution transcript proves resolver report before task intake.
- [x] Execution transcript proves baseline evidence before implementation and
  verification evidence.
- [x] Execution transcript proves stop gates before next-task selection.
- [x] Evidence packet includes run label, agent surface, skill source, target,
  commands, artifacts, result, proved, simulated, unproven, and follow-ups.
- [x] Append failures to `planning/failed-tests.md` if any marker/order check
  fails.

## Baseline Evidence

Current verifier checks transcript markers, but not all required ordering and
agentic workflow invariants.

## Verification

- `bun test`
- `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight`
- `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-transcripts --target /tmp/build-right-todo-trial --preflight-target /tmp/build-right-todo-trial-preflight` | pass | Canonical transcripts prove required preflight and execution ordering. |
| 2026-06-24 | `bun test` | pass | Positive and negative transcript-order tests pass. |
| 2026-06-24 | `planning/failed-tests.md` | pass/resolved | Missing fixture `## Closeout` marker was logged, fixed, and resolved with a separate row. |

## Files Changed

- `scripts/todo-trial.ts` - added transcript order verifier.
- `tests/skill-trials.test.ts` - added positive and negative transcript-order tests.
- `planning/failed-tests.md` - logged and resolved a task 035 transcript fixture failure.

## Verification Summary

- `bun scripts/todo-trial.ts verify-transcripts --target /tmp/build-right-todo-trial --preflight-target /tmp/build-right-todo-trial-preflight` - pass.
- `bun test` - pass.
- `bun scripts/todo-trial.ts failure-summary` - pass, 0 actionable open rows.

## Learning Notes

- Proved: transcript order and manual-trial evidence packet fields are machine-checked.
- Simulated: transcript fixtures stand in for provider-native chat export.
- Test next: attach provider-native transcript export if future release gates require it.

## Skill Trial Notes

- Source under test: repo-local preflight/execution workflow transcripts in `/tmp/build-right-todo-trial*`.
- Source comparison: pass.
- Contract markers checked: helper report, founder questions, file plan, resolver report, task intake, baseline, implementation, verification, stop gates.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
