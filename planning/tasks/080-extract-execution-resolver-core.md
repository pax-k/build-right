# 080: Extract Execution Resolver Core Without Behavior Drift

Status: complete
Type: refactor
Owner: AI

Assumption basis: repo-evidence-backed
Requirement basis: `docs/openspec-integration-technical-design.md` sections Architecture and Dependency Direction
Reversibility: easy
Learning objective: prove the current execution resolver can be separated into policy, repository inspection, and rendering without changing decisions or output
Source under test: repo-local path

## Goal

Refactor the execution resolver into explicit modules that can accept a future
planning provider while preserving all current non-OpenSpec behavior and public
helper output.

## Non-Goals

- Add OpenSpec commands or provider behavior.
- Change gate precedence.
- Change task selection.
- Change existing JSON or Markdown fields.
- Add a general plugin system.

## Required Reading

- docs/openspec-integration-technical-design.md
- docs/workflow-backbone.md
- skills/build-right-execution/scripts/continue-check.ts
- skills/build-right-execution/scripts/execution-check.ts
- skills/build-right-execution/references/gates.md
- tests/skill-trials.test.ts

## Solution-Fit Rationale

- Requirement served: isolate volatile provider mechanics from stable Build Right policy.
- Constraints honored: Bun-only, installed-skill portability, zero new runtime dependencies, read-only helpers.
- Guarantees preserved: current resolver decisions, gate precedence, output compatibility, one-task selection.
- Cost accepted: additional internal modules and explicit dependency composition.
- Deferred capability: no provider registry or shared cross-skill runtime.

## Acceptance Criteria

- [x] Extract stable task, gate, evidence, and result contracts.
- [x] Separate Markdown repository inspection from pure resolver policy.
- [x] Separate Markdown and JSON rendering from policy.
- [x] Keep CLI entrypoints thin and Bun-native.
- [x] Preserve existing output keys and decision behavior.
- [x] Add regression coverage comparing representative pre/post-refactor JSON and Markdown results.
- [x] Keep provider-specific code absent.
- [x] Update task 081 to `ready` only after verification passes.

## Baseline Evidence

Record:

- current line/module structure of execution helpers,
- current decision matrix tests,
- representative JSON and Markdown outputs,
- `bun test` and `bun run verify:skill-trials` results before edits.

## Verification

- `bun test tests/skill-trials.test.ts`
- `bun test`
- `bun run verify:skill-trials`
- `bunx tsc --noEmit`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-07-23 | Pre-edit baseline: `continue-check.ts` 806 lines; `execution-check.ts` 397 lines | pass | Existing resolver was a single CLI, Markdown adapter, policy, and renderer module. |
| 2026-07-23 | `bun test tests/skill-trials.test.ts` before edits | pass | 32 tests passed; representative JSON decision matrix and Markdown smoke output established. |
| 2026-07-23 | Extracted `scripts/lib/{contracts,markdown-provider,resolver,render}.ts` | pass | Pure policy has no filesystem or provider dependency; CLI now composes inspection, resolution, and rendering. |
| 2026-07-23 | `bun test`; `bun run verify:skill-trials`; `bunx tsc --noEmit`; `git diff --check` | pass | 32/32 tests passed twice; type and whitespace gates passed. |

## Files Changed

- `skills/build-right-execution/scripts/continue-check.ts`
- `skills/build-right-execution/scripts/lib/contracts.ts`
- `skills/build-right-execution/scripts/lib/markdown-provider.ts`
- `skills/build-right-execution/scripts/lib/resolver.ts`
- `skills/build-right-execution/scripts/lib/render.ts`
- `planning/tasks/080-extract-execution-resolver-core.md`
- `planning/tasks/081-add-managed-openspec-runtime-and-setup.md`
- `planning/sprints/007-openspec-planning-provider-integration.md`

## Verification Summary

- Baseline and post-refactor `bun test`: 32 pass, 0 fail.
- Baseline and post-refactor `bun run verify:skill-trials`: 32 pass, 0 fail.
- Focused resolver/helper tests: 2 pass, 0 fail.
- `bunx tsc --noEmit`: pass.
- `git diff --check`: pass.

## Learning Notes

- Proved: existing resolver decisions, output keys, Markdown rendering, malformed-input behavior, and strict gates remain covered after boundary extraction.
- Simulated: no provider behavior in this task.
- Test next: OpenSpec provider contract and adapter isolation.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: resolver output and decision compatibility
- Trial status: deterministic fixture pass

## Blockers

- None.

## Follow-Ups

- Task 081: add the managed pinned OpenSpec runtime and safe automatic setup.
