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

If the task is not `ready`, stop or update the tracker with the reason. Do not
implement, mark complete, or advance to the next task just because a queue
exists.

Print:

```text
Active task: <task id or path>
Done means: <observable completion criteria>
Non-goals: <explicit exclusions>
Assumption basis: <founder-claimed | ai-inferred | prototype-assumption | repo-evidence-backed | public-evidence-backed | customer-evidence-backed>
Reversibility: <easy | moderate | hard>
Learning hook: <how this task will produce evidence>
Source under test: <repo-local path | installed path | GitHub source | release tag | n/a>
Baseline evidence: <artifact or command>
Verification ladder: <focused -> broader checks>
Evidence destination: <task file or evidence file>
```

If no task exists, inspect whether the project has pre-execution artifacts. If
it does not, route to `/build-right-preflight` or create a Sprint 0 blocker.

## 2. Readiness Check

Execution is ready only when these exist or have clear local equivalents:

- product truth or MVP scope
- execution rules
- release or validation gates
- task tracker
- selected task with acceptance criteria
- known evidence destination

Prototype execution may proceed from `prototype-assumption` when the task is
reversible, the learning hook is explicit, and validation required before
product truth is recorded. Do not treat prototype readiness as product-feature
readiness.

If missing, create the smallest blocker task instead of implementing product
features.

Stop/ask gates:

- founder-owned product, positioning, buyer/user, or MVP decision required
- external discovery, search indexing, publishing, secrets, paid services, or
  production access required
- verification failed or could not run
- task evidence is stale, duplicated, ambiguous, or contradicted by current
  files
- installed skill source differs from repo-local source for a skill trial
- required subagent review was skipped without an equivalent substitute

When a stop/ask gate fires, do not continue to the next task. Record the gate,
ask the user when a user answer is required, or create the smallest blocker
task when the blocker is AI-owned and evidence-backed.

## 3. Preflight

Inspect current workspace before changing files:

- git status when available
- existing dirty files
- generated or untracked artifacts
- active branch or worktree
- whether the task still matches current code and docs
- for skill validation tasks, the exact skill source under test: repo-local
  path, installed user-scope path, GitHub source, or release tag
- active or recent mutations to the same tracker, same task file, release gates,
  checklist, or shared evidence files

Rules:

- do not revert unrelated user or agent work
- do not mix unrelated dirty files into the task
- work with existing changes that affect the task
- stop and update the tracker when the task is stale
- when validating a skill from this repo, compare the installed or invoked skill
  source against the repo-local `skills/<name>/` source before treating the
  trial as authoritative
- if the installed skill is stale or the source under test is ambiguous, mark
  the trial `partial-needs-rerun`, record the mismatch, and do not advance the
  release gate to ready
- if another run owns the same task or same tracker, wait, ask, or switch to
  observation-only mode instead of editing
- allow parallel work only when task ownership and touched files are disjoint
- if a concurrent mutation changes the task boundary, update the tracker or
  create a follow-up rather than overwriting another run's evidence

## 4. Baseline Evidence

Capture current state before implementation.

Choose baseline by task type:

- validation task: run documented validation commands
- bug fix: reproduce the bug or trace the failing path
- feature task: identify missing behavior and closest existing test
- UI task: inspect current screen and capture browser evidence when useful
- release task: inspect release reports and gate artifacts
- integration task: identify whether proof is mocked, local, sandboxed, or live
- skill manual trial: record source under test and verify expected contract
  markers before marking the trial pass

Baseline must answer:

```text
What is broken or missing right now?
How do we know?
Which artifact proves it?
For skill trials, which exact skill source produced the behavior?
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
- when assumption basis is `prototype-assumption`, prefer reversible UI, manual
  workflows, mocks, fixtures, flags, or copy that can change without data
  migration
- avoid hard-to-reverse schema, pricing, onboarding, or positioning commitments
  unless the task explicitly requires them
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
- skill trial: installed/repo source comparison, scratch output inspection, and
  current contract marker scan

Do not overclaim. Passing general validation does not always prove release
readiness, user-facing behavior, or live integration success.

For Build Right skill trials, check the current contract markers that apply:

- preflight output: `Source mode`, `Prototype confidence`, `Prototype
  assumptions labeled`
- task output: `Assumption basis`, `Reversibility`, `Learning objective`,
  `Learning Notes`
- release evidence: source under test, scratch path or target task, generated
  files, what was proved, what was only simulated

## 9. Evidence Capture

Record evidence inside the task tracker or evidence file before marking work
done. Follow `references/evidence-contract.md`.

## 10. Required And Optional Subagent Review

Use subagents after implementation when independent review would improve
confidence. Some reviews are required when the task touches high-risk evidence
or broad tracker state. Subagents may gather, critique, and audit; the main
agent decides, writes, updates trackers, and closes gates.

Required review triggers, when subagent tools are available:

- release gates, release checklist, manual-trial evidence, or verifier behavior
  changed
- skill workflows, artifact contracts, evidence contracts, or templates changed
- more than three durable docs/task files changed in one task
- a verification command failed and was fixed inside the same task
- the task changes status across multiple trackers
- findings imply a founder-owned, external-state, stale-task, or source-mismatch
  gate

If a required trigger applies but subagent tools are unavailable, disabled, or
forbidden by the user, record the skipped review, the substitute verification,
and the residual risk before closing. If no adequate substitute exists, stop at
the gate instead of advancing.

Useful review lanes:

- evidence completeness review
- scope creep review
- focused risk review for high-blast-radius changes

Do not use subagents for final tracker updates, commits, publishing, or
authoritative task closeout unless the user explicitly asks.

Every subagent review prompt must include:

- objective
- exact task file, changed files, or evidence to inspect
- scope boundaries
- output format
- stop condition
- instruction not to edit files

Use prompt templates in `assets/templates/subagents/`.

## 11. State Update

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

Before selecting another task, run the stop/ask gate again. A completed task may
create a blocker, founder question, stale follow-up, or external-state wait. In
that case, close out and stop instead of advancing.

## 12. Commit Or Handoff

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

## 13. Closeout

Keep closeout short and operational:

- completed, blocked, or partial status
- task id or path
- what changed
- what the task proved
- what the task only simulated
- which assumption should be tested next
- verification run
- evidence location
- commit or PR reference when present
- next logical task

Avoid vague summaries such as "looks good" or "should work". State what was
proved.
