# OpenSpec Planning Provider Integration

Status: accepted for implementation
Owner: AI
Created: 2026-07-23
Target sprint: `planning/sprints/007-openspec-planning-provider-integration.md`

## Purpose

Add OpenSpec as a managed internal planning engine for Build Right.

The integration should let OpenSpec own change-local behavioral specifications,
design artifacts, and implementation checklists while Build Right continues to
own product truth, task priority, execution readiness, ownership, stop gates,
evidence, and completion policy.

Users continue to prompt only Build Right skills. Build Right installs or
resolves a pinned OpenSpec runtime, initializes its repository-local planning
surface, creates and updates changes, consumes OpenSpec state during execution,
and finalizes completed changes under the hood.

This is managed orchestration between two systems with different
responsibilities. It is not an OpenSpec fork or a second implementation of
OpenSpec.

## Requirement Basis

The design is based on:

- the current Build Right lifecycle and workflow backbone,
- the current Build Right resolver and evidence contracts,
- the requested comparison and technical integration discussion from
  2026-07-23,
- OpenSpec `v1.6.0` at inspected commit
  `81d5109b86f16537deb99f84a772a83235dc9e09`,
- OpenSpec's public CLI JSON surfaces for status, apply instructions, and
  validation.

## Comparison Snapshot

Both systems make agent work more deliberate by turning an informal request
into durable repository artifacts, validating those artifacts, and separating
planning from implementation. They differ in what they govern.

| Dimension | Build Right | OpenSpec |
| --- | --- | --- |
| Primary purpose | Govern the product-to-evidence delivery lifecycle. | Govern change-scoped specifications and their lifecycle. |
| User entry point | Preflight, feature-planning, and execution skills. | CLI commands and generated agent workflows. |
| Canonical artifacts | Product truth, sprints, tasks, gates, and evidence. | Main specs plus proposal, design, delta specs, and checklist per change. |
| State model | Ownership, readiness, blockers, verification, and completion. | Artifact dependencies, requirement deltas, task checkboxes, and archive state. |
| Validation strength | Cross-cutting execution policy and evidence gates. | Schema-aware spec structure and strict change validation. |
| Completion meaning | Verified implementation with durable evidence and gates satisfied. | Change artifacts and checklist complete enough to synchronize and archive. |
| External constraints | Founder decisions, credentials, conflicts, releases, and outside state are first-class gates. | These concerns remain outside the core change engine. |
| History | Sprint/task evidence and failure ledgers. | Archived changes and synchronized main specifications. |

### What Each Does Well

Build Right is stronger at:

- connecting product intent to an ordered delivery queue,
- preserving explicit ownership and human/external stop gates,
- selecting exactly one ready task,
- requiring baselines, real verification, and durable closeout evidence,
- distinguishing planning, simulation, runtime proof, and completion.

OpenSpec is stronger at:

- expressing behavior as structured requirement deltas,
- keeping proposal, design, specifications, and implementation checklist
  together around one change,
- exposing artifact dependency order and machine-readable CLI state,
- validating spec structure before implementation,
- synchronizing accepted deltas into main specs and retaining an archive.

### What Each Does Less Well

Build Right currently has weaker native support for:

- formal behavioral requirement deltas,
- dependency-aware generation of change artifacts,
- spec synchronization and immutable change archives,
- a stable machine-readable planning-provider interface.

OpenSpec by itself has weaker native support for:

- product truth, MVP priority, and cross-change task selection,
- ownership and founder/external-state gates,
- implementation baselines and project-specific proof,
- evidence-backed completion beyond artifact and checkbox state,
- resolving conflicts between delivery policy and spec progress.

### What Build Right Should Learn And Preserve

Adopt from OpenSpec:

- change-scoped proposal, spec, design, and checklist artifacts,
- dependency-aware artifact instructions,
- strict structured validation,
- delta-to-main-spec synchronization and archival history,
- versioned JSON process contracts suitable for adapters.

Preserve from Build Right:

- a single authority for product truth and delivery readiness,
- one-task execution and explicit ownership,
- fail-closed founder, external, conflict, verification, and release gates,
- evidence as a prerequisite for completion,
- clear distinctions between deterministic tests, simulations, real runtime
  trials, and production proof.

Avoid:

- making users learn or prompt two overlapping workflows,
- copying OpenSpec artifacts into a second canonical Build Right form,
- treating a checked OpenSpec item as verified implementation,
- importing OpenSpec private modules or depending on unversioned output,
- allowing automatic setup or finalization to bypass repository safety gates.

## Authority Model

```text
Build Right
  owns:
    product truth
    MVP and release scope
    priority and task ownership
    founder and external-state gates
    execution readiness
    baseline and verification requirements
    evidence and completion policy

OpenSpec
  owns:
    change proposal
    behavioral requirement deltas
    technical design for the change
    implementation checklist
    main-spec synchronization
    change archive history

Target repository
  owns:
    source code
    tests
    CI
    deployable behavior
    enforceable project policy
```

No state should have two equal authorities. Build Right may reference and
validate OpenSpec state, but it must not copy OpenSpec proposal, spec, design,
or task descriptions into a second canonical form.

## Goals

- Require no OpenSpec-specific command or prompt from the user.
- Resolve a pinned OpenSpec runtime automatically through Bun.
- Initialize OpenSpec safely and idempotently without letting provider setup
  modify unrelated target-repository files.
- Create and update OpenSpec change artifacts automatically during Build Right
  feature planning.
- Bind every generated execution task to one OpenSpec change and work item.
- Normalize OpenSpec JSON behind a provider-neutral contract.
- Preserve Build Right's existing resolver decisions and gate precedence.
- Detect drift between Build Right execution state and OpenSpec checkbox state.
- Fail closed when the managed OpenSpec runtime cannot be resolved, initialized,
  inspected, or validated.
- Add a read-only archive-readiness decision that combines both systems.
- Automatically synchronize and archive an OpenSpec change only after Build
  Right archive readiness passes.
- Keep provider setup and mutations outside the read-only resolver.
- Protect the integration with deterministic fixtures and one real pinned
  OpenSpec scratch trial.

## Non-Goals

- Reimplement OpenSpec schemas, parsers, delta merging, or archive behavior.
- Import private OpenSpec TypeScript modules.
- Require a global OpenSpec installation.
- Generate OpenSpec-specific agent skills or slash commands in target repos.
- Run provider setup or mutations from a read-only resolver.
- Add a general Build Right workflow DSL.
- Add cross-repository OpenSpec stores in the first integration.
- Duplicate OpenSpec task descriptions or behavioral requirements in Build
  Right task files.
- Reinitialize or overwrite an existing valid OpenSpec root.
- Silently repair conflicting, externalized, or malformed OpenSpec state.

## Design Principles

1. Build Right policy depends on a stable provider port, not OpenSpec output.
2. OpenSpec is a managed but untrusted external process boundary.
3. Provider inspection is read-only and bounded.
4. Setup and mutations use a separate explicit orchestration boundary.
5. Users prompt only Build Right; internal OpenSpec actions remain visible in
   Build Right evidence and closeout.
6. Missing or incompatible managed runtime state is a hard gate.
7. A checked OpenSpec checkbox is progress, not completion evidence.
8. Existing Build Right projects migrate lazily and idempotently.
9. Version drift is surfaced as structured failure rather than guessed through.

## Architecture

### First Release Layout

The source implementation is shared and bundled into lifecycle skills at
release time so preflight, feature planning, and execution can invoke the same
managed runtime without depending on this source checkout.

```text
src/openspec/
  contracts.ts
  managed-runtime.ts
  safe-setup.ts
  adapter.ts
  orchestrator.ts
  process-runner.ts
  runtime-validation.ts

skills/build-right-preflight/scripts/
  ensure-openspec.ts

skills/build-right-feature-planning/scripts/
  ensure-openspec.ts
  openspec-change-check.ts

skills/build-right-execution/scripts/
  ensure-openspec.ts
  continue-check.ts
  execution-check.ts
  finalize-openspec-change.ts
  lib/
    contracts.ts
    resolver.ts
    markdown-provider.ts
    planning-provider.ts
    render.ts
```

Responsibilities:

- `managed-runtime.ts`: resolve the exact pinned Bun/OpenSpec command.
- `safe-setup.ts`: initialize in scratch, validate output, and atomically copy
  only `openspec/` into the target.
- `adapter.ts`: translate OpenSpec CLI JSON into provider-neutral state.
- `orchestrator.ts`: expose allowed OpenSpec mutations to Build Right skills.
- `ensure-openspec.ts`: idempotent lifecycle entrypoint used before Build Right
  planning or execution.
- `continue-check.ts`: parse CLI arguments, compose dependencies, render output.
- `execution-check.ts`: expose task-contract, stop-gate, and archive-readiness
  modes.
- `finalize-openspec-change.ts`: synchronize and archive only after a fresh
  archive-readiness result.
- `contracts.ts`: stable Build Right task, gate, provider, evidence, and result
  shapes.
- `resolver.ts`: pure gate precedence and next-action policy.
- `markdown-provider.ts`: current repository Markdown inspection.
- `planning-provider.ts`: provider port and provider-neutral result types.
- `render.ts`: stable Markdown and JSON rendering.

Generated or bundled runtime copies must be separated from hand-written source,
carry a source hash, and pass source-parity tests before release.

### Dependency Direction

```text
CLI entrypoints
  -> application composition
    -> managed OpenSpec runtime
      -> safe setup
      -> mutation orchestrator
    -> resolver policy
      -> planning-provider port
        <- OpenSpec adapter
      -> repository-state port
        <- Markdown provider

OpenSpec adapter
  -> bounded process runner
  -> runtime JSON validation
```

The resolver must not import setup or mutation behavior. Lifecycle skills call
`ensure-openspec.ts` before the read-only helper, and the CLI composition layer
constructs the adapter after setup succeeds.

## Provider Contract

```ts
export interface PlanningProvider {
  readonly id: "openspec";

  inspect(input: {
    cwd: string;
    change: string;
  }): Promise<PlanningChangeResult>;

  validate(input: {
    cwd: string;
    change: string;
  }): Promise<PlanningValidationResult>;
}

export type PlanningWorkItem = {
  id: string;
  title: string;
  complete: boolean;
  sourcePath: string;
};

export type PlanningChangeResult =
  | {
      ok: true;
      provider: "openspec";
      providerVersion: string;
      change: string;
      schema: string;
      state: "blocked" | "ready" | "all-done";
      artifacts: PlanningArtifact[];
      workItems: PlanningWorkItem[];
      evidence: EvidenceRef[];
    }
  | {
      ok: false;
      provider: "openspec";
      code:
        | "provider-unavailable"
        | "unsupported-version"
        | "invalid-output"
        | "command-failed"
        | "change-not-found"
        | "timeout";
      message: string;
      evidence: EvidenceRef[];
    };
```

Only fields consumed by Build Right belong in this public contract. OpenSpec's
full JSON result must not leak through the provider boundary.

## Managed Runtime And Automatic Setup

Build Right pins one tested OpenSpec version per release:

```text
bunx --bun @fission-ai/openspec@1.6.0
```

Users do not install OpenSpec globally and do not choose an OpenSpec version.
Upgrading OpenSpec is a Build Right release decision backed by contract and
native scratch tests.

Automatic setup runs during:

- `build-right-preflight` after repository inventory and before final
  readiness,
- `build-right-feature-planning` before change planning,
- `build-right-execution` as an idempotent guard for previously prepared
  projects.

Direct non-interactive `openspec init` in a user's repository is not allowed.
OpenSpec init may reconcile legacy provider-managed files outside
`openspec/`. Instead:

1. Detect an existing OpenSpec root.
2. If valid and compatible, preserve and use it.
3. If malformed, externalized, or incompatible, fail closed with evidence.
4. If absent, create a fresh temporary directory.
5. Run:

   ```sh
   bunx --bun @fission-ai/openspec@1.6.0 \
     init <scratch> --tools none --profile core
   ```

6. Validate that scratch output contains only the expected provider planning
   surface.
7. Stage the generated `openspec/` directory inside the target filesystem.
8. Atomically rename it into place only if `openspec/` is still absent.
9. Record the Build Right version, OpenSpec version, command, result, and
   created paths in evidence.
10. Remove only the validated scratch directory.

`--tools none` prevents OpenSpec-specific agent skills or slash commands from
being installed because users interact through Build Right.

First use may require network access for Bun to resolve the pinned package.
Offline or registry failure becomes a clear external/runtime blocker; Build
Right never falls back to an unpinned global binary.

## OpenSpec Process Boundary

The adapter invokes only public CLI commands:

```sh
bunx --bun @fission-ai/openspec@1.6.0 --version
bunx --bun @fission-ai/openspec@1.6.0 status --change <change> --json
bunx --bun @fission-ai/openspec@1.6.0 instructions apply --change <change> --json
bunx --bun @fission-ai/openspec@1.6.0 validate <change> --strict --json
```

Process rules:

- use `Bun.spawn` with an argument array, never a shell string,
- set the target repository as `cwd` only for read-only inspection; archive
  runs against an isolated validated scratch copy,
- apply a bounded timeout,
- bound captured stdout and stderr,
- record command name, exit code, duration, and sanitized failure summary,
- do not include repository content or secrets in generic error output,
- reject invalid JSON or missing required fields,
- require the exact Build Right-pinned version,
- never fall back to a global binary or Markdown scraping.

The read-only adapter cannot run mutation commands. The separate orchestrator
has an allowlist:

```text
init     scratch path only, tools none, core profile
new      one validated change name
archive  one validated change name, only after archive readiness
```

Proposal, spec, design, and task content is written by the Build Right
feature-planning skill using OpenSpec's returned artifact instructions and
resolved output paths. The orchestrator never accepts arbitrary subcommands
from repository content.

## Task Binding Contract

The first release adds three conditional task fields:

```md
Planning provider: openspec
Change ref: add-two-factor-auth
Work item ref: 2.1
```

These fields are generated automatically by Build Right feature planning and
are required together. Users never author or mention them.

Example:

```md
# AUTH-021: Implement TOTP Enrollment

Status: ready
Type: implementation
Owner: AI

Planning provider: openspec
Change ref: add-two-factor-auth
Work item ref: 2.1
Assumption basis: repo-evidence-backed
Requirement basis: openspec/specs/auth/spec.md#totp-enrollment
Reversibility: moderate
Learning objective: prove enrollment and recovery behavior
Source under test: repo-local path
```

Meaning:

- Build Right status expresses execution governance.
- OpenSpec checkbox state expresses implementation progress.
- Build Right evidence determines whether work may be called complete.

The task title and goal may summarize the selected work item, but they must not
be treated as a second canonical requirement or implementation checklist.

## State Reconciliation

| Build Right state | OpenSpec work item | Evidence | Result |
| --- | --- | --- | --- |
| `ready` | unchecked | baseline destination exists | `execute-task` |
| `active` | unchecked | task intake recorded | `continue-active-task` |
| `complete` | checked | completion evidence valid | valid complete |
| `complete` | unchecked | any | `invalid-state` |
| `ready` or `active` | checked | missing completion evidence | `invalid-state` |
| executable | missing change or work item | any | `invalid-state` |
| executable | change validation failed | any | `invalid-state` |
| planned | blocked artifact graph | any | planning blocker |

The resolver never mutates status. The active Build Right execution skill
reconciles the owning artifacts after implementation, verification, and
evidence are complete.

## New Gate Types

```ts
type PlanningGateType =
  | "planning-provider-unavailable"
  | "planning-provider-invalid"
  | "planning-drift"
  | "spec-validation-failed"
  | "spec-sync-pending";
```

These normalize into existing Build Right decisions:

- provider unavailable for a bound task -> `invalid-state`,
- invalid provider output -> `invalid-state`,
- status drift -> `invalid-state`,
- failed strict validation -> `invalid-state`,
- incomplete artifact graph during planning -> `create-blocker` or planning
  route,
- pending spec synchronization before archive -> `create-blocker`.

Existing precedence remains:

```text
invalid state
-> founder decision
-> external state
-> AI-owned blocker
-> active AI-owned task
-> ready AI-owned task
-> no ready task
```

OpenSpec contributes evidence and gates; it does not select Build Right's next
action.

## Archive Readiness

Add `archive-readiness` to the execution helper:

```sh
bun <skill-path>/scripts/execution-check.ts \
  --cwd <project> \
  --mode archive-readiness \
  --change <change> \
  --format json
```

Expected shape:

```json
{
  "decision": "archive-ready",
  "change": "add-two-factor-auth",
  "checks": {
    "openspecValidation": "pass",
    "tasksComplete": true,
    "buildRightEvidenceComplete": true,
    "projectVerification": "pass",
    "conflictsClosed": true,
    "releaseGatesSatisfied": true,
    "specSyncState": "synced | sync-ready"
  },
  "blockingGates": []
}
```

Archive is ready only when:

1. strict OpenSpec validation passes,
2. every bound work item is checked,
3. every bound Build Right task has required completion evidence,
4. required project verification has passed or an allowed skip records risk,
5. no founder, external, conflict, source-mismatch, or failed-verification gate
   remains,
6. delta specs are already synchronized (`synced`) or form a validated,
   bounded synchronization input that the allowlisted archive command will
   apply synchronously (`sync-ready`).

The helper does not archive. After it returns `archive-ready`, the Build Right
execution skill automatically invokes the allowlisted finalizer. The finalizer
reruns the complete read-only archive-readiness decision immediately before
mutation under a repository finalization lock. It copies the validated
`openspec/` tree to isolated scratch space and runs normal validated OpenSpec
archive behavior there, never `--no-validate`. Before publication it requires
an exact hash-preserved archive of the active change, permits changes only to
that archive and main specs, strictly validates the scratch main specs, and
rechecks the Build Right docs/tasks and target OpenSpec hashes for races. It
then atomically exchanges the complete validated OpenSpec tree into place and
re-inspects the canonical target before reporting success. Provider failure,
malformed output, unrelated writes, drift, validation failure, or publication
failure leaves the target OpenSpec tree unchanged. If the platform reports that
the guarded exchange cannot be rolled back, the finalizer fails as
`recovery-required`, preserves the displaced tree, and reports its bounded
recovery path instead of claiming an unchanged target.
`sync-ready` authorizes only that normal synchronous spec update plus archive;
it never authorizes `--skip-specs` or a validation bypass.
No OpenSpec-specific user prompt is required.

## Feature Planning Integration

Feature planning gains these internal routes:

```ts
type OpenSpecPlanningDecision =
  | "create-openspec-change"
  | "update-openspec-change"
  | "bind-openspec-tasks";
```

Routing:

```text
No relevant change
  -> automatically create OpenSpec change

Change exists but required artifacts are incomplete
  -> automatically continue/update artifacts

Change is apply-ready but Build Right task bindings are absent
  -> automatically bind OpenSpec tasks

Bindings exist and both contracts pass
  -> ready for execution
```

The user supplies only the feature request to `build-right-feature-planning`.
The skill derives a collision-safe change name, creates the change, obtains
artifact instructions in dependency order, writes the artifacts, validates
them, creates thin Build Right bindings, updates sprint state, and stops before
implementation.

Feature planning remains planning-only. OpenSpec artifacts are planning files,
not product implementation.

## User Experience

The only public prompts are Build Right prompts:

```text
Use $build-right-preflight.
Prepare this project for evidence-driven AI execution.
```

```text
Use $build-right-feature-planning.
Plan passwordless authentication and prepare the next executable task.
```

```text
Use $build-right-execution.
Execute the next ready AI-owned task.
```

The user never needs to install, initialize, name, prompt, apply, validate,
sync, or archive OpenSpec. Build Right reports internal planning-engine actions
as evidence, but OpenSpec is not part of the required user vocabulary.

## Configuration

A general Build Right project configuration is deferred until managed
orchestration proves it is needed. The intended later shape is:

```json
{
  "$schema": "https://example.org/build-right/v1/config.schema.json",
  "version": 1,
  "profile": "standard",
  "planning": {
    "managedEngine": "openspec",
    "required": true
  },
  "execution": {
    "oneTaskPerIteration": true,
    "requireBaseline": true,
    "requireEvidence": true,
    "failClosedOnVerification": true
  }
}
```

The proposed path is `.build-right/config.json`. JSON is preferred initially
because installed skill helpers can parse and validate it without fetching a
runtime dependency.

This configuration is not part of Sprint 007 unless implementation evidence
shows explicit task bindings are insufficient.

## Compatibility

- Existing task files without generated planning bindings are migrated during
  the next feature-planning pass; execution fails closed if a task requires
  behavior specifications that have not yet been migrated.
- Existing Markdown and JSON output fields remain stable.
- New provider evidence and gate fields are additive.
- Existing tests must pass before provider behavior is enabled.
- Installed skill use must not require this source repository.
- The integration never assumes a global OpenSpec binary exists on `PATH`.
- Existing OpenSpec roots are preserved when compatible and blocked when their
  ownership or shape is ambiguous.

## Security And Reliability

- Treat CLI output as untrusted external input.
- Use runtime shape checks before reading nested fields.
- Do not execute values from task Markdown.
- Validate change and work-item identifiers before passing them as arguments.
- Never invoke through a shell.
- Bound execution time and output.
- Keep command evidence free of secrets and full environment dumps.
- Preserve unrelated repository and OpenSpec state.
- Resolve only the exact pinned package version.
- Initialize only in validated scratch space and copy only `openspec/`.
- Keep mutation names and results visible in Build Right evidence.
- Do not publish or deploy.

## Verification Strategy

### Unit And Contract Fixtures

- valid OpenSpec status,
- valid apply instructions,
- all-done apply state,
- absent OpenSpec root with successful managed setup,
- compatible existing OpenSpec root preserved byte-for-byte,
- malformed or externalized existing root blocked,
- unexpected scratch init output rejected,
- concurrent setup race resolved without overwrite,
- offline pinned-runtime resolution failure,
- incomplete artifact graph,
- malformed JSON,
- missing required fields,
- missing CLI,
- non-zero exit,
- timeout,
- missing change,
- unknown major version.

### Resolver Matrix

- ready plus unchecked -> `execute-task`,
- active plus unchecked -> `continue-active-task`,
- complete plus unchecked -> `invalid-state`,
- checked without evidence -> `invalid-state`,
- missing bound work item -> `invalid-state`,
- strict validation failure -> `invalid-state`,
- legacy resolver fixtures remain unchanged below orchestration,
- lifecycle entry with no managed root -> safe setup before resolution.

### Archive Matrix

- invalid delta spec,
- incomplete work item,
- missing Build Right evidence,
- failed project verification,
- open conflict,
- unsynchronized specification,
- fully valid archive-ready state.

### Real Integration Trial

Use a fresh temporary repository and a pinned OpenSpec version:

```text
Build Right preflight fixture
-> automatic pinned runtime resolution and safe setup
-> Build Right feature request with no OpenSpec wording
-> automatically generated OpenSpec change artifacts
-> automatically generated thin Build Right task bindings
-> one-item execution simulation with real commands
-> evidence closeout
-> strict OpenSpec validation
-> archive readiness
-> automatic archive in the scratch repository
```

The trial must distinguish:

- deterministic fixture proof,
- real OpenSpec CLI proof,
- native agent proof,
- anything still simulated or unproven.

## Delivery Sequence

| Task | Outcome |
| --- | --- |
| 080 | Extract resolver core without changing behavior. |
| 081 | Add pinned managed runtime and safe automatic setup. |
| 082 | Add provider and mutation-orchestration contracts. |
| 083 | Automate OpenSpec-backed feature planning and binding generation. |
| 084 | Automate one-task execution and cross-system state reconciliation. |
| 085 | Add fail-closed readiness and automatic finalization. |
| 086 | Prove the zero-OpenSpec-mention user experience and close the sprint. |

## Definition Of Done

- A user can run the three normal Build Right skills without installing,
  initializing, naming, or prompting OpenSpec.
- Build Right safely establishes or preserves the managed OpenSpec root.
- Every planned feature is represented by an automatically generated OpenSpec
  change.
- A generated OpenSpec work item can be selected as exactly one Build Right
  task.
- Provider absence, malformed output, version mismatch, validation failure, and
  cross-system drift all fail closed.
- Completion requires OpenSpec progress plus Build Right evidence.
- Archive readiness is read-only; the execution skill automatically finalizes
  only after it passes.
- Feature planning creates valid OpenSpec artifacts and thin bindings, then
  stops before implementation.
- Tests cover positive, negative, drift, timeout, and compatibility cases.
- A pinned real OpenSpec scratch trial passes.
- Documentation and installed-skill packaging remain agent-agnostic.

## Deferred Work

- `.build-right/config.json` and profile selection,
- cross-repository OpenSpec stores,
- spec-to-test trace matrices beyond current verification evidence,
- provider registries for planning systems other than OpenSpec,
- user-facing OpenSpec commands or separately installed OpenSpec skills.
