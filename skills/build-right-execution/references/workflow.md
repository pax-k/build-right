# Execution Workflow

Use this workflow for one bounded task with evidence.

## Reference Routing

- Read `gates.md` before selecting a task, after intake, and before advancing.
- Read `review-and-delegation.md` when required review triggers apply or
  independent review would improve confidence.
- Read `evidence-contract.md` before completing or updating a task.
- Use templates in `assets/templates/` when creating a missing or split task.
- Run the full Bun state resolver command before selecting a task or advancing
  through a queue.
- When recording evidence or final summaries, write the exact command that ran.
  Do not shorten bundled helper invocations to PATH-style aliases.

## 1. Task Selection

Start with one task, not a broad project area.

Run the Build Right state resolver:

```sh
bun <skill-path>/scripts/managed-continue-check.ts --cwd <project> --format markdown --strict
```

When bindings exist, this lifecycle composition entrypoint invokes the explicit
setup boundary first, then the separate read-only `continue-check.ts` path for
pinned-runtime inspection, strict validation, exact work-item resolution, and
drift detection. Legacy unbound tasks make no setup or provider call. Stop
fail-closed on a structured planning gate. The user never runs or discusses
provider commands.

Report the resolver decision, confidence, next action, next task, blocking
gates, and external follow-ups before acting on the result.

If the resolver returns `ask-founder`, `wait-external`, `create-blocker`,
`no-ready-task`, or `invalid-state`, stop or create the named blocker. Continue
only when it returns `continue-active-task` or `execute-task`.

Run the lower-level execution helper when available:

```sh
bun <skill-path>/scripts/execution-check.ts --cwd <project> --mode next-task --format markdown
```

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

If no task exists, inspect whether the project has pre-execution artifacts. If
it does not, route to `/build-right-preflight` or create a Sprint 0 blocker.

## 2. Task Intake

Print:

```text
Active task: <task id or path>
Done means: <observable completion criteria>
Non-goals: <explicit exclusions>
Assumption basis: <founder-claimed | ai-inferred | prototype-assumption | repo-evidence-backed | public-evidence-backed | customer-evidence-backed>
Requirement basis: <authority path, decision ID, evidence reference, or explicit assumption>
Reversibility: <easy | moderate | hard>
Learning hook: <how this task will produce evidence>
Source under test: <repo-local path | installed path | GitHub source | release tag | n/a>
Baseline evidence: <artifact or command>
Verification ladder: <focused -> broader checks>
Evidence destination: <task file or evidence file>
```

When a task path exists, run:

```sh
bun <skill-path>/scripts/execution-check.ts --cwd <project> --task <task-path> --mode task-contract --format markdown
```

Reconcile missing required fields before editing.

## 3. Preflight

Inspect current workspace before changing files:

- git status when available
- existing dirty files
- generated or untracked artifacts
- active branch or worktree
- whether the task still matches current code and docs
- for skill validation tasks, the exact skill source under test
- active or recent mutations to the same tracker, task file, release gates,
  checklist, or shared evidence files
- open conflicts in `docs/conflicts.md`

Use `gates.md` for readiness, task ownership, open-conflict,
source-under-test, and concurrent-work gates.

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

## 5. Gap Analysis And Narrow Plan

Classify the gap, name the likely files/modules, identify checks that should
prove the work, record the evidence destination, and define the stop condition.
Answer:

```text
What requirement justifies this change?
Which proposed elements are unnecessary to satisfy it?
Which existing guarantees could the change weaken?
```

If unrelated work appears, create a follow-up issue. Do not silently expand the
task.

## 6. Implementation

Make the smallest change that satisfies acceptance criteria.

Rules:

- prefer existing module boundaries and local patterns
- do not implement capability justified only by hypothetical future requirements
- do not replace an existing guarantee with operational machinery unless the
  task explicitly accepts that tradeoff
- return unstated requirements or product decisions to planning instead of
  choosing silently
- preserve public contracts unless the task changes them
- avoid activating future-scope features while fixing scaffolding or validation
- when assumption basis is `prototype-assumption`, prefer reversible UI, manual
  workflows, mocks, fixtures, flags, or copy
- avoid hard-to-reverse schema, pricing, onboarding, or positioning commitments
  unless the task explicitly requires them
- add or update tests when behavior or shared contracts change
- verify whether generated files are intended deliverables before keeping them

If the implementation exposes a deeper root cause, update the plan and continue
inside the same task boundary.

## 7. Verification Ladder

Verify from narrow to broad:

```text
focused test or command
-> package or app check
-> repo-level check
-> domain-specific proof
-> user or release proof when required
```

Do not overclaim. Passing general validation does not always prove release
readiness, user-facing behavior, or live integration success.

For Build Right skill trials, check the current contract markers that apply:

- preflight output: `Source mode`, `Prototype confidence`, `Prototype
  assumptions labeled`
- task output: `Assumption basis`, `Requirement basis`, `Reversibility`,
  `Learning objective`, `Learning Notes`
- release evidence: source under test, scratch path or target task, generated
  files, what was proved, what was only simulated

## 8. Review, Evidence, And State Update

Run review when required by `review-and-delegation.md` or when useful for
confidence. If a required trigger applies and review is unavailable, record the
skipped review and substitute verification or stop at the gate.

Record evidence inside the task tracker or evidence file before marking work
done. Follow `evidence-contract.md`.

After evidence exists, update only artifacts that changed.

For an internally managed planning binding, first create a fresh structured
completion proof. It must bind the canonical repository, task path, sprint
path, change, work item, successful implementation and verification checks,
commands, and evidence references. Then invoke internally:

```sh
bun <skill-path>/scripts/complete-planning-work-item.ts --cwd <project> --proof <fresh-proof.json>
```

This helper takes an advisory lock, recovers any prior write-ahead journal,
revalidates provider and Build Right state, checks exactly one provider work
item, completes exactly one Build Right task, promotes at most one bound
successor in both issue and sprint files, and re-inspects both systems. A failed
or stale proof, missing evidence, failed validation, race, drift, or unsafe path
causes no new mutation. Do not mark the checkbox by hand.

If that closeout completes the last work item, run the read-only Build Right
archive decision:

```sh
bun <skill-path>/scripts/execution-check.ts --cwd <project> --mode archive-readiness --change <change> --format json
```

`archive-ready` requires fresh strict change validation, all bound tasks and
work items complete, exact Build Right evidence, passing project verification,
closed conflicts, satisfied release gates, and a `synced` or validated
`sync-ready` spec surface. Only a fresh ready proof may be passed to:

```sh
bun <skill-path>/scripts/finalize-openspec-change.ts --cwd <project> --change <change> --readiness <fresh-readiness.json>
```

The finalizer acquires a repository advisory lock and reruns the full read-only
archive-readiness decision before mutation. It runs only normal validated
archive behavior against an isolated scratch copy, never bypass flags. Before
an atomic whole-tree publication, it verifies the active change is preserved
exactly in the canonical archive, only the archive and main specs changed,
strict main-spec validation passes, and Build Right docs/tasks plus the target
OpenSpec tree have not raced. A failed check leaves the target OpenSpec tree
unchanged; a platform rollback failure returns `recovery-required` and retains
the displaced tree at the reported recovery path. Record both commands and
their structured results in Build Right evidence.

After successful finalization, reconcile all Build Right authority surfaces
before claiming closeout:

- rewrite bound task requirement and required-reading references from the
  removed active change to the returned archive path,
- clear a completed active task and execution-ready phase/gate from
  `docs/blueprint-status.md`,
- point managed-planning evidence at the archive and make `Next Action` agree
  with the fresh resolver decision,
- mark a sprint complete when all of its rows are terminal, or record an
  explicit truthful handoff if other work remains.

The final state must not route the user back to execution of a completed task or
reference an absent active change. Then rerun managed
resolution. These are internal lifecycle actions; the user supplies no
provider command or prompt.

For legacy unbound tasks, update:

- issue status
- sprint checklist
- task evidence section
- docs, if implementation changed product or architecture truth
- ADR, if durable architecture was decided
- risk register, if new risk surfaced
- follow-up issue queue, if new work was discovered

Do not mark a parent sprint, milestone, or release complete just because one
task is complete.

Before selecting another task, run the state resolver and stop/ask gate again.

```sh
bun <skill-path>/scripts/managed-continue-check.ts --cwd <project> --format markdown --strict
```

```sh
bun <skill-path>/scripts/execution-check.ts --cwd <project> --task <task-path> --mode stop-gates --format markdown
```

Report the resolver findings before deciding whether another task is safe to
select.

A completed task may create a blocker, founder question, stale follow-up, or
external-state wait. In that case, close out and stop instead of advancing.

## 9. Commit Or Handoff

Commit when the project workflow expects it and the task is coherent:

- stage only task-related files
- use a message that names the task or slice
- explain broad formatting churn if it is part of the diff
- do not combine unrelated task work
- do not hide known blockers behind a green commit

If not committing, hand off with changed files, verification summary, evidence
paths, remaining blockers, and suggested next task.

## 10. Closeout

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
