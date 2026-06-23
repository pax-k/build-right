# 011: Automate Preflight Artifact Verification

Status: blocked
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

- [ ] Automation checks that required generated preflight artifacts exist in
  the scratch repo.
- [ ] Automation checks blueprint status fields, source mode, prototype
  confidence, readiness table, file plan, and next action markers.
- [ ] Automation checks MVP scope, source index, execution rules, release gates,
  conflicts, evidence notes, Sprint 0, and first issue contract markers.
- [ ] Automation checks preflight transcript markers when a transcript artifact
  is available.
- [ ] Automation runs `preflight-check.ts --mode all --format json` against the
  scratch repo and validates the expected final decision.
- [ ] Automation fails when the app was implemented during preflight.
- [ ] Automation appends failures to `planning/failed-tests.md`.

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

## Learning Notes

- Proved: <what evidence supports>
- Simulated: <what remains unproven>
- Test next: whether execution verification can reuse the same failure logger.

## Blockers

- Blocked until task 009 captures the first preflight artifact set.

## Follow-Ups

- 012: Automate execution and browser proof verification.
- 014: Add failed-test log feedback loop.

