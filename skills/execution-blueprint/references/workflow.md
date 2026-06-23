# Execution Workflow

Use this workflow for one bounded task with evidence.

## 1. Task Intake

Start with one task, not a broad project area.

Read:

- selected issue or task file
- sprint or milestone tracker
- authority docs for product, architecture, UX, and execution rules
- local ownership rules such as nested agent instructions or module maps

Classify the task:

- `ready`
- `blocked`
- `stale`
- `duplicate`
- `too-broad`

Print:

```text
Active task: <task id or path>
Done means: <observable completion criteria>
Non-goals: <explicit exclusions>
Baseline evidence: <artifact or command>
Verification ladder: <focused -> broader checks>
Evidence destination: <task file or evidence file>
```

If no task exists, inspect whether the project has pre-execution artifacts. If
it does not, route to `/pre-execution-blueprint` or create a Sprint 0 blocker.

## 2. Readiness Check

Execution is ready only when these exist or have clear local equivalents:

- product truth or MVP scope
- execution rules
- release or validation gates
- task tracker
- selected task with acceptance criteria
- known evidence destination

If missing, create the smallest blocker task instead of implementing product
features.

## 3. Preflight

Inspect current workspace before changing files:

- git status when available
- existing dirty files
- generated or untracked artifacts
- active branch or worktree
- whether the task still matches current code and docs

Rules:

- do not revert unrelated user or agent work
- do not mix unrelated dirty files into the task
- work with existing changes that affect the task
- stop and update the tracker when the task is stale

## 4. Baseline Evidence

Capture current state before implementation.

Choose baseline by task type:

- validation task: run documented validation commands
- bug fix: reproduce the bug or trace the failing path
- feature task: identify missing behavior and closest existing test
- UI task: inspect current screen and capture browser evidence when useful
- release task: inspect release reports and gate artifacts
- integration task: identify whether proof is mocked, local, sandboxed, or live

Baseline must answer:

```text
What is broken or missing right now?
How do we know?
Which artifact proves it?
```

## 5. Gap Analysis

Classify the work:

- product behavior gap
- bug or regression
- test coverage gap
- type or build coverage gap
- lint or formatting blocker
- environment or configuration issue
- schema or migration gap
- docs drift
- external provider limitation
- release gate limitation

If unrelated work appears, create a follow-up issue. Do not silently expand the
task.

## 6. Narrow Plan

Before editing, name:

- files or modules likely to change
- tests or checks that should fail or prove the gap
- verification ladder
- evidence destination
- stop condition

Keep this plan short. It is a working hypothesis, not a second PRD.

## 7. Implementation

Make the smallest change that satisfies acceptance criteria.

Rules:

- prefer existing module boundaries and local patterns
- preserve public contracts unless the task changes them
- keep provider SDKs, credentials, framework objects, and persistence details
  behind owning boundaries
- avoid activating future-scope features while fixing scaffolding or validation
- add or update tests when behavior or shared contracts change
- verify whether generated files are intended deliverables before keeping them

If the implementation exposes a deeper root cause, update the plan and continue
inside the same task boundary.

## 8. Verification Ladder

Verify from narrow to broad:

```text
focused test or command
-> package or app check
-> repo-level check
-> domain-specific proof
-> user or release proof when required
```

Examples:

- simple code change: focused test plus typecheck
- shared contract change: package tests plus repo typecheck
- validation baseline: check, typecheck, and build
- UI behavior: browser proof, screenshots, or visual inspection
- external provider fix: regression test plus mocked provider boundary; live
  proof only when required
- release readiness: report artifacts, gate summaries, explicit go/no-go

Do not overclaim. Passing general validation does not always prove release
readiness, user-facing behavior, or live integration success.

## 9. Evidence Capture

Record evidence inside the task tracker or evidence file before marking work
done. Follow `references/evidence-contract.md`.

## 10. State Update

After evidence exists, update only artifacts that changed:

- issue status
- sprint checklist
- task evidence section
- docs, if implementation changed product or architecture truth
- ADR, if durable architecture was decided
- risk register, if new risk surfaced
- follow-up issue queue, if new work was discovered

Do not mark a parent sprint, milestone, or release complete just because one
task is complete.

## 11. Commit Or Handoff

Commit when the project workflow expects it and the task is coherent.

Commit rules:

- stage only task-related files
- use a message that names the task or slice
- explain broad formatting churn if it is part of the diff
- do not combine unrelated task work
- do not hide known blockers behind a green commit

If not committing, hand off with:

- changed file list
- verification summary
- evidence paths
- remaining blockers
- suggested next task

## 12. Closeout

Keep closeout short and operational:

- completed, blocked, or partial status
- task id or path
- what changed
- verification run
- evidence location
- commit or PR reference when present
- next logical task

Avoid vague summaries such as "looks good" or "should work". State what was
proved.
