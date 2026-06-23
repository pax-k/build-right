# 004: Run Blank-Project Preflight Trial

Status: complete
Type: release
Owner: AI
Source under test: installed user-scope `build-right-preflight`, synced from `skills/build-right-preflight/` after the partial run

## Goal

Run `build-right-preflight` in a blank or scratch project and record whether it creates a safe starter scaffold without overwriting unrelated work.

## Non-Goals

- Publish a new release.
- Change skill behavior unless the trial exposes a blocking defect.
- Claim customer validation.

## Required Reading

- docs/evidence/manual-trials.md
- docs/release-gates.md
- RELEASE_CHECKLIST.md

## Acceptance Criteria

- [x] Scratch target path is recorded.
- [x] Invocation and generated files are recorded.
- [x] Result is added to `docs/evidence/manual-trials.md#blank-project-preflight`.
- [x] `docs/release-gates.md` and `RELEASE_CHECKLIST.md` are updated if the trial passes or fails.
- [x] Installed skill source is synced with the repo-local skill source before the trial.
- [x] Generated scaffold includes current contract fields: `Source mode`, `Prototype confidence`, `Prototype assumptions labeled`, `Assumption basis`, `Reversibility`, `Learning objective`, and `Learning Notes`.

## Baseline Evidence

Record the scratch directory state before invoking the skill.

## Verification

- Inspect generated scratch files.
- Inspect `docs/evidence/manual-trials.md`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `find /tmp/build-right-blank-preflight-trial-20260623 -maxdepth 3 -type f -print` before preflight | pass | Scratch target existed and contained no files before the trial. |
| 2026-06-23 | `$build-right-preflight` manual trial in `/tmp/build-right-blank-preflight-trial-20260623` | pass | Generated starter `docs/` and `tasks/` scaffold from the installed skill contract and templates. |
| 2026-06-23 | `find /tmp/build-right-blank-preflight-trial-20260623 -maxdepth 4 -type f | sort` | pass | Generated `docs/blueprint-status.md`, `docs/source-index.md`, `docs/open-questions.md`, `docs/execution-rules.md`, `docs/release-gates.md`, `tasks/sprint-0.md`, and `tasks/issues/001-establish-execution-baseline.md`. |
| 2026-06-23 | `rg 'Project state: blank/new|No-go: Product feature work|First blocker: tasks/issues/001-establish-execution-baseline.md|Founder intent, MVP scope' /tmp/build-right-blank-preflight-trial-20260623` | pass | Scratch scaffold classified the project as blank/new, blocked product feature work, and routed execution to Sprint 0. |
| 2026-06-23 | `docs/evidence/manual-trials.md` | pass | Blank-project preflight row marked pass with scratch target and invocation. |
| 2026-06-23 | `docs/release-gates.md` | pass | Manual blank-project trial gate marked ready. |
| 2026-06-23 | `RELEASE_CHECKLIST.md` | pass | Blank/scratch manual trial checked off. |
| 2026-06-23 | `diff -u skills/build-right-preflight/assets/templates/docs/blueprint-status.md /Users/pax/.codex/skills/build-right-preflight/assets/templates/docs/blueprint-status.md` | fail | Installed user-scope preflight template is stale and misses `Source mode`, `Prototype confidence`, and `Prototype assumptions labeled`. |
| 2026-06-23 | `diff -u skills/build-right-preflight/assets/templates/tasks/issue-template.md /Users/pax/.codex/skills/build-right-preflight/assets/templates/tasks/issue-template.md` | fail | Installed user-scope issue template is stale and misses assumption basis, reversibility, learning objective, and learning notes. |
| 2026-06-23 | `rg 'Source mode|Prototype confidence|Prototype assumptions labeled|Assumption basis|Learning objective|Learning Notes' /tmp/build-right-blank-preflight-trial-20260623` | fail | Scratch output does not include current contract fields, so the trial is partial and must be rerun after sync. |
| 2026-06-23 | `bunx skills add . --skill build-right-preflight` | partial | Synced repo-local `.agents/skills/build-right-preflight`, but `/Users/pax/.codex/skills/build-right-preflight` remained stale. |
| 2026-06-23 | `rsync -a skills/build-right-preflight/ /Users/pax/.codex/skills/build-right-preflight/` | pass | Synced installed user-scope Codex preflight skill from repo-local source. |
| 2026-06-23 | `diff -u skills/build-right-preflight/assets/templates/docs/blueprint-status.md /Users/pax/.codex/skills/build-right-preflight/assets/templates/docs/blueprint-status.md` | pass | Installed user-scope blueprint status template now matches repo-local template. |
| 2026-06-23 | `diff -u skills/build-right-preflight/assets/templates/tasks/issue-template.md /Users/pax/.codex/skills/build-right-preflight/assets/templates/tasks/issue-template.md` | pass | Installed user-scope issue template now matches repo-local template. |
| 2026-06-23 | `find /tmp/build-right-blank-preflight-trial-20260623-rerun -maxdepth 3 -type f -print` before preflight | pass | Fresh rerun scratch target existed and contained no files before the trial. |
| 2026-06-23 | `$build-right-preflight` manual rerun in `/tmp/build-right-blank-preflight-trial-20260623-rerun` | pass | Generated current-contract starter scaffold after syncing installed user-scope skill. |
| 2026-06-23 | `find /tmp/build-right-blank-preflight-trial-20260623-rerun -maxdepth 4 -type f | sort` | pass | Generated `docs/blueprint-status.md`, `docs/open-questions.md`, `docs/execution-rules.md`, `docs/release-gates.md`, `tasks/sprint-0.md`, and `tasks/issues/001-establish-execution-baseline.md`. |
| 2026-06-23 | `rg 'Source mode|Prototype confidence|Prototype assumptions labeled|Assumption basis|Reversibility|Learning objective|Learning Notes|No-go: Product feature work|First blocker: tasks/issues/001-establish-execution-baseline.md' /tmp/build-right-blank-preflight-trial-20260623-rerun` | pass | Rerun output includes current contract markers and still blocks product feature work. |
| 2026-06-23 | `docs/evidence/manual-trials.md` | pass | Blank-project preflight matrix marked pass with rerun evidence. |
| 2026-06-23 | `docs/release-gates.md` | pass | Manual blank-project trial gate marked ready and first blocker advanced to task 005. |
| 2026-06-23 | `RELEASE_CHECKLIST.md` | pass | Blank/scratch preflight trial checked off again after synced rerun. |
| 2026-06-23 | `rsync -a --delete skills/build-right-preflight/ /Users/pax/.codex/skills/build-right-preflight/`; `rsync -a --delete skills/build-right-execution/ /Users/pax/.codex/skills/build-right-execution/` | pass | User-scope Codex skill copies were synced from the repo-local source after the stale-skill mismatch was found. |
| 2026-06-23 | `diff -qr skills/build-right-preflight /Users/pax/.codex/skills/build-right-preflight`; `diff -qr skills/build-right-execution /Users/pax/.codex/skills/build-right-execution` | pass | No differences after sync. The preflight rerun evidence above proves the blank-project trial against the synced contract. |

## Files Changed

- `docs/evidence/manual-trials.md` - recorded original partial run and synced rerun pass.
- `docs/release-gates.md` - marked manual blank-project trial ready after synced rerun.
- `RELEASE_CHECKLIST.md` - checked blank/scratch preflight trial after synced rerun.
- `tasks/sprint-0.md` - marked task 004 complete after synced rerun.
- `tasks/issues/004-run-blank-project-preflight-trial.md` - recorded evidence and completion state.
- `/tmp/build-right-blank-preflight-trial-20260623/docs/blueprint-status.md` - scratch scaffold output.
- `/tmp/build-right-blank-preflight-trial-20260623/docs/source-index.md` - scratch scaffold output.
- `/tmp/build-right-blank-preflight-trial-20260623/docs/open-questions.md` - scratch scaffold output.
- `/tmp/build-right-blank-preflight-trial-20260623/docs/execution-rules.md` - scratch scaffold output.
- `/tmp/build-right-blank-preflight-trial-20260623/docs/release-gates.md` - scratch scaffold output.
- `/tmp/build-right-blank-preflight-trial-20260623/tasks/sprint-0.md` - scratch scaffold output.
- `/tmp/build-right-blank-preflight-trial-20260623/tasks/issues/001-establish-execution-baseline.md` - scratch scaffold output.

## Verification Summary

- `diff -u` between repo-local and installed user-scope templates - pass after sync.
- `find /tmp/build-right-blank-preflight-trial-20260623-rerun -maxdepth 4 -type f | sort` - pass, expected current-contract starter scaffold exists.
- `rg 'Source mode|Prototype confidence|Prototype assumptions labeled|Assumption basis|Reversibility|Learning objective|Learning Notes|No-go: Product feature work|First blocker: tasks/issues/001-establish-execution-baseline.md' /tmp/build-right-blank-preflight-trial-20260623-rerun` - pass, contract markers and readiness routing are correct.
- Inspect `docs/evidence/manual-trials.md` - pass, rerun result recorded.
- Inspect `docs/release-gates.md` - pass, manual blank-project gate marked ready.
- Inspect `tasks/sprint-0.md` - pass, task 004 complete and task 005 remains ready.

## Blockers

- None.

## Follow-Ups

- tasks/issues/005-run-ready-task-execution-trial.md
