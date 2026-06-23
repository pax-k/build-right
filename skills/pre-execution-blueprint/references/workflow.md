# Pre-Execution Workflow

Use this workflow to turn founder context and existing project material into
trusted source docs, operating rules, Sprint 0, and the first executable AI task.

## 1. Inspect Project State

Read available project context:

- `AGENTS.md`, `CLAUDE.md`, or other local agent instructions
- `README.md`
- `docs/`
- `tasks/`, `issues/`, sprint trackers, or roadmap files
- package manifests and app/module layout
- validation, test, deploy, or release scripts
- existing product/customer/market language

Classify the project:

- `blank/new`: little or no product truth, evidence, operating docs, or tasks
- `existing`: meaningful docs, code, release process, or previous decisions

Create or update `docs/blueprint-status.md` early. It is the resume point for
the skill.

## 2. Announce File Plan

Before writing, print:

```text
Create:
- <path> - <purpose>

Update:
- <path> - <purpose>

Leave untouched:
- <path> - <reason>

Needs user input:
- <question or blocker>
```

Then proceed by default. Stop only for planning-only mode, risky overwrites, or
ambiguous project ownership.

## 3. Founder Context Dump

Gather messy founder context. Include:

- product idea
- target customer
- observed pain
- real-world examples
- known competitors
- pricing instincts
- desired product capabilities
- explicit non-goals
- constraints around time, money, team, and market timing

Output: `docs/raw/founder-dump.md`

AI may organize this material, but it does not become product truth yet.

## 4. AI Founder Interview

Interview like an operator or cofounder. Ask small batches of questions:

- Who feels the pain most sharply?
- What do they do today without this product?
- What event triggers buying intent?
- What would make the product must-have?
- What promise can we make without lying?
- What is the smallest sellable product?
- Which assumptions have no evidence yet?

Outputs:

- `docs/raw/founder-interview.md`
- `docs/open-questions.md`

## 5. Draft Source Factory

Turn raw input into structured draft sources. These are useful but not
authoritative.

Recommended outputs:

- `docs/raw/product-idea.md`
- `docs/raw/customer-hypotheses.md`
- `docs/raw/problem-hypotheses.md`
- `docs/raw/competitor-notes.md`
- `docs/raw/business-model-hypotheses.md`
- `docs/raw/feature-inventory.md`
- `docs/raw/launch-hypotheses.md`

Every major claim must use one status:

- `founder-claimed`
- `ai-inferred`
- `evidence-backed`
- `unknown`

## 6. Founder Validation

Ask the founder to mark important claims:

- `correct`
- `wrong`
- `unclear`
- `important-now`
- `post-mvp`
- `ignore`

Outputs:

- `docs/source-validation.md`
- `docs/decision-log.md`

The founder owns product promise, customer definition, positioning, and MVP
boundary. AI can recommend; it cannot decide these.

## 7. Evidence Layer

For every important claim, ask:

```text
Do we have evidence, or only an assumption?
```

Evidence may come from customer calls, sales conversations, emails, competitor
pages, pricing pages, reviews, forums, analytics, waitlists, preorders, or
manual delivery results.

Outputs:

- `docs/evidence/customer-notes.md`
- `docs/evidence/competitor-research.md`
- `docs/evidence/pricing-research.md`
- `docs/evidence/market-notes.md`

Evidence-backed claims may become product truth. Unsupported claims stay marked
as assumptions.

## 8. Canonical Product Docs

After validation and evidence tagging, produce canonical docs:

- `docs/product-thesis.md`
- `docs/personas.md`
- `docs/problem-statement.md`
- `docs/market.md`
- `docs/business-model.md`
- `docs/product-vision.md`
- `docs/mvp-scope.md`
- `docs/post-mvp.md`
- `docs/product-flows.md`
- `docs/risk-register.md`
- `docs/manual-ops-playbook.md`

These become source material that planning and execution agents may rely on.

## 9. Source Index

Create `docs/source-index.md` to say what each source is for and how much
confidence it deserves.

Use columns:

```text
Document | Purpose | Status | Confidence | Owner | Last Reviewed
```

## 10. Conflict Resolution

Scan for contradictions:

- multiple ICPs competing for priority
- pricing contradictions
- MVP scope too large
- product promise larger than current capability
- features unrelated to the main risk
- future scope written as current scope
- internal language leaking into user-facing docs

Outputs:

- `docs/conflicts.md`
- updates to `docs/decision-log.md`

Founder resolves major conflicts. Do not start automated execution while core
product, customer, or MVP boundaries are unresolved.

## 11. MVP Extraction

Extract the smallest sellable and learnable product:

- one primary customer
- one primary workflow
- one clear value moment
- smallest product that can be sold or manually delivered
- explicit exclusions
- main risk each MVP capability reduces
- what can be manual before it is automated

Gate:

```text
The MVP must be clear enough to sell, demo, or manually deliver before it is automated.
```

## 12. Manual Ops Before Product

Document how the founder or team can deliver value manually:

- manual customer onboarding
- manual delivery of the core result
- manual feedback collection
- manual simulation of unbuilt features
- manual sales or concierge workflow
- what must be learned before building automation

Output: `docs/manual-ops-playbook.md`

## 13. Project Operating System

Create or update:

- `docs/glossary.md`
- `docs/architecture.md`
- `docs/module-map.md`
- `docs/execution-rules.md`
- `docs/release-gates.md`
- `docs/ai-working-rules.md`
- `docs/clarification-rules.md`
- `docs/task-template.md`
- `AGENTS.md` when no adequate local agent instructions exist

The operating system must answer:

- which docs are authoritative
- what is active MVP scope
- what is out of scope
- customer-facing and internal vocabulary
- module or ownership boundaries
- what AI can decide
- when AI must ask the founder
- what checks prove work complete
- where evidence gets recorded

## 14. Sprint 0 Planning

Sprint 0 is foundation work, not product feature work.

Typical tasks:

- validation baseline
- build/type/lint/test command surface
- environment and configuration contract
- persistence or migration home
- deployment path or deployment blockers
- core module boundaries
- first architecture risks
- first issue tracker shape

Outputs:

- `tasks/sprint-0.md`
- `tasks/issues/001-*.md`
- `tasks/issues/002-*.md`

## 15. Readiness Gate

Before the first execution task, answer:

- Are product truth and MVP scope documented?
- Are assumptions separated from evidence?
- Are major conflicts resolved?
- Is manual delivery understood?
- Are authority docs and working rules in place?
- Is there a task tracker?
- Is the first task small, ordered, and verifiable?
- Is feature work allowed, or should Sprint 0 cleanup happen first?

Close with:

```text
Go for Sprint 0
No-go for product features
First blocker: <task path>
First executable AI task: <task path>
```

## Blank Project Handling

Create the starter scaffold progressively. Prefer the templates in
`assets/templates/`.

Do not require every canonical doc to be complete before Sprint 0. It is enough
for the status file to show missing evidence, blockers, and the first small task
needed to establish the project operating system.

## Existing Project Handling

Do not overwrite structure. First index what exists, then fill gaps.

For existing files:

- preserve content unless clearly stale or contradicted
- append evidence or decisions instead of replacing useful context
- create conflict notes when claims disagree
- keep local validation and release commands as the authority until proven wrong

When a project already has task tracking, adapt to it instead of forcing the
default `tasks/issues/` layout.
