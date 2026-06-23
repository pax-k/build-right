# Feature Planning Contract

Use project-local equivalents when a target project already has them. Otherwise
use these Build Right defaults.

## Default Artifacts

- `docs/blueprint-status.md`: current product/planning state
- `docs/mvp-scope.md`: MVP and post-MVP boundary
- `docs/decision-log.md`: durable product, scope, architecture, and workflow
  decisions
- `docs/conflicts.md`: unresolved contradictions and owners
- `docs/evidence/`: founder, repository, public, customer, and prototype
  evidence
- `tasks/sprint-0.md`: active sprint tracker by default
- `tasks/post-release-backlog.md`: deferred or post-release work
- `tasks/issues/*.md`: execution task files

## Tracker Rules

Each tracker row should include an ID, title, status, and evidence/task path.
Use `ready` only for tasks that satisfy the execution task contract.

Use `planned` or `draft` for work that still needs splitting, validation, or
founder input. Use `blocked` when a gate prevents progress. Use `complete` only
after execution evidence exists.

## Task Rules

Reuse the execution task contract:

- status
- type
- owner
- assumption basis
- reversibility
- learning objective
- source under test
- goal
- non-goals
- required reading
- acceptance criteria
- baseline evidence
- verification
- evidence log
- blockers
- follow-ups

Use `assets/templates/tasks/feature-task.md` for new feature tasks. Keep tasks
small enough that execution can finish one without re-opening product scope.

## Evidence Rules

Record planning evidence where future agents will find it:

- founder decisions in raw/interview notes or decision log
- public research in `docs/evidence/`
- repository facts in source index, task baseline evidence, or task evidence log
- conflicts in `docs/conflicts.md`
- prototype assumptions in evidence notes or task learning notes

Do not mark a claim as customer-evidence-backed without direct customer evidence.

## Implementation Boundary

This skill may create and update planning artifacts. It must not edit product implementation files.
If a planning update reveals implementation work, create a task and hand it to
`build-right-execution`.
