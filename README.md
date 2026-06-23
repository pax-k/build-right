# Build Right

Build Right is a small Agent Skills repository for turning early product work
into evidence-backed execution.

It contains two skills:

- `build-right-preflight`: guides founder/product preflight before AI
  implementation. It captures founder intent, separates assumptions from
  evidence, supports targeted public research, creates operating docs, and
  prepares Sprint 0 plus the first executable task.
- `build-right-execution`: executes one bounded task at a time with baseline
  evidence, narrow changes, layered verification, evidence capture, tracker
  updates, stop/ask gates, and trigger-based subagent review.

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
bunx skills add pax-k/build-right --skill build-right-execution
```

## Use

In Codex, invoke skills explicitly with `$`:

```text
$build-right-preflight

Bootstrap this existing project for evidence-driven AI execution.
```

```text
$build-right-execution

Take the next ready task and complete it with evidence.
```

Some agents may also expose installed skills as slash commands:

```text
/build-right-preflight
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

## Validate

Check local discovery:

```sh
bunx skills add . --list
```

Run deterministic helper smoke checks:

```sh
bun skills/build-right-execution/scripts/continue-check.ts --cwd . --format markdown
bun skills/build-right-preflight/scripts/preflight-check.ts --cwd . --mode all --format markdown
bun skills/build-right-execution/scripts/execution-check.ts --cwd . --mode next-task --format markdown
```

Check GitHub discovery after pushing:

```sh
bunx skills add pax-k/build-right --list
```

Expected skills:

```text
build-right-preflight
build-right-execution
```

## Notes

The skills are instruction-first. They use `references/` for detailed workflow
guidance, `assets/templates/` for reusable Markdown artifacts, and bundled
read-only Bun scripts for deterministic inventory, task-contract, and gate
signals.

The main skill files stay concise. Core workflows live in `workflow.md`; gates,
research/delegation, and evidence contracts are separate one-hop references
loaded only when relevant.

To continue safely through prepared work, run the state resolver first:

```sh
bun skills/build-right-execution/scripts/continue-check.ts --cwd . --format markdown
```

It parses the markdown operating system and returns one decision, such as
`execute-task`, `ask-founder`, `wait-external`, or `no-ready-task`.

Founder-fed context is the default source for product truth. When founder input
is thin and speed matters, bounded public web research can fill prototype-grade
gaps, but those claims stay labeled as prototype assumptions or public evidence,
not customer validation.
Subagents may gather, draft, critique, and audit. The skills use them when
defined triggers apply and tooling is available; the main agent still decides,
writes, updates trackers, and closes gates. Founder-owned or external-state
gates must stop execution instead of being silently converted into AI tasks.
Helper scripts can surface missing artifacts or gate signals, but they do not
replace founder judgment, web research, subagent review, or final synthesis.
