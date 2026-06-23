---
name: build-right-execution
description: Execute one bounded task using baseline evidence, narrow implementation, verification, evidence capture, and tracker updates. Use when the user invokes /build-right-execution, wants to work the next issue, run an evidence-driven implementation loop, verify a task, update task state, or continue execution from a prepared task queue.
license: MIT
---

# Build Right Execution

Use this skill after pre-execution work has produced product truth, MVP scope,
operating rules, and an executable task queue.

Core rule:

```text
Do one task.
Prove the current state.
Change narrowly.
Verify with the right evidence.
Update the tracker.
Then move to the next task.
```

## Required Reading

- Read `references/workflow.md` before acting.
- Read `references/evidence-contract.md` before completing or updating a task.
- Use `assets/templates/task-template.md` when creating a missing task or
  splitting an overbroad task.

## Operating Mode

1. Select exactly one task from the user prompt or prepared task queue.
2. Read task, sprint/milestone tracker, authority docs, and local agent
   instructions.
3. Print task intake:

   ```text
   Active task: <task id or path>
   Done means: <observable completion criteria>
   Non-goals: <explicit exclusions>
   Baseline evidence: <artifact or command>
   Verification ladder: <focused -> broader checks>
   Evidence destination: <task file or evidence file>
   ```

4. Inspect current workspace state before editing.
5. Capture baseline evidence.
6. Implement the smallest change that satisfies the task.
7. Verify in layers.
8. Record evidence before marking the task complete.
9. Update only the relevant tracker/docs.
10. Commit or hand off according to project workflow.

## Not-Ready Rule

If authority docs, MVP scope, execution rules, or task files are missing, do not
pretend execution is ready. Route the user to `/build-right-preflight` or
create the smallest Sprint 0 blocker needed to establish the missing execution
surface.

## Scope Rule

Do not silently widen scope. If the task reveals unrelated work, create a
follow-up issue and continue only inside the selected task boundary.
