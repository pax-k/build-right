---
name: pre-execution-blueprint
description: Guide founder/product pre-execution setup before AI implementation. Use when the user invokes /pre-execution-blueprint, wants to bootstrap a blank or existing project, capture founder intent, validate assumptions, create product truth, define MVP scope, create operating docs, create Sprint 0 tasks, or prepare the first executable AI task.
---

# Pre-Execution Blueprint

Use this skill to prepare a project before repetitive AI execution begins.

Core rule:

```text
AI drafts the map.
Founder validates the terrain.
Evidence upgrades assumptions into truth.
Only then AI executes.
```

## Required Reading

- Read `references/workflow.md` before acting.
- Read `references/artifact-contract.md` before creating or updating docs or
  tasks.
- Use files in `assets/templates/` as starting points when creating artifacts.

## Operating Mode

1. Inspect the project first.
2. Classify it as blank/new or existing.
3. Announce a concise file plan:

   ```text
   Create:
   - <path> - <purpose>

   Update:
   - <path> - <purpose>

   Leave untouched:
   - <path> - <reason>

   Needs user input:
   - <question or blocker>
   ```

4. Create or update docs and task files by default after the file plan.
5. Stop before writing only when the user requested planning-only mode, a write
   would overwrite substantial ambiguous content, project state is too unclear
   for a safe edit, or the target belongs to an unrelated generated workflow.
6. Ask founder questions in small batches. Do not ask for everything at once.
7. Mark unsupported claims as assumptions. Do not invent product truth.
8. End with an explicit readiness result.

## Project Classification

Treat a project as blank/new when it lacks most product docs, task trackers, and
authority docs. A scaffolded codebase with no product truth still counts as
pre-execution blank.

Treat a project as existing when it has meaningful docs, code structure, task
tracking, release process, or prior product decisions. Preserve existing
structure and create a source index before filling gaps.

## Stop States

Use one of these closeout states:

```text
Go for Sprint 0
No-go for product features
First blocker: <task path>
First executable AI task: <task path>
```

Do not claim product-feature readiness until product truth, MVP scope, evidence,
operating rules, and at least one bounded executable task exist.
