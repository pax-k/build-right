# 017: Add Concurrent-Run Safety Rule

Status: complete
Type: documentation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Prevent multiple agents from silently racing on the same tracker or release evidence files.
Source under test: skill workflow docs and execution rules

## Goal

Add an explicit concurrent-run safety rule to Build Right execution guidance.

## Non-Goals

- Build a lock server.
- Prevent all parallel work.
- Change Git behavior or enforce branch policy.

## Required Reading

- docs/execution-rules.md
- skills/build-right-execution/references/workflow.md
- skills/build-right-execution/references/evidence-contract.md
- tasks/sprint-0.md

## Acceptance Criteria

- [x] Execution workflow tells agents to detect active or recent tracker mutations before editing.
- [x] If another run owns the same task/tracker, the rule requires waiting, asking, or switching to observation-only.
- [x] The rule allows parallel work only when task ownership and touched files are disjoint.
- [x] Verification scans prove the rule appears in both repo docs and skill instructions where appropriate.

## Baseline Evidence

Self-adoption runs mutated shared status docs over multiple turns, making stale tracker state possible.

## Verification

- `rg -n 'concurrent|parallel|same tracker|observation-only|task ownership' docs skills`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `docs/execution-rules.md`; `skills/build-right-execution/references/workflow.md` | baseline | No explicit concurrent-run rule existed before this task. |
| 2026-06-23 | Concurrent-run safety rule | pass | Added same task/tracker conflict behavior, observation-only option, and disjoint parallel-work rule. |

## Files Changed

- `docs/execution-rules.md` - added repo-level concurrent run safety rule.
- `skills/build-right-execution/references/workflow.md` - added workflow preflight checks and conflict behavior.
- `tasks/issues/017-add-concurrent-run-safety-rule.md` - recorded evidence and completion state.

## Verification Summary

- `rg -n 'concurrent|parallel|same tracker|observation-only|task ownership' docs skills` - pass, concurrent-run terms appear in repo docs and execution workflow.
- Inspect `docs/execution-rules.md` - pass, repo-level rule covers same task/tracker conflicts, observation-only mode, and disjoint parallel work.
- Inspect `skills/build-right-execution/references/workflow.md` - pass, skill preflight now checks active/recent shared mutations before editing.
- `rg -n -e '017 \| Add concurrent-run safety rule \| complete' -e '018 \| Split post-release backlog from Sprint 0 \| ready' -e 'next hardening task is `018`' tasks/sprint-0.md docs/blueprint-status.md docs/source-index.md` - pass, tracker and status docs advance to `018`.
- `git diff --check` - pass.

## Learning Notes

- Proved: Future execution runs now have explicit same-task/same-tracker conflict behavior and may only do parallel edits when task ownership and touched files are disjoint.
- Simulated: Nothing.
- Test next: Whether future runs stop before conflicting tracker edits.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: assumption basis, reversibility, learning objective, learning notes
- Trial status: n/a

## Blockers

- None.

## Follow-Ups

- tasks/issues/018-split-post-release-backlog-from-sprint-0.md
