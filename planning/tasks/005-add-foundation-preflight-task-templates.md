# 005: Add Optional Foundation Preflight Task Templates

Status: ready
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

- [ ] Optional templates or reference guidance exist for architecture and
  boundary mapping.
- [ ] Optional templates or reference guidance exist for tech stack and runtime
  choices.
- [ ] Optional templates or reference guidance exist for directory structure.
- [ ] Optional templates or reference guidance exist for deployment path,
  Docker/self-hosting, cloud equivalents, and environment contracts.
- [ ] The guidance says these surface as Sprint 0 tasks when relevant, not as
  mandatory docs for every project.
- [ ] The templates preserve the task contract: assumption basis, reversibility,
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

## Learning Notes

- Proved: pending
- Simulated: pending
- Test next: whether preflight helper should report missing optional foundation categories

## Blockers

- None yet.

## Follow-Ups

- None yet.
