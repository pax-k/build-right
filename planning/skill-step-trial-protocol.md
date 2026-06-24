# Skill Step Trial Protocol

Status: active
Owner: AI
Created: 2026-06-24
Source under test: repo-local `skills/build-right-*`

## Purpose

Validate every Build Right skill workflow step in isolation, using a fresh
temporary repository that has the repo-local skills copied into it before the
skill is invoked.

This protocol covers Sprint 005 tasks 041-067.

## Scratch Repo Rule

Each task must use a unique scratch target:

```text
/tmp/build-right-step-trials/<task-id>-<slug>-<timestamp-or-random>
```

The scratch target must be disposable. Generated docs, app files, transcripts,
logs, and browser proof stay in the scratch target unless the task explicitly
records a durable summary in this repository.

## Skill Installation Rule

Each trial must copy the repo-local skills into the scratch repo before skill
invocation:

```sh
mkdir -p <scratch>/skills
cp -R /Users/pax/Documents/Repos/build-right/skills/build-right-preflight <scratch>/skills/
cp -R /Users/pax/Documents/Repos/build-right/skills/build-right-feature-planning <scratch>/skills/
cp -R /Users/pax/Documents/Repos/build-right/skills/build-right-execution <scratch>/skills/
```

The trial is authoritative only when the copied skill source matches the
repo-local source. If source parity cannot be proven, record the trial as
`partial-needs-rerun`.

## Seed Rule

Seed every scratch repo with:

- `AGENTS.md` copied from this repository.
- `README.md` describing the step trial.
- `git init`.
- The copied `skills/` directory.
- Only the minimum docs/tasks/app files needed to reach the step under test.

Do not use home-scoped skill state as the source of truth.

## Invocation Rule

Invoke the relevant skill from inside the scratch repo with a step-focused
prompt. Capture the prompt and agent output in:

```text
<scratch>/docs/evidence/<skill-name>-<task-id>-transcript.md
```

When a provider-native agent runner is unavailable, create an
agent-agnostic transcript fixture and mark the evidence as `simulated`. A
simulated transcript may test verifier expectations, but it cannot close a
manual release gate by itself.

## Helper Rule

Run the skill helper that corresponds to the step whenever one exists:

- Preflight: `bun <scratch>/skills/build-right-preflight/scripts/preflight-check.ts --cwd <scratch> --mode all --format markdown`
- Feature planning: `bun <scratch>/skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd <scratch> --feature "<feature>" --format markdown`
- Execution selection: `bun <scratch>/skills/build-right-execution/scripts/continue-check.ts --cwd <scratch> --format markdown --strict`
- Execution task contract: `bun <scratch>/skills/build-right-execution/scripts/execution-check.ts --cwd <scratch> --task <task-path> --mode task-contract --format markdown`
- Execution stop gates: `bun <scratch>/skills/build-right-execution/scripts/execution-check.ts --cwd <scratch> --task <task-path> --mode stop-gates --format markdown`

Use Bun for all JavaScript and TypeScript commands.

## Failure Logging Rule

Append any failure to:

```text
planning/failed-tests.md
```

Log failures for:

- Scratch repo setup failure.
- Skill source parity mismatch.
- Missing helper report fields.
- Unexpected helper decision.
- Missing transcript marker.
- Missing generated artifact or task field.
- A stop/ask gate being skipped or misclassified.
- Product implementation during a planning-only step.
- Missing evidence before task state changes.
- Verification or browser proof failures.

Rows are append-only. Fixes must add a separate resolution row.

## Evidence Rule

Every task must record:

- Scratch target.
- Skill invoked.
- Prompt path or inline prompt.
- Helper commands and results.
- Transcript path.
- Files generated in the scratch repo.
- What the step proved.
- What was simulated.
- Failures logged, or `none`.
- Next step trial to run.

## Shared Closeout

Close each step task with one of:

```text
pass
partial-needs-rerun
blocked
failures-logged
simulated-only
```

Do not mark a step task complete until its acceptance criteria and evidence log
are updated.
