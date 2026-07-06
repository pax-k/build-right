---
name: build-right-engineering-principles
description: Apply Build Right engineering principles as a planning, implementation, and review standard. Use when Codex is designing architecture boundaries, splitting modules or features, creating public contracts, changing provider adapters, reviewing implementation quality, planning tests, handling side effects, errors, observability, security, or deciding whether markdown guidance needs enforceable checks.
---

# Build Right Engineering Principles

Use this skill as a cross-cutting engineering standard for Build Right projects.
It is not a lifecycle phase. It is a review and design lens that other Build
Right skills may load when architecture, contracts, implementation boundaries,
or engineering-quality tradeoffs matter.

## Required Reading

- Read `references/principles.md` before making or reviewing changes that touch
  architecture boundaries, public contracts, provider adapters, generated code,
  package ownership, side effects, errors, observability, security, testing
  strategy, or enforceable policy.
- Do not load the reference for routine product capture, backlog grooming, or
  narrow content-only updates unless those topics raise engineering-risk
  questions.

## Operating Mode

1. Identify the changed or proposed engineering surface:
   architecture, module responsibility, dependency direction, contract, adapter,
   state shape, side effect, failure path, test, evidence, or policy.
2. Apply the review checklist from `references/principles.md`.
3. Separate guidance from enforceable authority. Markdown principles are
   guidance until backed by code, checks, tests, schemas, policy, or evidence.
4. Prefer the smallest correction that preserves local patterns and reduces
   real risk. Do not introduce abstraction only because a principle names one.
5. When repeated findings expose a process gap, recommend an enforcement
   surface instead of adding more prose.
6. Record significant architecture or public-contract choices in the target
   repo's normal decision surface.

## Closeout

End with the engineering result that matters:

```text
Principles applied: <areas reviewed>
Required changes: <none | concise list>
Enforcement gap: <none | check/test/schema/policy/docs evidence needed>
Residual risk: <none | concise risk>
```
