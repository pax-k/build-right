# 019: Normalize Manual-Trials Status

Status: complete
Type: documentation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Make the manual-trial evidence document status match the completed trial matrix and define when that evidence becomes stale.
Source under test: docs/evidence/manual-trials.md and release gates

## Goal

Normalize `docs/evidence/manual-trials.md` status and staleness rules.

## Non-Goals

- Re-run manual trials.
- Claim directory indexing.
- Change skill behavior.

## Required Reading

- docs/evidence/manual-trials.md
- docs/release-gates.md
- RELEASE_CHECKLIST.md
- tasks/issues/004-run-blank-project-preflight-trial.md
- tasks/issues/005-run-ready-task-execution-trial.md
- tasks/issues/006-run-not-ready-execution-trial.md
- tasks/issues/007-summarize-existing-project-preflight-evidence.md

## Acceptance Criteria

- [x] Manual trial evidence status matches the current pass matrix.
- [x] The document defines what changes make manual-trial evidence stale.
- [x] Release gates and checklist remain aligned with the normalized status.
- [x] Verification scans prove there is no stale `draft` status for completed manual-trial evidence.

## Baseline Evidence

The manual-trial matrix records pass results, while the document-level status still says draft.

## Verification

- Inspect `docs/evidence/manual-trials.md`.
- `rg -n 'Status: draft|stale|manual trial evidence is complete|Manual trial evidence' docs/evidence/manual-trials.md docs/release-gates.md RELEASE_CHECKLIST.md`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `docs/evidence/manual-trials.md` | baseline | Trial matrix records pass results while document status was `draft`. |
| 2026-06-23 | `docs/evidence/manual-trials.md#staleness-rules` | pass | Added validated status and staleness triggers for skill, template, manifest, package, release-claim, verifier, and evidence-hygiene changes. |
| 2026-06-23 | `docs/release-gates.md`; `RELEASE_CHECKLIST.md` | pass | Release docs now reference validated manual-trial status and staleness rules. |

## Files Changed

- `docs/evidence/manual-trials.md` - normalized status to validated and added staleness rules.
- `docs/release-gates.md` - aligned manual-trial gate with validated status/staleness rules.
- `RELEASE_CHECKLIST.md` - added manual-trial status/staleness checklist row.
- `tasks/post-release-backlog.md` - marked task `019` complete.
- `docs/blueprint-status.md` - updated next action after all AI-owned backlog tasks.
- `docs/source-index.md` - updated manual-trial evidence and task `019` status.
- `tasks/issues/019-normalize-manual-trials-status.md` - recorded evidence and completion state.

## Verification Summary

- Inspect `docs/evidence/manual-trials.md` - pass, document status is `validated`, confidence is high, and staleness rules are defined.
- Inspect `docs/release-gates.md` and `RELEASE_CHECKLIST.md` - pass, release docs/checklist reference validated manual-trial status and staleness rules.
- `rg -n 'Status: draft|stale|manual trial evidence is complete|Manual trial evidence|Staleness Rules|validated' docs/evidence/manual-trials.md docs/release-gates.md RELEASE_CHECKLIST.md` - pass, no `Status: draft` remains in manual-trial evidence and staleness/status language is present.
- `rg -n -e '019 \| Normalize manual-trials status \| complete' -e 'Status: complete-ai-executable' -e 'No AI-owned backlog task is ready' tasks/post-release-backlog.md docs/blueprint-status.md docs/source-index.md` - pass, post-release tracker and status docs show no ready AI-owned backlog task.
- `bun scripts/verify-skill-trials.ts` - pass, 4 verifier checks passed.
- `bun run verify:skill-trials` - pass, package script runs the verifier successfully.
- `rg -n 'codex:/{2}threads|codex_app\\.read_thread' docs tasks` - pass, no forbidden handle instances remain.
- `git diff --check` - pass.

## Learning Notes

- Proved: Manual-trial evidence status now matches the completed pass matrix, and future staleness triggers are explicit.
- Simulated: Nothing.
- Test next: Whether future skill/template changes correctly invalidate or refresh manual-trial evidence.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: assumption basis, reversibility, learning objective, learning notes
- Trial status: n/a

## Blockers

- None.

## Follow-Ups

- Founder must choose primary buyer/user framing before stronger audience-specific public positioning claims.
- Re-run generic GitHub search and skills.sh directory checks before claiming directory indexing.
