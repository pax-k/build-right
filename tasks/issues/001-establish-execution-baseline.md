# 001: Establish Execution Baseline

Status: complete
Type: validation
Owner: AI

## Goal

Verify the local skill repository baseline and record the exact evidence needed before release or repeated execution work.

## Non-Goals

- Implement product features.
- Rewrite the skill workflows.
- Publish, push, or install from GitHub.
- Resolve every product, market, or positioning assumption.

## Required Reading

- AGENTS.md
- README.md
- RELEASE_CHECKLIST.md
- docs/blueprint-status.md
- docs/source-index.md
- docs/execution-rules.md
- docs/release-gates.md
- skills.sh.json

## Acceptance Criteria

- [x] `bunx skills add . --list` finds `build-right-preflight` and `build-right-execution`, or the blocker is recorded.
- [x] `skills.sh.json` parses and references existing skill directories.
- [x] Each `skills/*/SKILL.md` has frontmatter with `name` and `description`.
- [x] Empty skill directories are absent or documented.
- [x] Unresolved `TODO`, `FIXME`, `PLACEHOLDER`, and `TBD` markers are absent or documented.
- [x] `docs/release-gates.md` is updated with results.
- [x] The next executable task or blocker is explicit in `tasks/sprint-0.md`.

## Baseline Evidence

Before edits, record:

- `git status --short`
- `bunx skills add . --list`
- `bun -e 'JSON.parse(await Bun.file("skills.sh.json").text()); console.log("skills.sh.json ok")'`
- `find skills -type d -empty`
- `rg 'TODO|FIXME|PLACEHOLDER|TBD'`

## Verification

- Re-run the baseline commands after any fix needed for this task.
- Inspect `docs/release-gates.md` and `tasks/sprint-0.md` to confirm evidence and next state are recorded.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `git status --short` | complete | Only new `docs/` and `tasks/` files were present during preflight. |
| 2026-06-23 | `bunx skills add . --list` | pass | Found `build-right-preflight` and `build-right-execution`. |
| 2026-06-23 | `bun -e 'JSON.parse(await Bun.file("skills.sh.json").text()); console.log("skills.sh.json ok")'` | pass | Manifest JSON parses. |
| 2026-06-23 | Bun manifest/frontmatter script | pass | `manifest paths and frontmatter ok: build-right-preflight, build-right-execution`. |
| 2026-06-23 | `find skills -type d -empty` | pass | No empty skill directories printed. |
| 2026-06-23 | `rg 'TODO|FIXME|PLACEHOLDER|TBD'` | documented | Hits are checklist/gate text in `RELEASE_CHECKLIST.md`, `docs/release-gates.md`, and this task file. Filtered scan excluding those files returned no hits. |
| 2026-06-23 | `git diff --check` | pass | No whitespace errors. |

## Blockers

- None.

## Follow-Ups

- tasks/issues/002-define-manual-trial-evidence.md
- tasks/issues/003-align-public-blueprint-terminology.md
