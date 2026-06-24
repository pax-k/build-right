# 070: Define Native Step Trial Protocol And Rubrics

Status: complete
Type: validation-planning
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: define how each documented workflow step will be tested through native Codex execution and judged from evidence
Source under test: planning protocol and Sprint 005 step matrix

## Goal

Create the protocol for full native Codex step trials. The protocol must define
scratch repo setup, skill source parity, `codex exec` invocation, JSONL capture,
per-step judgment, failure logging, and closeout rules.

## Non-Goals

- Implement the native runner.
- Run the 041-067 native trials.
- Change Build Right skill behavior.

## Required Reading

- planning/sprints/005-skill-step-validation.md
- planning/skill-step-trial-protocol.md
- planning/codex-native-skill-replay.md
- scripts/sprint005-step-trials.ts
- scripts/codex-native-skill-replay.ts

## Acceptance Criteria

- [x] Create `planning/codex-native-step-trial-protocol.md`.
- [x] Protocol states one native `codex exec --ephemeral --json` run per step.
- [x] Protocol requires fresh scratch repos under `/tmp/build-right-native-step-trials/`.
- [x] Protocol requires installed user-scope skill parity against repo-local `skills/`.
- [x] Protocol defines required evidence files: prompt, JSONL events, last message, native proof, and manual-trial packet.
- [x] Protocol defines per-step judgment categories: `pass`, `partial-needs-rerun`, `failures-logged`, and `blocked`.
- [x] Protocol says Codex's final reply is evidence, not authority; outer Bun automation judges the run.
- [x] Protocol requires append-only failure rows in `planning/failed-tests.md`.
- [x] Update Sprint 006 task 071 to `ready` after protocol evidence is recorded.

## Baseline Evidence

Sprint 005 has deterministic per-step fixtures, and task 069 has one native
skill-loading replay per skill. There is no protocol yet for native replay of
every individual step.

## Verification

- Inspect `planning/codex-native-step-trial-protocol.md`.
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `planning/codex-native-step-trial-protocol.md` | pass | Defines native per-step scratch, parity, invocation, JSONL judgment, evidence, failure logging, and summary rules. |
| 2026-06-24 | `git diff --check` | pass | No whitespace errors after protocol update. |

## Files Changed

- `planning/codex-native-step-trial-protocol.md` - native step-trial protocol and rubrics.
- `planning/tasks/070-define-native-step-trial-protocol.md` - completed task evidence.
- `planning/tasks/071-build-native-step-runner-foundation.md` - moved to ready.
- `planning/sprints/006-codex-native-step-validation.md` - task 070 complete and task 071 ready.

## Verification Summary

- `git diff --check` - pass.
- Protocol inspection - pass; all acceptance criteria are represented.

## Learning Notes

- Proved: native per-step trial rules now define how Codex JSONL, helper output, files, parity, and final replies are judged.
- Simulated: no native step trial was run in task 070.
- Test next: task 071 runner foundation.

## Blockers

- None.

## Follow-Ups

- `planning/tasks/071-build-native-step-runner-foundation.md`.
