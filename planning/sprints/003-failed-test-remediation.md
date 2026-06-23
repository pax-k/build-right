# Sprint 003: Failed-Test Remediation And Regression Proof

Status: complete
Owner: AI
Created: 2026-06-24

## Purpose

Turn the failed-test evidence from Sprint 002 into bounded system fixes and
paired regression proof. Each failure cluster gets one remediation task and one
task that proves the bug stays fixed.

## Scope

Included:

- Normalize failed-test status semantics so deliberate negative controls do not
  inflate unresolved bug counts.
- Harden preflight artifact snapshotting and semantic marker checks.
- Harden execution verification around scoped source scans, browser proof, and
  behavior-based assertions.
- Harden negative gate fixtures and conflict schema diagnostics.
- Remove shell/glob fragility from status-audit checks.
- Improve source-under-test mismatch guidance so actual drift produces a clear
  remediation path.
- Add paired Bun-native regression tests for every fix.

Excluded:

- Deleting or rewriting historical rows from `planning/failed-tests.md`.
- Reopening Sprint 002 or changing its completed task statuses.
- Committing generated Todo app artifacts into this source repository.
- Treating intentional negative controls as product defects.

## Source Evidence

- `planning/failed-tests.md`
- `planning/failed-test-summary.md`
- `planning/tasks/008-add-scratch-repo-seed-and-source-parity-checks.md`
- `planning/tasks/010-run-execution-todo-app-trial.md`
- `planning/tasks/011-automate-preflight-artifact-verification.md`
- `planning/tasks/012-automate-execution-and-browser-proof-verification.md`
- `planning/tasks/013-automate-negative-gate-case-trials.md`
- `planning/tasks/014-add-failed-test-log-feedback-loop.md`

## Task Queue

| ID | Title | Kind | Status | Evidence |
| --- | --- | --- | --- | --- |
| 015 | Fix failure-log status semantics and stale-open rollups | fix | complete | planning/tasks/015-fix-failure-log-status-semantics.md |
| 016 | Test failure-log status semantics and rollups | test | complete | planning/tasks/016-test-failure-log-status-semantics.md |
| 017 | Fix preflight snapshot and marker verification robustness | fix | complete | planning/tasks/017-fix-preflight-snapshot-and-markers.md |
| 018 | Test preflight verifier regressions | test | complete | planning/tasks/018-test-preflight-verifier-regressions.md |
| 019 | Fix execution verifier scoping and browser proof semantics | fix | complete | planning/tasks/019-fix-execution-verifier-scoping.md |
| 020 | Test execution verifier and browser proof regressions | test | complete | planning/tasks/020-test-execution-verifier-regressions.md |
| 021 | Fix negative gate fixtures and conflict diagnostics | fix | complete | planning/tasks/021-fix-negative-gate-fixtures.md |
| 022 | Test negative gate resolver matrix regressions | test | complete | planning/tasks/022-test-negative-gate-regressions.md |
| 023 | Fix baseline and status-audit environment noise handling | fix | complete | planning/tasks/023-fix-baseline-and-status-audit-noise.md |
| 024 | Test baseline and status-audit regressions | test | complete | planning/tasks/024-test-baseline-and-status-audit-regressions.md |
| 025 | Fix source parity mismatch remediation guidance | fix | complete | planning/tasks/025-fix-source-parity-remediation-guidance.md |
| 026 | Test source parity mismatch remediation path | test | complete | planning/tasks/026-test-source-parity-remediation.md |

## Gate

Do not mark Sprint 003 complete until every remediation task has a paired
regression task with fresh command evidence. If a regression task fails, append
the failure to `planning/failed-tests.md` and leave the task open.

## Review And Delegation

Required review triggers applied because helper scripts, verifier behavior, and
more than three durable task/tracker files changed. Subagent review was skipped
because the available subagent tool requires an explicit user request to spawn
subagents. Substitute review evidence: `bun test`, `bun run
verify:skill-trials`, `bun scripts/todo-trial.ts status-audit`, final trial
verifier commands, and `git diff --check` all passed.
