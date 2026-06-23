# Open Questions

Status: needs-founder-framing
Owner: founder + AI
Confidence: medium
Last updated: 2026-06-23

## Founder Validation Batch

1. Who is the primary user for release positioning: startup founders, AI-assisted product builders, Codex users, or agent-skill authors?

## Primary User Framing Packet

Founder decision needed: choose one primary framing for audience-specific public copy, or explicitly keep `v0.1.0` broad and tool-repository focused.

| Candidate | Repo Evidence | Best Fit | Risk If Primary |
| --- | --- | --- | --- |
| Startup founders | `pre-execution-blueprint.md` describes a startup founder preparing before handing repetitive execution to AI agents. | Strongest fit for the preflight workflow, founder interviews, customer definition, and MVP boundary decisions. | May understate the repo's immediate install/use surface as Agent Skills for Codex-style agents. |
| Founder/product owners | `README.md` and `agent-skills-blueprint-design.md` describe founder/product preflight and project-owner workflows. | Broad enough for existing projects where the user owns product truth but is not necessarily a startup founder. | Less sharp than a single buyer persona; can read like internal methodology. |
| AI-assisted product builders | `README.md` positions Build Right as turning early product work into evidence-backed execution. | Captures the practical builder workflow across preflight and execution without over-indexing on company stage. | Needs stronger founder/customer validation before claiming demand or buyer urgency. |
| Codex users | `README.md` documents Codex invocation with `$build-right-preflight` and `$build-right-execution`. | Best fit for current distribution and installation behavior. | Makes the product sound like a Codex utility instead of a broader product-building method. |
| Agent-skill authors | `agent-skills-blueprint-design.md` documents skill packaging, descriptions, and repository shape. | Useful for people adapting the blueprint into skills. | Too meta for the current two-skill MVP; risks confusing the user with the maker audience. |

Decision guardrail: no audience-specific public positioning is claimed until the founder chooses the primary framing.

## Example Evidence Strategy Packet

Current evidence model: direct-install readiness is backed by release gates, manual trial evidence, task logs, and live install/search commands. No checked-in example project exists in this repository today.

| Option | Repo Evidence | Best Fit | Risk |
| --- | --- | --- | --- |
| Keep `v0.1.0` evidence in release checklist, manual trials, and task logs only. | `docs/evidence/manual-trials.md`, `docs/release-gates.md`, `RELEASE_CHECKLIST.md`, and tasks `004-009` already prove current direct-install readiness. | Smallest release surface; avoids maintaining generated example artifacts that can drift from skills. | New users cannot inspect a polished example output without running the skills or reading task evidence. |
| Add a checked-in blank-project example. | Blank-project rerun evidence exists at `/tmp/build-right-blank-preflight-trial-20260623-rerun`, but it is not checked into the repo. | Useful for onboarding and public docs if the repo needs a visible output sample. | Must be regenerated or audited when templates change; can become stale release evidence. |
| Add a checked-in existing-project adoption example. | This repo's self-adoption evidence is summarized in `docs/evidence/manual-trials.md#existing-project-preflight`. | Shows how Build Right behaves in a real existing repository. | Risks confusing source docs with generated sample docs unless clearly separated. |
| Keep examples out of repo and add a release-note link to task evidence. | Current release docs already point at durable task and manual-trial evidence. | Good for a lean skills repository where installability matters more than demos. | Less friendly for discovery surfaces that reward quick visual or file-structure inspection. |

Decision guardrail: adding an example project is a future scope decision, not required for the current `v0.1.0` direct-install readiness claim.

## Resolved Operational Questions

| Question | Decision | Evidence |
| --- | --- | --- |
| Where should durable manual trial evidence live? | Use `docs/evidence/manual-trials.md` as the durable matrix, with task evidence files as detailed proof and `docs/release-gates.md` plus `RELEASE_CHECKLIST.md` as gate/checklist summaries. | tasks/issues/002-define-manual-trial-evidence.md; docs/evidence/manual-trials.md; docs/release-gates.md; RELEASE_CHECKLIST.md |
| Is skills.sh directory indexing a release gate or a post-release follow-up? | Treat it as a post-release discovery limitation, not a blocker for direct GitHub install readiness. Do not claim directory indexing until live evidence finds both skills. | tasks/issues/008-decide-skills-sh-directory-discovery.md; tasks/issues/009-monitor-skills-sh-directory-discovery.md; docs/release-gates.md |
| Should top-level blueprint docs be treated as stable public docs or internal design notes after `v0.1.0`? | Treat them as source/design notes unless explicitly promoted into stable public documentation by a future task. | docs/conflicts.md; tasks/issues/003-align-public-blueprint-terminology.md; docs/source-index.md |

## Claims

| Claim | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Build Right is a small Agent Skills repository for turning early product work into evidence-backed execution. | founder-claimed | README.md | Public-facing positioning exists; primary buyer/user framing still needs founder validation before stronger audience-specific claims. |
| The repository contains two skills: preflight and execution. | repo-evidence-backed | README.md; skills.sh.json; skills/ | Backed by local repository contents. |
| `v0.1.0` is published and directly installable from GitHub. | repo-evidence-backed | RELEASE_CHECKLIST.md; docs/release-gates.md; GitHub release tag `v0.1.0` | Backed by release/install command evidence from the release run. |
| Public web research is public evidence, not customer validation. | founder-claimed | README.md; agent-skills-research-delegation-design.md; skills/build-right-preflight/references/artifact-contract.md | Consistent across repo sources. |
| Subagents are support lanes, not final authority. | founder-claimed | README.md; agent-skills-research-delegation-design.md | Consistent across repo sources. |

## Parking Lot

- None yet.
