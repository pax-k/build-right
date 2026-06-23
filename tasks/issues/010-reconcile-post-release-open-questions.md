# 010: Reconcile Post-Release Open Questions

Status: complete
Type: documentation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Prove that resolved operational decisions are no longer listed as founder-input blockers after the post-release discovery monitor.
Source under test: repo-local docs and task tracker

## Goal

Reconcile stale open-question and status docs after manual-trial evidence, directory discovery decision, and post-release monitor tasks completed.

## Non-Goals

- Decide the primary buyer/user framing.
- Change public positioning.
- Change skill behavior.
- Claim generic GitHub search or skills.sh directory indexing.

## Required Reading

- docs/blueprint-status.md
- docs/open-questions.md
- docs/conflicts.md
- docs/decision-log.md
- docs/evidence/manual-trials.md
- tasks/sprint-0.md
- tasks/issues/002-define-manual-trial-evidence.md
- tasks/issues/008-decide-skills-sh-directory-discovery.md
- tasks/issues/009-monitor-skills-sh-directory-discovery.md

## Acceptance Criteria

- [x] Resolved manual-trial evidence destination decision is no longer listed as an open founder question.
- [x] Resolved skills.sh release-gate decision is no longer listed as an open founder question.
- [x] Remaining founder-only buyer/user framing question stays open.
- [x] Sprint tracker and source index include this reconciliation task.

## Baseline Evidence

Before this task, `docs/open-questions.md` still listed manual-trial evidence location and skills.sh release-gate status as founder validation questions even though tasks 002, 008, and 009 had already recorded those decisions.

## Verification

- Inspect changed docs and task tracker.
- `rg -n -e 'Where should durable manual trial evidence live' -e 'Is skills.sh directory indexing a release gate' docs tasks`
- `rg -n -e 'primary user' -e 'Resolved Operational Questions' docs/open-questions.md docs/blueprint-status.md`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `docs/open-questions.md`; `docs/blueprint-status.md`; `docs/evidence/manual-trials.md` | baseline | Stale resolved operational questions remained in open-question/status surfaces. |
| 2026-06-23 | Docs reconciliation | pass | Resolved operational decisions moved out of open founder-input state while primary buyer/user framing remained open. |

## Files Changed

- `tasks/issues/010-reconcile-post-release-open-questions.md` - recorded task scope and evidence.
- `tasks/sprint-0.md` - added completed task `010`.
- `docs/open-questions.md` - moved resolved operational questions out of the founder validation batch.
- `docs/blueprint-status.md` - removed resolved input requests and pointed next action at primary user framing.
- `docs/decision-log.md` - recorded durable evidence-location and directory-discovery decisions.
- `docs/evidence/manual-trials.md` - removed stale manual-trial next-evidence note.
- `docs/source-index.md` - indexed this task.

## Verification Summary

- `sed -n '1,180p' docs/open-questions.md` - pass, founder validation batch contains only the primary user framing question and resolved operational questions are separated.
- `rg -n -e 'primary user' -e 'Resolved Operational Questions' -e 'durable manual trial evidence' -e 'post-release discovery limitation' docs/open-questions.md docs/blueprint-status.md docs/decision-log.md` - pass, remaining founder input and resolved decisions are visible in the expected docs.
- `rg -n -e '010 \| Reconcile post-release open questions' -e '010-reconcile-post-release-open-questions' tasks/sprint-0.md docs/source-index.md` - pass, sprint tracker and source index include task `010`.
- `git diff --check` - pass.

## Learning Notes

- Proved: Resolved operational decisions are no longer open founder-input blockers, and the only remaining explicit founder validation item is primary buyer/user framing.
- Simulated: Nothing.
- Test next: Primary buyer/user framing still needs founder input before stronger positioning claims.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: assumption basis, reversibility, learning objective, learning notes
- Trial status: n/a

## Blockers

- None for docs-state reconciliation.

## Follow-Ups

- Founder must decide the primary buyer/user framing before stronger public positioning claims.
