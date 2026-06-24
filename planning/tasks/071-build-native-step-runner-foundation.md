# 071: Build Native Step Runner Foundation

Status: complete
Type: automation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: build the reusable native Codex runner that can execute one documented step in a fresh scratch repo
Source under test: repo-local skills plus installed user-scope parity

## Goal

Implement the foundation for `scripts/codex-native-step-trials.ts`: step matrix,
scratch repo seeding, installed skill parity checks, prompt writing, native
`codex exec` invocation, event capture, and basic task evidence output.

## Non-Goals

- Judge all step-specific behavior.
- Run the full 041-067 matrix.
- Fix skill defects found by native runs.

## Required Reading

- planning/codex-native-step-trial-protocol.md
- scripts/sprint005-step-trials.ts
- scripts/codex-native-skill-replay.ts
- planning/sprints/006-codex-native-step-validation.md

## Acceptance Criteria

- [x] Add `scripts/codex-native-step-trials.ts`.
- [x] Runner imports or recreates the 041-067 step matrix with skill, slug, prompt, expected references, and expected helper commands.
- [x] Runner supports at least `--task <id>`, `--start <id>`, `--end <id>`, and `--continue-on-failure`.
- [x] Runner scaffolds `/tmp/build-right-native-step-trials/<id>-<slug>-<unique>`.
- [x] Runner seeds each scratch repo with minimal docs/tasks/app files needed for the step under test.
- [x] Runner verifies installed user-scope skill parity before native invocation.
- [x] Runner writes `docs/evidence/codex-prompt.txt`, `codex-events.jsonl`, `codex-last-message.txt`, and `codex-native-step-proof.md`.
- [x] Runner never writes generated scratch artifacts into the source repo.
- [x] Add focused test coverage or smoke verification for the runner setup path.
- [x] Update task 072 to `ready` after evidence is recorded.

## Baseline Evidence

`scripts/codex-native-skill-replay.ts` proves native skill loading once per
skill, but it does not model one native run per documented step.

## Verification

- `bun scripts/codex-native-step-trials.ts --task 041 --dry-run` if implemented.
- `bun test`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --help` | pass | CLI exposes task/range, continuation, dry-run, and summary options. |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --task 041 --dry-run` | pass | Created scratch repo `/tmp/build-right-native-step-trials/041-preflight-inspect-project-state-1782290187279-65005-60dcc154-a7db-4aa3-9f20-efa5ccdd18c1` with prompt, dry-run JSONL, last message, proof, and manual-trial packet. |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --summary` | pass | Created `planning/codex-native-step-trials.md` with the dry-run row. |
| 2026-06-24 | `bun test` | pass | 26 tests passed. |
| 2026-06-24 | `git diff --check` | pass | No whitespace errors. |

## Files Changed

- `scripts/codex-native-step-trials.ts` - native step runner foundation, matrix, scratch seeding, parity checks, prompt/event/proof capture, and summary output.
- `planning/codex-native-step-trials.md` - native step trial summary with task 041 dry-run evidence.
- `planning/tasks/071-build-native-step-runner-foundation.md` - completed task evidence.
- `planning/tasks/072-add-codex-event-judge.md` - moved to ready.
- `planning/sprints/006-codex-native-step-validation.md` - task 071 complete and task 072 ready.

## Verification Summary

- `bun scripts/codex-native-step-trials.ts --help` - pass.
- `bun scripts/codex-native-step-trials.ts --task 041 --dry-run` - pass.
- `bun scripts/codex-native-step-trials.ts --summary` - pass.
- `bun test` - pass, 26 tests.
- `git diff --check` - pass.

## Learning Notes

- Proved: runner can select a documented step, check installed skill parity, scaffold a fresh scratch repo, copy repo-local skill sources for evidence, write required evidence paths, and update a durable summary.
- Simulated: task 041 dry-run did not invoke native Codex; event-level judgment remains task 072.
- Test next: task 072 event judge.

## Blockers

- None.

## Follow-Ups

- None.
