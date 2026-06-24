# 074: Run Native Feature-Planning Step Trials

Status: complete
Type: native-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove feature-planning steps 050-057 through native Codex execution, one scratch repo per step
Source under test: installed `build-right-feature-planning` with repo-local parity

## Goal

Run native Codex step trials for Sprint 005 feature-planning steps 050-057 and
judge each run from Codex JSONL events, helper output, planning artifacts, and
final reply evidence.

## Non-Goals

- Implement any planned feature.
- Use web research beyond bounded simulated/local evidence unless a step
  explicitly requires it.
- Treat a ready execution handoff as permission to execute product code.

## Required Reading

- planning/codex-native-step-trial-protocol.md
- planning/sprints/005-skill-step-validation.md
- planning/tasks/050-test-feature-planning-read-surface.md
- planning/tasks/057-test-feature-planning-implementation-boundary.md
- skills/build-right-feature-planning/SKILL.md

## Acceptance Criteria

- [x] Run `scripts/codex-native-step-trials.ts` for tasks 050-057 sequentially.
- [x] Each step has a fresh scratch repo under `/tmp/build-right-native-step-trials/`.
- [x] Each step proves the selected feature-planning `SKILL.md` and required references were read.
- [x] Each step runs the expected feature-planning helper command.
- [x] The runner judges planning surface reads, helper report, classification, founder questions, research/delegation routing, artifact updates, handoff, and implementation boundary.
- [x] Product implementation files remain untouched in feature-planning steps.
- [x] Any failure is appended to `planning/failed-tests.md` before continuing.
- [x] Update task 075 to `ready` after evidence is recorded.

## Baseline Evidence

Sprint 005 marked tasks 050-057 complete through deterministic helper fixtures.
Native per-step feature-planning proof does not yet exist.

## Verification

- `bun scripts/codex-native-step-trials.ts --start 050 --end 057`
- `bun scripts/todo-trial.ts failure-summary`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --start 050 --end 057 --continue-on-failure` | failures-logged | Steps 050-057 all produced native evidence and logged the same failure: `manual-trials.md missing manual trial packet markers`. |
| 2026-06-24 | `planning/codex-native-step-trials.md` | failures-logged | Summary lists feature-planning steps 050-057 with scratch repos, JSONL paths, proof paths, helper results, and failure status. |
| 2026-06-24 | `planning/failed-tests.md` | pass | Appended open rows for `050` through `057`, all pointing to this task. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | Summary reports nine actionable open rows total: step 048 plus 050-057. |

## Files Changed

- `planning/codex-native-step-trials.md` - native feature-planning batch results for steps 050-057.
- `planning/failed-tests.md` - append-only failure rows for steps 050-057.
- `planning/failed-test-summary.md` - regenerated summary with nine actionable open native rows.
- `planning/tasks/074-run-native-feature-planning-step-trials.md` - completed task evidence with failures captured.
- `planning/tasks/075-run-native-execution-intake-step-trials.md` - moved to ready.
- `planning/sprints/006-codex-native-step-validation.md` - task 074 complete and task 075 ready.

## Verification Summary

- `bun scripts/codex-native-step-trials.ts --start 050 --end 057 --continue-on-failure` - exit 1 because eight failures were logged; all steps still produced native evidence.
- `bun scripts/todo-trial.ts failure-summary` - pass, nine actionable open native rows total.
- `planning/codex-native-step-trials.md` - failures-logged for 050-057.

## Learning Notes

- Proved: native Codex loaded and followed `build-right-feature-planning` for every feature-planning step 050-057, with JSONL command-event reads, helper execution, proof artifacts, and scratch-only boundaries judged by the runner.
- Simulated: none for native invocation; each step used `codex exec --ephemeral --json`.
- Test next: task 075 native execution intake and planning steps.

## Blockers

- None.

## Follow-Ups

- `planning/failed-tests.md` rows for `050` through `057`: native feature-planning steps omitted the required manual-trial packet markers before judgment.
