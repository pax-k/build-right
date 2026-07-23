# 083: Automate OpenSpec-Backed Feature Planning

Status: complete
Type: feature
Owner: AI

Assumption basis: founder-claimed
Requirement basis: `docs/openspec-integration-technical-design.md` sections Feature Planning Integration and User Experience
Reversibility: moderate
Learning objective: prove a normal Build Right feature prompt automatically creates, validates, and binds an OpenSpec change without OpenSpec-specific user input
Source under test: repo-local path and managed OpenSpec runtime

## Goal

Make `build-right-feature-planning` ensure OpenSpec, derive a collision-safe
change name, create the change, write dependency-ordered artifacts from
OpenSpec instructions, validate them, create thin Build Right work-item
bindings, update the sprint, and stop before implementation.

## Non-Goals

- Require the user to name or prompt OpenSpec.
- Install OpenSpec agent skills or commands.
- Implement product code.
- Duplicate proposal, spec, design, or task authority.
- Auto-resolve founder-owned product questions.

## Required Reading

- docs/openspec-integration-technical-design.md
- planning/tasks/082-add-openspec-provider-and-orchestration-contracts.md
- skills/build-right-feature-planning/SKILL.md
- skills/build-right-feature-planning/references/workflow.md
- skills/build-right-feature-planning/references/planning-contract.md

## Solution-Fit Rationale

- Requirement served: one Build Right prompt produces spec-driven executable planning.
- Constraints honored: founder gates, planning-only boundary, OpenSpec artifact graph.
- Guarantees preserved: explicit requirement basis, one work item per task, no product-code writes.
- Cost accepted: additional planning steps and internal evidence.
- Deferred capability: user-selectable planning engines and custom OpenSpec profiles.

## Acceptance Criteria

- [x] A normal Build Right feature prompt contains no required OpenSpec wording.
- [x] Feature planning runs managed setup automatically.
- [x] Derive and collision-check a change name from the feature request.
- [x] Create the OpenSpec change automatically.
- [x] Request and follow artifact instructions in dependency order.
- [x] Re-read dependencies from disk before writing each artifact.
- [x] Validate proposal, specs, design, and tasks before binding.
- [x] Create one thin Build Right task per selected OpenSpec work item.
- [x] Generate binding fields without exposing them as user inputs.
- [x] Update sprint ordering and mark only the first unblocked task ready.
- [x] Keep product implementation files untouched.
- [x] Update the feature-planning skill and workflow references to invoke managed
  orchestration automatically.
- [x] Add missing, existing, incomplete, ambiguous, invalid, and happy-path fixtures.
- [x] Update task 084 to `ready` after verification.

## Baseline Evidence

Feature planning currently writes only Build Right planning artifacts and
requires no managed external planning engine.

## Verification

- focused zero-mention feature-planning fixtures
- OpenSpec artifact graph and validation fixtures
- implementation-boundary negative test
- `bun test`
- `bun run verify:skill-trials`
- `bunx tsc --noEmit`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-07-23 | `tests/openspec-feature-planning.test.ts` and `tests/openspec-provider.test.ts` | pass | Deterministic create/resume, dependency order, malformed/invalid state, bounded atomic 0/1/N artifact publication, symlink/externalized paths, malicious provider writes, exact binding triplets, idempotency, concurrent writers, exactly-one-ready, and advisory-lock recovery passed. |
| 2026-07-23 | `/tmp/build-right-083-final.nOvifw` | real-cli-pass | Current pinned 1.6.0 lifecycle performed scratch-confined creation, proposal/spec/design/tasks publication through the helper, strict validation, two thin bindings, and strict resolver selection without product writes. |
| 2026-07-23 | `/tmp/build-right-083-zero.xLzoA0`, `/tmp/build-right-083-one.v84RRF`, `/tmp/build-right-083-multi.AfjrJo` | real-cli-pass | Zero capability failed closed; one capability and a complete two-capability set published atomically and advanced to design. |
| 2026-07-23 | independent Sol/high review | pass-after-repair | Repaired provider target-write capability, missing artifact writer, duplicate/partial bindings, exactly-one-ready postconditions, crash recovery, multi-capability publication, and UTF-8 byte bounds; final review found no blocker or enforcement gap. |
| 2026-07-23 | full Bun gates | pass | `bun test` and `bun run verify:skill-trials` each passed 58 tests/163 assertions; exact runtime parity, typecheck, and diff check passed. |

## Files Changed

- `src/openspec/feature-planning.ts`
- `src/openspec/orchestrator.ts`
- `src/openspec/adapter.ts`
- `src/openspec/safe-setup.ts`
- `src/openspec/atomic-install.ts`
- synchronized lifecycle-skill copies under `scripts/lib/openspec/`
- `skills/build-right-feature-planning/scripts/openspec-change-check.ts`
- `skills/build-right-feature-planning/SKILL.md`
- `skills/build-right-feature-planning/references/workflow.md`
- `skills/build-right-feature-planning/references/planning-contract.md`
- `tests/openspec-feature-planning.test.ts`
- `tests/openspec-provider.test.ts`
- `.gitignore`

## Verification Summary

- Focused managed planning/provider boundary: 17 pass, 115 assertions.
- Full suite and skill-trial verifier: 58 pass, 163 assertions each.
- `bun run check:openspec-runtime`: pass.
- `bunx tsc --noEmit`: pass.
- `git diff --check`: pass.

## Learning Notes

- Proved: a Build Right feature request deterministically creates/resumes a confined managed change, publishes complete dependency-ordered planning artifacts atomically, validates strictly, and generates one thin binding per real work item with only one sprint-ready task.
- Simulated: product implementation and progress reconciliation remain task 084.
- Test next: one-task Build Right execution backed by generated OpenSpec state.

## Skill Trial Notes

- Source comparison: exact source-to-three-skill runtime parity passed.
- Contract markers checked: no OpenSpec prompt, automatic artifacts, thin bindings
- Trial status: fixture, adversarial boundary, real pinned 0/1/N, and full real feature-planning lifecycle pass

## Blockers

- None.

## Follow-Ups

- Task 084: automate OpenSpec-backed execution and reconciliation.
