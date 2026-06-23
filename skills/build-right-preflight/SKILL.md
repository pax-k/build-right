---
name: build-right-preflight
description: Guide founder/product pre-execution setup before AI implementation. Use when the user invokes /build-right-preflight, wants to bootstrap a blank or existing project, capture founder intent, validate assumptions, create product truth, define MVP scope, create operating docs, create Sprint 0 tasks, or prepare the first executable AI task.
license: MIT
---

# Build Right Preflight

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
3. Classify source mode as `founder-fed`, `web-assisted`, or
   `public-first-prototype`.
4. Announce a concise file plan:

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

5. In interactive runs, ask a focused founder-question batch before treating
   founder intent, customer, positioning, MVP, or product promise as captured.
   If those answers are already explicit in the prompt or repo docs, record the
   evidence path instead of asking again.
6. Create or update docs and task files by default after the file plan.
7. Stop before writing only when the user requested planning-only mode, a write
   would overwrite substantial ambiguous content, project state is too unclear
   for a safe edit, or the target belongs to an unrelated generated workflow.
8. Ask founder questions in small batches. Do not ask for everything at once.
   If the user does not answer, continue only with repo-evidence inventory and
   mark founder-owned claims as blocked or needing founder validation.
9. If founder context is thin and fast prototyping is allowed, use bounded web
   research to fill gaps and mark those claims as `prototype-assumption` or
   `public-evidence-backed`.
10. Use subagents when a required delegation trigger applies and subagent tools
    are available. If a trigger applies but subagents are unavailable or the
    user forbids them, record the skipped review and reduce confidence.
11. Mark unsupported claims as assumptions. Do not invent product truth.
12. Prepare the first executable task, but do not complete it unless the user
   explicitly asks to continue into execution.
13. End with an explicit readiness result. If founder input, external evidence,
    required research, or required review is missing, stop at the gate instead
    of advancing as if ready.

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
Go for prototype
Go for Sprint 0
No-go for product features
Needs founder/customer validation before product commitment
First blocker: <task path>
First executable AI task: <task path>
```

Do not claim product-feature readiness until product truth, MVP scope, evidence,
operating rules, and at least one bounded executable task exist.
