# Execution Gates

Use this reference before selecting a task, after task intake, and before
advancing to another task.

## State Resolver Gate

Before selecting work or continuing through a prepared queue, run:

```sh
bun <skill-path>/scripts/continue-check.ts --cwd <project> --format markdown --strict
```

Report the resolver decision, confidence, next action, next task, blocking
gates, and external follow-ups before acting.

Reconcile the resolver decision before continuing:

- `ask-founder`: ask or report the founder-owned gate
- `wait-external`: report the external-state gate
- `create-blocker`: create or propose the smallest AI-owned blocker
- `no-ready-task`: stop and report no ready AI-owned task
- `invalid-state`: reconcile contradictory tracker or gate state
- `continue-active-task`: continue only the selected active task
- `execute-task`: execute only the selected ready task

The resolver is advisory but mandatory to reconcile. Do not ignore it and read
Markdown manually when deciding to continue.

## Readiness Gate

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

If required artifacts are missing, create the smallest blocker task instead of
implementing product features.

## Stop/Ask Gates

Stop or ask when:

- founder-owned product, positioning, buyer/user, or MVP decision is required
- external discovery, search indexing, publishing, secrets, paid services, or
  production access is required
- verification failed or could not run
- task evidence is stale, duplicated, ambiguous, or contradicted by current
  files
- installed skill source differs from repo-local source for a skill trial
- required subagent review was skipped without an equivalent substitute
- release or directory-discovery claims would advance without durable evidence

When a stop/ask gate fires, do not continue to the next task. Record the gate,
ask the user when a user answer is required, or create the smallest blocker
task when the blocker is AI-owned and evidence-backed.

## Source Under Test Gate

For skill release/manual trials, record the exact source under test:

- repo-local path
- installed user-scope path
- GitHub source
- release tag

Compare installed or invoked skill source against repo-local
`skills/<name>/` source before treating a trial as authoritative.

If the installed skill is stale or the source under test is ambiguous, mark the
trial `partial-needs-rerun`, record the mismatch, and do not advance the release
gate to ready.

## Concurrent Work Gate

Before editing, inspect:

- git status
- dirty files
- active branch or worktree
- active or recent mutations to the same tracker, task file, release gates,
  checklist, or shared evidence files

Do not revert unrelated user or agent work. If another run owns the same task or
same tracker, wait, ask, or switch to observation-only mode instead of editing.
Allow parallel work only when task ownership and touched files are disjoint.

## Before Next Task

Before selecting another task, run the state resolver and stop/ask gate again. A
completed task may create a blocker, founder question, stale follow-up, or
external-state wait. In that case, close out and stop instead of advancing.
