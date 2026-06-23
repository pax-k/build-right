# 003: Align Public Blueprint Terminology

Status: complete
Type: docs
Owner: AI

## Goal

Align older top-level blueprint terminology with the current skill contract, especially the distinction between `repo-evidence-backed`, `public-evidence-backed`, and `customer-evidence-backed`.

## Non-Goals

- Rewrite the skill behavior.
- Change release positioning.
- Remove useful historical design context.

## Required Reading

- pre-execution-blueprint.md
- agent-skills-research-delegation-design.md
- skills/build-right-preflight/references/artifact-contract.md
- docs/conflicts.md

## Acceptance Criteria

- [x] Public-facing or authoritative docs use the current claim status vocabulary.
- [x] Historical design notes remain intact if the founder wants them preserved as internal notes.
- [x] `docs/conflicts.md` is updated with the resolution.

## Baseline Evidence

Treat top-level blueprint docs as source/design notes unless promoted into public documentation.

## Verification

- `rg 'repo-evidence-backed|public-evidence-backed|customer-evidence-backed' agent-skills-research-delegation-design.md skills/build-right-preflight skills/build-right-execution`
- Inspect `docs/conflicts.md`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `rg 'repo-evidence-backed|public-evidence-backed|customer-evidence-backed' skills/build-right-preflight skills/build-right-execution agent-skills-research-delegation-design.md` | pass | Skill contracts and design reference include repository, public, and customer evidence distinctions. |
| 2026-06-23 | `docs/conflicts.md` | pass | Terminology conflict resolved by making skill contracts authoritative and keeping top-level blueprints as source/design notes. |

## Blockers

- None.

## Follow-Ups

- Run a later public-doc cleanup if the blueprint docs are promoted from design notes to public docs.
