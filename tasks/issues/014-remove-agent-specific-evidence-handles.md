# 014: Remove Agent-Specific Evidence Handles

Status: complete
Type: documentation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Make release and trial evidence portable across agents by replacing conversation-specific handles with durable artifacts.
Source under test: repo-local docs and task tracker

## Goal

Remove agent-specific conversation handles from durable docs and task evidence, replacing them with reusable evidence summaries, artifact paths, commands, and task references.

## Non-Goals

- Delete useful trial evidence.
- Re-run manual trials.
- Change release readiness claims.
- Publish a new release.

## Required Reading

- docs/evidence/manual-trials.md
- docs/release-gates.md
- tasks/issues/002-define-manual-trial-evidence.md
- tasks/issues/007-summarize-existing-project-preflight-evidence.md

## Acceptance Criteria

- [x] Durable repository docs no longer include agent-specific conversation URLs or IDs.
- [x] Existing-project preflight evidence points to durable task/evidence summaries instead.
- [x] Release gates remain accurate after the replacement.
- [x] A scan command proves forbidden conversation-handle patterns are absent from durable docs/tasks, except this task if needed to describe the check.

## Baseline Evidence

Current docs and tasks still include agent-specific conversation handles in manual-trial and existing-project preflight evidence.

## Verification

- `rg -n 'codex:/{2}threads|thread pointer|conversation URL|conversation handle' docs tasks`
- `rg -n 'codex:/{2}threads|thread pointer|conversation URL|conversation handle' docs tasks -g '!tasks/issues/014-remove-agent-specific-evidence-handles.md'`
- Inspect `docs/evidence/manual-trials.md`.
- Inspect `docs/release-gates.md`.
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `rg -n 'codex:/{2}threads|thread pointer|conversation URL|conversation handle' docs tasks` | baseline | Found agent-specific handles/language in `docs/release-gates.md`, `docs/evidence/manual-trials.md`, and tasks `002`/`007`. |
| 2026-06-23 | Durable evidence replacement | pass | Existing-project preflight evidence now points at `docs/evidence/manual-trials.md#existing-project-preflight`, generated `docs/` and `tasks/` artifacts, and task `007` instead of an agent-specific conversation handle. |

## Files Changed

- `docs/evidence/manual-trials.md` - replaced conversation handle evidence with durable evidence section and task reference.
- `docs/release-gates.md` - removed agent-specific existing-project trial handle from the gate proof.
- `tasks/issues/002-define-manual-trial-evidence.md` - replaced the self-adoption handle with a portable run label.
- `tasks/issues/007-summarize-existing-project-preflight-evidence.md` - replaced handle-dependent wording with repo-local artifact evidence.
- `tasks/issues/014-remove-agent-specific-evidence-handles.md` - recorded evidence and completion state.

## Verification Summary

- `rg -n 'codex:/{2}threads|thread pointer|conversation URL|conversation handle' docs tasks -g '!tasks/issues/014-remove-agent-specific-evidence-handles.md'` - pass, no forbidden handle patterns remain outside this task.
- Inspect `docs/evidence/manual-trials.md` - pass, existing-project preflight evidence points at durable evidence section and task `007`.
- Inspect `docs/release-gates.md` - pass, existing-project preflight gate points at durable evidence and task artifacts.
- `rg -n -e '014 \| Remove agent-specific evidence handles \| complete' -e '015 \| Define agent-agnostic trial evidence packet \| ready' -e 'next hardening task is `015`' tasks/sprint-0.md docs/blueprint-status.md docs/source-index.md` - pass, tracker and status docs advance to `015`.
- `git diff --check` - pass.

## Learning Notes

- Proved: Durable docs and task evidence no longer depend on agent-specific conversation handles for the existing-project preflight trial.
- Simulated: Nothing.
- Test next: Whether existing manual-trial evidence is understandable without any agent-specific conversation handle.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: assumption basis, reversibility, learning objective, learning notes
- Trial status: n/a

## Blockers

- None.

## Follow-Ups

- tasks/issues/015-define-agent-agnostic-trial-evidence-packet.md
