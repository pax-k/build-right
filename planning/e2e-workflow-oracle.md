# E2E Workflow Oracle

Status: active
Owner: AI
Created: 2026-06-24
Source under test: repo-local `skills/build-right-preflight`, `skills/build-right-feature-planning`, and `skills/build-right-execution`

## Purpose

This oracle defines what must be true when a first-time human uses the Build
Right skills to create a demo React + TypeScript Todo app with Bun. Automated
checks, manual reviews, and failure logs should use this file as the canonical
expectation set for Sprint 004.

## Shared Gates

| Gate | Expected Behavior | Evidence |
| --- | --- | --- |
| Source parity | Repo-local skill source and invoked/installed source match before trial claims are authoritative. Mismatch is `partial-needs-rerun`. | `bun scripts/todo-trial.ts parity`, `bun scripts/todo-trial.ts parity-negative` |
| Failure logging | Any failed command, verifier assertion, browser proof, helper decision, state transition, transcript marker, or automation assertion appends a row to `planning/failed-tests.md`. | `planning/failed-tests.md` |
| Failure summary | Expected negative controls, forced controls, resolved rows, and actionable open rows are separated; actionable open count must be zero before closeout. | `bun scripts/todo-trial.ts failure-summary` |
| Bun compliance | Runtime source uses Bun commands, `Bun.serve()`, HTML imports, and Bun tests; forbidden runtime references in app source fail. | `bun scripts/todo-trial.ts scan-runtime --target <scratch>` |
| Scratch isolation | Generated Todo app docs, tasks, code, tests, browser proof, and dependencies stay under `/tmp/build-right-todo-trial*`, not in the source repo root. | `bun scripts/todo-trial.ts concurrency` and repo scan |
| Concurrency | Negative controls use collision-resistant scratch paths under `/tmp` and can run in parallel without temp path collision. | `bun scripts/todo-trial.ts concurrency` |

## Preflight Oracle

### Happy Path

1. Blank Bun-only scratch repo starts with `AGENTS.md` and no app files.
2. Preflight helper reports decision, confidence, project type, next action,
   missing artifacts, readiness warnings, and founder input gaps.
3. The agent asks focused founder questions before claiming product truth.
4. Founder reply records user, pain, promise, MVP, non-goals, constraints,
   validation, and source mode.
5. A file plan appears before writes.
6. Preflight creates only docs, tasks, and evidence.
7. Closeout names the first executable AI-owned task.

### State Matrix

| State | Expected Decision |
| --- | --- |
| Blank repo without founder context | `ask-founder` |
| Existing repo with meaningful docs/code | `delegate-inventory` |
| Missing core docs | `write-artifacts` |
| Docs without task tracker | `create-sprint0` |
| `web-assisted` without evidence | `run-research` |
| `public-first-prototype` without evidence | `run-research` |
| Public/prototype evidence present | `ready-for-execution` |
| Unresolved founder/product questions | stop at founder gate |
| Malformed markdown tables | helper returns a decision and does not crash |

### Artifact Contract

Required artifacts:

- `docs/blueprint-status.md`
- `docs/raw/founder-dump.md`
- `docs/raw/founder-interview.md`
- `docs/source-index.md`
- `docs/mvp-scope.md`
- `docs/execution-rules.md`
- `docs/release-gates.md`
- `docs/conflicts.md`
- `docs/evidence/evidence-notes.md`
- `docs/evidence/manual-trials.md`
- `docs/evidence/preflight-transcript.md`
- `tasks/sprint-0.md`
- `tasks/issues/001-build-bun-react-todo-app.md`

Preflight must fail if app files such as `package.json`, `index.ts`,
`index.html`, `frontend.tsx`, `todo.ts`, or `todo.test.ts` appear before
execution.

### Transcript Oracle

The preflight transcript must prove this order:

1. helper report
2. focused founder questions
3. founder reply
4. file plan
5. closeout with first executable AI task

## Execution Oracle

### Happy Path

1. Continue resolver reports decision, confidence, next action, next task,
   blocking gates, and external follow-ups.
2. Resolver returns `execute-task` for the prepared ready AI-owned Todo task.
3. Task intake records done means, non-goals, assumption basis, reversibility,
   learning hook, source under test, baseline evidence, verification ladder,
   and evidence destination.
4. Task-contract check runs before edits.
5. Baseline evidence exists before implementation evidence.
6. Only the selected Todo task is implemented.
7. Verification runs before closeout.
8. Stop gates run before selecting another task.

### Resolver Matrix

| State | Expected Decision |
| --- | --- |
| No preflight docs/tracker | `create-blocker` |
| Ready AI task | `execute-task` |
| Active AI task | `continue-active-task` |
| All tasks complete | `no-ready-task` |
| Missing task file | `invalid-state` |
| Missing task contract fields | block before edit |
| Founder-owned task | `ask-founder` |
| External-owned task | `wait-external` |
| Founder conflict | `ask-founder` |
| External conflict | `wait-external` |
| AI conflict | `create-blocker` |
| Failed, stale, source-mismatch, or release-claim gate | block execution |

### Todo Behavior

The generated app must use Bun, React, TypeScript, HTML imports, localStorage,
and `Bun.serve()`. Browser proof must cover add, complete, delete, all,
active, completed, and localStorage restore behavior. Scratch `bun test` must
pass.

### Transcript Oracle

The execution transcript must prove this order:

1. resolver report
2. task intake
3. baseline evidence
4. implementation
5. verification
6. stop-gate notes

## Negative Controls

| Control | Expected Classification |
| --- | --- |
| Missing preflight artifact | `expected-control` |
| Preflight app file | `expected-control` |
| Corrupted browser proof | `expected-control` |
| Runtime forbidden source | `expected-control` |
| Malformed conflict fixture | expected fixture error, not crash |
| Source parity mismatch | `expected-logged` with `partial-needs-rerun` |
| Forced failure-log smoke | forced/control row plus separate resolution row |

Expected negative controls must not count as actionable open rows in
`planning/failed-test-summary.md`.

## Report Oracle

The E2E report must include run label, timestamp, source under test, scratch
targets, command list, artifact links, browser proof, transcripts, task
evidence, failure counts, proved/simulated/unproven/follow-up sections, and
whether the run was direct, replayed, or simulated.
