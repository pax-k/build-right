# Release Gates

Status: direct-install-ready-directory-discovery-follow-up
Last updated: 2026-06-23

## Gates

| Gate | Required Evidence | Command or Proof | Status |
| --- | --- | --- | --- |
| Local skill discovery | Local repo install listing finds `build-right-preflight` and `build-right-execution`. | `bunx skills add . --list` | ready |
| Manifest parses | `skills.sh.json` is valid JSON and grouping points at existing skills. | `bun -e 'JSON.parse(await Bun.file("skills.sh.json").text())'` | ready |
| Skill frontmatter | Each `SKILL.md` has YAML frontmatter with `name` and `description`. | Bun frontmatter check in `tasks/issues/001-establish-execution-baseline.md` | ready |
| Manifest paths | Manifest skill names match `skills/<name>/SKILL.md`. | Bun manifest path check in `tasks/issues/001-establish-execution-baseline.md` | ready |
| Deterministic skill-trial verifier | Core release evidence hygiene, split-reference routing, continue-state resolver, and helper-script smoke checks run as one Bun verifier. | `bun scripts/verify-skill-trials.ts` | ready |
| No empty skill directories | All skill directories contain required files. | `find skills -type d -empty` | ready |
| No unresolved markers | No `TODO`, `FIXME`, `PLACEHOLDER`, or `TBD` markers remain outside checklist/gate text. | `rg 'TODO|FIXME|PLACEHOLDER|TBD' -g '!RELEASE_CHECKLIST.md' -g '!docs/release-gates.md' -g '!tasks/issues/001-establish-execution-baseline.md'` | ready |
| Installed skill sync | User-scope installed skills match the repo-local skill source before manual trials. | `rsync -a --delete skills/build-right-preflight/ /Users/pax/.codex/skills/build-right-preflight/`; `rsync -a --delete skills/build-right-execution/ /Users/pax/.codex/skills/build-right-execution/`; `diff -qr ...` returned no differences | ready |
| Manual blank-project trial | Preflight skill runs in a blank or scratch project and creates a safe starter scaffold that matches the current repo-local artifact contract. | `docs/evidence/manual-trials.md#blank-project-preflight`; `tasks/issues/004-run-blank-project-preflight-trial.md`; `/tmp/build-right-blank-preflight-trial-20260623-rerun`; manual-trial evidence status validated with staleness rules | ready |
| Manual existing-project trial | Preflight skill runs in an existing project and preserves useful structure. | `docs/evidence/manual-trials.md#existing-project-preflight`; generated `docs/` and `tasks/` adoption layer; `tasks/issues/007-summarize-existing-project-preflight-evidence.md` | ready |
| Execution ready-task trial | Execution skill completes one ready task with evidence. | `docs/evidence/manual-trials.md#ready-task-execution`; `tasks/issues/005-run-ready-task-execution-trial.md` | ready |
| Execution not-ready trial | Execution skill routes a not-ready project to preflight or a Sprint 0 blocker. | `docs/evidence/manual-trials.md#not-ready-execution`; `tasks/issues/006-run-not-ready-execution-trial.md`; `/tmp/build-right-not-ready-execution-trial-20260623` | ready |
| GitHub release published | GitHub release exists for current published MVP. | `gh release view v0.1.0` | ready |
| GitHub install validation | GitHub install listing finds both skills after pushing. | `bunx skills add pax-k/build-right --list` | ready |
| GitHub Agent Skills search | GitHub skill search finds both skills through targeted owner-scoped queries. | `gh skill search preflight --owner pax-k --json skillName,repo,path,description,stars` finds `build-right-preflight`; `gh skill search execution --owner pax-k --json skillName,repo,path,description,stars` finds both skills; generic `gh skill search build-right --json skillName,repo,path,description,stars` returns `[]` in `tasks/issues/009-monitor-skills-sh-directory-discovery.md` | targeted-ready-generic-follow-up |
| Codex user install | Both skills are installed for Codex user scope. | `gh skill install pax-k/build-right/build-right-preflight --agent codex`; `gh skill install pax-k/build-right/build-right-execution --agent codex` | ready |
| skills.sh directory search | skills.sh directory search finds both skills. | `bunx skills find build-right` returns no results in `tasks/issues/009-monitor-skills-sh-directory-discovery.md`; direct GitHub install remains ready. | post-release-follow-up |

## Go/No-Go Format

```text
Go: <what is allowed>
No-go: <what is not allowed>
First blocker: <task path>
```

## Current Go/No-Go

```text
Go: Published `v0.1.0` GitHub Agent Skills release, direct GitHub install, targeted owner-scoped GitHub skill search, and completed manual-trial coverage.
No-go: Claiming generic `build-right` search coverage or skills.sh directory indexing.
First blocker: none for direct GitHub install readiness.
Post-release follow-up: re-run discovery checks before claiming generic search or skills.sh directory indexing.
```
