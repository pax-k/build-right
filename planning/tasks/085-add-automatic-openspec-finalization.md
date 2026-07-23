# 085: Add Automatic OpenSpec Finalization

Status: complete
Type: validation/integration
Owner: AI

Assumption basis: founder-claimed
Requirement basis: `docs/openspec-integration-technical-design.md` section Archive Readiness
Reversibility: moderate
Learning objective: prove Build Right can finalize an internally managed OpenSpec change automatically without bypassing strict validation or evidence gates
Source under test: repo-local path and managed OpenSpec runtime

## Goal

Add read-only archive readiness and a separate finalizer that automatically
synchronizes and archives a completed OpenSpec change after all Build Right and
OpenSpec gates pass.

## Non-Goals

- Require an OpenSpec-specific archive prompt.
- Archive before Build Right evidence is complete.
- Use `--no-validate`.
- Put archive mutations in the resolver.
- Publish or deploy.

## Required Reading

- docs/openspec-integration-technical-design.md
- planning/tasks/084-automate-openspec-execution.md
- skills/build-right-execution/scripts/execution-check.ts
- skills/build-right-execution/references/gates.md
- skills/build-right-execution/references/evidence-contract.md

## Solution-Fit Rationale

- Requirement served: complete the hidden OpenSpec lifecycle through Build Right alone.
- Constraints honored: read-only readiness, separate allowlisted mutation, strict reinspection.
- Guarantees preserved: task evidence, project verification, conflict and release gates.
- Cost accepted: automatic repository planning mutation after proven readiness.
- Deferred capability: rollback across arbitrary external systems.

## Acceptance Criteria

- [x] Add structured read-only archive-readiness results.
- [x] Require strict OpenSpec validation and all work items complete.
- [x] Require Build Right evidence and project verification.
- [x] Require conflicts and release gates to permit finalization.
- [x] Detect pending or contradictory spec synchronization state.
- [x] Invoke only allowlisted validated finalization after readiness passes.
- [x] Never use `--no-validate`.
- [x] Reinspect main specs, archived path, and active-change absence after mutation.
- [x] Record finalization commands and results in Build Right evidence.
- [x] Update execution closeout guidance to invoke finalization automatically.
- [x] Add negative controls for every gate and a successful automatic finalization.
- [x] Update task 086 to `ready` after verification.

## Baseline Evidence

Task 084 should complete individual bound work items but leave change-level
finalization unimplemented.

- Confirmed: Task 084 had proof-gated item completion and successor promotion,
  but no change-level readiness contract or automatic validated archive path.
- Confirmed: the provider finalizer could invoke archive, but did not prove
  Build Right evidence/release readiness or canonical postconditions.

## Verification

- archive-readiness positive and negative matrix
- read-only readiness filesystem snapshot
- scratch finalization and postcondition assertions
- `bun test`
- `bun run verify:skill-trials`
- `bunx tsc --noEmit`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-07-23 | Archive-readiness fixture matrix and filesystem snapshot | pass | Readiness remained read-only and failed closed for invalid strict validation, incomplete work, missing task evidence, failed project/release proof, open conflicts, and contradictory or externalized spec sync. |
| 2026-07-23 | Finalizer mutation/postcondition controls | pass | Stale/wrong proofs were rejected before provider calls; normal archive omitted both bypass flags; claimed success without mutation and failed strict main-spec validation were rejected. |
| 2026-07-23 | `/var/folders/59/372ydp210wzbvvbgwktc6nmr0000gn/T/build-right-085-final-qhYNbx` pinned OpenSpec 1.6.0 lifecycle | real-cli-pass | Latest guarded transaction reran fresh readiness, archived in isolated scratch, atomically published `2026-07-23-add-a-readiness-probe-162de6ea18`, synchronized one main spec, and returned strict validation evidence with 1 item, 1 passed, 0 failed. |
| 2026-07-23 | Real post-archive managed resolver | real-cli-pass | Both exact bindings reconciled as complete from the canonical archive with zero provider calls and no ready task or blocking gate. |
| 2026-07-23 | Native `all_done` response repair | pass | A real last-item closeout exposed the provider spelling; the adapter now normalizes it to `all-done`, and journal recovery completed without duplicate mutation. |
| 2026-07-23 | Independent Sol/high finalization review and two repair rounds | pass | Twelve findings covering isolation, preservation, post-validation state, races, collision, metadata, rollback recovery, evidence paths, and nonzero validation semantics were repaired; final re-review reported no findings or enforcement gaps. |
| 2026-07-23 | `bun test` | pass | 85 tests, 279 assertions, 0 failures. |
| 2026-07-23 | `bun run verify:skill-trials` | pass | Full skill-trial verifier and its 85-test suite passed. |
| 2026-07-23 | `bun run check:openspec-runtime`; `bunx tsc --noEmit`; `git diff --check` | pass | Bundled runtime parity, type checking, and diff hygiene passed. |

## Files Changed

- `src/openspec/adapter.ts`
- `src/openspec/orchestrator.ts`
- `skills/build-right-execution/scripts/execution-check.ts`
- `skills/build-right-execution/scripts/finalize-openspec-change.ts`
- `skills/build-right-execution/scripts/lib/archive-readiness.ts`
- `skills/build-right-execution/scripts/lib/planning-reconciliation.ts`
- generated managed-runtime copies under the three lifecycle skills
- execution skill workflow, gates, and evidence contract
- `docs/openspec-integration-technical-design.md`
- `tests/openspec-finalization.test.ts`
- `tests/openspec-provider.test.ts`
- `tests/openspec-execution.test.ts`
- `tests/skill-trials.test.ts`

## Verification Summary

- Fixture/simulation: readiness and finalizer positive/negative matrices passed.
- Real CLI/native: pinned OpenSpec 1.6.0 finalization, strict post-archive
  validation, and archived-state resolver reconciliation passed in scratch.
- Review: independent Sol/high finalization review closed with no findings,
  required changes, enforcement gaps, or residual Task 085 risk.
- Integrated: `bun test`, `bun run verify:skill-trials`,
  `bun run check:openspec-runtime`, `bunx tsc --noEmit`, and
  `git diff --check` passed.
- Production: not claimed; no publish, deploy, or release occurred.

## Learning Notes

- Proved: normal validated archive synchronizes main specs, creates the
  canonical archive, removes the active change, and remains resolvable from
  archived task state.
- Proved: the finalizer reruns the complete Build Right readiness decision
  immediately before mutation and rejects provider claims that do not satisfy
  filesystem and strict-validation postconditions.
- Learned: pinned OpenSpec 1.6.0 emits native apply state `all_done`; the
  adapter must normalize it to the internal `all-done` contract.
- Simulated: every readiness gate, stale proof, unsafe sync, missing archived
  binding, false-success mutation, and post-archive validation failure.
- Test next: native user-level Build Right prompts from preflight through
  finalization in task 086.

## Skill Trial Notes

- Source comparison: generated provider/runtime sources match all three
  lifecycle bundles.
- Contract markers checked: readiness, strict validation, finalizer, postconditions
- Trial status: deterministic and real pinned trials passed; full zero-mention
  native trial remains task 086.

## Blockers

- None; task 084 completed with evidence.

## Follow-Ups

- Task 086: prove the complete zero-mention user experience.
