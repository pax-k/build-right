# 018: Split Post-Release Backlog From Sprint 0

Status: complete
Type: documentation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Keep the release baseline distinct from follow-up discovery, positioning, and hardening work.
Source under test: repo-local task trackers and status docs

## Goal

Move post-release and future-hardening work out of Sprint 0 or clearly mark it as post-release backlog.

## Non-Goals

- Delete completed task evidence.
- Change release readiness.
- Reorder historical evidence.

## Required Reading

- tasks/sprint-0.md
- docs/blueprint-status.md
- docs/release-gates.md
- docs/open-questions.md
- tasks/issues/008-decide-skills-sh-directory-discovery.md
- tasks/issues/009-monitor-skills-sh-directory-discovery.md
- tasks/issues/011-prepare-primary-user-framing-packet.md
- tasks/issues/012-prepare-example-evidence-strategy-packet.md

## Acceptance Criteria

- [x] Sprint 0 remains readable as the baseline/release-readiness lane.
- [x] Post-release follow-ups are either moved to a new tracker or clearly separated in Sprint 0.
- [x] Release gates still point at the correct completed evidence.
- [x] No task evidence is lost.

## Baseline Evidence

Sprint 0 currently includes release-baseline tasks, post-release discovery monitoring, positioning decision packets, and future strategy packets in one table.

## Verification

- Inspect task trackers and release gates.
- `rg -n 'post-release|Sprint 0|Backlog|014|015|016|017|018|019' tasks docs`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `tasks/sprint-0.md` | baseline | Sprint 0 mixed release-baseline tasks with post-release discovery, positioning packets, and hardening tasks. |
| 2026-06-23 | `tasks/post-release-backlog.md` | pass | Post-release tasks `009-019` moved into a separate tracker without deleting task evidence files. |
| 2026-06-23 | `docs/release-gates.md` | pass | Release gates still point at completed evidence paths for direct-install readiness and directory-discovery follow-up. |

## Files Changed

- `tasks/post-release-backlog.md` - new post-release tracker for tasks `009-019`.
- `tasks/sprint-0.md` - trimmed to release-baseline tasks `001-008` and linked post-release tracker.
- `docs/blueprint-status.md` - updated tracker plan and next action.
- `docs/source-index.md` - indexed the post-release tracker and updated task `018`.
- `tasks/issues/018-split-post-release-backlog-from-sprint-0.md` - recorded evidence and completion state.

## Verification Summary

- Inspect `tasks/sprint-0.md` - pass, Sprint 0 now contains baseline tasks `001-008` only and links to `tasks/post-release-backlog.md`.
- Inspect `tasks/post-release-backlog.md` - pass, post-release tasks `009-019` are tracked with evidence paths and task `019` ready.
- Inspect `docs/release-gates.md` - pass, release gates still point at completed direct-install and discovery evidence.
- `rg -n 'post-release|Sprint 0|Backlog|014|015|016|017|018|019' tasks docs` - pass, status-bearing references show tracker separation and post-release backlog.
- `rg -n 'tasks/issues/009-monitor-skills-sh-directory-discovery|docs/evidence/manual-trials.md#existing-project-preflight|tasks/issues/007-summarize-existing-project-preflight-evidence|tasks/issues/019-normalize-manual-trials-status' docs/release-gates.md tasks/post-release-backlog.md docs/blueprint-status.md docs/source-index.md` - pass, release evidence and next task references are intact.
- `git diff --check` - pass.

## Learning Notes

- Proved: Sprint 0 now reads as the release-baseline lane, while post-release discovery, positioning packets, and hardening tasks live in a separate tracker without losing task evidence.
- Simulated: Nothing.
- Test next: Whether the next agent can tell what is release baseline versus future backlog.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: assumption basis, reversibility, learning objective, learning notes
- Trial status: n/a

## Blockers

- None.

## Follow-Ups

- tasks/issues/019-normalize-manual-trials-status.md
