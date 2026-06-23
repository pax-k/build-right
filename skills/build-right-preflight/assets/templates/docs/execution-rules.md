# Execution Rules

## Authority Order

1. AGENTS.md and nested local instructions
2. docs/source-index.md
3. docs/mvp-scope.md
4. docs/release-gates.md
5. selected task file

## AI May Decide

- Implementation details inside an approved task boundary.
- Test structure that matches existing project patterns.
- Follow-up issue wording for unrelated discoveries.

## AI Must Ask

- Product promise changes.
- Primary customer or MVP boundary changes.
- Risky overwrites of substantial existing content.
- Changes requiring secrets, paid services, production access, or irreversible external actions.

## Stop/Ask Gates

- Founder-owned product, positioning, customer, or MVP decision required.
- External discovery, publishing, secrets, paid services, or production access required.
- Failed verification, stale task state, source mismatch, or ambiguous evidence.
- Required subagent review skipped without an equivalent substitute.

Ask the user when a user answer is required. Create a follow-up only when the
blocker is AI-owned, bounded, and evidence-backed.

## Subagent Review Triggers

Use subagent review when tooling is available and a selected task changes
release gates, manual-trial evidence, verifier behavior, workflows, contracts,
templates, or multiple trackers. If a trigger applies but subagent tooling is
unavailable or forbidden, record the skipped review, substitute verification,
and residual risk before closing.

## Evidence Destinations

- Task evidence: tasks/issues/*.md
- Blueprint status: docs/blueprint-status.md
- Durable decisions: docs/decision-log.md
- New risks: docs/risk-register.md

## Required Verification

| Change Type | Required Checks | Evidence |
| --- | --- | --- |
| docs/task update | Inspect changed Markdown and linked paths | task Evidence Log |
| code behavior | Focused test plus relevant package/app check | task Evidence Log |
| UI behavior | Browser proof or screenshot when useful | task Evidence Log |
| release readiness | Gate report and explicit go/no-go | release evidence path |
