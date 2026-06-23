# Blueprint Status

Status: direct-install-ready
Project state: existing
Source mode: founder-fed
Prototype confidence: n/a
Last updated: 2026-06-23

## Readiness

| Gate | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Founder intent captured | needs-founder | README.md; pre-execution-blueprint.md; execution-blueprint.md; agent-skills-blueprint-design.md | Existing docs define the two-skill concept and operating philosophy. Founder validation still needed for primary buyer/user framing. |
| Claims tagged | needs-validation | docs/source-index.md; docs/open-questions.md | Repo-local release and package claims are tagged as `repo-evidence-backed`; broader positioning claims still need founder/customer validation before stronger status. |
| Prototype assumptions labeled | ready | agent-skills-research-delegation-design.md; skills/build-right-preflight/references/artifact-contract.md | Source modes, `prototype-assumption`, and `repo-evidence-backed` are now documented in the skill contract. |
| Evidence recorded | ready | README.md; RELEASE_CHECKLIST.md; docs/release-gates.md; tasks/issues/001-establish-execution-baseline.md | Repo evidence exists for package shape, validation, publication, and installation. Customer or external market evidence is not recorded. |
| Canonical docs exist | draft | README.md; pre-execution-blueprint.md; execution-blueprint.md; agent-skills-blueprint-design.md; agent-skills-research-delegation-design.md | Canonical content currently lives in top-level source/design docs rather than a full product-doc set. |
| Conflicts resolved | needs-validation | docs/conflicts.md | Release-readiness and terminology conflicts are resolved; primary user framing still needs founder decision. |
| MVP extracted | ready | README.md; skills.sh.json; skills/ | Current released MVP is two installable skills plus split references, templates, and read-only helper scripts. |
| Manual ops understood | ready | RELEASE_CHECKLIST.md; docs/release-gates.md; docs/evidence/manual-trials.md; tasks/issues/002-define-manual-trial-evidence.md; tasks/issues/007-summarize-existing-project-preflight-evidence.md | Manual trial categories, durable evidence paths, validated status, and staleness rules are defined. |
| Operating rules exist | ready | AGENTS.md; docs/execution-rules.md; docs/release-gates.md | Bun rules and execution/release gates are documented. |
| First task is bounded and verifiable | complete | tasks/issues/001-establish-execution-baseline.md | Baseline validation task is complete. |

## Current File Plan

### Create

- docs/blueprint-status.md - preflight resume point and readiness gate.
- docs/source-index.md - index existing source and authority documents.
- docs/conflicts.md - track contradictions and unresolved scope risks.
- docs/open-questions.md - founder validation questions.
- docs/decision-log.md - durable decisions with evidence paths.
- docs/evidence/manual-trials.md - durable manual trial evidence matrix.
- docs/execution-rules.md - AI execution authority and evidence destinations.
- docs/release-gates.md - validation and release proof gates.
- tasks/sprint-0.md - Sprint 0 tracker.
- tasks/post-release-backlog.md - post-release discovery, positioning, and hardening tracker.
- tasks/issues/001-establish-execution-baseline.md - first bounded task.
- tasks/issues/002-define-manual-trial-evidence.md - manual-trial evidence destination task.
- tasks/issues/003-align-public-blueprint-terminology.md - terminology alignment task.
- tasks/issues/004-run-blank-project-preflight-trial.md - blank-project manual trial.
- tasks/issues/005-run-ready-task-execution-trial.md - ready execution manual trial.
- tasks/issues/006-run-not-ready-execution-trial.md - not-ready execution manual trial.
- tasks/issues/007-summarize-existing-project-preflight-evidence.md - existing-project preflight evidence summary task.
- tasks/issues/008-decide-skills-sh-directory-discovery.md - skills.sh directory discovery decision task.
- tasks/issues/009-monitor-skills-sh-directory-discovery.md - completed post-release directory discovery monitor.
- tasks/issues/010-reconcile-post-release-open-questions.md - completed open-question reconciliation.
- tasks/issues/011-prepare-primary-user-framing-packet.md - completed primary user framing decision packet.
- tasks/issues/012-prepare-example-evidence-strategy-packet.md - completed example evidence strategy decision packet.
- tasks/issues/013-resolve-blueprint-doc-status.md - completed blueprint doc status reconciliation.
- tasks/issues/014-remove-agent-specific-evidence-handles.md - completed portable-evidence handle cleanup.
- tasks/issues/015-define-agent-agnostic-trial-evidence-packet.md - completed reusable trial evidence packet shape.
- tasks/issues/016-add-deterministic-skill-trial-verifier.md - completed executable evidence checks.
- tasks/issues/017-add-concurrent-run-safety-rule.md - completed shared-tracker safety rule.
- tasks/issues/018-split-post-release-backlog-from-sprint-0.md - completed tracker separation.
- tasks/issues/019-normalize-manual-trials-status.md - completed manual-trial status cleanup.

### Update

- None.

### Leave Untouched

- AGENTS.md - existing Bun-specific local instructions are adequate.
- README.md - source material for install/use/product shape.
- pre-execution-blueprint.md - source material for preflight workflow.
- execution-blueprint.md - source material for execution workflow.
- agent-skills-blueprint-design.md - source material for current skill design decisions.
- agent-skills-research-delegation-design.md - source material for research and delegation rules.
- RELEASE_CHECKLIST.md - source material for release validation.
- skills/ - implementation source for the installable skills.

### Needs User Input

- Confirm the primary buyer/user framing: startup founders, AI-assisted product builders, Codex users, or agent-skill authors?

## Next Action

No AI-owned backlog task is ready. Founder should choose from the primary user framing packet in `docs/open-questions.md` before stronger audience-specific public positioning claims. Top-level blueprints remain source/design notes unless promoted by a future task. Direct GitHub install for `v0.1.0` remains ready without examples; re-run generic search and skills.sh directory checks before claiming directory indexing.
