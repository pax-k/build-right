# 081: Add Managed OpenSpec Runtime And Safe Setup

Status: complete
Type: integration
Owner: AI

Assumption basis: public-evidence-backed
Requirement basis: `docs/openspec-integration-technical-design.md` section Managed Runtime And Automatic Setup
Reversibility: easy
Learning objective: prove Build Right can resolve and initialize a pinned OpenSpec runtime automatically without globally installing it or touching unrelated target files
Source under test: repo-local path and `@fission-ai/openspec@1.6.0`

## Goal

Add the pinned Bun/OpenSpec command resolver and an idempotent setup script that
initializes OpenSpec in scratch, validates the output, and atomically installs
only the `openspec/` planning surface into the target repository.

## Non-Goals

- Initialize directly inside a target repository.
- Install OpenSpec globally.
- Generate OpenSpec agent skills or slash commands.
- Create a feature change.
- Modify read-only resolver policy.

## Required Reading

- docs/openspec-integration-technical-design.md
- planning/tasks/080-extract-execution-resolver-core.md
- OpenSpec v1.6.0 init and CLI contracts
- skills/build-right-engineering-principles/references/principles.md

## Solution-Fit Rationale

- Requirement served: zero-configuration internal OpenSpec availability.
- Constraints honored: Bun-only, exact version pin, no global install, no target legacy cleanup.
- Guarantees preserved: idempotency, target isolation, visible evidence, fail-closed errors.
- Cost accepted: first-use network resolution and scratch setup.
- Deferred capability: offline vendoring and cross-repository stores.

## Acceptance Criteria

- [x] Resolve only `bunx --bun @fission-ai/openspec@1.6.0`.
- [x] Add timeouts, bounded output, sanitized errors, and exact version proof.
- [x] Detect and preserve a compatible existing OpenSpec root.
- [x] Block malformed, externalized, or incompatible existing roots.
- [x] Initialize only in a fresh scratch directory with `--tools none --profile core`.
- [x] Validate the scratch tree contains only the allowed OpenSpec planning surface.
- [x] Atomically install only `openspec/` if the target remains absent.
- [x] Handle concurrent setup without overwrite.
- [x] Record commands, versions, created paths, and result as evidence.
- [x] Prove repeated setup is idempotent.
- [x] Bundle the managed runtime and setup helpers into every lifecycle skill.
- [x] Add source-hash parity tests for every bundled helper copy.
- [x] Make preflight invoke safe setup automatically after repository inventory.
- [x] Expose idempotent setup entry points for feature planning and execution.
- [x] Update the preflight skill and workflow references to describe managed setup.
- [x] Add negative tests for offline failure, unexpected output, permissions, and races.
- [x] Update task 082 to `ready` after verification.

## Baseline Evidence

The 2026-07-23 feasibility run at
`/tmp/build-right-openspec-init.Cf0CNe` proved the pinned non-interactive command
produces `openspec/config.yaml`, `openspec/specs/`, and
`openspec/changes/archive/`.

## Verification

- focused managed-runtime and safe-setup tests
- scratch filesystem before/after assertions
- `bun test`
- `bun run verify:skill-trials`
- `bunx tsc --noEmit`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-07-23 | `tests/openspec-runtime.test.ts` | pass | 9 tests cover exact pin, timeout/output bounds, missing process, idempotency, malformed/externalized/special roots, offline/version failure, unsafe output, races, permissions, stale locks, no-replace publication, and isolated provider cwd. |
| 2026-07-23 | Independent Sol/high security reviews | repaired | Findings on target cwd, scratch symlinks, entry types, TOCTOU publication, kill timing, failure handling, stale locks, evidence, and parity were enforced with code and adversarial tests. |
| 2026-07-23 | `/tmp/build-right-managed-081-review.aXva9S` | real CLI pass | Pinned 1.6.0 setup created only `openspec/`; sentinel remained unchanged; repeat setup preserved the root. |
| 2026-07-23 | `bun test`; `bun run verify:skill-trials`; `bunx tsc --noEmit`; `git diff --check` | pass | 41 tests passed; exact bundled hash/file-set parity, type, and whitespace gates passed. |
| 2026-07-23 | Final adversarial review repair cycle | pass | Detached process-group kill with SIGKILL escalation, aggregate output bounds, PID/nonce lock ownership, native no-replace publication, and final staged-tree validation added; 41 tests and real CLI rerun passed. |

## Files Changed

- `src/openspec/*`
- lifecycle `scripts/ensure-openspec.ts` and bundled `scripts/lib/openspec/*`
- `scripts/sync-openspec-runtime.ts`
- `tests/openspec-runtime.test.ts`
- lifecycle skill/workflow guidance
- `package.json`

## Verification Summary

- Focused setup/security matrix: 9 pass, 0 fail.
- Full suite and skill-trial gate: 41 pass, 0 fail.
- Real pinned CLI scratch setup and idempotent preservation: pass.
- Typecheck, exact source parity, and diff check: pass.

## Learning Notes

- Proved: real pinned runtime setup, isolated scratch initialization, atomic no-replace install, idempotency, lifecycle bundling, and compatibility preservation.
- Simulated: offline, race, malformed-root, and unexpected-output failures.
- Test next: provider and mutation orchestration through the managed runtime.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: pinned version, scratch init, tools none, atomic copy
- Trial status: deterministic fixtures plus real CLI pass

## Blockers

- None.

## Follow-Ups

- Task 082: add provider and mutation-orchestration contracts.
