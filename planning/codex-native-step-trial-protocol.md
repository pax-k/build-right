# Codex Native Step Trial Protocol

Status: active
Owner: AI
Created: 2026-06-24
Source under test: installed user-scope Build Right skills with repo-local parity

## Purpose

Validate every documented Build Right workflow step through native Codex
execution. Each step gets a fresh scratch repo, a native `codex exec` run, a
captured JSONL execution loop, deterministic outer judgment, and durable
source-repo evidence.

This protocol covers Sprint 006 tasks 070-078 and native replays for Sprint 005
step IDs 041-067.

## Scratch Repo Rule

Each native step trial must use a unique disposable target:

```text
/tmp/build-right-native-step-trials/<step-id>-<slug>-<timestamp-pid-uuid>
```

Generated app files, docs, transcripts, JSONL events, screenshots, helper
outputs, and native proof files stay in the scratch repo. Only durable
summaries, task evidence, and failure-log rows are written to this source repo.

## Source-Under-Test Rule

Native Codex loads skills from the Codex skill registry, so every authoritative
run must prove the installed user-scope skill matches repo-local source before
invocation:

```sh
diff -qr /Users/pax/Documents/Repos/build-right/skills/<skill> /Users/pax/.codex/skills/<skill>
```

If a selected skill is missing from `/Users/pax/.codex/skills`, install or sync
it from repo-local source, then rerun parity. If parity cannot be proven, mark
the trial `partial-needs-rerun`, append a failure row, and do not claim native
step proof.

Each scratch repo must also include copied repo-local skills under `skills/` as
inspectable evidence, but copied scratch skills are not the native Codex loading
source.

## Invocation Rule

Invoke exactly one documented step per native Codex run:

```sh
codex exec --ephemeral --json \
  -s workspace-write \
  -C <scratch> \
  -o <scratch>/docs/evidence/codex-last-message.txt \
  '<step-focused prompt using $<skill-name>>' \
  > <scratch>/docs/evidence/codex-events.jsonl
```

The prompt must name:

- selected Build Right skill,
- step ID and step objective,
- scratch-only write boundary,
- required skill/reference reads,
- helper commands to run,
- expected proof artifact,
- final response markers.

Use `--skip-git-repo-check` only when a scratch repo intentionally cannot be a
Git repository. Otherwise initialize Git in the scratch repo.

## Evidence Files

Every native step scratch repo must contain:

```text
docs/evidence/codex-prompt.txt
docs/evidence/codex-events.jsonl
docs/evidence/codex-last-message.txt
docs/evidence/codex-native-step-proof.md
docs/evidence/manual-trials.md
```

When helpers run, also keep their stdout/stderr or summarize their exit codes in
the native proof and manual-trial packet.

## JSONL Judgment Rule

Codex's final reply is evidence, not authority. The outer Bun runner must parse
and judge the native run from:

- JSONL event stream,
- command execution records,
- selected `SKILL.md` read,
- required reference-file reads,
- helper commands and exit codes,
- generated files,
- forbidden write checks,
- final agent message markers,
- scratch repo state after the run.

The runner must not mark a step passed merely because Codex said it passed.

## Required Read Assertions

For every native step, assert the JSONL stream contains a read of the selected
installed skill:

```text
/Users/pax/.codex/skills/<skill>/SKILL.md
```

Assert required references by skill:

- `build-right-preflight`: `references/workflow.md`,
  `references/founder-gates.md`, `references/artifact-contract.md`; include
  `references/research-and-delegation.md` when research, review, inventory, or
  delegation routing is under test.
- `build-right-feature-planning`: `references/workflow.md`,
  `references/gates.md`, `references/planning-contract.md`; include
  `references/research-and-delegation.md` when research, review, conflict scan,
  or delegation routing is under test.
- `build-right-execution`: `references/workflow.md`, `references/gates.md`,
  `references/evidence-contract.md`; include
  `references/review-and-delegation.md` when review, evidence/state update,
  commit/handoff, or closeout is under test.

Missing reads are `partial-needs-rerun` when evidence is ambiguous, and
`failures-logged` when the run clearly skipped required instructions.

## Helper Rule

Run the helper commands relevant to the step:

- Preflight:
  `bun /Users/pax/.codex/skills/build-right-preflight/scripts/preflight-check.ts --cwd <scratch> --mode all --format markdown`
- Feature planning:
  `bun /Users/pax/.codex/skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd <scratch> --feature "<feature>" --format markdown`
- Execution resolver:
  `bun /Users/pax/.codex/skills/build-right-execution/scripts/continue-check.ts --cwd <scratch> --format markdown --strict`
- Execution task contract:
  `bun /Users/pax/.codex/skills/build-right-execution/scripts/execution-check.ts --cwd <scratch> --task <task-path> --mode task-contract --format markdown`
- Execution stop gates:
  `bun /Users/pax/.codex/skills/build-right-execution/scripts/execution-check.ts --cwd <scratch> --task <task-path> --mode stop-gates --format markdown`

The native Codex run should execute the helper when the step requires it. The
outer runner may rerun helpers after Codex exits to verify final state.

## Forbidden Write Rule

Native runs must write only inside their scratch repo. Planning-only steps must
not create product implementation files. Execution implementation steps may
create or edit product files only inside the scratch repo and only when the step
under test requires implementation proof.

## Step Statuses

Use these closeout statuses:

- `pass`: native run, JSONL assertions, helper checks, artifact checks, and
  forbidden-write checks all pass.
- `partial-needs-rerun`: native run completed but source, JSONL, transcript, or
  artifact evidence is ambiguous or incomplete.
- `failures-logged`: a concrete expectation failed and a row was appended to
  `planning/failed-tests.md`.
- `blocked`: execution cannot proceed because of a repeated environment,
  missing-tool, auth, or external-state blocker.

## Failure Logging Rule

Append a row to `planning/failed-tests.md` immediately when any of these fail:

- scratch setup,
- installed skill parity,
- `codex exec` exit code,
- JSONL parse,
- selected skill read,
- required reference read,
- expected helper command,
- generated proof artifact,
- forbidden write check,
- final response marker,
- task evidence update,
- summary/status audit,
- final verification command.

Rows are append-only. Fixes require later resolution rows; never delete or edit
the original failure row.

## Durable Summary Rule

The native step runner must update:

```text
planning/codex-native-step-trials.md
```

The summary must list each step 041-067 with status, skill, scratch repo, JSONL
path, proof path, helper result, and failure follow-up.

## Completion Gate

Sprint 006 can close only when every step 041-067 has native JSONL evidence and
every failure is resolved, expected/control, or explicitly left as an
actionable blocker. Final verification must include:

```sh
git diff --check
bun test
bun run verify:skill-trials
bun scripts/todo-trial.ts failure-summary
bun scripts/codex-native-step-trials.ts --summary
```
