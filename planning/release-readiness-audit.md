# Release Readiness Audit

Run label: build-right-release-readiness-2026-06-24
Source under test: repo-local `skills/build-right-preflight`, `skills/build-right-feature-planning`, and `skills/build-right-execution`
Verdict: GO for repo-local Build Right skill release/readiness.

## Scope

This audit verifies the repo-local skills, helper scripts, state resolvers,
gate handling, negative controls, failure-log feedback loop, and canonical
Todo temp-repo trial artifacts. It does not claim external deployment,
customer validation, or a full provider-native conversation export.

## Coverage Matrix

| Area | Evidence | Status |
| --- | --- | --- |
| Skill entrypoints and references | Read all three `SKILL.md` files and referenced workflow/gate/evidence contracts. | pass |
| Preflight outcomes | Unit matrix covers `delegate-inventory`, `ask-founder`, `run-research`, `write-artifacts`, `create-sprint0`, and `ready-for-execution`; blocked gates are covered through founder/research/readiness checks. | pass |
| Feature-planning outcomes | Unit matrix covers `route-preflight`, `ask-founder`, `run-research`, `delegate-review`, `update-roadmap`, `update-sprint`, `create-ready-tasks`, and `blocked`. | pass |
| Execution outcomes | Unit and gate matrices cover `execute-task`, `continue-active-task`, `ask-founder`, `wait-external`, `create-blocker`, `no-ready-task`, and `invalid-state`. | pass |
| Gates and states | Source parity, founder, external owner, open conflict, failed release gate, source mismatch, stale/manual-trial, release-claim, malformed conflict, scratch isolation, and stop-before-continue paths pass. | pass |
| Scripts | `bunx skills add . --list`, `bun test`, `bun run verify:skill-trials`, all relevant `scripts/todo-trial.ts` verifier/control commands, and direct helper commands ran. | pass |
| Temp-repo behavior | Canonical preflight and execution targets plus seed, snapshot, replay, concurrency, negative-control, and browser-proof scratch paths were verified under `/tmp/build-right-todo-trial*`. | pass |
| Codex proof | `bun scripts/codex-native-skill-replay.ts` ran `codex exec --ephemeral --json` once per Build Right skill and verified each JSONL stream read the selected `SKILL.md` plus required references. | pass |
| Failure log | `planning/failed-test-summary.md` reports 73 total rows, 0 actionable open rows, 27 expected/control rows, and 23 resolved rows after fresh controls and Sprint 005 resolution rows. | pass |

## Commands

- `bunx skills add . --list` - found `build-right-preflight`, `build-right-feature-planning`, and `build-right-execution`.
- `bun test` - pass, 26 tests.
- `bun run verify:skill-trials` - pass, 26 tests.
- `bun scripts/todo-trial.ts verify-e2e-oracle` - pass.
- `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight` - pass.
- `bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial` - pass.
- `bun scripts/todo-trial.ts verify-transcripts --target /tmp/build-right-todo-trial --preflight-target /tmp/build-right-todo-trial-preflight` - pass.
- `bun scripts/todo-trial.ts negative-gates` - pass.
- `bun scripts/todo-trial.ts negative-gates-malformed-conflict` - expected fixture error.
- `bun scripts/todo-trial.ts parity` - pass.
- `bun scripts/todo-trial.ts verify-preflight-negative --kind missing` - expected-control row appended.
- `bun scripts/todo-trial.ts verify-preflight-negative --kind app-file` - expected-control row appended.
- `bun scripts/todo-trial.ts verify-execution-negative` - expected-control row appended.
- `bun scripts/todo-trial.ts parity-negative` - expected `partial-needs-rerun` remediation.
- `bun scripts/todo-trial.ts failure-injection` - 6 expected rows.
- `bun scripts/todo-trial.ts failure-log-smoke` - pass.
- `bun scripts/todo-trial.ts failure-summary` - pass and regenerated summary.
- `bun scripts/todo-trial.ts status-audit` - pass.
- `bun scripts/todo-trial.ts verify-e2e-report` - pass.
- `bun scripts/todo-trial.ts concurrency` - pass.
- `bun scripts/todo-trial.ts scan-runtime --target /tmp/build-right-todo-trial` - pass.
- `bun scripts/todo-trial.ts baseline-check --target /tmp/build-right-todo-trial --phase baseline` - pass.
- `bun scripts/todo-trial.ts baseline-check --target /tmp/build-right-todo-trial --phase final` - pass.
- `bun skills/build-right-preflight/scripts/preflight-check.ts --cwd . --mode all --format markdown` - pass; source repo reports not-ready as designed.
- `bun skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd . --feature "Example feature" --format markdown` - pass; routes source repo to preflight as designed.
- `bun skills/build-right-execution/scripts/continue-check.ts --cwd . --format markdown --strict` - pass; reports `create-blocker` for source repo root as designed.
- `bun skills/build-right-execution/scripts/execution-check.ts --cwd . --mode next-task --format markdown` - pass; no source-root ready task as designed.
- `codex exec --ephemeral --json -s read-only -C /Users/pax/Documents/Repos/build-right -o /tmp/build-right-codex-exec-proof-1782257088-21013.txt 'Read AGENTS.md. Do not edit files. Run exactly: bun scripts/todo-trial.ts verify-e2e-oracle. Report the command result and nothing else.'` - pass.
- `bun scripts/codex-native-skill-replay.ts` - pass; native `codex exec` replay for `build-right-preflight`, `build-right-feature-planning`, and `build-right-execution`.

## Temp Targets

- `/tmp/build-right-todo-trial-preflight`
- `/tmp/build-right-todo-trial`
- `/tmp/build-right-todo-trial-seed-1782256977-97599`
- `/tmp/build-right-todo-trial-snapshot-1782256987-98763`
- `/tmp/build-right-todo-trial-replay-1782256988-98815`
- `/tmp/build-right-todo-trial-concurrency-1782256953272-92386-f4ef46f8-8226-456f-8597-615bfd8420dd`
- `/tmp/build-right-codex-exec-proof-1782257088-21013.txt`
- `/tmp/build-right-codex-native-skill-replay/1782287163302-72876-c9142c7e-2c94-4a5d-88a6-3ec1c57c5aa8`

Negative-control temp paths are recorded in `planning/failed-tests.md`.

## Notes And Residual Risk

- Independent subagent review was a Build Right review trigger because release
  evidence changed, but the available multi-agent tool policy permits spawning
  subagents only when the user explicitly asks for delegation. Substitute
  verification was the full Bun suite, direct helper checks, negative controls,
  regenerated failure summary, E2E report verification, status audit, whitespace
  check, and bounded read-only Codex CLI proof.
- The source repo intentionally does not contain generated root `docs/` or
  `tasks/` artifacts; direct helpers therefore report route/preflight/blocker
  decisions for the source root while the real target behavior is verified in
  external `/tmp/build-right-todo-trial*` repos.
- `build-right-feature-planning` is now installed in user-scope
  `$HOME/.codex/skills` from repo-local source, and native replay verified
  installed-source parity for all three Build Right skills.
- Full per-step provider-native conversation export remains represented by
  deterministic transcript artifacts, but native Codex skill loading and
  bounded skill-guided execution are now proved once per Build Right skill in
  `planning/codex-native-skill-replay.md`.
