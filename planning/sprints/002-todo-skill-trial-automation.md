# Sprint 002: Todo Skill Trial Automation

Status: ready
Owner: AI
Created: 2026-06-23

## Purpose

Prove the Build Right skills end to end by using them like a first-time human
would use them to create a demo React + TypeScript Todo app, then automate the
same expectations so regressions are visible.

The target trial uses an external scratch repository, not generated root
`docs/` or `tasks/` in this source repo.

## Scope

Included:

- Define the exact first-user trial protocol for a Bun-only Todo app.
- Record expected preflight questions, recommended founder replies, and
  expected under-the-hood helper behavior.
- Run the preflight skill against a blank scratch repo and inspect artifacts.
- Run the execution skill against the prepared first task and inspect the app,
  evidence, and stop gates.
- Build automation that verifies generated artifacts, transcript markers,
  helper decisions, source-under-test parity, and browser-visible Todo behavior.
- Add negative gate-case trials for not-ready projects, founder-owned work,
  open conflicts, failed release gates, and source mismatches.
- Log every failed test, failed expectation, or failed manual-trial assertion in
  `planning/failed-tests.md`.

Excluded:

- Committing the generated Todo app into this source repository.
- Replacing the current read-only helper scripts with mutable state writers.
- Publishing or deploying the Todo app.
- Treating public research as customer validation.
- Allowing automation to pass without durable artifact evidence.

## Trial Target

External scratch repository:

```text
/tmp/build-right-todo-trial
```

Seed only:

- `AGENTS.md` with the Bun-only repo rules.
- Optional blank `README.md`.
- `git init`.

Source under test:

- `skills/build-right-preflight/`
- `skills/build-right-execution/`

## Failure Logging Rule

Any failed command, verifier assertion, browser check, transcript expectation,
manual-trial expectation, helper decision mismatch, or generated-artifact
contract mismatch must be appended to `planning/failed-tests.md`.

Do not remove failed rows after fixes. Append resolution notes so later system
improvements can learn from the failure history.

## Task Queue

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| 007 | Define the Todo trial protocol | ready | planning/tasks/007-define-todo-trial-protocol.md |
| 008 | Add scratch repo seed and source parity checks | blocked | planning/tasks/008-add-scratch-repo-seed-and-source-parity-checks.md |
| 009 | Run the preflight first-user Todo trial | blocked | planning/tasks/009-run-preflight-first-user-todo-trial.md |
| 010 | Run the execution Todo app trial | blocked | planning/tasks/010-run-execution-todo-app-trial.md |
| 011 | Automate preflight artifact verification | blocked | planning/tasks/011-automate-preflight-artifact-verification.md |
| 012 | Automate execution and browser proof verification | blocked | planning/tasks/012-automate-execution-and-browser-proof-verification.md |
| 013 | Automate negative gate-case trials | blocked | planning/tasks/013-automate-negative-gate-case-trials.md |
| 014 | Add failed-test log feedback loop | blocked | planning/tasks/014-add-failed-test-log-feedback-loop.md |

## Testing Matrix

| Area | Expected Coverage |
| --- | --- |
| Preflight transcript | helper report, focused founder questions, file plan, no implementation, readiness closeout |
| Founder replies | primary user, pain, promise, MVP, non-goals, Bun-only constraints, validation expectations |
| Preflight artifacts | blueprint status, source index, MVP scope, execution rules, release gates, conflicts, evidence notes, Sprint 0, first issue |
| Execution transcript | strict resolver report, task intake, baseline evidence, task contract check, narrow implementation, verification, stop-gate report |
| Todo app behavior | add, complete, delete, filter, localStorage restore |
| Bun compliance | no Vite, npm, pnpm, yarn, npx, Express, dotenv, or forbidden Node-first runtime assumptions |
| Evidence packet | run label, agent surface, skill source, target, commands, artifacts, result, proved, simulated, unproven, follow-ups |
| Negative gates | blank repo execution, founder-owned task, open founder conflict, failed release gate, source mismatch |
| Failure logging | failed commands and failed expectations append to `planning/failed-tests.md` |

## Gate

Do not mark the manual trial ready until source-under-test parity is proven.
Do not mark automation ready until at least one failure path is forced and
logged to `planning/failed-tests.md`.

