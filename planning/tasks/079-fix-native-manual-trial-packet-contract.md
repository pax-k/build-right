# 079: Fix Native Manual-Trial Packet Contract

Status: complete
Type: bugfix
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove native Codex step runs write the manual-trial packet fields required by the outer judge
Source under test: repo-local path and installed user-scope Build Right skills

## Goal

Fix the native step validation failure class where Codex-native runs completed
the workflow but did not write `docs/evidence/manual-trials.md` with the packet
markers required by the Sprint 006 judge.

## Non-Goals

- Weaken the native judge.
- Delete or edit original `planning/failed-tests.md` failure rows.
- Rerun unaffected native steps unless verification requires it.
- Implement unrelated skill behavior changes.

## Required Reading

- planning/failed-tests.md
- planning/failed-test-summary.md
- planning/codex-native-step-trial-protocol.md
- scripts/codex-native-step-trials.ts
- skills/build-right-preflight/references/artifact-contract.md
- skills/build-right-feature-planning/references/planning-contract.md
- skills/build-right-execution/references/evidence-contract.md

## Acceptance Criteria

- [x] Native runner prompt requires the exact manual-trial packet field schema.
- [x] Native judge checks the full manual-trial packet field schema.
- [x] Preflight, feature-planning, and execution skill contracts document the same schema.
- [x] Installed user-scope Build Right skills are synced with repo-local source and parity is verified.
- [x] Affected native steps 048, 050-057, and 064-065 pass after rerun.
- [x] Resolution rows are appended to `planning/failed-tests.md` without deleting original failures.
- [x] `planning/codex-native-step-trials.md` and `planning/failed-test-summary.md` are regenerated.

## Baseline Evidence

Sprint 006 logged eleven actionable `agent-instruction` rows:

- `048/codex-native-step-048`
- `050` through `057/codex-native-step-*`
- `064/codex-native-step-064`
- `065/codex-native-step-065`

All share the same failure cause: `manual-trials.md missing manual trial packet
markers`.

## Verification

- `bun test tests/skill-trials.test.ts`
- `bun scripts/codex-native-step-trials.ts --task 048`
- `bun scripts/codex-native-step-trials.ts --start 050 --end 057 --continue-on-failure`
- `bun scripts/codex-native-step-trials.ts --start 064 --end 065 --continue-on-failure`
- `bun scripts/todo-trial.ts failure-summary`
- `bun scripts/codex-native-step-trials.ts --summary`
- `bun scripts/codex-native-step-trials.ts --status-audit`
- `git diff --check`
- `bun test`
- `bun run verify:skill-trials`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `scripts/codex-native-step-trials.ts` | complete | Native prompts now include the exact manual-trial packet schema; the judge checks every packet field marker. |
| 2026-06-24 | Skill evidence contracts | complete | Preflight, feature-planning, and execution references now document the same exact packet labels. |
| 2026-06-24 | Installed skill parity | pass | Synced all three installed user-scope Build Right skills from repo-local source and verified `diff -qr` parity. |
| 2026-06-24 | `bun test tests/skill-trials.test.ts` | pass | 29 pass / 0 fail, including manual packet schema and judge regression coverage. |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --task 048` | pass | Step 048 passed in scratch repo `/tmp/build-right-native-step-trials/048-preflight-sprint0-preparation-1782296880151-939-05a3669b-ccb9-4134-8947-07a94612bc7e`. |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --start 050 --end 057 --continue-on-failure` | pass | Feature-planning steps 050-057 all passed with native JSONL and packet evidence. |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --start 064 --end 065 --continue-on-failure` | pass | Execution steps 064 and 065 both passed with native JSONL and packet evidence. |
| 2026-06-24 | `planning/failed-tests.md` | resolved | Appended one matching resolution row for each original native packet failure. |
| 2026-06-24 | `bun scripts/todo-trial.ts failure-summary` | pass | Regenerated summary reports 0 actionable open rows. |
| 2026-06-24 | `bun scripts/codex-native-step-trials.ts --status-audit` | pass | Native summary reports 27/27 pass with artifact paths present. |
| 2026-06-24 | Final verification suite | pass | `git diff --check`, `git diff --cached --check`, `bun test`, and `bun run verify:skill-trials` passed after removing unrelated generated eval artifacts. |

## Files Changed

- `scripts/codex-native-step-trials.ts` - prompt, runner packet, and judge schema alignment.
- `tests/skill-trials.test.ts` - regression coverage for the full manual-trial packet schema.
- `planning/codex-native-step-trial-protocol.md` - protocol now defines exact packet labels.
- `skills/build-right-preflight/references/artifact-contract.md` - preflight manual-trial schema.
- `skills/build-right-feature-planning/references/planning-contract.md` - feature-planning manual-trial schema.
- `skills/build-right-execution/references/evidence-contract.md` - execution manual-trial schema.
- `/Users/pax/.codex/skills/build-right-preflight` - synced installed skill copy for native Codex loading.
- `/Users/pax/.codex/skills/build-right-feature-planning` - synced installed skill copy for native Codex loading.
- `/Users/pax/.codex/skills/build-right-execution` - synced installed skill copy for native Codex loading.
- `planning/codex-native-step-trials.md` - affected steps now pass.
- `planning/failed-tests.md` - appended resolution rows.
- `planning/failed-test-summary.md` - regenerated with 0 actionable open rows.
- `planning/sprints/006-codex-native-step-validation.md` - Sprint 006 closed as complete after remediation.
- `planning/tasks/079-fix-native-manual-trial-packet-contract.md` - closed this remediation task.

## Verification Summary

- `bun test tests/skill-trials.test.ts` - pass, 29 pass / 0 fail.
- `diff -qr skills/build-right-preflight /Users/pax/.codex/skills/build-right-preflight` - pass.
- `diff -qr skills/build-right-feature-planning /Users/pax/.codex/skills/build-right-feature-planning` - pass.
- `diff -qr skills/build-right-execution /Users/pax/.codex/skills/build-right-execution` - pass.
- `bun scripts/codex-native-step-trials.ts --task 048` - pass.
- `bun scripts/codex-native-step-trials.ts --start 050 --end 057 --continue-on-failure` - pass.
- `bun scripts/codex-native-step-trials.ts --start 064 --end 065 --continue-on-failure` - pass.
- `bun scripts/todo-trial.ts failure-summary` - pass, 0 actionable open rows.
- `bun scripts/codex-native-step-trials.ts --summary` - pass.
- `bun scripts/codex-native-step-trials.ts --status-audit` - pass, 27 steps.
- `bun scripts/todo-trial.ts status-audit --sprint planning/sprints/006-codex-native-step-validation.md --task-start 070 --task-end 079 --allowed-statuses complete` - pass.
- `git diff --check` - pass.
- `git diff --cached --check` - pass.
- `bun test` - pass, 29 pass / 0 fail.
- `bun run verify:skill-trials` - pass, 29 pass / 0 fail.

## Learning Notes

- Proved: the previous native failures were caused by an underspecified manual-trial packet contract, not by inability to invoke Codex-native skill runs.
- Proved: making the packet labels explicit in both runner prompts and skill contracts fixes the failure class without weakening the judge.
- Proved: affected steps now pass through actual `codex exec --ephemeral --json` reruns, not simulated fixtures.

## Blockers

- None.

## Follow-Ups

- None for Sprint 006 native step validation.
