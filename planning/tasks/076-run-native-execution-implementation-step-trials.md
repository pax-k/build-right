# 076: Run Native Execution Implementation And Closeout Step Trials

Status: complete
Type: native-validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove execution steps 063-067 through native Codex implementation, verification, evidence, handoff, and closeout behavior
Source under test: installed `build-right-execution` with repo-local parity

## Goal

Run native Codex step trials for execution steps 063-067. These steps validate
the implementation half of the execution loop: narrow implementation,
verification ladder, evidence-before-state update, commit/handoff, and closeout.

## Non-Goals

- Commit scratch repo changes to the source repository.
- Hide failed verification behind a passing final answer.
- Treat browser proof as complete unless the native run creates inspectable
  evidence or records a justified skip.

## Required Reading

- planning/codex-native-step-trial-protocol.md
- planning/sprints/005-skill-step-validation.md
- planning/tasks/063-test-execution-narrow-implementation.md
- planning/tasks/067-test-execution-closeout.md
- skills/build-right-execution/SKILL.md
- skills/build-right-execution/references/evidence-contract.md
- skills/build-right-execution/references/review-and-delegation.md

## Acceptance Criteria

- [x] Run `scripts/codex-native-step-trials.ts` for tasks 063-067 sequentially.
- [x] Each step has a fresh scratch repo under `/tmp/build-right-native-step-trials/`.
- [x] Each step proves the execution `SKILL.md` and required references were read.
- [x] The runner judges minimal implementation, Bun runtime compliance, verification ordering, evidence-before-status, review/substitute handling, handoff content, and closeout fields.
- [x] Scratch product files remain confined to the scratch repo.
- [x] Any browser proof skip is explicitly recorded with risk and later proof path.
- [x] Any failure is appended to `planning/failed-tests.md` before continuing.
- [x] Update task 077 to `ready` after evidence is recorded.

## Baseline Evidence

Sprint 005 marked tasks 063-067 complete through deterministic helper fixtures.
Native implementation and closeout proof does not yet exist.

## Verification

- `bun scripts/codex-native-step-trials.ts --start 063 --end 067`
- `bun scripts/todo-trial.ts failure-summary`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --start 063 --end 067 --continue-on-failure` | failures-logged | Steps 063, 066, and 067 passed; steps 064 and 065 logged `manual-trials.md missing manual trial packet markers`. |
| 2026-06-24 | `planning/codex-native-step-trials.md` | failures-logged | Summary lists execution implementation/closeout steps 063-067 with scratch repos, JSONL paths, proof paths, helper results, and failure status. |
| 2026-06-24 | `planning/failed-tests.md` | pass | Appended open rows for steps 064 and 065 pointing to this task. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | Summary reports eleven actionable open native rows total. |

## Files Changed

- `planning/codex-native-step-trials.md` - native execution implementation/closeout results for steps 063-067.
- `planning/failed-tests.md` - append-only failure rows for steps 064 and 065.
- `planning/failed-test-summary.md` - regenerated summary with eleven actionable open native rows.
- `planning/tasks/076-run-native-execution-implementation-step-trials.md` - completed task evidence with failures captured.
- `planning/tasks/077-add-native-step-summary-and-failure-feedback.md` - moved to ready.
- `planning/sprints/006-codex-native-step-validation.md` - task 076 complete and task 077 ready.

## Verification Summary

- `bun scripts/codex-native-step-trials.ts --start 063 --end 067 --continue-on-failure` - exit 1 because two failures were logged; all steps still produced native evidence.
- `bun scripts/todo-trial.ts failure-summary` - pass, eleven actionable open native rows total.
- `planning/codex-native-step-trials.md` - pass for 063, 066, and 067; failures-logged for 064 and 065.

## Learning Notes

- Proved: native Codex loaded and followed `build-right-execution` for implementation/verification/evidence/handoff/closeout steps 063-067, with helper command evidence and scratch proof artifacts.
- Simulated: none for native invocation; each step used `codex exec --ephemeral --json`.
- Test next: task 077 native summary and failure feedback.

## Blockers

- None.

## Follow-Ups

- `planning/failed-tests.md` rows for `064` and `065`: native execution steps omitted the required manual-trial packet markers before judgment.
