# 008: Decide Skills.sh Directory Discovery

Status: complete
Type: release
Owner: founder + AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Decide whether missing skills.sh directory discovery is a release blocker or a post-release follow-up.
Source under test: `bunx skills find build-right`; `gh skill search build-right`

## Goal

Resolve the remaining discovery gate so release messaging can distinguish direct GitHub install readiness from directory search readiness.

## Non-Goals

- Publish a new release unless explicitly chosen.
- Change skill behavior.
- Claim skills.sh directory indexing without live evidence.

## Required Reading

- docs/release-gates.md
- RELEASE_CHECKLIST.md
- docs/evidence/manual-trials.md

## Acceptance Criteria

- [x] Current `bunx skills find build-right` result is recorded.
- [x] Current generic `gh skill search build-right` result is recorded.
- [x] Decision is recorded: release blocker or post-release follow-up.
- [x] `docs/release-gates.md` and `RELEASE_CHECKLIST.md` reflect the decision.

## Baseline Evidence

`docs/release-gates.md` currently marks skills.sh directory search as missing, while direct GitHub install and targeted GitHub skill search are ready.

## Verification

- `bunx skills find build-right`
- `gh skill search build-right --json skillName,repo,path,description,stars`
- Inspect `docs/release-gates.md`.
- Inspect `RELEASE_CHECKLIST.md`.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `bunx skills find build-right` | missing | Command returned `No skills found for "build-right"`. |
| 2026-06-23 | `gh skill search build-right --json skillName,repo,path,description,stars` | missing | Command returned `[]`. |
| 2026-06-23 | `gh skill search preflight --owner pax-k --json skillName,repo,path,description,stars`; `gh skill search execution --owner pax-k --json skillName,repo,path,description,stars` | pass | Targeted owner-scoped search finds `build-right-preflight`; execution query finds both skills. |
| 2026-06-23 | `bunx skills add pax-k/build-right --list` | pass | Direct GitHub install discovery finds both skills from `pax-k/build-right`. |
| 2026-06-23 | Release decision | pass | Missing generic/directory search is a post-release discovery follow-up, not a blocker for published `v0.1.0` direct GitHub install readiness. |
| 2026-06-23 | `rg 'direct-install-ready|post-release-follow-up|009 \\| Monitor skills.sh directory discovery \\| post-release|008 \\| Decide skills.sh directory discovery \\| complete|First blocker: none|No-go: Claiming generic|No skills found|returns `\\[\\]`' docs RELEASE_CHECKLIST.md tasks` | pass | Status-bearing docs reflect direct-install readiness, post-release directory discovery follow-up, and task `009`. |
| 2026-06-23 | `git diff --check` | pass | No whitespace errors. |

## Files Changed

- `docs/release-gates.md` - marked direct install ready and directory discovery as post-release follow-up.
- `RELEASE_CHECKLIST.md` - documented generic search and skills.sh discovery as post-release follow-ups.
- `tasks/sprint-0.md` - marked task `008` complete and added task `009` as post-release follow-up.
- `docs/blueprint-status.md` - updated current status and next action.
- `docs/source-index.md` - updated task `008` and indexed task `009`.
- `tasks/issues/008-decide-skills-sh-directory-discovery.md` - recorded evidence and completion state.
- `tasks/issues/009-monitor-skills-sh-directory-discovery.md` - follow-up for future discovery checks.

## Verification Summary

- `bunx skills find build-right` - missing, no directory results.
- `gh skill search build-right --json skillName,repo,path,description,stars` - missing, returns `[]`.
- `gh skill search preflight --owner pax-k --json skillName,repo,path,description,stars` - pass, finds `build-right-preflight`.
- `gh skill search execution --owner pax-k --json skillName,repo,path,description,stars` - pass, finds both skills.
- `bunx skills add pax-k/build-right --list` - pass, direct install discovery finds both skills.
- `rg 'direct-install-ready|post-release-follow-up|009 \\| Monitor skills.sh directory discovery \\| post-release|008 \\| Decide skills.sh directory discovery \\| complete|First blocker: none|No-go: Claiming generic|No skills found|returns `\\[\\]`' docs RELEASE_CHECKLIST.md tasks` - pass.
- `git diff --check` - pass.

## Learning Notes

- Proved: Direct GitHub install and owner-scoped GitHub skill search are ready.
- Simulated: Directory indexing timing or external directory behavior remains outside this repo's direct control.
- Test next: Re-run generic and skills.sh discovery later before claiming directory indexing.

## Skill Trial Notes

- Source under test: `bunx skills find build-right`; `gh skill search build-right`
- Source comparison: not applicable
- Contract markers checked: live command evidence, release decision, release gate state
- Trial status: pass

## Blockers

- None for direct GitHub install readiness.

## Follow-Ups

- tasks/issues/009-monitor-skills-sh-directory-discovery.md
