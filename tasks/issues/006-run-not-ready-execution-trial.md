# 006: Run Not-Ready Execution Trial

Status: complete
Type: release
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Prove `build-right-execution` routes missing execution readiness to the smallest Sprint 0 blocker instead of product feature work.
Source under test: `/Users/pax/.codex/skills/build-right-execution`, compared with `skills/build-right-execution/`

## Goal

Run `build-right-execution` against a project or task setup that lacks required readiness surfaces and record whether it routes to preflight or creates the smallest Sprint 0 blocker.

## Non-Goals

- Run product feature work.
- Publish a new release.
- Change skill behavior unless the trial exposes a blocking defect.

## Required Reading

- docs/evidence/manual-trials.md
- docs/release-gates.md
- RELEASE_CHECKLIST.md
- skills/build-right-execution/SKILL.md

## Acceptance Criteria

- [x] Not-ready target setup is recorded.
- [x] Execution skill source under test is recorded and compared with the repo-local skill source when applicable.
- [x] Missing readiness surface is recorded.
- [x] Routing behavior or created blocker task is recorded.
- [x] Created blocker or routing evidence includes current execution contract fields where a task artifact is produced.
- [x] Result is added to `docs/evidence/manual-trials.md#not-ready-execution`.
- [x] `docs/release-gates.md` and `RELEASE_CHECKLIST.md` are updated if the trial passes or fails.

## Baseline Evidence

Record target readiness state before invoking the execution skill.
Record whether the installed execution skill matches `skills/build-right-execution/`.

## Verification

- Inspect created blocker or routing output.
- Inspect `docs/evidence/manual-trials.md`.
- Inspect source comparison evidence for the execution skill under test.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `diff -qr skills/build-right-execution /Users/pax/.codex/skills/build-right-execution` | pass | Installed user-scope execution skill matched repo-local source before the not-ready execution trial. |
| 2026-06-23 | `find /tmp/build-right-not-ready-execution-trial-20260623 -maxdepth 4 -type f | sort` before execution | pass | Fresh scratch target existed and contained no files before the trial. |
| 2026-06-23 | `$build-right-execution` against `/tmp/build-right-not-ready-execution-trial-20260623` | pass | Target lacked `AGENTS.md`, `docs/`, `tasks/`, execution rules, release gates, task tracker, and selected task; execution created the smallest Sprint 0 blocker instead of product work. |
| 2026-06-23 | `find /tmp/build-right-not-ready-execution-trial-20260623 -maxdepth 4 -type f | sort` after execution | pass | Only `tasks/sprint-0.md` and `tasks/issues/001-establish-execution-baseline.md` were created. |
| 2026-06-23 | `rg 'Assumption basis|Reversibility|Learning objective|Source under test|Learning Notes|Skill Trial Notes|Execution authority docs|product feature work|Sprint 0 blocker' /tmp/build-right-not-ready-execution-trial-20260623` | pass | Created blocker includes current execution contract markers and blocks product feature work. |
| 2026-06-23 | `find /tmp/build-right-not-ready-execution-trial-20260623 -maxdepth 3 -type f ! -path '*/tasks/sprint-0.md' ! -path '*/tasks/issues/001-establish-execution-baseline.md' -print` | pass | No unexpected or product-feature artifacts were created. |
| 2026-06-23 | `docs/evidence/manual-trials.md` | pass | Not-ready execution row marked pass with scratch target and routing result. |
| 2026-06-23 | `docs/release-gates.md` | pass | Execution not-ready trial gate marked ready and next blocker advanced to existing-project summary. |
| 2026-06-23 | `RELEASE_CHECKLIST.md` | pass | Not-ready execution manual trial checked off. |
| 2026-06-23 | `rg 'Not-ready execution \\| pass|Execution not-ready trial.*ready|Run it against a not-ready project|006 \\| Run not-ready execution trial \\| complete|007 \\| Summarize existing-project preflight evidence \\| ready|First blocker: tasks/issues/007-summarize-existing-project-preflight-evidence.md|Next Action' docs RELEASE_CHECKLIST.md tasks` | pass | Status-bearing docs point to completed task `006` and next task `007`. |
| 2026-06-23 | `git diff --check` | pass | No whitespace errors. |

## Files Changed

- `docs/evidence/manual-trials.md` - recorded not-ready execution pass.
- `docs/release-gates.md` - marked execution not-ready trial ready and advanced first blocker.
- `RELEASE_CHECKLIST.md` - checked not-ready execution manual trial.
- `tasks/sprint-0.md` - marked task `006` complete and added task `007`.
- `tasks/issues/006-run-not-ready-execution-trial.md` - recorded evidence and completion state.
- `tasks/issues/007-summarize-existing-project-preflight-evidence.md` - follow-up for the remaining manual-trial summary gap.
- `/tmp/build-right-not-ready-execution-trial-20260623/tasks/sprint-0.md` - scratch routing output.
- `/tmp/build-right-not-ready-execution-trial-20260623/tasks/issues/001-establish-execution-baseline.md` - scratch blocker output.

## Verification Summary

- `diff -qr skills/build-right-execution /Users/pax/.codex/skills/build-right-execution` - pass, no differences.
- `find /tmp/build-right-not-ready-execution-trial-20260623 -maxdepth 4 -type f | sort` - pass, only Sprint 0 tracker and blocker task created.
- `rg 'Assumption basis|Reversibility|Learning objective|Source under test|Learning Notes|Skill Trial Notes|Execution authority docs|product feature work|Sprint 0 blocker' /tmp/build-right-not-ready-execution-trial-20260623` - pass, blocker includes current contract markers and routing proof.
- Inspect `docs/evidence/manual-trials.md` - pass, not-ready execution result recorded.
- Inspect `docs/release-gates.md` - pass, not-ready execution gate ready.
- Inspect `tasks/sprint-0.md` - pass, task `006` complete and task `007` ready.
- `rg 'Not-ready execution \\| pass|Execution not-ready trial.*ready|Run it against a not-ready project|006 \\| Run not-ready execution trial \\| complete|007 \\| Summarize existing-project preflight evidence \\| ready|First blocker: tasks/issues/007-summarize-existing-project-preflight-evidence.md|Next Action' docs RELEASE_CHECKLIST.md tasks` - pass.
- `git diff --check` - pass.

## Learning Notes

- Proved: `build-right-execution` routes a project with missing execution surfaces to a minimal Sprint 0 blocker instead of product feature work.
- Simulated: No product implementation behavior was tested.
- Test next: Summarize existing-project preflight evidence and decide whether skills.sh directory discovery remains release-blocking.

## Skill Trial Notes

- Source under test: `/Users/pax/.codex/skills/build-right-execution`
- Source comparison: pass
- Contract markers checked: `Assumption basis`, `Reversibility`, `Learning objective`, `Source under test`, `Learning Notes`
- Trial status: pass

## Blockers

- None.

## Follow-Ups

- tasks/issues/007-summarize-existing-project-preflight-evidence.md
