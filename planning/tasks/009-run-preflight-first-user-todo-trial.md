# 009: Run the Preflight First-User Todo Trial

Status: blocked
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

- [ ] The trial prompt invokes `build-right-preflight` and clearly says not to
  implement the app yet.
- [ ] The agent reports `Preflight decision`, `Confidence`, `Project type`,
  `Next action`, missing artifacts, readiness warnings, and founder input gaps.
- [ ] The agent asks a focused founder-question batch before claiming product
  truth.
- [ ] The provided founder reply covers primary user, pain, promise, MVP,
  non-goals, Bun-only constraints, and validation expectations.
- [ ] The agent announces a file plan before writing.
- [ ] Generated artifacts include blueprint status, raw founder context,
  source index, MVP scope, execution rules, release gates, conflicts, evidence
  notes, Sprint 0, and first issue.
- [ ] Generated claims distinguish founder-claimed, repo-evidence-backed, and
  prototype-assumption claims where relevant.
- [ ] The first executable task includes assumption basis, reversibility,
  learning objective, source under test, baseline evidence, verification, and
  evidence log.
- [ ] The app is not implemented during preflight.
- [ ] Preflight helper is rerun before closeout.
- [ ] Manual-trial evidence is recorded in the scratch repo evidence packet.
- [ ] Any failed expectation is appended to `planning/failed-tests.md`.

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

## Learning Notes

- Proved: <what evidence supports>
- Simulated: <what remains unproven>
- Test next: whether execution can take the generated first task without extra context.

## Blockers

- Blocked until task 008 proves the scratch repo seed and source parity check.

## Follow-Ups

- 010: Run the execution Todo app trial.

