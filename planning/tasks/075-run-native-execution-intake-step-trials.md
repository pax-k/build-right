# 075: Run Native Execution Intake And Planning Step Trials

Status: complete
Type: native-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove execution steps 058-062 through native Codex task selection, intake, workspace preflight, baseline, and narrow plan
Source under test: installed `build-right-execution` with repo-local parity

## Goal

Run native Codex step trials for execution steps 058-062. These steps validate
the pre-edit execution loop: resolver, task intake, workspace preflight,
baseline evidence, and gap analysis.

## Non-Goals

- Implement product behavior.
- Advance past a stop/ask gate.
- Reuse one native run for multiple step claims.

## Required Reading

- planning/codex-native-step-trial-protocol.md
- planning/sprints/005-skill-step-validation.md
- planning/tasks/058-test-execution-task-selection.md
- planning/tasks/062-test-execution-gap-analysis-plan.md
- skills/build-right-execution/SKILL.md
- skills/build-right-execution/references/workflow.md
- skills/build-right-execution/references/gates.md

## Acceptance Criteria

- [x] Run `scripts/codex-native-step-trials.ts` for tasks 058-062 sequentially.
- [x] Each step has a fresh scratch repo under `/tmp/build-right-native-step-trials/`.
- [x] Each step proves the execution `SKILL.md` and required references were read.
- [x] Resolver and execution helper commands run where required.
- [x] The runner judges resolver reporting, full task intake, workspace state inspection, baseline-before-implementation, and narrow plan output.
- [x] No product implementation files are modified for 058-062 unless a fixture file is explicitly needed as baseline evidence.
- [x] Any failure is appended to `planning/failed-tests.md` before continuing.
- [x] Update task 076 to `ready` after evidence is recorded.

## Baseline Evidence

Sprint 005 marked tasks 058-062 complete through deterministic helper fixtures.
Native execution pre-edit proof does not yet exist.

## Verification

- `bun scripts/codex-native-step-trials.ts --start 058 --end 062`
- `bun scripts/todo-trial.ts failure-summary`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --start 058 --end 062 --continue-on-failure` | pass | Native execution pre-edit steps 058-062 all passed. |
| 2026-06-24 | `planning/codex-native-step-trials.md` | pass | Summary lists steps 058-062 with scratch repos, JSONL paths, proof paths, helper results, and no failures. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | No new execution pre-edit failure rows; actionable open rows remain the known step 048 and 050-057 manual-trial packet failures. |
| 2026-06-24 | `git diff --check` | pass | No whitespace errors after task 075 evidence. |

## Files Changed

- `planning/codex-native-step-trials.md` - native execution pre-edit results for steps 058-062.
- `planning/failed-test-summary.md` - regenerated summary after execution pre-edit batch.
- `planning/tasks/075-run-native-execution-intake-step-trials.md` - completed task evidence.
- `planning/tasks/076-run-native-execution-implementation-step-trials.md` - moved to ready.
- `planning/sprints/006-codex-native-step-validation.md` - task 075 complete and task 076 ready.

## Verification Summary

- `bun scripts/codex-native-step-trials.ts --start 058 --end 062 --continue-on-failure` - pass.
- `bun scripts/todo-trial.ts failure-summary` - pass, no new rows for 058-062.
- `git diff --check` - pass.

## Learning Notes

- Proved: native Codex loaded and followed `build-right-execution` for execution steps 058-062, with resolver/task-contract/stop-gate helper command evidence and scratch proof artifacts.
- Simulated: none for native invocation; each step used `codex exec --ephemeral --json`.
- Test next: task 076 native execution implementation and closeout steps.

## Blockers

- None.

## Follow-Ups

- None.
