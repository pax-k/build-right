# <ID>: Define Directory Structure and Ownership Map

Status: ready
Type: architecture
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: make the project layout understandable enough for bounded AI execution
Source under test: repo-local path

## Goal

Document the directory structure, ownership map, generated-file boundaries, and
where future tasks should place code, docs, tests, fixtures, and evidence.

## Non-Goals

- Move files unless the selected task explicitly requires it.
- Create a new monorepo layout by default.
- Override established project conventions.

## Required Reading

- AGENTS.md
- README.md
- docs/source-index.md
- package manifests and workspace configuration
- existing docs, tasks, and generated artifacts

## Acceptance Criteria

- [ ] Important directories are mapped to their purpose.
- [ ] Generated or external artifacts are identified.
- [ ] Ownership or review boundaries are recorded.
- [ ] Placement rules for future code, docs, tests, fixtures, and evidence are
  documented.

## Baseline Evidence

Record current directory inventory and any existing ownership or workspace
configuration before editing docs.

## Verification

- Inspect the directory map.
- Confirm it preserves existing conventions and does not force unrelated moves.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Learning Notes

- Proved: <what structure evidence supports>
- Simulated: <what remains unproven>
- Test next: <structure or ownership follow-up>

## Blockers

- None yet.

## Follow-Ups

- None yet.
