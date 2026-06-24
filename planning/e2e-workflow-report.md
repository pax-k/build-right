# E2E Workflow Report

Run label: sprint-004-e2e-2026-06-24
Timestamp: 2026-06-23T23:23:43.618Z
Source under test: repo-local `skills/build-right-preflight`, `skills/build-right-feature-planning`, and `skills/build-right-execution`
Preflight target: /tmp/build-right-todo-trial-preflight
Execution target: /tmp/build-right-todo-trial
Replay mode: direct-or-replayed-fixture

## Command List

- `bun test`
- `bun run verify:skill-trials`
- `bun scripts/todo-trial.ts verify-e2e-oracle`
- `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight`
- `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial`
- `bun scripts/todo-trial.ts verify-transcripts --target /tmp/build-right-todo-trial --preflight-target /tmp/build-right-todo-trial-preflight`
- `bun scripts/todo-trial.ts negative-gates`
- `bun scripts/todo-trial.ts negative-gates-malformed-conflict`
- `bun scripts/todo-trial.ts parity`
- `bun scripts/todo-trial.ts parity-negative`
- `bun scripts/todo-trial.ts failure-summary`
- `bun scripts/todo-trial.ts status-audit`
- `git diff --check`

## Shared Gates

- Source parity: `bun scripts/todo-trial.ts parity`.
- Failure log grouping: `planning/failed-test-summary.md`.
- Bun runtime compliance: `scan-runtime` and execution verifier.
- Scratch isolation: generated Todo files remain under `/tmp/build-right-todo-trial*`.
- Concurrency: negative controls use collision-resistant scratch paths.

## Preflight

- Target: /tmp/build-right-todo-trial-preflight
- Evidence: `docs/evidence/preflight-transcript.md`, `docs/evidence/manual-trials.md`, `tasks/sprint-0.md`.
- Expected result: docs/tasks/evidence only, no app files.

## Execution

- Target: /tmp/build-right-todo-trial
- Evidence: `docs/evidence/execution-transcript.md`, `docs/evidence/browser-proof.md`, `tasks/issues/001-build-bun-react-todo-app.md`.
- Expected result: Bun-served React + TypeScript Todo app with tests and browser proof.

## Negative Controls

- Expected/control rows: 27
- Missing preflight artifact, preflight app file, corrupted browser proof, malformed conflict, forbidden runtime source, and source parity mismatch are expected controls.

## Agentic Replay

- Replay mode: direct-or-replayed-fixture
- Transcript checks prove helper reports, founder questions, file plans, task intake, baseline evidence, implementation, verification, and stop-gate ordering.
- Sprint 004 transcript export remains fixture-based; task 069 adds native `codex exec --ephemeral --json` skill-loading proof for all three Build Right skills.

## Artifacts

- `planning/e2e-workflow-oracle.md`
- `planning/e2e-workflow-report.md`
- `/tmp/build-right-todo-trial-preflight/docs/evidence/preflight-transcript.md`
- `/tmp/build-right-todo-trial/docs/evidence/execution-transcript.md`
- `/tmp/build-right-todo-trial/docs/evidence/browser-proof.md`
- `/tmp/build-right-todo-trial/docs/evidence/browser-proof.png`
- `/tmp/build-right-todo-trial/tasks/issues/001-build-bun-react-todo-app.md`
- `planning/codex-native-skill-replay.md`

## Failure Summary

- Total rows: 53
- Actionable open rows: 0
- Expected/control rows: 27
- Resolved rows: 13
- Summary: planning/failed-test-summary.md

## Proved

- Oracle, helper commands, transcript markers, artifact contracts, negative controls, failure grouping, and status audit are machine-checkable.
- The canonical scratch execution target contains Bun app files, tests, browser proof, and task evidence.
- Native `codex exec` runs load and follow `build-right-preflight`, `build-right-feature-planning`, and `build-right-execution` once each, with JSONL event proof.

## Simulated

- Exhaustive per-step provider-native chat export is represented by durable transcript artifacts.
- Fresh replay can copy and reverify canonical scratch artifacts without invoking another autonomous agent.

## Unproven

- No deployment or external user validation is attempted.
- Native replay proves one bounded run per skill, not one native run per documented step.

## Follow-Ups

- None. No actionable failure groups remain.
