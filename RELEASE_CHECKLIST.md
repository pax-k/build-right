# Release Checklist

Use this checklist before announcing or submitting Build Right skills.

## Local Validation

- [x] `bunx skills add . --list` finds:
  - `build-right-preflight`
  - `build-right-execution`
- [x] `skills.sh.json` parses.
- [x] Each `SKILL.md` has YAML frontmatter with `name` and `description`.
- [x] Manifest skill names match `skills/<name>/SKILL.md`.
- [x] `bun scripts/verify-skill-trials.ts` passes.
- [x] No empty skill directories.
- [x] No unresolved `TODO`, `FIXME`, `PLACEHOLDER`, or `TBD` markers outside checklist/gate text.

## GitHub Validation

- [x] Local `main` is pushed to `pax-k/build-right`.
- [x] GitHub release `v0.1.0` is published:
  `https://github.com/pax-k/build-right/releases/tag/v0.1.0`
- [x] `bunx skills add pax-k/build-right --list` finds:
  - `build-right-preflight`
  - `build-right-execution`
- [x] Targeted owner-scoped GitHub skill search finds the skills.
  Current live evidence: `gh skill search preflight --owner pax-k --json
  skillName,repo,path,description,stars` finds `build-right-preflight`;
  `gh skill search execution --owner pax-k --json
  skillName,repo,path,description,stars` finds both skills.
- [ ] Generic `gh skill search build-right` finds both skills. Post-release
  discovery follow-up; not a direct GitHub install release blocker.
  Current live evidence: `gh skill search build-right --json
  skillName,repo,path,description,stars` returns `[]`; see
  `tasks/issues/009-monitor-skills-sh-directory-discovery.md`.
- [ ] `bunx skills find build-right` finds both skills in the skills.sh directory.
  Post-release discovery follow-up; not a direct GitHub install release blocker.
  Current live evidence: `bunx skills find build-right` returns `No skills
  found for "build-right"`; see
  `tasks/issues/009-monitor-skills-sh-directory-discovery.md`.
- [x] GitHub repo description and topics describe Agent Skills / Codex skills.
- [x] License is intentionally selected or intentionally omitted.

## Manual Trial

- [x] Manual trial evidence status is validated and staleness rules are defined:
  `docs/evidence/manual-trials.md#staleness-rules`
- [x] Install `build-right-preflight` into Codex.
- [x] Confirm installed Codex skills match the repo-local skill source before
  manual trials.
- [x] Run it in a blank/scratch project using a synced current skill. Evidence:
  `docs/evidence/manual-trials.md#blank-project-preflight`
- [x] Run it in an existing project. Evidence:
  `docs/evidence/manual-trials.md#existing-project-preflight`
- [x] Install `build-right-execution` into Codex.
- [x] Run it against a ready task. Evidence:
  `docs/evidence/manual-trials.md#ready-task-execution`
- [x] Run it against a not-ready project and confirm it routes to preflight or
  creates a small Sprint 0 blocker. Evidence:
  `docs/evidence/manual-trials.md#not-ready-execution`

## Release Notes

- [x] Summarize the two skills.
- [x] Include install command:
  `bunx skills add pax-k/build-right`
- [x] Include explicit skill names.
- [x] Mention that public research is treated as public evidence, not customer
  validation.
- [x] Mention that subagents are optional support lanes, not final authority.

## Published Release

- Tag: `v0.1.0`
- URL: `https://github.com/pax-k/build-right/releases/tag/v0.1.0`
- Current limitation: skills are published and directly installable from GitHub,
  but generic `gh skill search build-right` coverage and `bunx skills find
  build-right` directory discovery are not yet proven after the post-release
  monitor run. Treat those as discovery limitations, not blockers for direct
  GitHub install.
