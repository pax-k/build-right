# Sprint 007: Managed OpenSpec Planning Engine

Status: complete
Owner: AI
Created: 2026-07-23

## Purpose

Make OpenSpec a managed internal planning engine invoked automatically by Build
Right while preserving Build Right as the only user-facing workflow and the
authority for product truth, ownership, task readiness, evidence, stop gates,
and completion.

The user continues to invoke only `build-right-preflight`,
`build-right-feature-planning`, and `build-right-execution`. Build Right
resolves a pinned OpenSpec runtime, initializes it safely, creates and updates
changes, binds work items, uses them during execution, and finalizes them when
all Build Right gates pass.

## Requirement Basis

- `docs/openspec-integration-technical-design.md`
- `docs/workflow-backbone.md`
- `skills/build-right-feature-planning/references/planning-contract.md`
- `skills/build-right-execution/references/gates.md`
- `skills/build-right-execution/references/evidence-contract.md`
- `skills/build-right-engineering-principles/references/principles.md`

## Scope

Included:

- Refactor execution resolution into explicit policy and adapter boundaries.
- Preserve existing Build Right helper output and policy.
- Add a pinned Bun/OpenSpec runtime with no global installation.
- Add idempotent safe setup through scratch initialization and atomic copy.
- Add provider-neutral inspection and mutation-orchestration contracts.
- Automatically create OpenSpec changes and artifacts from Build Right feature
  requests.
- Automatically create OpenSpec change/work-item task bindings.
- Detect provider failures, validation failures, and cross-system drift.
- Update OpenSpec progress only after Build Right verification and evidence.
- Add read-only fail-closed archive readiness plus automatic validated
  finalization.
- Add deterministic fixtures and a pinned real OpenSpec scratch trial.

Excluded:

- Reimplementing OpenSpec schemas or archive mechanics.
- Requiring users to install, initialize, prompt, apply, validate, sync, or
  archive OpenSpec.
- Direct imports from OpenSpec private TypeScript modules.
- A general provider registry or Build Right workflow DSL.
- Cross-repository OpenSpec stores.
- `.build-right/config.json` profiles unless Sprint 007 evidence proves they
  are required for the first release.
- Product implementation unrelated to this integration.

## Task Queue

| ID | Title | Status | Depends On | Evidence |
| --- | --- | --- | --- | --- |
| 080 | Extract execution resolver core without behavior drift | complete | none | planning/tasks/080-extract-execution-resolver-core.md |
| 081 | Add managed OpenSpec runtime and safe setup | complete | 080 | planning/tasks/081-add-managed-openspec-runtime-and-setup.md |
| 082 | Add OpenSpec provider and orchestration contracts | complete | 081 | planning/tasks/082-add-openspec-provider-and-orchestration-contracts.md |
| 083 | Automate OpenSpec-backed feature planning | complete | 082 | planning/tasks/083-automate-openspec-feature-planning.md |
| 084 | Automate OpenSpec-backed execution | complete | 083 | planning/tasks/084-automate-openspec-execution.md |
| 085 | Add automatic OpenSpec finalization | complete | 084 | planning/tasks/085-add-automatic-openspec-finalization.md |
| 086 | Prove zero-mention OpenSpec UX and close Sprint 007 | complete | 085 | planning/tasks/086-prove-zero-mention-openspec-ux.md |

## Sequencing Rule

Only task 080 is ready initially. Move the next task to `ready` only after its
dependency is complete with evidence and the current verification suite is
green.

Do not implement provider behavior before task 080 locks existing resolver
behavior behind tests.

## Gates

Sprint 007 cannot close until:

- tasks 080-086 are complete with checked acceptance criteria,
- a user prompt never needs to name or invoke OpenSpec,
- managed setup uses an exact pinned OpenSpec version,
- setup cannot modify unrelated target-repository files,
- compatible existing OpenSpec roots are preserved,
- managed-runtime absence, setup failure, and malformed provider output fail
  closed,
- incompatible runtime or root state is rejected with remediation guidance,
- OpenSpec/Build Right status drift is detected,
- automatic finalization cannot bypass strict validation or Build Right
  evidence,
- feature planning remains planning-only,
- a pinned real OpenSpec scratch trial passes,
- `planning/failed-test-summary.md` reports zero actionable open rows or the
  sprint closes explicitly as `failures-logged`,
- `bun test`, `bun run verify:skill-trials`, and `git diff --check` pass.

## Review Triggers

Independent review is required before closing task 086 because the sprint
changes:

- execution resolver architecture,
- an external process/provider boundary,
- automatic dependency resolution and repository setup,
- public task-contract fields,
- gate, completion, and finalization semantics,
- more than three durable planning and source files.

If subagent review is unavailable or forbidden, record the skip and substitute
focused contract tests, negative controls, a real pinned CLI trial, and a final
manual architecture review.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |
| 2026-07-23 | `docs/openspec-integration-technical-design.md` | planned | Authority, provider, binding, drift, archive, security, compatibility, and verification design recorded. |
| 2026-07-23 | `planning/tasks/080-*.md` through `planning/tasks/086-*.md` | planned | Dependency-ordered implementation tasks created; task 080 is ready. |
| 2026-07-23 | `/tmp/build-right-openspec-init.Cf0CNe` | feasibility-pass | Pinned OpenSpec 1.6.0 initialized non-interactively with `--tools none --profile core` and produced only the expected `openspec/` planning surface. |
| 2026-07-23 | Task 080 resolver extraction and full Bun gates | pass | Contracts, Markdown inspection, pure policy, rendering, and CLI composition separated without fixture/output drift; task 081 promoted. |
| 2026-07-23 | Task 081 managed setup, real pinned scratch trial, and security review repairs | pass | Exact 1.6.0, isolated scratch init, atomic no-replace install, compatible-root preservation, adversarial matrix, and exact bundled parity passed; task 082 promoted. |
| 2026-07-23 | Task 082 provider/orchestration contracts, real pinned reads, and independent contract review | pass | Typed normalization, exact read/write allowlists, repository-bound readiness proof, strict-validation failure semantics, untrusted JSON checks, and adversarial timeout/output-limit behavior passed; task 083 promoted. |
| 2026-07-23 | Task 083 zero-mention feature planning, real pinned 0/1/N trials, and independent security review | pass | Scratch-confined change creation, bounded atomic artifact publication, strict validation, thin binding generation, exactly-one-ready, concurrency/crash safety, and source parity passed; task 084 promoted. |
| 2026-07-23 | Task 084 managed execution, real pinned one-item closeout, and independent final review | pass | Automatic setup composition, read-only reconciliation, structured drift gates, exact evidence proof, recoverable semantic closeout, one successor promotion, native 1/2 and dotted 1.1/1.2 bindings, and source parity passed; task 085 promoted. |
| 2026-07-23 | Task 085 archive readiness, validated finalization, and real pinned archive | pass | Read-only readiness, scratch-confined archive, exact content/mode preservation, fresh authority rehash, atomic publication/recovery, strict main-spec validation, archived binding reconciliation, real pinned proof, 85-test integrated gates, and independent no-findings review passed; task 086 promoted. |
| 2026-07-23 | Task 086 fresh three-prompt native lifecycle, failure audit, and independent final acceptance | pass | Fresh normal-configuration scratch `build-right-086-zero-mention-JZVJii` proved zero-mention setup, planning, one-item execution, strict finalization, archive-backed authority reconciliation, and clean `no-ready-task`; 92 tests/310 assertions, skill/runtime/installed parity, TypeScript, diff check, 0 actionable failures, and no-findings review passed. Sprint 007 complete. |
