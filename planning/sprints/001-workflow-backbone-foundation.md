# Sprint 001: Workflow Backbone Foundation

Status: planned
Owner: AI
Created: 2026-06-23

## Purpose

Turn the current opinionated Build Right skill workflows into a tested,
customizable backbone without adding a heavy runtime or unnecessary artifacts.

The stable backbone is:

```text
observe state -> classify -> choose one next action -> run gates -> act -> verify -> record -> stop/continue
```

Customization should add policy hooks around that loop. It should not bypass
stop gates, ownership checks, evidence capture, task boundaries, or
verification.

## Scope

Included:

- Document the workflow backbone as a first-class contract.
- Convert current verifier coverage into Bun unit tests.
- Expand tests across script decisions, Markdown templates, gates, states, and
  edge cases.
- Tighten decision log and lean state contracts.
- Add optional foundation task prompts for architecture, stack, directory
  structure, deployment, env, and module boundaries.
- Define a small workflow customization hook vocabulary.

Excluded:

- Building a full workflow DSL.
- Adding mutable state-writing scripts.
- Replacing the current read-only helper scripts with a runtime engine.
- Making architecture, stack, deployment, or directory docs mandatory for every
  project.
- Allowing workflow customization to remove safety gates.

## Task Queue

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| 001 | Define the workflow backbone contract | complete | planning/tasks/001-define-workflow-backbone-contract.md |
| 002 | Convert verifier coverage to Bun tests | complete | planning/tasks/002-convert-verifier-to-bun-tests.md |
| 003 | Expand the script and Markdown testing matrix | complete | planning/tasks/003-expand-testing-matrix.md |
| 004 | Tighten decision log and lean state contracts | complete | planning/tasks/004-tighten-decision-log-and-state-contracts.md |
| 005 | Add optional foundation preflight task templates | complete | planning/tasks/005-add-foundation-preflight-task-templates.md |
| 006 | Define workflow customization hooks | ready | planning/tasks/006-define-workflow-customization-hooks.md |

## Testing Matrix

| Area | States or Conditions | Expected Outcomes |
| --- | --- | --- |
| Preflight project state | blank/new, existing, existing without source index, existing with many docs | `ask-founder`, `delegate-inventory`, `write-artifacts` |
| Source mode | `founder-fed`, `web-assisted`, `public-first-prototype` | Research is required only when an evidence gap matters. |
| Founder gates | missing customer, missing promise, unresolved MVP, open founder question | `ask-founder` |
| Artifact readiness | missing core docs, missing task tracker, missing issue file, ready docs | `write-artifacts`, `create-sprint0`, `ready-for-execution` |
| Execution state | active AI task, ready AI task, no ready task, no tracker | `continue-active-task`, `execute-task`, `no-ready-task`, `create-blocker` |
| Ownership | AI, founder, external provider, unknown | execute, ask founder, wait external, or block |
| Conflicts | founder-owned, AI-owned, external-owned, resolved | ask, create blocker, wait, or ignore |
| Release gates | source mismatch, failed verification, stale evidence, external discovery, release claim | block or wait correctly |
| Task contract | missing fields, missing sections, blockers present | invalid state or stop gate |
| Templates | decision log, blueprint status, MVP scope, release gates, issue template | required headings and markers exist |
| Custom hooks | atomic commit, screenshot required for UI, no web research, stronger verification | allowed when additive; blocked when bypassing gates |

## Gate

Do not implement workflow customization before task 002 and task 003 are green.
The tests should lock current behavior before the backbone is reshaped.

## Later Loop Notes

- Start with task 001 only if the goal is documentation alignment.
- Start with task 002 if the goal is implementation safety.
- Treat task 006 as blocked until the tests prove the current gate behavior.
