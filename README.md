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
  updates, and optional subagent review.

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
    assets/templates/

  build-right-execution/
    SKILL.md
    references/
    assets/templates/

skills.sh.json
```

## Validate

Check local discovery:

```sh
bunx skills add . --list
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
guidance and `assets/templates/` for reusable Markdown artifacts.

Founder-fed context is the default source for product truth. When founder input
is thin and speed matters, bounded public web research can fill prototype-grade
gaps, but those claims stay labeled as prototype assumptions or public evidence,
not customer validation.
Subagents may gather, draft, critique, and audit; the main agent decides,
writes, updates trackers, and closes gates.
