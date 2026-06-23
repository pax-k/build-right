# Release Checklist

Use this checklist before announcing or submitting Build Right skills.

## Local Validation

- [ ] `bunx skills add . --list` finds:
  - `build-right-preflight`
  - `build-right-execution`
- [ ] `skills.sh.json` parses.
- [ ] Each `SKILL.md` has YAML frontmatter with `name` and `description`.
- [ ] Manifest skill names match `skills/<name>/SKILL.md`.
- [ ] No empty skill directories.
- [ ] No unresolved `TODO`, `FIXME`, `PLACEHOLDER`, or `TBD` markers.

## GitHub Validation

- [ ] Local `main` is pushed to `pax-k/build-right`.
- [ ] `bunx skills add pax-k/build-right --list` finds:
  - `build-right-preflight`
  - `build-right-execution`
- [ ] GitHub repo description and topics describe Agent Skills / Codex skills.
- [ ] License is intentionally selected or intentionally omitted.

## Manual Trial

- [ ] Install `build-right-preflight` into Codex.
- [ ] Run it in a blank/scratch project.
- [ ] Run it in an existing project.
- [ ] Install `build-right-execution` into Codex.
- [ ] Run it against a ready task.
- [ ] Run it against a not-ready project and confirm it routes to preflight or
  creates a small Sprint 0 blocker.

## Release Notes

- [ ] Summarize the two skills.
- [ ] Include install command:
  `bunx skills add pax-k/build-right`
- [ ] Include explicit skill names.
- [ ] Mention that public research is treated as public evidence, not customer
  validation.
- [ ] Mention that subagents are optional support lanes, not final authority.
