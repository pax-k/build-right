# Sprint 005: Skill Step Validation

Status: complete
Owner: AI
Created: 2026-06-24

## Purpose

Run one validation task for every documented workflow step across
`build-right-preflight`, `build-right-feature-planning`, and
`build-right-execution`.

Each task scaffolds a fresh temporary repository, copies the repo-local skills
into it, invokes the relevant skill, exercises the step under test, and logs
failures in `planning/failed-tests.md`.

## Scope

Included:

- Per-step manual or agentic trials for preflight, feature planning, and
  execution.
- Source-under-test parity checks for copied scratch skills.
- Step-focused transcript capture.
- Helper-script decision checks.
- Failure logging for any skipped, reordered, missing, or misclassified step.

Excluded:

- Fixing discovered skill defects in this sprint.
- Replacing the existing Sprint 004 E2E oracle.
- Writing generated scratch artifacts into this repository.
- Treating simulated transcript fixtures as manual release proof.

## Shared Protocol

All tasks in this sprint must follow:

- `planning/skill-step-trial-protocol.md`
- `planning/failed-tests.md`

## Task Queue

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| 041 | Test preflight project-state inspection | complete | planning/tasks/041-test-preflight-inspect-project-state.md |
| 042 | Test preflight file-plan announcement | complete | planning/tasks/042-test-preflight-file-plan.md |
| 043 | Test preflight founder-context capture | complete | planning/tasks/043-test-preflight-founder-context.md |
| 044 | Test preflight claim and evidence tagging | complete | planning/tasks/044-test-preflight-claim-evidence-tagging.md |
| 045 | Test preflight research and delegation routing | complete | planning/tasks/045-test-preflight-research-delegation.md |
| 046 | Test preflight operating-artifact creation | complete | planning/tasks/046-test-preflight-operating-artifacts.md |
| 047 | Test preflight MVP and prototype scope extraction | complete | planning/tasks/047-test-preflight-mvp-prototype-scope.md |
| 048 | Test preflight Sprint 0 preparation | complete | planning/tasks/048-test-preflight-sprint0-preparation.md |
| 049 | Test preflight readiness gate | complete | planning/tasks/049-test-preflight-readiness-gate.md |
| 050 | Test feature planning surface read | complete | planning/tasks/050-test-feature-planning-read-surface.md |
| 051 | Test feature planning helper report | complete | planning/tasks/051-test-feature-planning-helper-report.md |
| 052 | Test feature classification | complete | planning/tasks/052-test-feature-planning-classification.md |
| 053 | Test feature planning founder questions | complete | planning/tasks/053-test-feature-planning-founder-questions.md |
| 054 | Test feature planning research and delegation routing | complete | planning/tasks/054-test-feature-planning-research-delegation.md |
| 055 | Test feature planning artifact updates | complete | planning/tasks/055-test-feature-planning-artifact-updates.md |
| 056 | Test feature planning executable handoff | complete | planning/tasks/056-test-feature-planning-executable-handoff.md |
| 057 | Test feature planning implementation boundary | complete | planning/tasks/057-test-feature-planning-implementation-boundary.md |
| 058 | Test execution task selection | complete | planning/tasks/058-test-execution-task-selection.md |
| 059 | Test execution task intake | complete | planning/tasks/059-test-execution-task-intake.md |
| 060 | Test execution workspace preflight | complete | planning/tasks/060-test-execution-workspace-preflight.md |
| 061 | Test execution baseline evidence capture | complete | planning/tasks/061-test-execution-baseline-evidence.md |
| 062 | Test execution gap analysis and narrow plan | complete | planning/tasks/062-test-execution-gap-analysis-plan.md |
| 063 | Test execution narrow implementation | complete | planning/tasks/063-test-execution-narrow-implementation.md |
| 064 | Test execution verification ladder | complete | planning/tasks/064-test-execution-verification-ladder.md |
| 065 | Test execution review, evidence, and state update | complete | planning/tasks/065-test-execution-review-evidence-state-update.md |
| 066 | Test execution commit or handoff | complete | planning/tasks/066-test-execution-commit-handoff.md |
| 067 | Test execution closeout | complete | planning/tasks/067-test-execution-closeout.md |

## Gate

Do not mark Sprint 005 complete until every task from 041-067 has evidence, any
failures are appended to `planning/failed-tests.md`, and a final failure summary
shows no actionable open rows unless the sprint explicitly closes as
`failures-logged`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/sprint005-step-trials.ts` | simulated-only | Completed tasks 041-067 with scratch repos under `/tmp/build-right-step-trials`; provider-native invocation remains simulated. |
| 2026-06-24 | `bun scripts/codex-native-skill-replay.ts` | native-invocation-pass | Proved separate `codex exec --ephemeral --json` runs load and follow all three Build Right skills; see `planning/codex-native-skill-replay.md`. |

## Review Note

- Required review trigger: more than three durable task/evidence files changed.
- Subagent review: skipped because the available multi-agent tool policy requires an explicit user request for subagents.
- Substitute verification: `bun test`, `bun run verify:skill-trials`, `git diff --check`, `bun scripts/todo-trial.ts failure-summary`, Sprint 005 `status-audit`, and `bun scripts/codex-native-skill-replay.ts`.
- Residual risk: tasks 041-067 remain deterministic per-step helper fixtures; task 069 proves native Codex skill loading and bounded skill-guided execution once per Build Right skill.
