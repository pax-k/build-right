# Pre-Execution Artifact Contract

Use strict structure where downstream execution depends on it. Use lighter
claim-tagged structure for founder discovery and product docs.

## Claim Statuses

Use one of:

- `founder-claimed`: founder stated it, not independently validated
- `ai-inferred`: AI inferred it from available material
- `prototype-assumption`: public or inferred context is good enough to
  prototype against, but not validated enough for product truth, sales claims,
  or durable architecture commitments
- `repo-evidence-backed`: linked to local repository evidence, such as
  manifests, source files, task files, release files, or command output
- `public-evidence-backed`: linked to public web evidence, such as competitor
  pages, pricing pages, reviews, forums, public docs, or market notes
- `customer-evidence-backed`: linked to direct customer conversations, sales
  calls, user messages, support requests, interviews, or manual delivery results
- `unknown`: known gap

Do not present public web research as customer validation. Public evidence can
challenge, contextualize, and strengthen assumptions; it cannot prove private
buyer urgency or willingness to pay.

Do not present local repository evidence as public web or customer evidence.
Repository evidence can prove what the project contains, what commands passed,
or what was released; it cannot prove market demand.

## Source Modes

Use one source mode for each preflight pass:

- `founder-fed`: founder context is the primary source; web research is only
  supporting evidence or contradiction discovery
- `web-assisted`: founder context exists but has gaps; bounded public research
  may fill prototype-grade gaps
- `public-first-prototype`: founder context is missing or intentionally thin;
  public research may produce a reversible prototype scope, not product truth

Record source mode, prototype confidence, and validation required before any
prototype assumption is treated as product truth.

## Validation Marks

Use one of:

- `correct`
- `wrong`
- `unclear`
- `important-now`
- `post-mvp`
- `ignore`

## Lightweight Discovery/Product Doc Shape

Use this shape for raw and canonical product docs that benefit from flexibility:

```md
# <Document Title>

Status: draft | prototype-assumption | founder-validated | repo-evidence-backed | public-evidence-backed | customer-evidence-backed
Owner: founder | AI | founder + AI
Confidence: low | medium | high
Source mode: founder-fed | web-assisted | public-first-prototype
Prototype confidence: low | medium | high | n/a
Last updated: YYYY-MM-DD

## Summary

<short summary>

## Claims

| Claim | Status | Evidence | Notes |
| --- | --- | --- | --- |
| <claim> | founder-claimed | <path/link or none> | <notes> |

## Open Questions

- <question>

## Validation Required Before Product Truth

- <founder or customer evidence needed>
```

## Strict Blueprint Status Shape

Use for `docs/blueprint-status.md`:

```md
# Blueprint Status

Status: collecting-context | validating | evidence-review | operating-system | sprint-0-ready | blocked
Project state: blank/new | existing
Source mode: founder-fed | web-assisted | public-first-prototype
Prototype confidence: low | medium | high | n/a
Last updated: YYYY-MM-DD

## Readiness

| Gate | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Founder intent captured | missing |  |  |
| Claims tagged | missing |  |  |
| Prototype assumptions labeled | missing |  |  |
| Evidence recorded | missing |  |  |
| Canonical docs exist | missing |  |  |
| Conflicts resolved | missing |  |  |
| MVP extracted | missing |  |  |
| Manual ops understood | missing |  |  |
| Operating rules exist | missing |  |  |
| First task is bounded and verifiable | missing |  |  |

## Current File Plan

### Create

- <path> - <purpose>

### Update

- <path> - <purpose>

### Leave Untouched

- <path> - <reason>

### Needs User Input

- <question or blocker>

## Next Action

<single next action>
```

Gate statuses: `missing`, `draft`, `needs-validation`, `blocked`, `ready`.

## Source Index Shape

Use for `docs/source-index.md`:

```md
# Source Index

| Document | Purpose | Status | Confidence | Owner | Last Reviewed |
| --- | --- | --- | --- | --- | --- |
| <path> | <purpose> | draft | low | founder + AI | YYYY-MM-DD |
```

Document statuses: `raw`, `draft`, `needs-validation`, `validated`,
`prototype-assumption`, `repo-evidence-backed`, `public-evidence-backed`,
`customer-evidence-backed`, `stale`.

## Decision Log Shape

Use for `docs/decision-log.md`:

```md
# Decision Log

| Date | Decision | Owner | Evidence | Consequence |
| --- | --- | --- | --- | --- |
| YYYY-MM-DD | <decision> | founder | <path/link> | <impact> |
```

## Conflicts Shape

Use for `docs/conflicts.md`:

```md
# Conflicts

| Conflict | Sources | Severity | Owner | Status | Resolution |
| --- | --- | --- | --- | --- | --- |
| <conflict> | <paths> | low | founder | open |  |
```

Severity: `low`, `medium`, `high`.
Status: `open`, `needs-founder`, `resolved`, `deferred`.

## MVP Scope Shape

Use for `docs/mvp-scope.md`:

```md
# MVP Scope

Status: draft | prototype-assumption | founder-validated | repo-evidence-backed | public-evidence-backed | customer-evidence-backed
Owner: founder
Confidence: low | medium | high
Source mode: founder-fed | web-assisted | public-first-prototype
Prototype confidence: low | medium | high | n/a
Last updated: YYYY-MM-DD

## Primary Customer

<one customer>

## Primary Workflow

<one workflow>

## Value Moment

<clear value moment>

## Included

| Capability | User Outcome | Risk Reduced | Evidence |
| --- | --- | --- | --- |
| <capability> | <outcome> | <risk> | <path/link> |

## Excluded

- <non-goal>

## Manual Before Automated

- <manual step>

## Readiness Notes

<what must be true before product feature work starts>

## Validation Required Before Product Truth

- <founder/customer evidence or manual delivery proof required>

## Learning Objective

<what this MVP/prototype is meant to learn>
```

## Operating Rules Shape

Use for `docs/execution-rules.md`:

```md
# Execution Rules

## Authority Order

1. <highest authority>
2. <next authority>

## AI May Decide

- <decision>

## AI Must Ask

- <decision>

## Evidence Destinations

- Task evidence: `tasks/issues/*.md`
- Release evidence: `<path>`

## Required Verification

| Change Type | Required Checks | Evidence |
| --- | --- | --- |
| <type> | <commands/proof> | <where recorded> |
```

## Evidence Notes Shape

Use separate repository, public, and customer evidence sections:

```md
# Evidence Notes

Status: draft
Owner: founder + AI
Confidence: low
Last updated: YYYY-MM-DD

## Public Evidence

| Date | Source Type | Source | Claim Supported Or Challenged | Strength | Link/Path | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| YYYY-MM-DD | competitor page | <name> | <claim> | weak | <url/path> | <notes> |

## Customer Evidence

| Date | Source Type | Source | Claim Supported Or Challenged | Strength | Link/Path | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| YYYY-MM-DD | customer call | <name/account> | <claim> | medium | <path> | <notes> |

## Repository Evidence

| Date | Source Type | Source | Claim Supported Or Challenged | Strength | Link/Path | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| YYYY-MM-DD | command output | <command> | <claim> | strong | <path> | <notes> |

## Unsupported Important Claims

- <claim>

## Prototype Assumptions

| Claim | Source | Reversibility | Validation Required Before Product Truth |
| --- | --- | --- | --- |
| <claim> | <path/link> | easy | <evidence needed> |

## Evidence To Gather Next

- <evidence target>
```

Use `docs/evidence/customer-notes.md` only for direct customer evidence. Store
public research in competitor, pricing, or market evidence docs. Store local
repository proof in task evidence logs, release gates, source index entries, or
repository evidence sections.

For Build Right manual trials, use the agent-agnostic packet shape in
`docs/evidence/manual-trials.md`: run label, agent/tool surface, skill source,
target, commands, artifacts, result, proved, simulated, unproven, and
follow-ups. Trial evidence must stand on durable artifacts, not an
agent-specific conversation handle.

## Sprint 0 Shape

Use for `tasks/sprint-0.md`:

```md
# Sprint 0

Status: draft | active | complete | blocked
Purpose: establish trustworthy execution baseline before product feature work.

## Tasks

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| 001 | <title> | ready | tasks/issues/001-*.md |

## Gate

Do not start product feature work until validation baseline or explicit blockers
exist.
```

## Issue Shape

Use for `tasks/issues/*.md` and `tasks/001-first-ai-task.md`:

```md
# <ID>: <Title>

Status: ready | active | blocked | complete
Type: validation | docs | architecture | feature | bug | release
Owner: AI

Assumption basis: founder-claimed | ai-inferred | prototype-assumption | repo-evidence-backed | public-evidence-backed | customer-evidence-backed
Reversibility: easy | moderate | hard
Learning objective: <what this task should prove or reveal>
Source under test: <repo-local path | installed path | GitHub source | release tag | n/a>

## Goal

<one goal>

## Non-Goals

- <explicit exclusion>

## Required Reading

- <path>

## Acceptance Criteria

- [ ] <observable criterion>

## Baseline Evidence

<current state proof required before edits>

## Verification

- <command or proof>

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Blockers

- <blocker or none>

## Follow-Ups

- <follow-up or none>
```
