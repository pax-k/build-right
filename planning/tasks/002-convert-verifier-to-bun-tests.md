# 002: Convert Verifier Coverage to Bun Tests

Status: complete
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

- [x] `bun test` runs a test suite for skill manifests, contract markers,
  helper smoke checks, preflight fixture decisions, and continue resolver
  fixture decisions.
- [x] `bun run verify:skill-trials` either delegates to the Bun test suite or
  remains as a compatibility wrapper with no duplicate business logic.
- [x] Fixture helpers are reusable across preflight, continue, and execution
  tests.
- [x] Tests use Bun APIs and do not introduce Jest, Vitest, Node-only runners,
  or npm/pnpm scripts.
- [x] Existing verifier behavior remains green.

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
| 2026-06-23 | `bun run verify:skill-trials` before conversion | pass | Existing verifier behavior was green with 9 checks. |
| 2026-06-23 | `bun test` | pass | 9 named tests passed across `tests/skill-trials.test.ts`. |
| 2026-06-23 | `bun run verify:skill-trials` | pass | Compatibility wrapper delegates to `bun test tests/skill-trials.test.ts`; 9 tests passed. |
| 2026-06-23 | Required review trigger check | skipped | Verifier behavior changed; subagent review tooling requires explicit user-requested delegation, so substituted direct wrapper/test inspection plus both verification commands. |

## Files Changed

- `tests/skill-trials.test.ts` - moved verifier behavior into named Bun tests with reusable fixture helpers.
- `scripts/verify-skill-trials.ts` - replaced custom verifier loop with a compatibility wrapper that runs the Bun test suite.
- `planning/sprints/001-workflow-backbone-foundation.md` - marks task 002 complete.
- `planning/tasks/002-convert-verifier-to-bun-tests.md` - records evidence and completion state.

## Verification Summary

- `bun test` - pass, 9 tests.
- `bun run verify:skill-trials` - pass, wrapper ran the same 9 tests.

## Learning Notes

- Proved: current verifier coverage can run as real Bun tests while preserving the `verify:skill-trials` entrypoint.
- Simulated: helper decision logic is still exercised through CLI fixtures rather than direct imports.
- Test next: whether helper decision logic needs importable modules after CLI-level tests exist.

## Blockers

- None.

## Follow-Ups

- planning/tasks/003-expand-testing-matrix.md
