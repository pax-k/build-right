# Actual Execution Blueprint

This document describes the generic workflow to follow after pre-execution work
has produced product truth, MVP scope, operating rules and an executable task
queue.

It is tech-stack agnostic. The unit of work is one bounded task with evidence.

Core rule:

```text
Do one task.
Prove the current state.
Change narrowly.
Verify with the right evidence.
Update the tracker.
Then move to the next task.
```

## Workflow Overview

```text
Select one task
-> Read authority
-> Define done and non-goals
-> Inspect current state
-> Capture baseline
-> Diagnose the gap
-> Implement narrow change
-> Verify in layers
-> Record evidence
-> Update tracker and docs
-> Commit or hand off
-> Select next task
```

## 1. Task Intake

Start with one task, not a broad project area.

Read:

- The selected issue or task file
- The sprint or milestone tracker
- Authority docs for product, architecture, UX and execution rules
- Local ownership rules, such as nested agent instructions or module maps

Classify the task:

- Ready
- Blocked
- Stale
- Duplicate
- Too broad and needs splitting

Output:

```text
Active task: <task id or path>
Done means: <observable completion criteria>
Non-goals: <explicit exclusions>
```

## 2. Preflight

Inspect the current workspace before changing files.

Check:

- Git status
- Existing dirty files
- Generated or untracked artifacts
- Active branch or worktree
- Whether the task still matches the current code and docs

Rules:

- Do not revert unrelated user or agent work.
- Do not mix unrelated dirty files into the task.
- If existing changes affect the task, work with them instead of overwriting
  them.
- If the task is no longer valid, stop and update the tracker instead of forcing
  a stale plan.

## 3. Baseline Evidence

Capture the current state before implementation.

Choose the baseline based on task type:

- Validation task: run the documented validation commands.
- Bug fix: reproduce the bug or trace the failing path.
- Feature task: identify the missing behavior and the closest existing test.
- UI task: inspect the current screen and capture browser evidence where useful.
- Release task: inspect current release reports and gate artifacts.
- Integration task: identify whether proof is mocked, local, sandboxed or live.

The baseline should answer:

```text
What is broken or missing right now?
How do we know?
Which artifact proves it?
```

## 4. Gap Analysis

Classify the work before editing.

Common categories:

- Product behavior gap
- Bug or regression
- Test coverage gap
- Type or build coverage gap
- Lint or formatting blocker
- Environment or configuration issue
- Schema or migration gap
- Docs drift
- External provider limitation
- Release gate limitation

If the task reveals unrelated work, create a follow-up issue. Do not silently
expand the task.

## 5. Narrow Plan

Define the smallest implementation path.

A good execution plan names:

- Files or modules likely to change
- Tests or checks that should fail or prove the gap
- The verification ladder
- The evidence destination
- The stop condition

Keep this plan short. It is a working hypothesis, not a second PRD.

## 6. Implementation

Make the smallest change that satisfies the acceptance criteria.

Rules:

- Prefer existing module boundaries and local patterns.
- Preserve public contracts unless the task explicitly changes them.
- Keep provider SDKs, credentials, framework objects and persistence details
  behind their owning boundaries.
- Avoid activating future-scope features while fixing scaffolding or validation.
- Add or update tests when the task changes behavior or shared contracts.
- For generated files, verify whether they are intended deliverables before
  keeping them.

If the first implementation exposes a deeper root cause, update the plan and
continue within the same task boundary.

## 7. Verification Ladder

Verify from narrow to broad.

Typical ladder:

```text
focused test or command
-> package or app check
-> repo-level check
-> domain-specific proof
-> user or release proof when required
```

Examples:

- Simple code change: focused test plus typecheck.
- Shared contract change: package tests plus repo typecheck.
- Validation baseline: check, typecheck and build.
- UI behavior: browser proof, screenshots or visual inspection.
- External provider fix: regression test plus mocked provider boundary; live
  proof only when the task requires it.
- Release readiness: report artifacts, gate summaries and explicit go/no-go.

Do not overclaim. Passing general validation does not always prove release
readiness, user-facing behavior or live integration success.

## 8. Evidence Capture

Record evidence inside the task tracker or evidence file before marking work
done.

Capture:

- Baseline result
- Files changed
- Commands run
- Exit codes or key output
- Test names
- Report paths
- Screenshots or URLs when relevant
- Generated artifacts kept or discarded
- Known blockers
- Follow-up issues

Evidence should be specific enough that another person or agent can understand
why the task is complete without reading the whole conversation.

## 9. State Update

After evidence exists, update project state.

Update only the artifacts that changed:

- Issue status
- Sprint checklist
- Task comments or evidence section
- Docs, if implementation changed product or architecture truth
- ADR, if the task made a durable architecture decision
- Risk register, if the task surfaced a new risk
- Follow-up issue queue, if new work was discovered

Do not mark a parent sprint, milestone or release complete just because one task
is complete.

## 10. Commit Or Handoff

Create a clean boundary for the completed work.

Commit when the project workflow expects it and the task is coherent.

Commit rules:

- Stage only task-related files.
- Use a message that names the task or slice.
- Explain broad formatting churn if it is part of the diff.
- Do not combine unrelated task work.
- Do not hide known blockers behind a green commit.

If not committing, hand off with:

- Changed file list
- Verification summary
- Evidence paths
- Remaining blockers
- Suggested next task

## 11. Closeout

The closeout should be short and operational.

Include:

- Completed, blocked or partial status
- Task id or path
- What changed
- Verification run
- Evidence location
- Commit or PR reference when present
- Next logical task

Avoid vague summaries such as "looks good" or "should work". State what was
proved.

## 12. Next Task Selection

Select the next task from dependency order, not preference.

Before moving on, ask:

- Is the current task actually closed?
- Did it unblock another task?
- Did it create a new blocker?
- Is the next task still valid?
- Is the project ready for feature work, or still in foundation mode?

Then start the loop again at task intake.

## Execution Modes

Not every task needs the same proof. Choose the mode before implementation.

| Mode | Purpose | Typical proof |
| --- | --- | --- |
| Foundation execution | Build, lint, types, env, schema, deploy skeleton | Commands green, coverage inventory, tracker evidence |
| Feature slice execution | One vertical user or system workflow | Tests plus user-visible behavior or artifact |
| Debug/fix execution | Reproduce, root cause, regression, fix | Failing case becomes passing, root cause documented |
| Release/gate execution | Readiness, real runtime, user proof, release reports | Truth artifacts, gate summary, explicit go/no-go |
| Docs/contract execution | Align docs, boundaries, tasks or decisions | Diff hygiene, reference checks, updated authority index |

## Verification Truth Sources

Each task should name its truth source.

Examples:

- Unit test result
- Typecheck result
- Build result
- Migration generation result
- Browser screenshot
- Generated app artifact
- Runtime report JSON
- Release gate evidence doc
- Provider sandbox response
- Manual QA note

General validation can be necessary but insufficient. A release gate, user
surface or provider integration may require a more specific truth artifact.

## Failure Rules

When execution fails, classify the failure.

Common outcomes:

- Fixed in task
- Converted into follow-up issue
- Blocked by missing credentials
- Blocked by unsupported provider capability
- Blocked by stale docs or task definition
- Deferred because it belongs to later scope
- No-go for release, but acceptable for non-release validation

Write the classification into the evidence. A known no-go with exact proof is
better than an overclaimed success.

## Actual Execution Prompt Shape

Use a prompt like this when handing a task to AI:

```text
Work in this project.

Take only this task: <task path or id>.
Read the task, authority docs and local ownership rules.
Define done and non-goals before editing.
Inspect the current worktree.
Capture baseline evidence.
Make the smallest scoped change that satisfies the acceptance criteria.
Run the narrowest useful verification first, then broaden as needed.
Record evidence in the task.
Update the tracker only after evidence exists.
Create follow-up issues for unrelated discoveries.
Do not widen scope.
Do not mark done without proof.
```

## Final Rule

Actual execution is not:

```text
AI codes until it seems done.
```

Actual execution is:

```text
AI runs an evidence loop over one bounded task.
```
