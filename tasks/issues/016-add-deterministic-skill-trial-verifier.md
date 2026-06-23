# 016: Add Deterministic Skill-Trial Verifier

Status: complete
Type: validation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Reduce manual release-check drift by making core skill-trial evidence checks executable.
Source under test: repo-local validation scripts and docs

## Goal

Add a Bun-based verifier for Build Right skill-trial readiness and evidence hygiene.

## Non-Goals

- Replace manual product judgment.
- Publish or install skills automatically.
- Depend on Node.js, npm, pnpm, or Vite.

## Required Reading

- AGENTS.md
- docs/release-gates.md
- docs/evidence/manual-trials.md
- skills/build-right-execution/references/evidence-contract.md
- tasks/issues/014-remove-agent-specific-evidence-handles.md
- tasks/issues/015-define-agent-agnostic-trial-evidence-packet.md

## Acceptance Criteria

- [x] A Bun script checks skill frontmatter, manifest paths, required contract markers, and forbidden agent-specific evidence handles.
- [x] The script can be run locally with `bun`.
- [x] Release gates or checklist reference the verifier.
- [x] The verifier passes on the current repo state after required evidence cleanup.

## Baseline Evidence

Current validation relies on separate manual commands and ad hoc `rg` scans.

## Verification

- `bun <verifier-script>`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `scripts/verify-skill-trials.ts` | pass | Added Bun verifier for manifest/frontmatter, contract markers, forbidden evidence handles, and release-gate wiring. |
| 2026-06-23 | `bun scripts/verify-skill-trials.ts` | fail/pass | Initial run caught a remaining literal forbidden handle pattern in task `014`; after cleanup, the verifier passed all 4 checks. |
| 2026-06-23 | `bun run verify:skill-trials` | pass | Package script runs the verifier successfully. |

## Files Changed

- `scripts/verify-skill-trials.ts` - Bun-based deterministic skill-trial verifier.
- `package.json` - added `verify:skill-trials` Bun script.
- `docs/release-gates.md` - referenced the verifier as a release evidence gate.
- `RELEASE_CHECKLIST.md` - added verifier to local validation checklist.
- `tasks/issues/014-remove-agent-specific-evidence-handles.md` - removed a literal forbidden handle pattern from the task's own scan command text.
- `tasks/issues/016-add-deterministic-skill-trial-verifier.md` - recorded evidence and completion state.

## Verification Summary

- `bun scripts/verify-skill-trials.ts` - pass, 4 verifier checks passed.
- `bun run verify:skill-trials` - pass, package script runs the same verifier.
- `rg -n 'codex:/{2}threads|codex_app\\.read_thread' docs tasks` - pass, no forbidden handle instances remain.
- `git diff --check` - pass.

## Learning Notes

- Proved: Core skill-trial evidence hygiene now has a deterministic Bun verifier covering manifest/frontmatter, contract markers, forbidden handles, and release-gate wiring.
- Simulated: Nothing.
- Test next: Whether the verifier catches stale evidence or missing contract markers before release claims advance.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: assumption basis, reversibility, learning objective, learning notes
- Trial status: n/a

## Blockers

- None.

## Follow-Ups

- tasks/issues/017-add-concurrent-run-safety-rule.md
