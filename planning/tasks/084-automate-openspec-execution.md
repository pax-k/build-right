# 084: Automate OpenSpec-Backed Execution

Status: complete
Type: integration
Owner: AI

Assumption basis: repo-evidence-backed
Requirement basis: `docs/openspec-integration-technical-design.md` sections Task Binding Contract, State Reconciliation, and New Gate Types
Reversibility: moderate
Learning objective: prove a normal Build Right execution prompt selects and completes exactly one internally managed OpenSpec work item
Source under test: repo-local path and managed OpenSpec runtime

## Goal

Integrate managed OpenSpec inspection into execution resolution, detect
cross-system drift, execute exactly one bound work item, and update OpenSpec
progress only after Build Right verification and evidence are complete.

## Non-Goals

- Require the user to mention OpenSpec.
- Use OpenSpec's multi-task apply loop.
- Let the resolver mutate status.
- Change founder or external-state gate precedence.
- Finalize the whole change.

## Required Reading

- docs/openspec-integration-technical-design.md
- planning/tasks/083-automate-openspec-feature-planning.md
- skills/build-right-execution/SKILL.md
- skills/build-right-execution/references/gates.md
- skills/build-right-execution/references/evidence-contract.md

## Solution-Fit Rationale

- Requirement served: preserve one-task evidence-driven execution over OpenSpec work.
- Constraints honored: zero user OpenSpec vocabulary, read-only resolver, post-proof progress mutation.
- Guarantees preserved: gate precedence, ownership, baseline, verification, durable evidence.
- Cost accepted: managed runtime inspection for every execution iteration.
- Deferred capability: parallel OpenSpec work-item execution.

## Acceptance Criteria

- [x] A normal Build Right execution prompt contains no required OpenSpec wording.
- [x] Ensure and inspect managed OpenSpec state automatically.
- [x] Select exactly one pending bound work item.
- [x] Map runtime, validation, missing-item, and malformed-state failures to structured gates.
- [x] Detect Build Right/OpenSpec status drift.
- [x] Preserve existing founder, external, conflict, ownership, and release precedence.
- [x] Keep OpenSpec checkbox unchecked until implementation, verification, and evidence succeed.
- [x] Update the checkbox and Build Right task state in one closeout sequence.
- [x] Re-resolve both systems after closeout.
- [x] Preserve existing JSON and Markdown output fields additively.
- [x] Update the execution skill and workflow references to invoke managed
  orchestration automatically.
- [x] Add complete positive, negative, drift, and compatibility matrices.
- [x] Update task 085 to `ready` after verification.

## Baseline Evidence

Task 083 should create validated OpenSpec changes and thin bindings, but the
execution resolver should not yet consume them.

## Verification

- focused resolver/provider reconciliation matrix
- failed-verification no-checkbox-mutation control
- legacy resolver fixture compatibility below managed orchestration
- `bun test`
- `bun run verify:skill-trials`
- `bunx tsc --noEmit`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-07-23 | `bun test tests/openspec-execution.test.ts` | pass | 15 tests cover automatic setup composition, legacy compatibility, binding parsing, provider/validation failures, drift, proof gating, exact-command evidence, concurrency, semantic journal recovery, forged journals, invalid-root/validation recovery, unrelated successors, post-write drift, and reordered provider output. |
| 2026-07-23 | `/tmp/build-right-084-real` | real pinned CLI pass | Managed execution selected native OpenSpec item `1`, proof-gated closeout checked only item `1`, completed its Build Right task, promoted only item `2`, and fresh resolution selected item `2`. |
| 2026-07-23 | `bun test` and `bun run verify:skill-trials` | pass | 73 tests, 234 assertions, zero failures in each integrated run. |
| 2026-07-23 | `bun run check:openspec-runtime`, `bunx tsc --noEmit`, `git diff --check` | pass | Bundled sources match canonical runtime; types and whitespace pass. |
| 2026-07-23 | independent Sol/high review | pass after repair | Repaired proof, journal, recovery-order, final reinspection, successor, metadata parsing, setup/resolver separation, and work-item mapping findings; final review reported no findings. |

## Files Changed

- `src/openspec/execution-progress.ts`
- `src/openspec/adapter.ts`
- `src/openspec/feature-planning.ts`
- `skills/build-right-execution/scripts/managed-continue-check.ts`
- `skills/build-right-execution/scripts/complete-planning-work-item.ts`
- `skills/build-right-execution/scripts/continue-check.ts`
- `skills/build-right-execution/scripts/lib/{contracts,markdown-provider,planning-reconciliation,execution-orchestration,render}.ts`
- `skills/build-right-execution/{SKILL.md,references/workflow.md,references/gates.md,references/evidence-contract.md}`
- synchronized `skills/build-right-*/scripts/lib/openspec/`
- `tests/openspec-execution.test.ts`
- `tests/openspec-provider.test.ts`
- `tests/skill-trials.test.ts`
- `.gitignore`

## Verification Summary

- Focused execution matrix: 15/15 pass.
- Full Bun gates: 73/73 tests and 234 assertions pass.
- Real pinned lifecycle: pass at `/tmp/build-right-084-real`.
- Source/bundle parity, TypeScript, and diff checks: pass.
- Independent final review: no findings.

## Learning Notes

- Proved: setup orchestration remains outside the read-only resolver; one exact
  bound item advances only through fresh, exact-command, evidence-backed
  closeout with recoverable filesystem semantics.
- Simulated: automatic change-level finalization remains task 085.
- Test next: strict archive readiness, synchronization, archive mutation, and
  postconditions.

## Skill Trial Notes

- Source comparison: pass (`bun run check:openspec-runtime`)
- Contract markers checked: zero mention, one item, post-proof mutation, drift
- Trial status: pass

## Blockers

- None.

## Follow-Ups

- Task 085: add archive readiness and automatic finalization.
