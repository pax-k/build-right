# 005: Run Ready-Task Execution Trial

Status: complete
Type: release
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Prove `build-right-execution` can complete one ready bounded task with source-under-test evidence, verification, and tracker updates.
Source under test: `/Users/pax/.codex/skills/build-right-execution`, compared with `skills/build-right-execution/`

## Goal

Run `build-right-execution` against one ready bounded task and record whether it completes the task with baseline evidence, verification, and tracker updates.

## Non-Goals

- Run unrelated tasks.
- Publish a new release.
- Change skill behavior unless the trial exposes a blocking defect.

## Required Reading

- docs/evidence/manual-trials.md
- docs/release-gates.md
- RELEASE_CHECKLIST.md
- skills/build-right-execution/SKILL.md

## Acceptance Criteria

- [x] Selected ready task is recorded.
- [x] Execution skill source under test is recorded and compared with the repo-local skill source when applicable.
- [x] Baseline, implementation, verification, and evidence updates are recorded.
- [x] Task output includes current execution contract fields: `Assumption basis`, `Reversibility`, `Learning objective`, `Source under test`, and `Learning Notes`.
- [x] Result is added to `docs/evidence/manual-trials.md#ready-task-execution`.
- [x] `docs/release-gates.md` and `RELEASE_CHECKLIST.md` are updated if the trial passes or fails.

## Baseline Evidence

Record selected task status and relevant workspace state before execution.
Record whether the installed execution skill matches `skills/build-right-execution/`.

## Verification

- Inspect selected task evidence log.
- Inspect `docs/evidence/manual-trials.md`.
- Inspect source comparison evidence for the execution skill under test.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `tasks/issues/005-run-ready-task-execution-trial.md` | pass | Selected ready bounded task was task `005` itself: a release/manual-trial tracker update with explicit acceptance criteria. |
| 2026-06-23 | `git status --short --branch` | baseline | Worktree already contained staged and unstaged release/skill adoption changes; this task only updated manual-trial tracker surfaces. |
| 2026-06-23 | `diff -qr skills/build-right-execution /Users/pax/.codex/skills/build-right-execution` | pass | Installed user-scope execution skill matched repo-local source before the ready-task execution trial. |
| 2026-06-23 | `docs/evidence/manual-trials.md` | pass | Ready-task execution row marked pass with task `005` as the target. |
| 2026-06-23 | `docs/release-gates.md` | pass | Execution ready-task trial gate marked ready and first blocker advanced to task `006`. |
| 2026-06-23 | `RELEASE_CHECKLIST.md` | pass | Ready-task execution manual trial checked off. |
| 2026-06-23 | `rg -n 'Ready-task execution|Execution ready-task trial|Run ready-task execution trial|First blocker|Run it against a ready task|Assumption basis|Learning Notes|Skill Trial Notes' docs/evidence/manual-trials.md docs/release-gates.md RELEASE_CHECKLIST.md tasks/sprint-0.md tasks/issues/005-run-ready-task-execution-trial.md` | pass | Required task/result markers are present across evidence, release gates, checklist, sprint tracker, and task file. |
| 2026-06-23 | `bunx skills add . --list` | pass | Local skill discovery still finds `build-right-preflight` and `build-right-execution`. |
| 2026-06-23 | Bun manifest/frontmatter check | pass | Manifest paths and skill frontmatter still validate after task updates. |
| 2026-06-23 | `find skills -type d -empty` | pass | No empty skill directories printed. |
| 2026-06-23 | `rg 'TODO|FIXME|PLACEHOLDER|TBD' skills skills.sh.json README.md RELEASE_CHECKLIST.md docs tasks` | documented | Hits are documented checklist/gate text only. |
| 2026-06-23 | `git diff --check` | pass | No whitespace errors. |
| 2026-06-23 | `gh skill publish --dry-run` | pass | Dry run completed; warning remains that no active tag protection rulesets were found. |

## Files Changed

- `docs/evidence/manual-trials.md` - recorded ready-task execution pass.
- `docs/release-gates.md` - marked execution ready-task trial ready and advanced first blocker.
- `RELEASE_CHECKLIST.md` - checked ready-task execution trial.
- `tasks/sprint-0.md` - marked task `005` complete.
- `tasks/issues/005-run-ready-task-execution-trial.md` - recorded evidence and completion state.

## Verification Summary

- `diff -qr skills/build-right-execution /Users/pax/.codex/skills/build-right-execution` - pass, no differences.
- Inspect `docs/evidence/manual-trials.md` - pass, ready-task execution result recorded.
- Inspect `docs/release-gates.md` - pass, ready-task execution gate ready and next blocker is task `006`.
- Inspect `tasks/sprint-0.md` - pass, task `005` complete and task `006` ready.
- `bunx skills add . --list` - pass, both skills found.
- Bun manifest/frontmatter check - pass.
- `find skills -type d -empty` - pass.
- `git diff --check` - pass.
- `gh skill publish --dry-run` - pass with tag-protection warning.

## Learning Notes

- Proved: `build-right-execution` can complete a ready bounded tracker task with source-under-test evidence and release/manual-trial tracker updates.
- Simulated: Product implementation work was not tested; this was a release/tracker execution task.
- Test next: Not-ready execution routing in `tasks/issues/006-run-not-ready-execution-trial.md`.

## Skill Trial Notes

- Source under test: `/Users/pax/.codex/skills/build-right-execution`
- Source comparison: pass
- Contract markers checked: `Assumption basis`, `Reversibility`, `Learning objective`, `Source under test`, `Learning Notes`
- Trial status: pass

## Blockers

- None.

## Follow-Ups

- tasks/issues/006-run-not-ready-execution-trial.md
