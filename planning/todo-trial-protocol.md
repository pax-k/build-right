# Todo Skill Trial Protocol

Status: ready
Owner: AI
Created: 2026-06-24

## Purpose

Exercise `build-right-preflight` and `build-right-execution` the way a
first-time human would use them to create a demo React + TypeScript Todo app,
then give automation a concrete oracle for expected behavior.

## Target And Source

Scratch target:

```text
/tmp/build-right-todo-trial
```

Seed files:

- `AGENTS.md` with the Bun-only rules from this repository.
- Optional blank `README.md`.
- A Git repository initialized with `git init`.

Generated Todo app artifacts, generated scratch `docs/`, generated scratch
`tasks/`, transcripts, and manual-trial evidence stay in the scratch repo.

Source under test:

- `/Users/pax/Documents/Repos/build-right/skills/build-right-preflight`
- `/Users/pax/Documents/Repos/build-right/skills/build-right-execution`

The trial is authoritative only when the invoked or installed skill source
matches the repo-local source. If it does not, mark the run
`partial-needs-rerun`.

## Human Prompt: Preflight

```text
$build-right-preflight

Bootstrap this blank repo for a demo React + TypeScript Todo app.
Use Bun only. Do not implement the app yet; prepare the project truth, Sprint 0,
and the first executable AI task.
```

## Expected Preflight Interaction

The agent should:

- Read local instructions and the preflight skill references.
- Inspect the blank scratch repo before writing.
- Run:

```sh
bun /Users/pax/Documents/Repos/build-right/skills/build-right-preflight/scripts/preflight-check.ts --cwd /tmp/build-right-todo-trial --mode all --format markdown
```

- Report `Preflight decision`, `Confidence`, `Project type`, `Next action`,
  missing artifacts, readiness warnings, and founder input gaps.
- Ask a focused founder-question batch before claiming product truth.
- Announce a file plan before writing.
- Create only preflight docs, Sprint 0, and the first executable task.
- Rerun the preflight helper before closeout.
- Stop at `Go for Sprint 0` or `First executable AI task: <path>`.

The agent should not:

- Implement the app during preflight.
- Install app dependencies during preflight unless the generated first task
  explicitly requires setup verification.
- Treat public research as customer validation.
- Write generated scratch artifacts into this source repository.

## Founder Reply Batch

Use this reply when the agent asks for founder input:

```text
Primary user: reviewers testing whether Build Right skills work end to end.
Pain: we need a small app that proves the skills create docs, tasks, code,
tests, and evidence correctly.
Promise: a local Todo app where a user can add, complete, delete, and filter
todos.
MVP: React + TypeScript UI served by Bun, local state/localStorage only.
Non-goals: auth, backend database, deployment, accounts, collaboration,
styling system.
Constraints: Bun only, no Vite/npm/pnpm/yarn/Express.
Validation: bun install, bun test, Bun dev server, browser proof of the todo
workflow.
Source mode: founder-fed manual trial; no web research needed.
```

## Expected Preflight Artifacts

The scratch repo should contain:

- `docs/blueprint-status.md`
- `docs/raw/founder-dump.md` or `docs/raw/founder-interview.md`
- `docs/source-index.md`
- `docs/mvp-scope.md`
- `docs/execution-rules.md`
- `docs/release-gates.md`
- `docs/conflicts.md`
- `docs/evidence/evidence-notes.md`
- `docs/evidence/manual-trials.md`
- `tasks/sprint-0.md`
- `tasks/issues/001-*.md`

The first executable issue must include status, type, owner, assumption basis,
reversibility, learning objective, source under test, goal, non-goals, required
reading, acceptance criteria, baseline evidence, verification, evidence log,
blockers, and follow-ups.

## Human Prompt: Execution

```text
$build-right-execution

Use the repo-local Build Right execution skill source under test.
Take the next ready AI-owned task only. Use Bun only. Record baseline evidence,
verification, files changed, and stop-gate results.
```

## Expected Execution Behavior

The agent should:

- Run:

```sh
bun /Users/pax/Documents/Repos/build-right/skills/build-right-execution/scripts/continue-check.ts --cwd /tmp/build-right-todo-trial --format markdown --strict
```

- Report resolver decision, confidence, next action, next task, blocking
  gates, and external follow-ups.
- Run:

```sh
bun /Users/pax/Documents/Repos/build-right/skills/build-right-execution/scripts/execution-check.ts --cwd /tmp/build-right-todo-trial --mode next-task --format markdown
```

- Print task intake with done means, non-goals, assumption basis,
  reversibility, learning hook, source under test, baseline evidence,
  verification ladder, and evidence destination.
- Run task-contract checking before editing.
- Capture baseline evidence before writing app code.
- Implement one bounded Todo task.
- Verify with Bun tests and browser proof.
- Record evidence before marking the task complete.
- Run stop gates before selecting another task.

## Expected Todo App

The scratch app should use:

- `Bun.serve()`
- HTML imports
- React
- TypeScript
- localStorage for persistence
- Bun tests

Required behavior:

- Add a todo.
- Mark a todo complete.
- Delete a todo.
- Filter all, active, and completed todos.
- Restore todos from localStorage after reload.

Forbidden tools and dependencies:

- Vite
- npm
- pnpm
- yarn
- npx
- Express
- dotenv
- `ws`
- Node-first substitutes for Bun APIs when a Bun API is available.

## Pass/Fail Criteria

Preflight passes when:

- Required transcript markers are present.
- Founder questions were asked before product truth was claimed.
- Required artifacts and first issue exist.
- The app was not implemented during preflight.
- Helper rerun shows ready for execution or a reconciled explicit gate.
- Manual-trial evidence packet exists.

Execution passes when:

- Resolver and execution helper markers are present.
- Task intake is printed.
- Baseline evidence exists before implementation evidence.
- App files satisfy Bun-only constraints.
- `bun test` passes in the scratch repo.
- Browser proof covers add, complete, delete, filter, and localStorage restore.
- Task evidence records source under test, commands, results, proved,
  simulated, unproven, blockers, and follow-ups.
- Stop-gate checks run before any next task.

Negative gate trials pass when expected unsafe states stop instead of
continuing:

- Blank repo execution request routes to preflight or a small blocker.
- Founder-owned task returns `ask-founder`.
- External-owned task returns `wait-external`.
- Open founder conflict returns `ask-founder`.
- Open AI-owned conflict returns `create-blocker`.
- Failed release gate returns `create-blocker`.
- Source mismatch returns `partial-needs-rerun` or a source-mismatch blocker.

## Failure Logging

Any failed command, verifier assertion, browser proof, helper decision,
generated artifact contract, transcript expectation, source parity check, or
stop/ask gate must append a row to:

```text
planning/failed-tests.md
```

Rows are append-only. Fixes add resolution notes; they do not delete the
original failure.

