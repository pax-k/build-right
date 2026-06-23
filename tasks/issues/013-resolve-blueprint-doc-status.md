# 013: Resolve Blueprint Doc Status

Status: complete
Type: documentation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Reconcile the remaining parking-lot question about top-level blueprint docs with the existing conflict resolution.
Source under test: repo-local docs

## Goal

Record that top-level blueprint docs are source/design notes after `v0.1.0` unless explicitly promoted into stable public documentation.

## Non-Goals

- Rewrite top-level blueprint docs.
- Change README or public positioning.
- Change skill behavior.
- Choose primary buyer/user framing.

## Required Reading

- docs/open-questions.md
- docs/conflicts.md
- docs/source-index.md
- docs/decision-log.md
- tasks/issues/003-align-public-blueprint-terminology.md

## Acceptance Criteria

- [x] Stale parking-lot question about blueprint doc status is removed or resolved.
- [x] Resolution points to existing repo evidence.
- [x] Top-level blueprint docs remain unchanged.
- [x] Sprint tracker and source index include this task.

## Baseline Evidence

`docs/open-questions.md` still asked whether top-level blueprint docs should be stable public docs or internal design notes after `v0.1.0`. `docs/conflicts.md` and `tasks/issues/003-align-public-blueprint-terminology.md` already resolved that top-level blueprints should be treated as source/design notes unless promoted.

## Verification

- Inspect `docs/open-questions.md`.
- Inspect `docs/decision-log.md`.
- `rg -n -e 'Top-level blueprint docs' -e 'source/design notes unless explicitly promoted' docs/open-questions.md docs/decision-log.md tasks/issues/013-resolve-blueprint-doc-status.md`
- `rg -n -e '013 \| Resolve blueprint doc status' -e '013-resolve-blueprint-doc-status' tasks/sprint-0.md docs/source-index.md docs/blueprint-status.md`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `docs/conflicts.md` | baseline | Conflict row already says to treat top-level blueprints as source/design notes unless promoted. |
| 2026-06-23 | `tasks/issues/003-align-public-blueprint-terminology.md` | baseline | Task `003` recorded the same source/design-note resolution. |
| 2026-06-23 | `docs/open-questions.md` | stale | Parking lot still listed the resolved blueprint doc status question. |

## Files Changed

- `tasks/issues/013-resolve-blueprint-doc-status.md` - recorded task scope and evidence.
- `docs/open-questions.md` - moved blueprint doc status into resolved operational questions.
- `docs/decision-log.md` - recorded durable blueprint doc status decision.
- `tasks/sprint-0.md` - added completed task `013`.
- `docs/source-index.md` - indexed this task.
- `docs/blueprint-status.md` - added the completed task and clarified next action.

## Verification Summary

- `sed -n '1,240p' docs/open-questions.md` - pass, parking lot is empty and blueprint doc status is listed under resolved operational questions.
- `sed -n '1,180p' docs/decision-log.md` - pass, durable decision recorded.
- `rg -n -e 'Top-level blueprint docs' -e 'source/design notes unless explicitly promoted' docs/open-questions.md docs/decision-log.md tasks/issues/013-resolve-blueprint-doc-status.md` - pass.
- `rg -n -e '013 \| Resolve blueprint doc status' -e '013-resolve-blueprint-doc-status' tasks/sprint-0.md docs/source-index.md docs/blueprint-status.md` - pass.
- `git diff --check` - pass.

## Learning Notes

- Proved: Top-level blueprint docs are now explicitly treated as source/design notes unless a future task promotes them into stable public docs.
- Simulated: Nothing.
- Test next: Promote any top-level blueprint into stable public docs only through a separate explicit task.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: assumption basis, reversibility, learning objective, learning notes
- Trial status: n/a

## Blockers

- None for blueprint doc status reconciliation.

## Follow-Ups

- Primary buyer/user framing remains founder-owned.
