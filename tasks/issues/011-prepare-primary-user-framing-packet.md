# 011: Prepare Primary User Framing Packet

Status: complete
Type: documentation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Make the founder-owned primary user decision concrete without changing public positioning.
Source under test: repo-local docs

## Goal

Prepare an evidence-backed decision packet for the unresolved primary buyer/user framing question.

## Non-Goals

- Choose the primary user.
- Change README or public-facing positioning.
- Claim customer validation or market demand.
- Run public web research.

## Required Reading

- docs/open-questions.md
- docs/conflicts.md
- docs/blueprint-status.md
- README.md
- pre-execution-blueprint.md
- agent-skills-blueprint-design.md
- agent-skills-research-delegation-design.md

## Acceptance Criteria

- [x] Current audience candidates are listed with repo evidence.
- [x] Founder decision needed is reduced to a concrete choice.
- [x] No audience-specific public positioning is claimed.
- [x] Sprint tracker and source index include this task.

## Baseline Evidence

`docs/open-questions.md` asked who the primary user is, and `docs/conflicts.md` recorded broad MVP buyer/user framing across founder/product owner, Codex user, AI-assisted builder, and agent-skill author.

## Verification

- Inspect `docs/open-questions.md`.
- `rg -n -e 'Primary User Framing Packet' -e 'Founder decision needed' -e 'No audience-specific public positioning is claimed' docs/open-questions.md tasks/issues/011-prepare-primary-user-framing-packet.md`
- `rg -n -e '011 \| Prepare primary user framing packet' -e '011-prepare-primary-user-framing-packet' tasks/sprint-0.md docs/source-index.md`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `rg -n "founder|builder|Codex|skill author|product owner|startup|buyer|user|audience|position" README.md pre-execution-blueprint.md execution-blueprint.md agent-skills-blueprint-design.md agent-skills-research-delegation-design.md docs skills -g '*.md'` | baseline | Repo sources contain multiple plausible audience framings. |
| 2026-06-23 | `README.md`; `pre-execution-blueprint.md`; `agent-skills-blueprint-design.md`; `agent-skills-research-delegation-design.md` | pass | Extracted audience candidates from repo-local source docs only. |

## Files Changed

- `tasks/issues/011-prepare-primary-user-framing-packet.md` - recorded task scope and evidence.
- `docs/open-questions.md` - added a primary user framing decision packet.
- `tasks/sprint-0.md` - added completed task `011`.
- `docs/source-index.md` - indexed this task.
- `docs/blueprint-status.md` - pointed next action at choosing from the prepared framing packet.

## Verification Summary

- `sed -n '1,220p' docs/open-questions.md` - pass, decision packet lists candidates, evidence, best fit, risks, and a no-claim guardrail.
- `rg -n -e 'Primary User Framing Packet' -e 'Founder decision needed' -e 'No audience-specific public positioning is claimed' docs/open-questions.md tasks/issues/011-prepare-primary-user-framing-packet.md` - pass.
- `rg -n -e '011 \| Prepare primary user framing packet' -e '011-prepare-primary-user-framing-packet' tasks/sprint-0.md docs/source-index.md docs/blueprint-status.md` - pass.
- `git diff --check` - pass.

## Learning Notes

- Proved: The repo now has a concrete founder decision packet for primary user framing, without changing public positioning or claiming customer validation.
- Simulated: Nothing.
- Test next: Founder must choose the primary user before audience-specific public copy changes.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: assumption basis, reversibility, learning objective, learning notes
- Trial status: n/a

## Blockers

- Founder decision required for primary buyer/user framing.

## Follow-Ups

- Founder selects one primary framing option or explicitly keeps broad positioning for `v0.1.0`.
