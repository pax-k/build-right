# Sprint 006: Codex Native Step Validation

Status: failures-logged
Owner: AI
Created: 2026-06-24

## Purpose

Run a full real-world simulation for every documented Build Right workflow step:
one fresh scratch repo, one native `codex exec` invocation, one inspected JSONL
execution loop, and one deterministic judgment per step.

Sprint 005 proved every step with deterministic helper fixtures. Task 069
proved native Codex skill loading once per skill. This sprint combines those
surfaces: every step from 041-067 must be exercised through native Codex.

## Scope

Included:

- Native `codex exec --ephemeral --json` invocation for each documented step.
- Fresh scratch repos under `/tmp/build-right-native-step-trials/`.
- Installed user-scope skill parity against repo-local `skills/` before each
  authoritative native run.
- JSONL event inspection for skill reads, reference reads, helper commands,
  file writes, final agent reply, and turn completion.
- Per-step deterministic judgment from outer Bun automation.
- Failure logging to `planning/failed-tests.md` with append-only resolution
  behavior.

Excluded:

- Replacing the existing Sprint 005 deterministic helper matrix.
- Treating Codex's final message as self-verifying.
- Fixing discovered skill defects inside native trial tasks unless a task
  explicitly asks for a harness or verifier fix.
- Writing generated scratch artifacts into this source repository except
  durable summaries and task evidence.
- Customer validation, deployment, paid services, or external-state proof.

## Task Queue

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| 070 | Define native step trial protocol and rubrics | complete | planning/tasks/070-define-native-step-trial-protocol.md |
| 071 | Build native step runner foundation | complete | planning/tasks/071-build-native-step-runner-foundation.md |
| 072 | Add Codex event judge and assertions | complete | planning/tasks/072-add-codex-event-judge.md |
| 073 | Run native preflight step trials | complete | planning/tasks/073-run-native-preflight-step-trials.md |
| 074 | Run native feature-planning step trials | complete | planning/tasks/074-run-native-feature-planning-step-trials.md |
| 075 | Run native execution intake and planning step trials | complete | planning/tasks/075-run-native-execution-intake-step-trials.md |
| 076 | Run native execution implementation and closeout step trials | complete | planning/tasks/076-run-native-execution-implementation-step-trials.md |
| 077 | Add native step summary and failure feedback loop | complete | planning/tasks/077-add-native-step-summary-and-failure-feedback.md |
| 078 | Close native step validation sprint | complete | planning/tasks/078-close-native-step-validation-sprint.md |

## Gate

Do not mark Sprint 006 complete until:

- every task 070-078 is complete with evidence,
- every native step 041-067 has a scratch target and JSONL evidence,
- every failure is appended to `planning/failed-tests.md`,
- `planning/failed-test-summary.md` reports no actionable open rows unless the
  sprint explicitly closes as `failures-logged`,
- final verification passes with Bun.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `planning/tasks/070-*.md` through `planning/tasks/078-*.md` | planned | Sprint 006 task queue written; task 070 is ready and tasks 071-078 are sequenced as planned. |
| 2026-06-24 | `planning/codex-native-step-trial-protocol.md` | task-070-complete | Native step-trial protocol created; task 071 is ready. |
| 2026-06-24 | `scripts/codex-native-step-trials.ts --task 041 --dry-run` | task-071-complete | Native step runner foundation created; task 072 is ready for JSONL judgment. |
| 2026-06-24 | `scripts/codex-native-step-trials.ts --task 041` | task-072-complete | JSONL judge passed a live native Codex step run; task 073 is ready. |
| 2026-06-24 | `scripts/codex-native-step-trials.ts --start 041 --end 049 --continue-on-failure` | task-073-complete | Native preflight steps 041-047 and 049 passed; step 048 failure logged for missing manual-trial packet markers. |
| 2026-06-24 | `scripts/codex-native-step-trials.ts --start 050 --end 057 --continue-on-failure` | task-074-complete | Native feature-planning steps 050-057 all logged missing manual-trial packet marker failures. |
| 2026-06-24 | `scripts/codex-native-step-trials.ts --start 058 --end 062 --continue-on-failure` | task-075-complete | Native execution pre-edit steps 058-062 passed. |
| 2026-06-24 | `scripts/codex-native-step-trials.ts --start 063 --end 067 --continue-on-failure` | task-076-complete | Native execution steps 063, 066, and 067 passed; steps 064 and 065 logged missing manual-trial packet marker failures. |
| 2026-06-24 | `scripts/codex-native-step-trials.ts --status-audit` | task-077-complete | Native summary now reports all 27 steps with evidence paths and follow-up routing. |
| 2026-06-24 | Final verification suite | task-078-complete | `git diff --check`, `bun test`, `bun run verify:skill-trials`, `failure-summary`, native `--summary`, and native `--status-audit` passed. Sprint closes as `failures-logged` with eleven actionable native rows. |

## Closeout

Sprint 006 produced native Codex evidence for all steps 041-067.

- Passed: 041-047, 049, 058-063, 066-067.
- Failed and logged: 048, 050-057, 064-065.
- Partial or blocked: none.
- Open blocker: eleven actionable `agent-instruction` rows for missing
  manual-trial packet markers before native judgment.
- Next fix task: make native Build Right skill runs consistently write
  manual-trial packets with `Run label:` and `Unproven:` markers, then rerun
  affected steps.
