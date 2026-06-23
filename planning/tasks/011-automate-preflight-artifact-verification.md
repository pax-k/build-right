# 011: Automate Preflight Artifact Verification

Status: complete
Type: testing/tooling
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: moderate
Learning objective: turn the manual preflight trial expectations into repeatable verifier checks
Source under test: repo-local path

## Goal

Add automation that verifies the scratch-repo preflight output matches the
Build Right preflight contract.

## Non-Goals

- Automate execution/browser behavior.
- Replace human review of product judgment.
- Treat public evidence as customer validation.

## Required Reading

- planning/tasks/009-run-preflight-first-user-todo-trial.md
- tests/skill-trials.test.ts
- scripts/verify-skill-trials.ts
- skills/build-right-preflight/references/artifact-contract.md
- skills/build-right-preflight/scripts/preflight-check.ts
- planning/failed-tests.md

## Acceptance Criteria

- [x] Automation checks that required generated preflight artifacts exist in
  the scratch repo.
- [x] Automation checks blueprint status fields, source mode, prototype
  confidence, readiness table, file plan, and next action markers.
- [x] Automation checks MVP scope, source index, execution rules, release gates,
  conflicts, evidence notes, Sprint 0, and first issue contract markers.
- [x] Automation checks preflight transcript markers when a transcript artifact
  is available.
- [x] Automation runs `preflight-check.ts --mode all --format json` against the
  scratch repo and validates the expected final decision.
- [x] Automation fails when the app was implemented during preflight.
- [x] Automation appends failures to `planning/failed-tests.md`.

## Baseline Evidence

Current Bun tests cover helper fixture decisions and template markers, but not
a real scratch-repo preflight artifact set.

## Verification

- Run the new preflight verifier against a passing scratch repo.
- Force one missing artifact and confirm the verifier fails and logs it.
- Run `bun test`.
- Run `bun run verify:skill-trials`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-24 | `bun scripts/todo-trial.ts snapshot-preflight --target /tmp/build-right-todo-trial-preflight` | pass | Created a preflight-only snapshot from the scratch repo docs/tasks. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight` | pass | Verified required artifacts, markers, transcript, no app files, and preflight helper `ready-for-execution`. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-preflight-negative --kind missing --source /tmp/build-right-todo-trial-preflight` | pass | Missing artifact negative failed as expected and appended a log row. |
| 2026-06-24 | `bun scripts/todo-trial.ts verify-preflight-negative --kind app-file --source /tmp/build-right-todo-trial-preflight` | pass | App-file negative failed as expected and appended a log row. |
| 2026-06-24 | `planning/failed-tests.md` | pass | Captured the initial verifier implementation failures and a resolution row. |

## Learning Notes

- Proved: preflight artifacts can be verified automatically, and both missing
  artifact and accidental app-file failures are logged.
- Simulated: verifier checks marker coverage, not full human judgment quality.
- Test next: whether execution verification can reuse the same failure logger.

## Blockers

- None.

## Follow-Ups

- 012: Automate execution and browser proof verification.
- 014: Add failed-test log feedback loop.
