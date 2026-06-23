# Build Right

Build Right is a small, agent-agnostic skills repository for turning an app idea
into evidence-backed execution.

## TL;DR: App Lifecycle

Build Right stops agents from guessing what to build:

```text
Research once. Plan continuously. Execute one proven task at a time.
```

1. `build-right-preflight` - research / preflight, once.
   It captures what the founder wants, checks what already exists, separates
   facts from assumptions, defines the MVP, writes the operating docs, and
   creates the first sprint/task.
2. `build-right-feature-planning` - plan, next and repeatedly.
   It takes a new feature idea, asks only the questions that matter, does
   bounded research/review when needed, updates backlog/sprint/docs, and turns
   the idea into ready tasks.
3. `build-right-execution` - execute, next and repeatedly.
   It picks one ready task, proves the starting state, makes the smallest
   useful change, verifies it, records evidence, updates the tracker, and stops
   at the next decision point.

## Install

Install from GitHub with the skills CLI:

```sh
bunx skills add pax-k/build-right
```

List available skills without installing:

```sh
bunx skills add pax-k/build-right --list
```

Install one skill explicitly:

```sh
bunx skills add pax-k/build-right --skill build-right-preflight
bunx skills add pax-k/build-right --skill build-right-feature-planning
bunx skills add pax-k/build-right --skill build-right-execution
```

## Use

Invoke the skill for the phase you are in:

```text
$build-right-preflight

Bootstrap this existing project for evidence-driven AI execution.
```

```text
$build-right-feature-planning

Explore this feature request, update the project sprint/task plan, and stop
before implementation.
```

```text
$build-right-execution

Take the next ready task and complete it with evidence.
```

Some agents may also expose installed skills as slash commands:

```text
/build-right-preflight
/build-right-feature-planning
/build-right-execution
```

## Repository Layout

```text
skills/
  build-right-preflight/
    SKILL.md
    references/
      workflow.md
      founder-gates.md
      research-and-delegation.md
      artifact-contract.md
    scripts/
      preflight-check.ts
    assets/templates/

  build-right-feature-planning/
    SKILL.md
    references/
      workflow.md
      gates.md
      research-and-delegation.md
      planning-contract.md
    scripts/
      feature-planning-check.ts
    assets/templates/

  build-right-execution/
    SKILL.md
    references/
      workflow.md
      gates.md
      review-and-delegation.md
      evidence-contract.md
    scripts/
      continue-check.ts
      execution-check.ts
    assets/templates/

skills.sh.json
```

This repository intentionally does not commit generated `docs/` or `tasks/`
output from its own skills. Use an external test repository to run manual trials
and review generated artifacts.

## Validate

Check local discovery:

```sh
bunx skills add . --list
```

Run the repository verifier:

```sh
bun run verify:skill-trials
```

Run deterministic helper smoke checks:

```sh
bun skills/build-right-preflight/scripts/preflight-check.ts --cwd . --mode all --format markdown
bun skills/build-right-feature-planning/scripts/feature-planning-check.ts --cwd . --feature "Example feature" --format markdown
bun skills/build-right-execution/scripts/continue-check.ts --cwd . --format markdown --strict
bun skills/build-right-execution/scripts/execution-check.ts --cwd . --mode next-task --format markdown
```

Check GitHub discovery after pushing:

```sh
bunx skills add pax-k/build-right --list
```

Expected skills:

```text
build-right-preflight
build-right-feature-planning
build-right-execution
```

## Notes

The skills are instruction-first. `SKILL.md` carries the phase workflow,
`references/` carries deeper rules, `assets/templates/` carries reusable
Markdown artifacts, and read-only Bun scripts surface deterministic gate
signals.

The stable safety model is in [`workflow-backbone.md`](workflow-backbone.md):
observe state, classify it, choose one next action, run gates, act, verify,
record, then stop or continue.

Helper decisions are intentionally small and explicit:

- preflight can return `delegate-inventory`, `ask-founder`, `run-research`,
  `write-artifacts`, `create-sprint0`, `ready-for-execution`, or `blocked`.
- feature planning can return `route-preflight`, `ask-founder`, `run-research`,
  `delegate-review`, `update-roadmap`, `update-sprint`, `create-ready-tasks`,
  or `blocked`.
- execution can return `execute-task`, `continue-active-task`, `ask-founder`,
  `wait-external`, `create-blocker`, `no-ready-task`, or `invalid-state`.

Founder input remains the source of product truth. Public research can support
prototype assumptions or public evidence, but it does not become customer
validation. Subagents may gather, draft, critique, and audit; the main agent
still decides, writes, updates trackers, and closes gates.
