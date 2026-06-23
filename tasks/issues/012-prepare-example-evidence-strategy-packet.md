# 012: Prepare Example Evidence Strategy Packet

Status: complete
Type: documentation
Owner: AI

Assumption basis: repo-evidence-backed
Reversibility: easy
Learning objective: Clarify the tradeoff between checked-in example projects and release checklist/manual-trial evidence without changing release scope.
Source under test: repo-local docs and directory shape

## Goal

Prepare an evidence-backed decision packet for whether Build Right should add a checked-in example project or keep `v0.1.0` evidence in release checklist, manual trial evidence, and task logs.

## Non-Goals

- Add a checked-in example project.
- Change release readiness or public install claims.
- Change README or public positioning.
- Replace manual trial evidence.

## Required Reading

- docs/open-questions.md
- docs/evidence/manual-trials.md
- docs/release-gates.md
- RELEASE_CHECKLIST.md
- tasks/sprint-0.md

## Acceptance Criteria

- [x] Current absence of checked-in example directories is recorded.
- [x] Current evidence model is summarized.
- [x] Options for checked-in examples versus release evidence are listed with tradeoffs.
- [x] Sprint tracker and source index include this task.

## Baseline Evidence

`docs/open-questions.md` asked whether there should be a checked-in example project or only release checklist evidence. `find . -maxdepth 3 -type d \( -name 'examples' -o -name 'demo' -o -name 'demos' -o -name 'fixtures' \) -print` returned no matching example/demo directories.

## Verification

- Inspect `docs/open-questions.md`.
- `rg -n -e 'Example Evidence Strategy Packet' -e 'Current evidence model' -e 'No checked-in example project exists' docs/open-questions.md tasks/issues/012-prepare-example-evidence-strategy-packet.md`
- `rg -n -e '012 \| Prepare example evidence strategy packet' -e '012-prepare-example-evidence-strategy-packet' tasks/sprint-0.md docs/source-index.md docs/blueprint-status.md`
- `git diff --check`

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-06-23 | `find . -maxdepth 3 -type d \( -name 'examples' -o -name 'demo' -o -name 'demos' -o -name 'fixtures' \) -print` | baseline | No checked-in example, demo, or fixture directories were found. |
| 2026-06-23 | `docs/evidence/manual-trials.md`; `docs/release-gates.md`; `RELEASE_CHECKLIST.md` | pass | Current direct-install readiness is backed by manual trials, release gates, and task evidence rather than checked-in example projects. |

## Files Changed

- `tasks/issues/012-prepare-example-evidence-strategy-packet.md` - recorded task scope and evidence.
- `docs/open-questions.md` - added the example evidence strategy packet.
- `tasks/sprint-0.md` - added completed task `012`.
- `docs/source-index.md` - indexed this task.
- `docs/blueprint-status.md` - included the new decision packet in next-action guidance.

## Verification Summary

- `sed -n '1,260p' docs/open-questions.md` - pass, example evidence strategy packet lists current evidence model, options, tradeoffs, and a no-scope-change guardrail.
- `rg -n -e 'Example Evidence Strategy Packet' -e 'Current evidence model' -e 'No checked-in example project exists' docs/open-questions.md tasks/issues/012-prepare-example-evidence-strategy-packet.md` - pass.
- `rg -n -e '012 \| Prepare example evidence strategy packet' -e '012-prepare-example-evidence-strategy-packet' tasks/sprint-0.md docs/source-index.md docs/blueprint-status.md` - pass.
- `git diff --check` - pass.

## Learning Notes

- Proved: Current `v0.1.0` direct-install readiness is already supported by release gates, manual trials, and task evidence; no checked-in example project exists or is required by current release gates.
- Simulated: Nothing.
- Test next: Decide whether an example project is needed for onboarding/public docs, or keep examples out of `v0.1.0` release scope.

## Skill Trial Notes

- Source comparison: not applicable
- Contract markers checked: assumption basis, reversibility, learning objective, learning notes
- Trial status: n/a

## Blockers

- None for decision-packet preparation.

## Follow-Ups

- Choose whether to add a checked-in example project as a future task, or explicitly keep `v0.1.0` evidence in manual trials and release gates only.
