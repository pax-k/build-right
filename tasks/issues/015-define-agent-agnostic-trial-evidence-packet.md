# 015: Define Agent-Agnostic Trial Evidence Packet

Status: complete
Type: documentation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Standardize manual-trial evidence so any agent or human can reproduce the result without reading a chat transcript.
Source under test: repo-local evidence docs and skill templates

## Goal

Define a reusable trial evidence packet shape for Build Right manual trials.

## Non-Goals

- Re-run manual trials.
- Add a database or external evidence system.
- Replace existing task evidence files.

## Required Reading

- docs/evidence/manual-trials.md
- skills/build-right-execution/references/evidence-contract.md
- skills/build-right-preflight/references/artifact-contract.md
- tasks/issues/014-remove-agent-specific-evidence-handles.md

## Acceptance Criteria

- [x] Evidence packet fields are documented in a repo doc or skill evidence contract.
- [x] Packet fields include run label, agent/tool surface, skill source, target, commands, artifacts, result, proved, simulated, unproven, and follow-ups.
- [x] Existing manual-trial evidence can be mapped to the packet without conversation-specific handles.
- [x] Templates or skill instructions point future trial writers at the packet shape.

## Baseline Evidence

Manual-trial evidence exists, but the reusable agent-agnostic packet shape is implicit.

## Verification

- Inspect changed evidence contract docs.
- `rg -n 'run label|agent/tool|proved|simulated|unproven|follow-ups' docs skills`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `docs/evidence/manual-trials.md` | baseline | Manual-trial evidence existed as trial-specific tables, but the reusable packet shape was implicit. |
| 2026-06-23 | `docs/evidence/manual-trials.md#agent-agnostic-trial-evidence-packet` | pass | Durable packet shape added with all required fields and mapping guidance. |
| 2026-06-23 | `skills/build-right-execution/references/evidence-contract.md`; `skills/build-right-preflight/references/artifact-contract.md` | pass | Skill contracts now point future trial writers at the packet shape and forbid dependency on conversation handles. |

## Files Changed

- `docs/evidence/manual-trials.md` - added the agent-agnostic trial evidence packet shape.
- `skills/build-right-execution/references/evidence-contract.md` - added manual-trial packet requirements.
- `skills/build-right-preflight/references/artifact-contract.md` - pointed preflight evidence guidance at the packet shape.
- `tasks/issues/015-define-agent-agnostic-trial-evidence-packet.md` - recorded evidence and completion state.

## Verification Summary

- Inspect `docs/evidence/manual-trials.md` - pass, packet shape is documented with all required fields and mapping guidance.
- Inspect `skills/build-right-execution/references/evidence-contract.md` - pass, execution evidence contract requires an agent-agnostic manual-trial packet.
- Inspect `skills/build-right-preflight/references/artifact-contract.md` - pass, preflight artifact contract points manual trials at the packet shape.
- `rg -n 'run label|agent/tool|proved|simulated|unproven|follow-ups' docs skills` - pass, required field language is present in durable docs and skill contracts.
- `rg -n -e '015 \| Define agent-agnostic trial evidence packet \| complete' -e '016 \| Add deterministic skill-trial verifier \| ready' -e 'next hardening task is `016`' tasks/sprint-0.md docs/blueprint-status.md docs/source-index.md` - pass, tracker and status docs advance to `016`.
- `awk -F'|' '/tasks\/issues\// {gsub(/^ +| +$/,"",$2); count[$2]++} END {for (k in count) if (count[k] > 1) print count[k], k}' docs/source-index.md` - pass, no duplicate task entries printed.
- `git diff --check` - pass.

## Learning Notes

- Proved: Future manual-trial evidence now has a reusable agent-agnostic packet shape, and existing trial evidence can map to it through durable docs and task files.
- Simulated: Nothing.
- Test next: Whether a future manual trial can be summarized from artifacts alone.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: assumption basis, reversibility, learning objective, learning notes
- Trial status: n/a

## Blockers

- None.

## Follow-Ups

- tasks/issues/016-add-deterministic-skill-trial-verifier.md
