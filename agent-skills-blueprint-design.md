# Agent Skills Blueprint Design

This document records how to turn `pre-execution-blueprint.md` and
`execution-blueprint.md` into reusable agent skills compatible with the open
Agent Skills ecosystem and skills.sh.

## Goal

Create two portable skills:

- `pre-execution-blueprint`: guides a founder or project owner through product
  truth, evidence, MVP scope, operating docs, Sprint 0, and the first executable
  AI task.
- `execution-blueprint`: executes one bounded task using baseline evidence,
  narrow implementation, verification, evidence capture, and tracker updates.

Current implementation decisions:

- This repository is the installable skills repository.
- Skills should be optimized for slash-style invocation and natural-language
  triggering.
- Public packaging, license, and README polish can wait.
- Skills should create and update docs or task files by default after announcing
  the intended file plan.
- Skills should not require approval before every write unless the user requests
  approval-only mode or the write would overwrite ambiguous existing content.
- Templates should use a contract-first approach: strict where downstream
  execution depends on structure, lighter where founder discovery benefits from
  flexibility.

These skills should work when invoked explicitly, such as:

```text
/pre-execution-blueprint
/execution-blueprint
```

They should also trigger from natural-language requests such as:

```text
bootstrap this project for AI execution
prepare this startup for agent work
run the next issue using the execution blueprint
work this task with evidence and tracker updates
```

Slash commands are agent-specific. For skills.sh compatibility, the reliable
triggering surface is the skill `description` in `SKILL.md`.

## Write Behavior

The skills should be action-oriented by default.

Before writing, the active skill should print a concise file plan:

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

After the plan, it should proceed with the relevant creates and updates unless:

- the user explicitly asked for planning only
- the change would overwrite substantial existing content
- current project state is ambiguous enough that a reasonable write could damage
  useful work
- the target file belongs to an unrelated workflow or generated artifact set

For new projects, the skill can create the full starter doc/task scaffold. For
existing projects, it should inspect first, preserve existing structure, and
update only missing or clearly stale artifacts.

## Recommended Repository Shape

```text
skills/
  pre-execution-blueprint/
    SKILL.md
    references/
      workflow.md
      artifact-contract.md
    assets/
      templates/
        docs/
        tasks/

  execution-blueprint/
    SKILL.md
    references/
      workflow.md
      evidence-contract.md
    assets/
      templates/
        task-template.md

skills.sh.json
```

The main `SKILL.md` files should stay concise. Put longer process detail,
artifact contracts, and templates in `references/` and `assets/` so agents load
them only when needed.

## Skill 1: Pre-Execution Blueprint

### Purpose

Guide a founder or project owner through the workflow before repetitive AI
execution begins.

The skill should treat AI as:

- interviewer
- analyst
- critic
- documenter
- evidence classifier
- scope guard
- task slicer

AI becomes an executor only after founder intent, assumptions, evidence,
canonical docs, MVP scope, operating rules, and a first task exist.

### Frontmatter

```md
---
name: pre-execution-blueprint
description: Guide founder/product pre-execution setup before AI implementation. Use when the user invokes /pre-execution-blueprint, wants to bootstrap a blank or existing project, capture founder intent, validate assumptions, create product truth, define MVP scope, create operating docs, create Sprint 0 tasks, or prepare the first executable AI task.
---
```

### Core Behavior

When activated, the skill should:

1. Detect project state.
2. Create or resume a blueprint status artifact.
3. Gather founder context.
4. Interview the founder in small batches.
5. Convert rough input into structured draft sources.
6. Mark claims as `founder-claimed`, `ai-inferred`, `evidence-backed`, or
   `unknown`.
7. Ask the founder to validate important claims.
8. Build or update evidence docs.
9. Produce canonical product docs.
10. Scan for conflicts and unresolved decisions.
11. Extract MVP scope.
12. Define manual operations before automation.
13. Create project operating docs and AI working rules.
14. Create Sprint 0 and first task files.
15. Stop with a concrete readiness result.

### Blank Project Flow

In a blank or new project, the skill should create structure progressively:

```text
docs/raw/founder-dump.md
docs/raw/founder-interview.md
docs/open-questions.md
docs/source-validation.md
docs/source-index.md
docs/decision-log.md
docs/evidence/customer-notes.md
docs/evidence/competitor-research.md
docs/evidence/pricing-research.md
docs/evidence/market-notes.md
docs/product-thesis.md
docs/personas.md
docs/problem-statement.md
docs/market.md
docs/business-model.md
docs/product-vision.md
docs/mvp-scope.md
docs/post-mvp.md
docs/product-flows.md
docs/risk-register.md
docs/manual-ops-playbook.md
docs/glossary.md
docs/architecture.md
docs/module-map.md
docs/execution-rules.md
docs/release-gates.md
docs/ai-working-rules.md
docs/clarification-rules.md
docs/task-template.md
tasks/sprint-0.md
tasks/issues/001-*.md
```

It should not invent certainty. Unknowns remain explicit assumptions until
validated.

### Existing Project Flow

In an existing project, the skill should not overwrite local structure. It
should first inspect and index what already exists:

- README and docs
- task trackers
- issue files
- architecture notes
- agent instructions
- package or app structure
- validation commands
- deployment/release artifacts
- existing product or customer language

Then it should create a gap report:

```text
docs/source-index.md
docs/conflicts.md
docs/open-questions.md
docs/blueprint-status.md
```

Only missing or clearly stale artifacts should be created or updated.

### Completion Output

The skill should end with one of these states:

```text
Go for Sprint 0
No-go for product features
First blocker: <task path>
First executable AI task: <task path>
```

It should not claim readiness if product truth, MVP scope, evidence, operating
rules, or the first task are still missing.

## Skill 2: Execution Blueprint

### Purpose

Execute one bounded task from a prepared project state.

The skill should enforce:

```text
Do one task.
Prove the current state.
Change narrowly.
Verify with the right evidence.
Update the tracker.
Then move to the next task.
```

### Frontmatter

```md
---
name: execution-blueprint
description: Execute one bounded task using baseline evidence, narrow implementation, verification, evidence capture, and tracker updates. Use when the user invokes /execution-blueprint, wants to work the next issue, run an evidence-driven implementation loop, verify a task, update task state, or continue execution from a prepared task queue.
---
```

### Core Behavior

When activated, the skill should:

1. Select exactly one task from the user prompt or task queue.
2. Read authority docs and local agent instructions.
3. Define done and non-goals.
4. Inspect workspace state before editing.
5. Capture baseline evidence.
6. Diagnose the gap.
7. Make the smallest implementation change.
8. Verify in layers.
9. Record evidence in the task tracker or evidence file.
10. Update only the relevant project state.
11. Commit or hand off, depending on project workflow.
12. Name the next logical task without silently widening scope.

### Not-Ready Behavior

If the project lacks authority docs, MVP scope, execution rules, or task files,
the skill should not pretend execution is ready.

It should either:

- ask the user to run `/pre-execution-blueprint`, or
- create a narrow Sprint 0 blocker that establishes the missing execution
  surface.

### Expected Task Intake Output

```text
Active task: <task id or path>
Done means: <observable completion criteria>
Non-goals: <explicit exclusions>
Baseline evidence: <artifact or command>
Verification ladder: <focused -> broader checks>
Evidence destination: <task file or evidence file>
```

### Evidence Contract

Each completed task should record:

- baseline result
- files changed
- commands run
- exit codes or key output
- test names
- report paths
- screenshots or URLs when relevant
- generated artifacts kept or discarded
- known blockers
- follow-up issues

The closeout should state what was proved. Avoid vague status language.

## skills.sh Compatibility Notes

skills.sh and the broader Agent Skills format expect each skill to be a
directory containing a `SKILL.md` file with YAML frontmatter.

Required frontmatter:

```md
---
name: skill-name
description: What this skill does and when to use it.
---
```

Naming rules:

- Use lowercase letters, numbers, and hyphens.
- Keep names under 64 characters.
- Match the folder name and the `name` field.

Discovery-friendly layout:

```text
skills/<skill-name>/SKILL.md
```

Optional directories:

- `references/` for detailed instructions loaded on demand.
- `assets/` for templates copied or adapted into user projects.
- `scripts/` for deterministic automation, if later needed.

Do not start with scripts unless repeated mechanical work justifies them. These
two workflows mostly require judgment, interaction, and careful file edits.

## Suggested `skills.sh.json`

```json
{
  "$schema": "https://skills.sh/schemas/skills.sh.schema.json",
  "notGrouped": "bottom",
  "groupings": [
    {
      "title": "Blueprints",
      "description": "Skills for preparing and executing evidence-driven AI project work.",
      "skills": [
        "pre-execution-blueprint",
        "execution-blueprint"
      ]
    }
  ]
}
```

## Implementation Notes

The first implementation should be instruction-and-template driven:

- Put concise activation and operating rules in each `SKILL.md`.
- Move the detailed step-by-step workflow into `references/workflow.md`.
- Put artifact shapes and required fields in `references/artifact-contract.md`
  or `references/evidence-contract.md`.
- Put reusable Markdown templates in `assets/templates/`.
- Forward-test each skill in both a blank project and an existing project.

Useful test prompts:

```text
Use /pre-execution-blueprint in this blank project and guide me until the first executable AI task exists.
```

```text
Use /pre-execution-blueprint in this existing project. Do not overwrite existing docs; index them, find gaps, and prepare execution.
```

```text
Use /execution-blueprint to take the next ready task and complete it with evidence.
```

```text
Use /execution-blueprint on this project that has no task tracker. Tell me whether execution is ready and create the smallest blocker if not.
```

## Design Principle

The pre-execution skill creates truth, scope, operating rules, and the first
task. The execution skill consumes those artifacts one bounded task at a time.

Do not let either skill silently cross that boundary.
