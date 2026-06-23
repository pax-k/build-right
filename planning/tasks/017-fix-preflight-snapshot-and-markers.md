# 017: Fix Preflight Snapshot And Marker Verification Robustness

Status: ready
Type: tooling/fix
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: remove preflight verifier brittleness around directory copies and exact-case marker strings
Source under test: repo-local path

## Goal

Harden the preflight trial automation so it copies nested artifact directories
reliably and checks semantic Bun/preflight contract markers instead of brittle
literal strings.

## Non-Goals

- Change the generated Todo application.
- Add root `docs/` or `tasks/` to this source repo.
- Skip required preflight artifacts when they are genuinely missing.

## Required Reading

- planning/failed-tests.md
- planning/tasks/011-automate-preflight-artifact-verification.md
- scripts/todo-trial.ts
- planning/todo-trial-protocol.md

## Acceptance Criteria

- [ ] Replace any file-only existence checks used for directory snapshotting
  with directory-aware logic.
- [ ] Ensure preflight snapshot commands preserve `docs/raw`,
  `docs/evidence`, and nested task artifacts.
- [ ] Make required marker checks semantic and case-tolerant where case is not
  contractually meaningful.
- [ ] Keep missing required artifacts as hard failures.
- [ ] Append any failed verifier command from this task to
  `planning/failed-tests.md`.

## Baseline Evidence

Sprint 002 logged missing `docs/blueprint-status.md`, `docs/raw/*`,
`docs/source-index.md`, `docs/mvp-scope.md`, and `docs/execution-rules.md`
after snapshot copy, followed by a resolution note about directory copying and
the brittle `Bun` marker.

## Verification

- `bun scripts/todo-trial.ts snapshot-preflight --target /tmp/build-right-todo-trial-preflight`
- `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight`
- `bun test`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Learning Notes

- Proved: pending.
- Simulated: pending.
- Test next: nested-directory and marker regression fixtures.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: preflight docs, raw docs, source index, MVP scope,
  execution rules
- Trial status: n/a

## Blockers

- None yet.

## Follow-Ups

- planning/tasks/018-test-preflight-verifier-regressions.md

