# 069: Prove Codex-Native Skill Invocation

Status: complete
Type: validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: prove a separate `codex exec` process loads and follows the Build Right skills, instead of relying only on deterministic transcript fixtures
Source under test: installed user-scope skill paths with repo-local parity

## Goal

Run native Codex CLI replays for `build-right-preflight`,
`build-right-feature-planning`, and `build-right-execution` in fresh scratch
repos, capture JSONL event streams, and verify the event streams show each
skill `SKILL.md` plus required references were read.

## Non-Goals

- Replace the deterministic Sprint 005 per-step helper coverage.
- Claim customer validation, production readiness, or paid/external service proof.
- Let native replay write outside scratch repos.

## Required Reading

- planning/sprints/005-skill-step-validation.md
- planning/skill-step-trial-protocol.md
- planning/failed-test-summary.md
- skills/build-right-preflight/SKILL.md
- skills/build-right-feature-planning/SKILL.md
- skills/build-right-execution/SKILL.md

## Acceptance Criteria

- [x] Installed user-scope Build Right skills exist and match repo-local source.
- [x] Fresh scratch repos are scaffolded under `/tmp/build-right-codex-native-skill-replay/`.
- [x] `codex exec --ephemeral --json` runs once for each Build Right skill.
- [x] Each JSONL stream proves the native agent read that skill's `SKILL.md`.
- [x] Each JSONL stream proves required references for that skill were read.
- [x] Each scratch repo contains `docs/evidence/codex-native-proof.md`.
- [x] Durable summary is written in `planning/codex-native-skill-replay.md`.
- [x] Any native invocation failure is appended to `planning/failed-tests.md`.

## Baseline Evidence

Sprint 005 completed deterministic step trials, but the task files and sprint
review note still marked provider-native invocation as simulated-only.

## Verification

- `bun scripts/codex-native-skill-replay.ts`
- `bun test`
- `bun scripts/todo-trial.ts failure-summary`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/codex-native-skill-replay.ts` | pass | Ran native `codex exec --ephemeral --json` replays for preflight, feature planning, and execution. |
| 2026-06-24 | `planning/codex-native-skill-replay.md` | pass | Summary links each scratch repo, JSONL event stream, and native proof artifact. |
| 2026-06-24 | `/Users/pax/.codex/skills/build-right-feature-planning` | pass | Installed missing feature-planning skill from repo-local source so all three native replays could use user-scope Codex skills with parity. |

## Files Changed

- `scripts/codex-native-skill-replay.ts` - adds native Codex replay automation and verification.
- `planning/codex-native-skill-replay.md` - records native replay summary and evidence paths.
- `planning/tasks/069-prove-codex-native-skill-invocation.md` - closes this validation task.
- `planning/sprints/005-skill-step-validation.md` - updates residual-risk note after native replay.
- `planning/release-readiness-audit.md` - updates release-readiness coverage.
- `planning/e2e-workflow-report.md` - distinguishes fixture replay from native smoke proof.
- `/Users/pax/.codex/skills/build-right-feature-planning` - installed repo-local feature-planning skill for native Codex loading.

## Verification Summary

- `bun scripts/codex-native-skill-replay.ts` - pass; all three native replays passed.
- Native replay checked event streams for each selected `SKILL.md` and required reference paths.
- Native replay checked `docs/evidence/codex-native-proof.md` in each scratch repo.
- Installed skill parity against repo-local `skills/` passed for all three Build Right skills.
- `git diff --check` - pass.
- `bun test` - pass, 26 pass / 0 fail.
- `bun run verify:skill-trials` - pass, 26 pass / 0 fail.
- `bun scripts/todo-trial.ts failure-summary` - pass, 0 actionable open rows.
- `bun scripts/todo-trial.ts status-audit --sprint planning/sprints/005-skill-step-validation.md --task-start 041 --task-end 067 --allowed-statuses complete` - pass.

## Learning Notes

- Proved: separate `codex exec` processes loaded and followed `build-right-preflight`, `build-right-feature-planning`, and `build-right-execution`.
- Simulated: Sprint 005's exhaustive per-step matrix remains deterministic helper coverage, not one native Codex run per documented step.
- Test next: provider-native per-step replay only if every individual step needs native replay, not just native skill-loading proof.

## Blockers

- None.

## Follow-Ups

- None.
