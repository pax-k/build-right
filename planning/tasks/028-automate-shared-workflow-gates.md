# 028: Automate Shared Workflow Gates

Status: complete
Type: testing/tooling
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove shared Build Right gates before either skill is trusted
Source under test: repo-local path

## Goal

Automate shared workflow gates that apply to both preflight and execution.

## Non-Goals

- Duplicate preflight or execution state-matrix tests.
- Mutate installed user-scope skills.
- Delete historical failure rows.

## Required Reading

- planning/tasks/027-define-e2e-workflow-oracle.md
- scripts/todo-trial.ts
- tests/skill-trials.test.ts
- planning/failed-tests.md

## Acceptance Criteria

- [x] Test clean source parity.
- [x] Test source mismatch blocks with `partial-needs-rerun`, exact path, and
  remediation guidance.
- [x] Test failure logging and failure-summary actionable/control grouping.
- [x] Test Bun-only compliance and forbidden runtime references.
- [x] Test scratch isolation keeps generated Todo artifacts out of this source
  repo.
- [x] Test helper scratch paths are collision-resistant under concurrency.
- [x] Append failures to `planning/failed-tests.md` if any verifier fails.

## Baseline Evidence

Sprint 003 covers pieces of these gates, but Sprint 004 needs one shared gate
suite that runs before skill-specific E2E replay.

## Verification

- `bun test`
- `bun scripts/todo-trial.ts parity`
- `bun scripts/todo-trial.ts parity-negative`
- `bun scripts/todo-trial.ts failure-summary`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts parity` | pass | Repo-local skill sources match compare root. |
| 2026-06-24 | `bun scripts/todo-trial.ts parity-negative` | pass/expected-control | Forced mismatch logs `partial-needs-rerun` as expected. |
| 2026-06-24 | `bun scripts/todo-trial.ts concurrency` | pass | Parallel negative controls used collision-resistant `/tmp/build-right-todo-trial-*` paths. |
| 2026-06-24 | `bun test` | pass | Failure grouping, runtime scan scope, scratch isolation, and concurrency regressions pass. |

## Files Changed

- `scripts/todo-trial.ts` - added `concurrency`, E2E commands, and Sprint 004 status-audit defaults.
- `tests/skill-trials.test.ts` - added shared gate, failure-injection, and concurrency regression coverage.
- `planning/failed-tests.md` - expected source mismatch/control rows remain append-only.
- `planning/failed-test-summary.md` - regenerated with 0 actionable open rows.

## Verification Summary

- `bun scripts/todo-trial.ts parity` - pass.
- `bun scripts/todo-trial.ts parity-negative` - pass, expected source-under-test row appended.
- `bun scripts/todo-trial.ts concurrency` - pass.
- `bun test` - pass.

## Learning Notes

- Proved: shared source, failure-log, Bun-compliance, scratch-isolation, and concurrency gates are automated.
- Simulated: concurrency is local helper parallelism, not multi-agent provider contention.
- Test next: run the shared gates as the first stage of every future skill trial.

## Skill Trial Notes

- Source under test: repo-local skill source.
- Source comparison: pass; negative parity logs `partial-needs-rerun`.
- Contract markers checked: source parity, failure summary, runtime scan, scratch isolation.
- Trial status: pass.

## Blockers

- None yet.

## Follow-Ups

- None yet.
