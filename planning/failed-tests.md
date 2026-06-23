# Failed Tests Log

Status: active
Owner: AI
Created: 2026-06-23

## Purpose

Append every failed Build Right manual-trial expectation, verifier assertion,
browser proof, helper-script decision, or command result here. This log is an
input for later system improvements, so failures should remain visible after
they are fixed.

## Logging Rule

Append a row whenever any of these happens:

- A Bun command exits non-zero.
- A helper script returns an unexpected decision.
- A generated artifact is missing a required section or marker.
- A transcript misses a required workflow marker.
- Browser proof fails or cannot run when required.
- Source-under-test parity fails.
- A stop/ask gate is ignored or misclassified.
- An automation assertion fails.

Do not delete rows after fixes. Add resolution notes and link the follow-up
task or commit when available.

## Failure Classes

| Class | Meaning |
| --- | --- |
| `agent-instruction` | Agent skipped, reordered, or contradicted skill instructions. |
| `helper-script` | A Bun helper produced the wrong decision or crashed. |
| `generated-artifact` | Generated docs, tasks, or evidence did not match the contract. |
| `verifier-gap` | Automation missed or could not express an important expectation. |
| `environment` | Local runtime, dependency, port, filesystem, or browser setup failed. |
| `browser-proof` | UI behavior or visual proof failed. |
| `source-under-test` | Installed, invoked, or repo-local skill source did not match expectations. |
| `gate` | Founder, external, ownership, conflict, stale, release, or verification gate was mishandled. |
| `regression` | Previously passing behavior failed after a change. |
| `unknown` | Failure needs triage before classification. |

## Failures

| Date | Task | Phase | Command or Test | Expected | Actual | Class | Artifact | Follow-up | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

