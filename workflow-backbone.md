# Workflow Backbone

Build Right skills are instruction-first, but their safety model is a stable
workflow backbone:

```text
observe state -> classify -> choose one next action -> run gates -> act -> verify -> record -> stop/continue
```

This backbone is the shared contract behind preflight, execution, helper
scripts, templates, and later workflow customization.

## Invariant Behavior

Workflow customization must not bypass these invariants:

- Run the relevant state or readiness resolver when available.
- Select one bounded next action instead of a broad project area.
- Stop for founder-owned product, customer, positioning, or MVP decisions.
- Stop or wait for external state such as publishing, secrets, paid services,
  production access, search indexing, or third-party provider action.
- Respect task ownership; do not execute a ready or active task owned by a
  non-AI owner.
- Keep source-under-test evidence explicit for skill trials and release claims.
- Capture baseline evidence before changing behavior.
- Verify with evidence appropriate to the task type.
- Record evidence before marking a task, gate, sprint, or release complete.
- Create follow-up tasks for unrelated discoveries instead of widening scope.

These are product safety rules, not defaults. A project-local workflow may make
them stricter, but it should not make them weaker.

## Customizable Policy

Users can customize policy around the backbone by adding project-local rules in
the execution rules or equivalent authority file.

Supported customization points:

| Hook | When It Applies |
| --- | --- |
| `before-task-select` | Before choosing or continuing a task. |
| `after-task-intake` | After task goal, non-goals, ownership, and evidence destination are known. |
| `before-edit` | After baseline evidence and before file changes. |
| `after-verify` | After verification commands or proof have run. |
| `after-evidence-recorded` | After task evidence exists and before status changes. |
| `after-task-complete` | After a task is marked complete. |
| `before-next-task` | Before selecting or continuing more work. |

Useful examples:

- commit after each completed task
- require screenshot evidence for UI changes
- require no web research for private founder-fed work
- require broader verification before release-gate changes
- disable web research for a project or phase
- require decision-log entries for architecture or deployment choices

Customization is additive when it answers:

```text
At which point in the loop should this extra rule apply?
What evidence proves it ran?
Which invariant gates still apply?
```

Customization is unsafe when it says:

```text
skip the resolver
skip founder gate
ignore external-state gates
skip evidence
skip verification
mark complete without evidence
continue after failed verification
auto-publish
widen task scope
combine unrelated tasks
auto-publish or use secrets without approval
```

## Relationship To Helpers

The Bun helper scripts are read-only deterministic checks. They provide
decision signals and gate evidence, but they are not the whole workflow and do
not replace judgment.

- `skills/build-right-preflight/scripts/preflight-check.ts` observes preflight
  artifacts and classifies the next preflight action.
- `skills/build-right-execution/scripts/continue-check.ts` observes task and
  gate state and classifies the next execution action.
- `skills/build-right-execution/scripts/execution-check.ts` inspects task
  candidates, task contracts, and stop/ask gate signals.

When helper output and project-local authority disagree, record the mismatch
and reconcile it before advancing.

## Current Scope

This file names the backbone. It does not introduce a workflow DSL, runtime
engine, mutable state writer, or automatic hook executor.
