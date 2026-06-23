# 009: Run the Preflight First-User Todo Trial

Status: complete
Type: manual-trial
Owner: AI

Assumption basis: founder-claimed
Reversibility: easy
Learning objective: verify that preflight asks the right first-user questions and creates execution-ready artifacts without implementing the app
Source under test: repo-local path

## Goal

Run `build-right-preflight` in `/tmp/build-right-todo-trial` as a first-time
human user developing a demo React + TypeScript Todo app.

## Non-Goals

- Implement the Todo app.
- Run execution skill work.
- Do public web research.
- Treat the trial transcript as the only durable evidence.

## Required Reading

- planning/tasks/007-define-todo-trial-protocol.md
- planning/tasks/008-add-scratch-repo-seed-and-source-parity-checks.md
- skills/build-right-preflight/SKILL.md
- skills/build-right-preflight/references/workflow.md
- skills/build-right-preflight/references/founder-gates.md
- skills/build-right-preflight/references/artifact-contract.md
- planning/failed-tests.md

## Acceptance Criteria

- [x] The trial prompt invokes `build-right-preflight` and clearly says not to
  implement the app yet.
- [x] The agent reports `Preflight decision`, `Confidence`, `Project type`,
  `Next action`, missing artifacts, readiness warnings, and founder input gaps.
- [x] The agent asks a focused founder-question batch before claiming product
  truth.
- [x] The provided founder reply covers primary user, pain, promise, MVP,
  non-goals, Bun-only constraints, and validation expectations.
- [x] The agent announces a file plan before writing.
- [x] Generated artifacts include blueprint status, raw founder context,
  source index, MVP scope, execution rules, release gates, conflicts, evidence
  notes, Sprint 0, and first issue.
- [x] Generated claims distinguish founder-claimed, repo-evidence-backed, and
  prototype-assumption claims where relevant.
- [x] The first executable task includes assumption basis, reversibility,
  learning objective, source under test, baseline evidence, verification, and
  evidence log.
- [x] The app is not implemented during preflight.
- [x] Preflight helper is rerun before closeout.
- [x] Manual-trial evidence is recorded in the scratch repo evidence packet.
- [x] Any failed expectation is appended to `planning/failed-tests.md`.

## Baseline Evidence

The scratch repo should contain only seeded files before this trial starts.

## Verification

- Inspect transcript markers.
- Inspect generated scratch-repo artifacts.
- Run preflight helper in the scratch repo with `--mode all --format markdown`.
- Run `bun test` in this source repo after recording evidence.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun /Users/pax/Documents/Repos/build-right/skills/build-right-preflight/scripts/preflight-check.ts --cwd /tmp/build-right-todo-trial --mode all --format markdown` before writes | pass | Helper returned `ask-founder` with expected missing artifacts and founder gaps. |
| 2026-06-24 | `/tmp/build-right-todo-trial/docs/evidence/preflight-transcript.md` | pass | Transcript records prompt, helper report, founder questions, founder reply, file plan, and closeout. |
| 2026-06-24 | `/tmp/build-right-todo-trial/docs/evidence/manual-trials.md` | pass | Agent-agnostic preflight evidence packet records source, target, commands, artifacts, result, proved, simulated, unproven, and follow-ups. |
| 2026-06-24 | `find /tmp/build-right-todo-trial -maxdepth 3 -type f` | pass | Required preflight docs and task files exist in the scratch repo. |
| 2026-06-24 | no-app-file check | pass | `package.json`, `index.ts`, `index.html`, and `frontend.tsx` do not exist after preflight. |
| 2026-06-24 | `bun /Users/pax/Documents/Repos/build-right/skills/build-right-preflight/scripts/preflight-check.ts --cwd /tmp/build-right-todo-trial --mode all --format markdown` after writes | pass | Helper returned `ready-for-execution` with high confidence. |
| 2026-06-24 | `bun /Users/pax/Documents/Repos/build-right/skills/build-right-execution/scripts/continue-check.ts --cwd /tmp/build-right-todo-trial --format markdown --strict` | pass | Scratch resolver returned `execute-task` for `tasks/issues/001-build-bun-react-todo-app.md`. |

## Learning Notes

- Proved: preflight produces execution-ready scratch docs, Sprint 0, and a
  bounded first task without implementing the app.
- Simulated: transcript is durable reconstructed evidence, not a provider
  conversation export.
- Test next: whether execution can take the generated first task without extra context.

## Blockers

- None.

## Follow-Ups

- 010: Run the execution Todo app trial.
