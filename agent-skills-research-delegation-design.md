# Research And Delegation Design

This document records how the blueprint skills should model web research and
subagent delegation.

It extends `agent-skills-blueprint-design.md` and is intended to guide the next
implementation pass for:

- `skills/pre-execution-blueprint`
- `skills/execution-blueprint`

## Core Principle

Web research and subagents are optional support lanes, not replacements for the
main workflow.

```text
Founder input defines the terrain.
Web research challenges and contextualizes assumptions.
Subagents gather, draft, critique, and audit.
The main agent decides, writes, updates trackers, and closes gates.
```

## Research Lane

Do not run web research blindly at every step. Run it when public evidence can
materially improve confidence or expose contradictions.

### Default Loop

```text
Founder input
-> AI extracts claims
-> AI identifies research-worthy claims
-> Web research pass when useful
-> Evidence notes with sources
-> Contradictions and confidence updates
-> Founder clarification only for important unresolved points
-> Canonical doc update
```

### Founder Input Comes First

Ask the founder for the raw answer before researching:

- product idea
- target customer
- workflow
- pain
- current alternatives
- pricing instincts
- constraints
- non-goals

Then extract claims and decide which ones need outside evidence.

### Research-Worthy Claims

Use web research for:

- competitors and alternatives
- pricing benchmarks
- market/category language
- public customer pain signals
- regulatory or platform constraints
- distribution/channel assumptions
- public reviews, forums, docs, and buying guides
- buyer vocabulary

Do not treat web research as enough to prove:

- whether this founder can sell the product
- whether a specific customer will buy
- true urgency of a pain
- willingness to pay
- feasibility inside a private workflow
- claims that require private customer conversations or internal data

### Research Plan

Before web research, announce a concise research plan:

```text
Research pass:
- competitor alternatives for <category>
- pricing signals for <buyer/use case>
- public pain language from <source types>

Purpose:
- challenge or support current assumptions
- identify contradictions
- improve vocabulary and positioning

Not purpose:
- replace founder validation
- claim customer willingness to pay
```

Proceed by default unless the user asked for no web research or planning-only
mode.

### Evidence Destinations

Record public research in:

- `docs/evidence/competitor-research.md`
- `docs/evidence/pricing-research.md`
- `docs/evidence/market-notes.md`

Use `docs/evidence/customer-notes.md` only for real customer conversations,
messages, sales calls, interviews, support requests, or direct user feedback.

### Claim Statuses

Extend claim status options to distinguish public evidence from direct customer
evidence:

```text
founder-claimed
ai-inferred
public-evidence-backed
customer-evidence-backed
unknown
```

Public research can upgrade a claim to `public-evidence-backed`, not
`customer-evidence-backed`.

### When To Ask Follow-Up Questions

Do not interrupt after every search. Ask the founder to clarify when:

- founder claims conflict with public evidence
- multiple plausible ICPs compete for priority
- competitor framing suggests a different product category
- pricing evidence contradicts founder instinct
- market language implies a narrower or broader product
- the claim remains important but unsupported

## Delegation Lane

Use subagents selectively. They are valuable for independent parallel judgment
and bounded delegation. They are harmful when the workflow needs direct founder
interaction, careful state updates, or a single coherent source of truth.

### Subagent Rule

```text
Subagents may gather, draft, critique, and audit.
The main agent decides, writes, updates trackers, and closes gates.
```

### Use Subagents For

- web research lanes
- existing project inventory
- competitor research
- pricing research
- market language research
- public pain signal research
- conflict detection
- readiness review
- evidence completeness review
- execution review after implementation
- large draft generation where the main agent will merge and edit

### Do Not Use Subagents For

- founder interview flow
- final product promise decisions
- MVP boundary decisions
- authoritative final-state writes without main-agent review
- tracker updates without main-agent review
- committing, publishing, or external irreversible actions
- work requiring private context that the main agent has not explicitly passed
  to the subagent

## Subagent Prompt Contract

Every subagent prompt should include:

- objective
- exact files or context to read
- scope boundaries
- allowed sources
- output format
- stop condition
- instruction not to edit files unless explicitly delegated

Template:

```text
Objective:
<one bounded research/audit/draft objective>

Context to read:
- <file/path or pasted excerpt>

Scope:
- Include: <allowed work>
- Exclude: <forbidden work>

Sources:
- <web/source/file limits>

Output format:
- Findings
- Evidence
- Contradictions
- Confidence
- Recommended updates

Stop condition:
Return when <condition>. Do not update canonical docs or trackers.
```

## Pre-Execution Subagent Patterns

### Competitor Research

```text
Research public competitors and alternatives for <category/customer/workflow>.
Find direct competitors, manual workarounds, adjacent tools, pricing signals,
and positioning language. Return evidence with links, confidence, and
contradictions. Do not edit files.
```

### Pricing Research

```text
Research public pricing benchmarks for <buyer/use case/category>. Separate
listed prices, packaging models, usage-based pricing, enterprise-only signals,
and unsupported inferences. Return evidence with links and confidence. Do not
edit files.
```

### Public Pain Language

```text
Research public pain language for <customer/workflow>. Prefer reviews, forums,
support docs, comparison pages, and buying guides. Extract exact pain phrases
sparingly, summarize patterns, and flag weak evidence. Do not edit files.
```

### Existing Project Inventory

```text
Inspect the project docs/tasks/code surfaces for existing product truth,
authority docs, validation commands, release gates, and task trackers. Return
what exists, what is missing, conflicts, and suggested file plan entries. Do not
edit files.
```

### Conflict Scan

```text
Read the provided product docs and task files. Identify contradictions in ICP,
pricing, MVP scope, product promise, feature priority, and user-facing language.
Return conflicts with source paths and severity. Do not edit files.
```

### Readiness Audit

```text
Audit whether this project is ready for Sprint 0 or bounded execution. Check
product truth, MVP scope, evidence, operating rules, task tracker, and first
task quality. Return go/no-go, blockers, and evidence paths. Do not edit files.
```

## Execution Subagent Patterns

### Evidence Completeness Review

```text
Review the selected task after implementation. Check whether baseline evidence,
verification, files changed, blockers, and follow-ups are recorded well enough
for another agent to trust completion. Return gaps only. Do not edit files.
```

### Scope Creep Review

```text
Compare the task acceptance criteria with the changed files and evidence. Flag
unrelated changes, hidden product decisions, missing tests, and follow-up work.
Return findings with paths and severity. Do not edit files.
```

## Implementation Changes To Make

Update `skills/pre-execution-blueprint`:

- Add a `Research Lane` section to `references/workflow.md`.
- Add a `Delegation Lane` section to `references/workflow.md`.
- Update `references/artifact-contract.md` claim statuses:
  `founder-claimed`, `ai-inferred`, `public-evidence-backed`,
  `customer-evidence-backed`, `unknown`.
- Update evidence templates to separate public evidence from customer evidence.
- Add subagent prompt templates under `assets/templates/subagents/`.

Update `skills/execution-blueprint`:

- Add optional subagent review guidance to `references/workflow.md`.
- Add evidence completeness and scope review prompt templates under
  `assets/templates/subagents/`.
- Keep the main agent responsible for final task updates and closeout.

## Guardrails

- Web research must cite sources when used.
- Public web evidence must not be presented as customer validation.
- Subagents must not independently update canonical docs, trackers, commits, or
  publishing state unless the user explicitly asks for that behavior.
- The main agent owns synthesis and final writes.
- Research and delegation should reduce uncertainty, not expand scope
  indefinitely.
