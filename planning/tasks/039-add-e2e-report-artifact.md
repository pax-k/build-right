# 039: Add E2E Report Artifact And Summary Output

Status: complete
Type: testing/tooling
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: make E2E trial results reviewable without reading the whole transcript or terminal output
Source under test: repo-local path

## Goal

Add a durable E2E report artifact that summarizes each skill, state matrix,
command, artifact, result, proved behavior, simulated behavior, unproven risk,
and failure-log links.

## Non-Goals

- Replace task evidence logs.
- Store generated Todo app source in this repository.
- Hide expected-control failures.

## Required Reading

- skills/build-right-execution/references/evidence-contract.md
- planning/todo-trial-protocol.md
- planning/failed-test-summary.md
- scripts/todo-trial.ts

## Acceptance Criteria

- [x] Report includes run label, timestamp, source under test, scratch target,
  and command list.
- [x] Report separates preflight, execution, shared gates, negative controls,
  and agentic replay results.
- [x] Report links generated artifacts, browser proof, transcripts, and task
  evidence.
- [x] Report states proved, simulated, unproven, and follow-ups.
- [x] Report includes failure summary counts and any actionable rows.
- [x] Append failures to `planning/failed-tests.md` if report generation or
  validation fails.

## Baseline Evidence

Manual-trial evidence exists in scratch artifacts and task files, but there is
no single E2E report for the full test matrix.

## Verification

- `bun test`
- New E2E report command or documented equivalent
- Inspect report artifact

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts e2e-report --target /tmp/build-right-todo-trial --preflight-target /tmp/build-right-todo-trial-preflight` | pass | Wrote `planning/e2e-workflow-report.md` with required sections and current failure counts. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-e2e-report --report planning/e2e-workflow-report.md` | pass | Report shape verifier passes. |
| 2026-06-24 | `bun test` | pass | Report generation test checks required review sections and failure counts. |

## Files Changed

- `scripts/todo-trial.ts` - added `e2e-report` and `verify-e2e-report`.
- `tests/skill-trials.test.ts` - added report generation regression.
- `planning/e2e-workflow-report.md` - durable E2E summary artifact.

## Verification Summary

- `bun scripts/todo-trial.ts e2e-report --target /tmp/build-right-todo-trial --preflight-target /tmp/build-right-todo-trial-preflight` - pass.
- `bun scripts/todo-trial.ts verify-e2e-report --report planning/e2e-workflow-report.md` - pass.
- `bun test` - pass.

## Learning Notes

- Proved: the report captures run label, source, targets, commands, artifacts, failure counts, proved/simulated/unproven, and follow-ups.
- Simulated: replay mode records copied-artifact replay unless a provider-native transcript is attached.
- Test next: make this report the default evidence bundle for future release checks.

## Skill Trial Notes

- Source under test: canonical and replayed scratch artifacts.
- Source comparison: pass.
- Contract markers checked: report sections, artifact links, failure summary counts, follow-up summary.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
