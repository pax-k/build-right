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

Classify the source mode:

- `founder-fed`: founder context is the primary source; web research only
  supports or challenges it
- `web-assisted`: founder context exists but has important gaps; bounded public
  research may fill prototype-grade gaps
- `public-first-prototype`: founder context is missing, thin, or intentionally
  deferred for speed; public research may create reversible prototype
  assumptions

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
- `prototype-assumption`
- `repo-evidence-backed`
- `public-evidence-backed`
- `customer-evidence-backed`
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
manual delivery results. It may also come from local repository artifacts when
the claim is about the project itself, such as manifests, skill folders,
release files, task files, or command output.

Outputs:

- `docs/evidence/customer-notes.md`
- `docs/evidence/competitor-research.md`
- `docs/evidence/pricing-research.md`
- `docs/evidence/market-notes.md`

Evidence-backed claims may become product truth when the evidence type matches
the claim. Use `repo-evidence-backed` for claims proven by local repository
artifacts. Use `public-evidence-backed` for public web evidence. Use
`customer-evidence-backed` for direct customer evidence. Unsupported claims stay
marked as assumptions.

## 8. Research Lane

Use web research when public evidence can materially improve confidence, expose
contradictions, or fill founder-context gaps for fast prototyping. Do not run
research blindly at every step.

Default loop:

```text
Founder input when available
-> AI extracts claims
-> AI identifies missing or research-worthy claims
-> Web research pass when useful or needed for fast prototyping
-> Evidence notes with sources
-> Contradictions and confidence updates
-> Prototype assumptions labeled when evidence is public-only or inferred
-> Founder clarification only for important unresolved points
-> Canonical doc update
```

Founder input comes first when available. Ask for raw founder answers about
product idea, target customer, workflow, pain, alternatives, pricing instincts,
constraints, and non-goals before researching unless the user explicitly wants a
fast prototype from thin context.

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

When founder context is missing or intentionally thin, public research may
unblock a prototype. Mark the resulting claims as `prototype-assumption` or
`public-evidence-backed`, record validation required before product truth, and
prefer reversible scope.

Before web research, announce:

```text
Research pass:
- competitor alternatives for <category>
- pricing signals for <buyer/use case>
- public pain language from <source types>

Purpose:
- challenge or support current assumptions
- identify contradictions
- improve vocabulary and positioning
- fill prototype-grade gaps when founder context is unavailable

Not purpose:
- replace founder validation
- claim customer willingness to pay
- promote prototype assumptions into product truth
```

Proceed by default unless the user asked for no web research or planning-only
mode.

Record public research in:

- `docs/evidence/competitor-research.md`
- `docs/evidence/pricing-research.md`
- `docs/evidence/market-notes.md`

Use `docs/evidence/customer-notes.md` only for real customer conversations,
messages, sales calls, interviews, support requests, or direct user feedback.

Public research can upgrade a claim to `public-evidence-backed`, not
`customer-evidence-backed`. If research only makes a direction plausible enough
to prototype, use `prototype-assumption`.

Ask follow-up questions only when research reveals important conflicts,
ambiguity, or unsupported critical claims:

- founder claims conflict with public evidence
- multiple plausible ICPs compete for priority
- competitor framing suggests a different product category
- pricing evidence contradicts founder instinct
- market language implies a narrower or broader product
- the claim remains important but unsupported

## 9. Delegation Lane

Use subagents selectively for independent parallel judgment and bounded
delegation. Do not use them as the default for every step.

Rule:

```text
Subagents may gather, draft, critique, and audit.
The main agent decides, writes, updates trackers, and closes gates.
```

Use subagents for:

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

Do not use subagents for:

- founder interview flow
- final product promise decisions
- MVP boundary decisions
- authoritative final-state writes without main-agent review
- tracker updates without main-agent review
- committing, publishing, or external irreversible actions
- work requiring private context that the main agent has not explicitly passed
  to the subagent

Every subagent prompt must include:

- objective
- exact files or context to read
- scope boundaries
- allowed sources
- output format
- stop condition
- instruction not to edit files unless explicitly delegated

Use prompt templates in `assets/templates/subagents/` for common research,
inventory, conflict, and readiness lanes.

## 10. Canonical Product Docs

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

## 11. Source Index

Create `docs/source-index.md` to say what each source is for and how much
confidence it deserves.

Use columns:

```text
Document | Purpose | Status | Confidence | Owner | Last Reviewed
```

## 12. Conflict Resolution

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

## 13. MVP Extraction

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

For `public-first-prototype`, extract the smallest reversible prototype instead:

- one plausible primary customer
- one plausible workflow
- one demoable value moment
- explicit assumptions and validation required
- no hard-to-reverse architecture, schema, pricing, or positioning commitments

## 14. Manual Ops Before Product

Document how the founder or team can deliver value manually:

- manual customer onboarding
- manual delivery of the core result
- manual feedback collection
- manual simulation of unbuilt features
- manual sales or concierge workflow
- what must be learned before building automation

Output: `docs/manual-ops-playbook.md`

## 15. Project Operating System

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

## 16. Sprint 0 Planning

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

## 17. Readiness Gate

Before the first execution task, answer:

- What source mode is active?
- Are product truth and MVP scope documented?
- Are assumptions separated from evidence?
- Are prototype assumptions clearly labeled?
- Are major conflicts resolved?
- Is manual delivery understood?
- Are authority docs and working rules in place?
- Is there a task tracker?
- Is the first task small, ordered, and verifiable?
- Is feature work allowed, or should Sprint 0 cleanup happen first?
- Is the first task only prepared, or did the user explicitly ask to continue
  into execution?

Close with:

```text
Go for prototype
Go for Sprint 0
No-go for product features
Needs founder/customer validation before product commitment
First blocker: <task path>
First executable AI task: <task path>
```

## Preflight And Execution Boundary

By default, this skill prepares the first executable task but does not complete
it. Stop after creating a bounded task and tell the user to run
`/build-right-execution` or `$build-right-execution`.

Continue into execution only when the user explicitly asks for end-to-end
preflight plus execution in the same run. If you continue, record that boundary
crossing in the task evidence log and closeout.

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
