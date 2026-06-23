# Sprint 004: End-To-End Workflow Test Matrix

Status: complete
Owner: AI
Created: 2026-06-24

## Purpose

Define and automate the full Build Right workflow test matrix for
`build-right-preflight` and `build-right-execution`, including step-by-step
state transitions, happy paths, stop gates, artifact contracts, transcript
requirements, browser-visible Todo behavior, and failure logging.

## Scope

Included:

- Shared source-parity, Bun-compliance, scratch-isolation, failure-log, summary,
  and concurrency gates.
- Preflight happy path, state matrix, artifact contract, and transcript checks.
- Execution happy path, resolver state matrix, Todo app proof, and stop-gate
  checks.
- Agentic transcript/evidence ordering checks that prove the workflow was
  followed, not merely that scripts passed.
- A fresh scratch-repo replay harness that can run the first-user Todo trial
  end to end and produce a durable report.
- Failure-injection cases that must append to `planning/failed-tests.md`.

Excluded:

- Committing generated Todo app artifacts into this source repository.
- Deleting or rewriting historical rows in `planning/failed-tests.md`.
- Replacing the Build Right skills with a different workflow engine.
- Treating expected negative controls as actionable failures.

## Failure Logging Rule

Any failed command, verifier assertion, browser proof, helper decision,
transcript marker, state transition, or automation assertion must append a row
to `planning/failed-tests.md` with task, phase, command/test, expected, actual,
class, artifact, follow-up, and status.

After any failure is fixed, append a separate resolution row. Do not edit or
delete the original failure row.

## Task Queue

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| 027 | Define the E2E workflow oracle | complete | planning/tasks/027-define-e2e-workflow-oracle.md |
| 028 | Automate shared workflow gates | complete | planning/tasks/028-automate-shared-workflow-gates.md |
| 029 | Automate preflight happy-path replay | complete | planning/tasks/029-automate-preflight-happy-path-replay.md |
| 030 | Automate preflight state matrix | complete | planning/tasks/030-automate-preflight-state-matrix.md |
| 031 | Automate preflight artifact contract checks | complete | planning/tasks/031-automate-preflight-artifact-contracts.md |
| 032 | Automate execution happy-path replay | complete | planning/tasks/032-automate-execution-happy-path-replay.md |
| 033 | Automate execution resolver state matrix | complete | planning/tasks/033-automate-execution-resolver-state-matrix.md |
| 034 | Automate Todo app behavior and browser proof checks | complete | planning/tasks/034-automate-todo-app-browser-proof.md |
| 035 | Automate agentic transcript and evidence ordering checks | complete | planning/tasks/035-automate-agentic-transcript-evidence-checks.md |
| 036 | Build fresh scratch-repo prompt replay harness | complete | planning/tasks/036-build-fresh-scratch-replay-harness.md |
| 037 | Add failure-injection and failure-log E2E cases | complete | planning/tasks/037-add-failure-injection-log-cases.md |
| 038 | Add concurrency and scratch-isolation E2E cases | complete | planning/tasks/038-add-concurrency-scratch-isolation-cases.md |
| 039 | Add E2E report artifact and summary output | complete | planning/tasks/039-add-e2e-report-artifact.md |
| 040 | Run full E2E workflow verification and close gates | complete | planning/tasks/040-run-full-e2e-workflow-verification.md |

## Gate

Do not mark Sprint 004 complete until tasks 027-040 are complete, all
acceptance criteria are checked, `planning/failed-test-summary.md` reports no
actionable open rows, and the final verification suite passes.
