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

| 2026-06-24 | 008 | source-parity-negative | bun run todo-trial -- parity-negative | forced mismatch logs partial-needs-rerun | build-right-preflight/SKILL.md: content differs | source-under-test | /tmp/build-right-parity-negative-1782248711910 | planning/tasks/008-add-scratch-repo-seed-and-source-parity-checks.md | expected-logged |
| 2026-06-24 | 010 | baseline | bun test | baseline command may fail before app tests exist | exit 1: No tests found | generated-artifact | /tmp/build-right-todo-trial | planning/tasks/010-run-execution-todo-app-trial.md | expected-baseline |
| 2026-06-24 | 010 | verification | forbidden-tool rg scan | scan only runtime source files | command searched docs and node_modules, producing forbidden-term matches from prohibitions and dependencies | verifier-gap | /tmp/build-right-todo-trial | planning/tasks/010-run-execution-todo-app-trial.md | resolved-by-scoped-scan |
| 2026-06-24 | 011 | verify-preflight | bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight | preflight artifacts satisfy contract | missing file: /tmp/build-right-todo-trial-preflight/docs/blueprint-status.md; missing file: /tmp/build-right-todo-trial-preflight/docs/raw/founder-dump.md; missing file: /tmp/build-right-todo-trial-preflight/docs/raw/founder-interview.md; missing file: /tmp/build-right-todo-trial-preflight/docs/source-index.md; missing file: /tmp/build-right-todo-trial-preflight/docs/mvp-scope.md; missing file: /tmp/build-right-todo-trial-preflight/docs/execution-rules.md | generated-artifact | /tmp/build-right-todo-trial-preflight | planning/tasks/011-automate-preflight-artifact-verification.md | open |
| 2026-06-24 | 011 | verify-preflight | bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight-negative-missing-1782249348395 | preflight artifacts satisfy contract | missing file: /tmp/build-right-todo-trial-preflight-negative-missing-1782249348395/docs/blueprint-status.md; missing file: /tmp/build-right-todo-trial-preflight-negative-missing-1782249348395/docs/raw/founder-dump.md; missing file: /tmp/build-right-todo-trial-preflight-negative-missing-1782249348395/docs/raw/founder-interview.md; missing file: /tmp/build-right-todo-trial-preflight-negative-missing-1782249348395/docs/source-index.md; missing file: /tmp/build-right-todo-trial-preflight-negative-missing-1782249348395/docs/mvp-scope.md; missing file: /tmp/build-right-todo-trial-preflight-negative-missing-1782249348395/docs/execution-rules.md | generated-artifact | /tmp/build-right-todo-trial-preflight-negative-missing-1782249348395 | planning/tasks/011-automate-preflight-artifact-verification.md | open |
| 2026-06-24 | 011 | verify-preflight | bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight-negative-app-file-1782249348406 | preflight artifacts satisfy contract | missing file: /tmp/build-right-todo-trial-preflight-negative-app-file-1782249348406/docs/blueprint-status.md; missing file: /tmp/build-right-todo-trial-preflight-negative-app-file-1782249348406/docs/raw/founder-dump.md; missing file: /tmp/build-right-todo-trial-preflight-negative-app-file-1782249348406/docs/raw/founder-interview.md; missing file: /tmp/build-right-todo-trial-preflight-negative-app-file-1782249348406/docs/source-index.md; missing file: /tmp/build-right-todo-trial-preflight-negative-app-file-1782249348406/docs/mvp-scope.md; missing file: /tmp/build-right-todo-trial-preflight-negative-app-file-1782249348406/docs/execution-rules.md | generated-artifact | /tmp/build-right-todo-trial-preflight-negative-app-file-1782249348406 | planning/tasks/011-automate-preflight-artifact-verification.md | open |
| 2026-06-24 | 011 | resolution | preflight verifier implementation | positive preflight verifier passes after fixes | fixed directory snapshot copy and relaxed brittle `Bun` casing marker to `bun`; reran positive and negative checks successfully | verifier-gap | scripts/todo-trial.ts | planning/tasks/011-automate-preflight-artifact-verification.md | resolved |
| 2026-06-24 | 011 | verify-preflight | bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight | preflight artifacts satisfy contract | /tmp/build-right-todo-trial-preflight/docs/execution-rules.md missing marker: Bun | generated-artifact | /tmp/build-right-todo-trial-preflight | planning/tasks/011-automate-preflight-artifact-verification.md | open |
| 2026-06-24 | 011 | verify-preflight | bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight-negative-missing-1782249397112 | preflight artifacts satisfy contract | missing file: /tmp/build-right-todo-trial-preflight-negative-missing-1782249397112/docs/source-index.md; missing readable file: /tmp/build-right-todo-trial-preflight-negative-missing-1782249397112/docs/source-index.md; preflight helper decision was delegate-inventory | generated-artifact | /tmp/build-right-todo-trial-preflight-negative-missing-1782249397112 | planning/tasks/011-automate-preflight-artifact-verification.md | open |
| 2026-06-24 | 011 | verify-preflight | bun scripts/todo-trial.ts verify-preflight --target /tmp/build-right-todo-trial-preflight-negative-app-file-1782249397153 | preflight artifacts satisfy contract | app file exists during preflight verification: package.json | generated-artifact | /tmp/build-right-todo-trial-preflight-negative-app-file-1782249397153 | planning/tasks/011-automate-preflight-artifact-verification.md | open |
| 2026-06-24 | 012 | verify-execution | bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial | execution artifacts satisfy contract | /tmp/build-right-todo-trial/frontend.tsx missing marker: filter-completed | generated-artifact | /tmp/build-right-todo-trial | planning/tasks/012-automate-execution-and-browser-proof-verification.md | open |
| 2026-06-24 | 012 | verify-execution | bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial-execution-negative-1782249520780 | execution artifacts satisfy contract | /tmp/build-right-todo-trial-execution-negative-1782249520780/docs/evidence/browser-proof.md missing marker: \| localStorage restore \| pass \|; /tmp/build-right-todo-trial-execution-negative-1782249520780/frontend.tsx missing marker: filter-completed | generated-artifact | /tmp/build-right-todo-trial-execution-negative-1782249520780 | planning/tasks/012-automate-execution-and-browser-proof-verification.md | open |
| 2026-06-24 | 012 | resolution | execution verifier implementation | positive execution verifier passes and negative browser-proof corruption is isolated | replaced brittle `filter-completed` source marker with dynamic `data-testid` pattern and reran positive and negative checks | verifier-gap | scripts/todo-trial.ts | planning/tasks/012-automate-execution-and-browser-proof-verification.md | resolved |
| 2026-06-24 | 012 | verify-execution | bun scripts/todo-trial.ts verify-execution --target /tmp/build-right-todo-trial-execution-negative-1782249541345 | execution artifacts satisfy contract | /tmp/build-right-todo-trial-execution-negative-1782249541345/docs/evidence/browser-proof.md missing marker: \| localStorage restore \| pass \| | generated-artifact | /tmp/build-right-todo-trial-execution-negative-1782249541345 | planning/tasks/012-automate-execution-and-browser-proof-verification.md | open |
| 2026-06-24 | 013 | negative-gates | open founder conflict | ask-founder | execute-task | gate | /tmp/build-right-todo-trial-gate-founder-conflict-1782249632168 | planning/tasks/013-automate-negative-gate-case-trials.md | open |
| 2026-06-24 | 013 | resolution | negative gate fixture shape | conflict fixtures are parsed by continue-check | added `## Conflicts` heading to conflict fixtures and reran `bun scripts/todo-trial.ts negative-gates` successfully | verifier-gap | scripts/todo-trial.ts | planning/tasks/013-automate-negative-gate-case-trials.md | resolved |
| 2026-06-24 | 014 | forced-log-smoke | bun scripts/todo-trial.ts failure-log-smoke | forced failure row is durable | intentional smoke failure | verifier-gap | planning/failed-tests.md | planning/tasks/014-add-failed-test-log-feedback-loop.md | forced-open |
| 2026-06-24 | 014 | forced-log-smoke-resolution | bun scripts/todo-trial.ts failure-log-smoke | resolution is appended without deleting original row | forced smoke failure resolved by appended row | verifier-gap | planning/failed-tests.md | planning/tasks/014-add-failed-test-log-feedback-loop.md | resolved |
| 2026-06-24 | final-audit | status-audit | rg over task glob | audit task statuses with explicit paths | zsh glob expanded to nonexistent `planning/tasks/0010-*.md` | environment | planning/tasks | planning/tasks/014-add-failed-test-log-feedback-loop.md | resolved-by-explicit-paths |
