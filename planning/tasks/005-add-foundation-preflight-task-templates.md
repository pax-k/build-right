# 005: Add Optional Foundation Preflight Task Templates

Status: complete
Type: templates
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: surface architecture, tech stack, directory, deployment, env, and boundary work as optional Sprint 0 tasks instead of mandatory upfront docs
Source under test: repo-local path

## Goal

Add optional foundation task templates that preflight can use when a project
needs architecture, stack, directory, deployment, environment, or module-boundary
work before feature execution.

## Non-Goals

- Force every project to create all foundation docs.
- Prescribe TypeScript, React, Bun, or a monorepo when an existing project has
  different working constraints.
- Build scaffolders or deployment automation.
- Add cloud provider lock-in.

## Required Reading

- skills/build-right-preflight/references/workflow.md
- skills/build-right-preflight/references/artifact-contract.md
- skills/build-right-preflight/assets/templates/tasks/issue-template.md
- skills/build-right-preflight/assets/templates/tasks/issues/001-establish-execution-baseline.md
- pre-execution-blueprint.md
- agent-skills-blueprint-design.md

## Acceptance Criteria

- [x] Optional templates or reference guidance exist for architecture and
  boundary mapping.
- [x] Optional templates or reference guidance exist for tech stack and runtime
  choices.
- [x] Optional templates or reference guidance exist for directory structure.
- [x] Optional templates or reference guidance exist for deployment path,
  Docker/self-hosting, cloud equivalents, and environment contracts.
- [x] The guidance says these surface as Sprint 0 tasks when relevant, not as
  mandatory docs for every project.
- [x] The templates preserve the task contract: assumption basis, reversibility,
  learning objective, baseline evidence, verification, evidence log, blockers,
  and follow-ups.

## Baseline Evidence

Current preflight workflow already names these Sprint 0 categories:

- validation baseline
- build/type/lint/test command surface
- environment and configuration contract
- deployment path or deployment blockers
- core module boundaries
- first architecture risks

## Verification

- `bun test`
- `bun run verify:skill-trials`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | Inspect current preflight Sprint 0 guidance | pass | Workflow named architecture, env, deployment, and boundaries as task categories but had no optional foundation templates. |
| 2026-06-23 | `bun test` | pass | 14 tests passed after adding optional foundation template marker coverage. |
| 2026-06-23 | `bun run verify:skill-trials` | pass | 14 tests passed through the compatibility wrapper after syncing the installed preflight skill copy. |
| 2026-06-23 | Installed skill parity sync | pass | Synced `skills/build-right-preflight/` to `$HOME/.codex/skills/build-right-preflight/` because this task added installed skill source files. |
| 2026-06-23 | Required review trigger check | skipped | Skill templates/contracts changed; subagent review tooling requires explicit user-requested delegation, so substituted marker tests, direct inspection, and both verification commands. |

## Files Changed

- `skills/build-right-preflight/assets/templates/tasks/foundation/architecture-boundaries.md` - optional architecture/boundary task template.
- `skills/build-right-preflight/assets/templates/tasks/foundation/tech-stack-runtime.md` - optional stack/runtime task template.
- `skills/build-right-preflight/assets/templates/tasks/foundation/directory-structure.md` - optional directory/ownership task template.
- `skills/build-right-preflight/assets/templates/tasks/foundation/deployment-env-contract.md` - optional deployment/env task template.
- `skills/build-right-preflight/references/workflow.md` - routes these as optional Sprint 0 tasks when relevant.
- `skills/build-right-preflight/references/artifact-contract.md` - adds template map entries and optionality guidance.
- `tests/skill-trials.test.ts` - asserts template contract markers and optional foundation guidance.
- `planning/sprints/001-workflow-backbone-foundation.md` - marks task 005 complete.
- `planning/tasks/005-add-foundation-preflight-task-templates.md` - records evidence and completion state.

## Verification Summary

- `bun test` - pass, 14 tests.
- `bun run verify:skill-trials` - pass, 14 tests through compatibility wrapper.

## Learning Notes

- Proved: architecture, stack, directory, deployment, env, and boundary work can surface as optional Sprint 0 task templates while preserving the task contract.
- Simulated: no scaffolders or deployment automation were added.
- Test next: whether preflight helper should report missing optional foundation categories.

## Blockers

- None.

## Follow-Ups

- None yet.
