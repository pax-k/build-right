# Founder + AI Pre-Execution Blueprint

This document describes the generic workflow a startup founder can follow before
handing repetitive execution work to AI agents. It is tech-stack agnostic.

The workflow has two layers:

1. **Source Factory**: how founder input, AI drafts and evidence become trusted
   source material.
2. **Execution System**: how trusted source material becomes operating rules,
   tasks, verification and the first executable AI assignment.

Core rule:

```text
AI drafts the map.
Founder validates the terrain.
Evidence upgrades assumptions into truth.
Only then AI executes.
```

## Workflow Overview

```text
Founder dump
-> AI interview
-> Synthetic drafts
-> Founder validation
-> Evidence layer
-> Canonical product docs
-> Conflict resolution
-> MVP extraction
-> Manual ops playbook
-> Operating contract
-> Sprint 0 issues
-> Readiness gate
-> First AI task
-> Repetitive execution
```

## 1. Founder Context Dump

The founder writes down everything they know, without trying to make it clean.

Include:

- Product idea
- Target customer
- Observed pain
- Real-world examples
- Known competitors
- Pricing instincts
- Desired product capabilities
- Explicit non-goals
- Constraints around time, money, team and market timing

Output:

```text
docs/raw/founder-dump.md
```

AI may clean and organize this dump, but should not turn it into product truth
yet.

## 2. AI Founder Interview

AI interviews the founder like an operator or cofounder.

Questions to answer:

- Who feels the pain most sharply?
- What do they do today without this product?
- What event triggers buying intent?
- What would make the product must-have?
- What promise can we make without lying?
- What is the smallest sellable product?
- Which assumptions have no evidence yet?

Outputs:

```text
docs/raw/founder-interview.md
docs/open-questions.md
```

## 3. Synthetic Source Drafts

AI turns the raw input into structured draft sources. These are useful, but they
are not authoritative.

Recommended drafts:

```text
docs/raw/product-idea.md
docs/raw/customer-hypotheses.md
docs/raw/problem-hypotheses.md
docs/raw/competitor-notes.md
docs/raw/business-model-hypotheses.md
docs/raw/feature-inventory.md
docs/raw/launch-hypotheses.md
```

Every major claim should carry one status:

```text
founder-claimed
ai-inferred
evidence-backed
unknown
```

## 4. Founder Validation

The founder reviews AI-generated sources and marks claims as:

- Correct
- Wrong
- Unclear
- Important now
- Post-MVP
- Ignore

Outputs:

```text
docs/source-validation.md
docs/decision-log.md
```

Founder owns product promise, customer definition, positioning and MVP boundary.
AI can recommend, but it does not decide these.

## 5. Evidence Layer

For every important claim, ask:

```text
Do we have evidence, or only an assumption?
```

Evidence may come from:

- Customer calls
- Sales conversations
- Emails or messages
- Competitor pages
- Pricing pages
- Reviews and forums
- Analytics
- Waitlists
- Preorders
- Manual delivery results

Outputs:

```text
docs/evidence/customer-notes.md
docs/evidence/competitor-research.md
docs/evidence/pricing-research.md
docs/evidence/market-notes.md
```

Evidence-backed claims can become product truth. Unsupported claims stay marked
as assumptions.

## 6. Canonical Product Docs

After validation and evidence tagging, turn raw material into canonical docs.

Recommended docs:

```text
docs/product-thesis.md
docs/personas.md
docs/problem-statement.md
docs/market.md
docs/business-model.md
docs/product-vision.md
docs/mvp-scope.md
docs/post-mvp.md
docs/product-flows.md
docs/risk-register.md
docs/manual-ops-playbook.md
```

These docs become the source material that planning and execution agents are
allowed to rely on.

## 7. Source Index

Create an index that says what each source is for and how much confidence it
deserves.

Output:

```text
docs/source-index.md
```

Suggested shape:

```md
| Document | Purpose | Status | Confidence | Owner |
| --- | --- | --- | --- | --- |
| product-thesis.md | Core product truth | validated | high | founder |
| market.md | Market assumptions | draft | medium | AI + founder |
| pricing-research.md | Pricing evidence | needs validation | low | founder |
```

## 8. Conflict Resolution

AI scans for contradictions before execution begins.

Look for:

- Multiple ICPs competing for priority
- Pricing contradictions
- MVP scope that is too large
- Product promise larger than current capability
- Features unrelated to the main risk
- Future scope written as current scope
- Internal language leaking into user-facing docs

Outputs:

```text
docs/conflicts.md
docs/decision-log.md
```

Founder resolves major conflicts. Do not start automated execution while the
core product, customer or MVP boundary is still unresolved.

## 9. MVP Extraction

AI extracts the smallest sellable and learnable product from the canonical docs.

The MVP should define:

- One primary customer
- One primary workflow
- One clear value moment
- The smallest product that can be sold or manually delivered
- Explicit exclusions
- The main risk each MVP capability reduces
- What can be manual before it is automated

Outputs:

```text
docs/mvp-scope.md
docs/post-mvp.md
docs/risk-register.md
```

Gate:

```text
The MVP must be clear enough to sell, demo, or manually deliver before it is
automated.
```

## 10. Manual Ops Before Product

Before automating, document how the founder or team can deliver the value
manually.

Cover:

- Manual customer onboarding
- Manual delivery of the core result
- Manual feedback collection
- Manual simulation of unbuilt features
- Manual sales or concierge workflow
- What must be learned before building automation

Output:

```text
docs/manual-ops-playbook.md
```

This prevents the team from automating a workflow that has not been proven.

## 11. Project Operating System

Now define how people and AI agents are allowed to work in the project.

Create:

```text
docs/glossary.md
docs/architecture.md
docs/module-map.md
docs/execution-rules.md
docs/release-gates.md
docs/ai-working-rules.md
docs/clarification-rules.md
docs/task-template.md
AGENTS.md
```

The operating system must answer:

- Which docs are authoritative?
- What is active MVP scope?
- What is explicitly out of scope?
- What vocabulary is customer-facing?
- What vocabulary is internal?
- What modules or ownership boundaries exist?
- What can AI decide?
- When must AI ask the founder?
- What checks prove work is complete?
- Where does evidence get recorded?

Gate:

```text
Every executor should know what to read, what not to decide, and what counts as done.
```

## 12. Sprint 0 Planning

Sprint 0 is foundation work, not product feature work.

Typical Sprint 0 tasks:

- Validation baseline
- Build/type/lint/test command surface
- Environment and configuration contract
- Persistence or migration home
- Deployment path or deployment blockers
- Core module boundaries
- First architecture risks
- First issue tracker shape

Outputs:

```text
tasks/sprint-0.md
tasks/issues/001-*.md
tasks/issues/002-*.md
```

Each issue should include:

- Goal
- Non-goals
- Acceptance criteria
- Required reading
- Verification commands
- Evidence section
- Known blockers

Gate:

```text
Do not start product feature work until the project has a trustworthy validation baseline or explicit blockers.
```

## 13. Readiness Gate

Before the first AI execution task, answer:

- Are product truth and MVP scope documented?
- Are assumptions separated from evidence?
- Are major conflicts resolved?
- Is manual delivery understood?
- Are authority docs and working rules in place?
- Is there a task tracker?
- Is the first task small, ordered and verifiable?
- Is feature work allowed, or should Sprint 0 cleanup happen first?

Output:

```text
Go for Sprint 0
No-go for product features
First blocker: <task path>
```

## 14. First AI Task

The first AI task should be narrow and evidence-driven.

Prompt shape:

```text
Work in this project.

Read the authority docs and the selected issue.
Take only this issue.
Do not widen scope.
Implement the smallest change that satisfies the acceptance criteria.
Run the required verification.
Record evidence in the issue.
Create follow-up issues for unrelated discoveries.
Do not mark the task done without evidence.
```

Output:

```text
tasks/001-first-ai-task.md
```

## 15. Repetitive AI Execution

After the first task, repeat the execution loop.

```text
Read authority docs
-> Pick next issue
-> Implement narrow change
-> Verify
-> Record evidence
-> Update tracker
-> Capture new decisions
-> Repeat
```

New facts discovered during execution should update the right artifact:

- Product change: product or MVP docs
- Architecture decision: ADR or architecture doc
- Scope change: roadmap or post-MVP doc
- Task discovery: new issue
- Risk discovery: risk register
- Evidence discovery: evidence docs

## Final Folder Shape

```text
docs/
  raw/
    founder-dump.md
    founder-interview.md
    product-idea.md
    customer-hypotheses.md
    problem-hypotheses.md
    feature-inventory.md

  evidence/
    customer-notes.md
    competitor-research.md
    pricing-research.md
    market-notes.md

  source-index.md
  source-validation.md
  conflicts.md
  decision-log.md

  product-thesis.md
  personas.md
  problem-statement.md
  market.md
  business-model.md
  product-vision.md
  mvp-scope.md
  post-mvp.md
  product-flows.md
  risk-register.md
  manual-ops-playbook.md

  glossary.md
  architecture.md
  module-map.md
  execution-rules.md
  release-gates.md
  ai-working-rules.md
  clarification-rules.md
  task-template.md

tasks/
  sprint-0.md
  001-first-ai-task.md
  issues/
    001-*.md
    002-*.md
```

## Founder Rule

Before automation, AI is not primarily a developer. It is an interviewer,
analyst, critic, documenter, scope guard and task slicer.

AI becomes an executor only after:

- Founder intent is captured
- Assumptions are marked
- Evidence is recorded
- Canonical docs exist
- Conflicts are resolved
- MVP is extracted
- Manual ops are understood
- Operating rules exist
- The first task is small and verifiable
