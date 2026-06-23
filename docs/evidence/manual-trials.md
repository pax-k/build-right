# Manual Trial Evidence

Status: validated
Owner: founder + AI
Confidence: high
Last updated: 2026-06-23

## Summary

Manual trial evidence for Build Right lives here. Each trial should record the
run label, target path, commands, generated or changed files, result, and any
follow-up issue.

## Agent-Agnostic Trial Evidence Packet

Use this packet shape for every manual trial summary so the result can be
understood without an agent transcript or conversation handle.

| Field | Required Content |
| --- | --- |
| Run label | Stable label for the trial, including date and trial type. |
| Agent/tool surface | Invocation surface, such as Codex skill invocation, CLI command, or local script. |
| Skill source | Repo-local path, installed user-scope path, GitHub source, or release tag under test. |
| Target | Scratch path, repository path, task path, or release artifact under test. |
| Commands | Commands or manual invocation steps that produced the result. |
| Artifacts | Generated files, changed files, reports, logs, screenshots, or durable summaries kept as evidence. |
| Result | `pass`, `partial`, `fail`, or `skipped`, with reason. |
| Proved | What the evidence directly supports. |
| Simulated | What was mocked, inferred, or not exercised live. |
| Unproven | Claims the trial does not establish. |
| Follow-ups | Task files or decisions required after the trial. |

Existing trial rows map to this packet through each trial table plus the linked
task evidence file. Use task files for detailed command output and this document
for the durable matrix and summary.

## Staleness Rules

Manual trial evidence remains valid for the current `v0.1.0` direct-install
readiness claim until one of these changes occurs:

- `skills/build-right-preflight/` behavior, templates, or artifact contract
  changes in a way that affects preflight output.
- `skills/build-right-execution/` behavior, templates, or evidence contract
  changes in a way that affects execution output.
- `skills.sh.json`, install paths, or release packaging changes.
- Release claims expand beyond direct GitHub install and completed manual-trial
  coverage.
- Generic GitHub search or skills.sh directory discovery starts being claimed
  as ready.
- A verifier or manual inspection finds stale source-under-test evidence,
  forbidden agent-specific handles, or missing required packet fields.

If any staleness trigger applies, create a new task before advancing release
claims. Mark affected trial rows `partial-needs-rerun` or `stale` until current
evidence is captured.

## Trial Matrix

| Trial | Status | Evidence Path | Required Follow-Up |
| --- | --- | --- | --- |
| Blank-project preflight | pass | `docs/evidence/manual-trials.md#blank-project-preflight` | `tasks/issues/004-run-blank-project-preflight-trial.md` |
| Existing-project preflight | pass | `docs/evidence/manual-trials.md#existing-project-preflight` | `tasks/issues/007-summarize-existing-project-preflight-evidence.md` |
| Ready-task execution | pass | `docs/evidence/manual-trials.md#ready-task-execution` | `tasks/issues/005-run-ready-task-execution-trial.md` |
| Not-ready execution | pass | `docs/evidence/manual-trials.md#not-ready-execution` | `tasks/issues/006-run-not-ready-execution-trial.md` |

## Blank-Project Preflight

| Date | Scratch Target | Invocation | Result | Evidence | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-06-23 | `/tmp/build-right-blank-preflight-trial-20260623` | `$build-right-preflight` manual trial using the installed user-scope skill | partial | `tasks/issues/004-run-blank-project-preflight-trial.md` | Created starter `docs/` and `tasks/` scaffold, classified project as `blank/new`, and blocked product feature work. Later comparison showed the installed skill was stale versus repo-local templates: output missed `Source mode`, `Prototype confidence`, `Prototype assumptions labeled`, `Assumption basis`, `Reversibility`, `Learning objective`, and `Learning Notes`. |
| 2026-06-23 | `/tmp/build-right-blank-preflight-trial-20260623-rerun` | `$build-right-preflight` manual trial after syncing installed user-scope skill from repo-local source | pass | `tasks/issues/004-run-blank-project-preflight-trial.md` | Installed user-scope templates matched repo-local templates before rerun. Scratch output included `Source mode`, `Prototype confidence`, `Prototype assumptions labeled`, `Assumption basis`, `Reversibility`, `Learning objective`, and `Learning Notes`, while still blocking product feature work behind Sprint 0. |

## Existing-Project Preflight

| Date | Target | Invocation | Result | Evidence | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-06-23 | `/Users/pax/Documents/Repos/build-right` | `$build-right-preflight` | pass | `docs/evidence/manual-trials.md#existing-project-preflight`; `tasks/issues/007-summarize-existing-project-preflight-evidence.md` | Existing-project preflight classified the repo as existing, preserved README/blueprints/skill source, created the `docs/` and `tasks/` operating layer, ran local validation, and ended with Sprint 0 readiness while keeping product-feature/release overclaims blocked. |

### Existing-Project Preflight Summary

The self-adoption run used `build-right-preflight` against this repository rather than a blank scratch target. It found meaningful existing structure: README, release checklist, package metadata, top-level blueprint/design docs, `skills.sh.json`, and the two skill source trees. It therefore treated the project as `existing`, preserved those sources, and added an operating layer instead of replacing the project structure.

Evidence created or updated by the run:

- `docs/blueprint-status.md`
- `docs/source-index.md`
- `docs/conflicts.md`
- `docs/open-questions.md`
- `docs/decision-log.md`
- `docs/execution-rules.md`
- `docs/release-gates.md`
- `tasks/sprint-0.md`
- `tasks/issues/001-establish-execution-baseline.md`
- `tasks/issues/002-define-manual-trial-evidence.md`
- `tasks/issues/003-align-public-blueprint-terminology.md`

What this proves:

- Preflight can inventory an existing skills repo and avoid overwriting useful source material.
- Preflight can create a resume/status layer, source index, release gates, operating rules, and Sprint 0 tracker.
- Preflight can run and record local baseline checks: local skill discovery, manifest parsing, frontmatter/path checks, empty skill directory check, unresolved-marker scan, and `git diff --check`.
- Preflight correctly blocks product-feature readiness while founder validation, broader positioning, and release/manual-trial evidence remain incomplete.

What remains unproven:

- This summary is repo/self-adoption evidence, not customer validation.
- It does not prove skills.sh directory indexing.
- It does not prove market demand or founder/buyer positioning.

## Ready-Task Execution

| Date | Target Task | Invocation | Result | Evidence | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-06-23 | `tasks/issues/005-run-ready-task-execution-trial.md` | `$build-right-execution` against a ready release/manual-trial tracker task | pass | `tasks/issues/005-run-ready-task-execution-trial.md` | Installed execution skill matched repo-local source. The task recorded source under test, baseline evidence, verification, learning notes, and updated manual-trial/release/sprint trackers. |

## Not-Ready Execution

| Date | Target Project Or Task | Invocation | Result | Evidence | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-06-23 | `/tmp/build-right-not-ready-execution-trial-20260623` | `$build-right-execution` against a project with no authority docs, no task tracker, and no selected task | pass | `tasks/issues/006-run-not-ready-execution-trial.md` | Installed execution skill matched repo-local source. The trial created only `tasks/sprint-0.md` and `tasks/issues/001-establish-execution-baseline.md`, included current execution contract fields, and blocked product feature work. |

## Evidence State

- Manual trial evidence is complete for the current `v0.1.0` direct-install readiness claim.
- Manual trial evidence status is validated against the current pass matrix.
- Generic GitHub search and skills.sh directory discovery remain separate discovery limitations, not manual-trial gaps.
