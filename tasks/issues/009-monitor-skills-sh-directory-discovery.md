# 009: Monitor Skills.sh Directory Discovery

Status: complete
Type: release
Owner: founder + AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Re-check generic GitHub skill search and skills.sh directory search before making directory-indexing claims.
Source under test: `bunx skills find build-right`; `gh skill search build-right`

## Goal

Monitor whether Build Right appears in generic GitHub skill search or the skills.sh directory after publication/indexing delay.

## Non-Goals

- Block direct GitHub install release claims.
- Change skill behavior.
- Claim directory indexing without live evidence.

## Required Reading

- docs/release-gates.md
- RELEASE_CHECKLIST.md
- tasks/issues/008-decide-skills-sh-directory-discovery.md

## Acceptance Criteria

- [x] Re-run generic `gh skill search build-right`.
- [x] Re-run `bunx skills find build-right`.
- [x] Update release gates and checklist if either discovery surface starts finding both skills.

## Baseline Evidence

As of 2026-06-23, direct GitHub install works, targeted owner-scoped GitHub skill search works, generic `gh skill search build-right` returns `[]`, and `bunx skills find build-right` returns no skills.

## Verification

- `gh skill search build-right --json skillName,repo,path,description,stars`
- `bunx skills find build-right`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `gh skill search build-right --json skillName,repo,path,description,stars` | missing | Command returned `[]`; generic search still does not find either Build Right skill. |
| 2026-06-23 | `bunx skills find build-right` | missing | Command returned `No skills found for "build-right"`; skills.sh directory discovery still does not find either Build Right skill. |
| 2026-06-23 | Release gate decision | pass | No release gate/checklist claim was advanced because neither discovery surface found both skills. Direct GitHub install remains ready; directory indexing remains unproven. |

## Files Changed

- `tasks/issues/009-monitor-skills-sh-directory-discovery.md` - recorded fresh monitor evidence.
- `tasks/sprint-0.md` - marked the monitor task complete.
- `docs/release-gates.md` - pointed directory discovery gates at the fresh monitor evidence.
- `RELEASE_CHECKLIST.md` - refreshed the live evidence notes for generic and directory discovery.
- `docs/blueprint-status.md` - updated the next action after the monitor run.
- `docs/source-index.md` - marked the monitor task validated.

## Verification Summary

- `gh skill search build-right --json skillName,repo,path,description,stars` - missing, returns `[]`.
- `bunx skills find build-right` - missing, returns `No skills found for "build-right"`.

## Learning Notes

- Proved: As of this monitor run, direct GitHub install remains the only proven generic install path; generic GitHub skill search and skills.sh directory discovery are still not proven.
- Simulated: Nothing; both discovery checks were live command results.
- Test next: Re-run these discovery checks before making directory-indexing or generic-search claims.

## Skill Trial Notes

- Source under test: `bunx skills find build-right`; `gh skill search build-right`
- Source comparison: not applicable
- Contract markers checked: live command evidence, release gate state, checklist state
- Trial status: pass

## Blockers

- External indexing/search availability blocks only generic-search and skills.sh directory claims.

## Follow-Ups

- Re-run discovery checks before claiming generic GitHub search coverage or skills.sh directory indexing.
