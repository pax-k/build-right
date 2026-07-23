# 082: Add OpenSpec Provider And Orchestration Contracts

Status: complete
Type: contract/integration
Owner: AI

Assumption basis: repo-evidence-backed
Requirement basis: `docs/openspec-integration-technical-design.md` sections Provider Contract and OpenSpec Process Boundary
Reversibility: easy
Learning objective: prove Build Right can inspect and mutate only allowlisted OpenSpec lifecycle operations through stable typed boundaries
Source under test: repo-local path and managed OpenSpec runtime

## Goal

Implement provider-neutral inspection contracts, the OpenSpec JSON adapter, and
a separate mutation orchestrator for change creation and validated
finalization.

## Non-Goals

- Let the read-only resolver mutate OpenSpec.
- Accept arbitrary OpenSpec subcommands.
- Import OpenSpec private modules.
- Create feature artifacts without the feature-planning skill.
- Add multiple planning providers.

## Required Reading

- docs/openspec-integration-technical-design.md
- planning/tasks/081-add-managed-openspec-runtime-and-setup.md
- OpenSpec v1.6.0 status, instructions, new-change, validate, and archive contracts

## Solution-Fit Rationale

- Requirement served: use OpenSpec under the hood without leaking it into Build Right policy.
- Constraints honored: public CLI, typed normalization, separate read/write boundaries.
- Guarantees preserved: resolver purity, command allowlist, structured failure, version compatibility.
- Cost accepted: subprocess adapter and runtime validation code.
- Deferred capability: generic plugins and arbitrary OpenSpec profiles.

## Acceptance Criteria

- [x] Define normalized change, artifact, work-item, validation, and error results.
- [x] Validate every external JSON field consumed by Build Right.
- [x] Add read-only status, apply-instructions, artifact-instructions, and strict-validation operations.
- [x] Add an allowlisted mutation orchestrator for change creation and post-readiness finalization.
- [x] Reject arbitrary commands and repository-provided arguments.
- [x] Validate change and work-item identifiers.
- [x] Detect malformed JSON, missing fields, failure exits, timeout, and version mismatch.
- [x] Keep resolver imports free of setup and mutation implementations.
- [x] Add deterministic success and negative fixtures.
- [x] Update task 083 to `ready` after verification.

## Baseline Evidence

Task 081 should provide a managed compatible runtime and valid OpenSpec root but
no planning or execution orchestration.

## Verification

- focused adapter and orchestrator contract tests
- mutation allowlist negative controls
- `bun test`
- `bun run verify:skill-trials`
- `bunx tsc --noEmit`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-07-23 | `tests/openspec-provider.test.ts` | pass | 4 focused tests and 50 assertions cover typed normalization, exact allowlists, malformed/untrusted output, identifier validation, mutation authorization, proof replay, timeout/output-limit partial JSON, and completed strict-validation failures. |
| 2026-07-23 | `/tmp/build-right-openspec-082.0aRYi2` | real-cli-pass | Pinned OpenSpec 1.6.0 status and artifact instructions normalized successfully; a real strict-validation exit with issues was preserved as an invalid result rather than mislabeled as provider failure. |
| 2026-07-23 | independent Sol/high contract review | pass-after-repair | Repaired archive-output authorization, unsafe artifact/path acceptance, completion consistency, repository-bound readiness proof, and non-zero JSON timeout/output-limit fail-open behavior; final review found no blocker or enforcement gap. |
| 2026-07-23 | full Bun gates | pass | `bun test` and `bun run verify:skill-trials` each passed 45 tests/98 assertions; typecheck and diff check passed. |

## Files Changed

- `src/openspec/provider-contracts.ts`
- `src/openspec/adapter.ts`
- `src/openspec/orchestrator.ts`
- synchronized lifecycle-skill copies under `scripts/lib/openspec/`
- `tests/openspec-provider.test.ts`

## Verification Summary

- Focused provider/orchestrator contracts: 4 pass, 50 assertions.
- Full suite: 45 pass, 98 assertions.
- Skill trials: 45 pass, 98 assertions with managed-runtime parity.
- `bunx tsc --noEmit`: pass.
- `git diff --check`: pass.

## Learning Notes

- Proved: public pinned-CLI reads normalize into bounded typed results, arbitrary mutations are unavailable, strict validation preserves completed invalid results, and incomplete process output fails closed.
- Simulated: archive readiness proof shape and archive output authorization; filesystem postconditions remain task 085.
- Test next: zero-mention feature planning.

## Skill Trial Notes

- Source comparison: exact source-to-three-skill runtime parity passed.
- Contract markers checked: read/write separation, allowlist, normalized errors
- Trial status: focused fixture pass plus real pinned CLI read/validation pass

## Blockers

- None.

## Follow-Ups

- Task 083: automate OpenSpec-backed feature planning.
