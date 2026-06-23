# 002: Convert Verifier Coverage to Bun Tests

Status: ready
Type: testing
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: moderate
Learning objective: lock current verifier behavior in named Bun unit tests before workflow restructuring
Source under test: repo-local path

## Goal

Move the current custom verifier coverage into a `bun test` suite with named
test cases, fixture helpers, and stable assertions.

## Non-Goals

- Remove `bun run verify:skill-trials` unless an equivalent script remains.
- Change preflight or execution decisions.
- Add a workflow runtime.
- Rewrite all helper scripts in one pass.

## Required Reading

- scripts/verify-skill-trials.ts
- package.json
- skills/build-right-preflight/scripts/preflight-check.ts
- skills/build-right-execution/scripts/continue-check.ts
- skills/build-right-execution/scripts/execution-check.ts
- AGENTS.md

## Acceptance Criteria

- [ ] `bun test` runs a test suite for skill manifests, contract markers,
  helper smoke checks, preflight fixture decisions, and continue resolver
  fixture decisions.
- [ ] `bun run verify:skill-trials` either delegates to the Bun test suite or
  remains as a compatibility wrapper with no duplicate business logic.
- [ ] Fixture helpers are reusable across preflight, continue, and execution
  tests.
- [ ] Tests use Bun APIs and do not introduce Jest, Vitest, Node-only runners,
  or npm/pnpm scripts.
- [ ] Existing verifier behavior remains green.

## Baseline Evidence

Run and record:

- `bun run verify:skill-trials`

Current baseline expected result:

- 9 verifier checks pass.

## Verification

- `bun test`
- `bun run verify:skill-trials`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Learning Notes

- Proved: pending
- Simulated: pending
- Test next: whether helper decision logic needs importable modules after CLI-level tests exist

## Blockers

- None yet.

## Follow-Ups

- planning/tasks/003-expand-testing-matrix.md
