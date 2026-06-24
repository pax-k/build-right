# 073: Run Native Preflight Step Trials

Status: complete
Type: native-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove preflight steps 041-049 through native Codex execution, one scratch repo per step
Source under test: installed `build-right-preflight` with repo-local parity

## Goal

Run native Codex step trials for Sprint 005 preflight steps 041-049 and judge
each run from Codex JSONL events, helper output, generated artifacts, and final
reply evidence.

## Non-Goals

- Rewrite the preflight skill.
- Collapse multiple steps into one native run.
- Treat deterministic Sprint 005 fixtures as a substitute for native proof.

## Required Reading

- planning/codex-native-step-trial-protocol.md
- planning/sprints/005-skill-step-validation.md
- planning/tasks/041-test-preflight-inspect-project-state.md
- planning/tasks/049-test-preflight-readiness-gate.md
- skills/build-right-preflight/SKILL.md

## Acceptance Criteria

- [x] Run `scripts/codex-native-step-trials.ts` for tasks 041-049 sequentially.
- [x] Each step has a fresh scratch repo under `/tmp/build-right-native-step-trials/`.
- [x] Each step has prompt, JSONL, last-message, native proof, and manual-trial evidence.
- [x] Each step proves the selected preflight `SKILL.md` and required references were read.
- [x] Each step runs the expected preflight helper command where applicable.
- [x] Planning/file-plan/founder/evidence/readiness ordering is judged by the outer runner.
- [x] No product implementation files are created during preflight-only steps.
- [x] Any failure is appended to `planning/failed-tests.md` before continuing.
- [x] Update task 074 to `ready` after evidence is recorded.

## Baseline Evidence

Sprint 005 marked tasks 041-049 complete through deterministic helper fixtures.
Native per-step preflight proof does not yet exist.

## Verification

- `bun scripts/codex-native-step-trials.ts --start 041 --end 049`
- `bun scripts/todo-trial.ts failure-summary`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --start 041 --end 049 --continue-on-failure` | failures-logged | Steps 041-047 and 049 passed; step 048 logged `manual-trials.md missing manual trial packet markers`. |
| 2026-06-24 | `planning/codex-native-step-trials.md` | failures-logged | Summary lists all preflight steps 041-049 with scratch repos, JSONL paths, proof paths, helper results, and failure status. |
| 2026-06-24 | `planning/failed-tests.md` | pass | Appended open row for `048/codex-native-step-048` pointing to this task. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | Summary reports one actionable open row: `agent-instruction/codex-native-step-048`. |

## Files Changed

- `planning/codex-native-step-trials.md` - native preflight batch results for steps 041-049.
- `planning/failed-tests.md` - append-only failure row for step 048 manual-trial packet markers.
- `planning/failed-test-summary.md` - regenerated summary with one actionable open row.
- `planning/tasks/073-run-native-preflight-step-trials.md` - completed task evidence with failure captured.
- `planning/tasks/074-run-native-feature-planning-step-trials.md` - moved to ready.
- `planning/sprints/006-codex-native-step-validation.md` - task 073 complete and task 074 ready.

## Verification Summary

- `bun scripts/codex-native-step-trials.ts --start 041 --end 049 --continue-on-failure` - exit 1 because one failure was logged; all steps still produced native evidence.
- `bun scripts/todo-trial.ts failure-summary` - pass, one actionable open row for step 048.
- `planning/codex-native-step-trials.md` - pass for 041-047 and 049; failures-logged for 048.

## Learning Notes

- Proved: native Codex loaded and followed `build-right-preflight` for every preflight step 041-049, with JSONL command-event reads, helper execution, proof artifacts, and scratch-only boundaries judged by the runner.
- Simulated: none for native invocation; each step used `codex exec --ephemeral --json`.
- Test next: task 074 native feature-planning steps.

## Blockers

- None.

## Follow-Ups

- `planning/failed-tests.md` row for `048/codex-native-step-048`: native step 048 omitted the required manual-trial packet markers before judgment.
