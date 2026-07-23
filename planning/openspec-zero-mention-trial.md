# OpenSpec Zero-Mention Native Trial

Generated: 2026-07-23
Status: pass
Scratch repository: `/private/var/folders/59/372ydp210wzbvvbgwktc6nmr0000gn/T/build-right-086-zero-mention-JZVJii`
Source under test: installed Build Right skills in `/Users/pax/.codex/skills` and `/Users/pax/.agents/skills` with exact repo-local parity.

## User Prompt Contract

1.
   ```text
   Use $build-right-preflight.
   Prepare this project for evidence-driven AI execution.
   ```
2.
   ```text
   Use $build-right-feature-planning.
   Plan a readiness probe and prepare the next executable task.
   ```
3.
   ```text
   Use $build-right-execution.
   Execute the next ready AI-owned task.
   ```

The prompt audit passed: exactly three prompt forms, each names only its Build Right skill and no managed-provider term or operation.

## Native Results

| Stage | Result | Evidence |
| --- | --- | --- |
| preflight | pass (live-process) | `/var/folders/59/372ydp210wzbvvbgwktc6nmr0000gn/T/build-right-086-zero-mention-JZVJii/docs/evidence/native/preflight-a6b71509-1078-48ed-8760-a93b98bd7ca6.jsonl`, `/var/folders/59/372ydp210wzbvvbgwktc6nmr0000gn/T/build-right-086-zero-mention-JZVJii/docs/evidence/native/preflight-a6b71509-1078-48ed-8760-a93b98bd7ca6.last.txt` |
| feature-planning | pass (live-process) | `/var/folders/59/372ydp210wzbvvbgwktc6nmr0000gn/T/build-right-086-zero-mention-JZVJii/docs/evidence/native/feature-planning-009f0ebe-8dd0-49c5-89f8-dfd58c952689.jsonl`, `/var/folders/59/372ydp210wzbvvbgwktc6nmr0000gn/T/build-right-086-zero-mention-JZVJii/docs/evidence/native/feature-planning-009f0ebe-8dd0-49c5-89f8-dfd58c952689.last.txt` |
| execution-1 | pass (live-process) | `/var/folders/59/372ydp210wzbvvbgwktc6nmr0000gn/T/build-right-086-zero-mention-JZVJii/docs/evidence/native/execution-1-83af542c-46b6-40b5-a7c9-2fb1e0165e30.jsonl`, `/var/folders/59/372ydp210wzbvvbgwktc6nmr0000gn/T/build-right-086-zero-mention-JZVJii/docs/evidence/native/execution-1-83af542c-46b6-40b5-a7c9-2fb1e0165e30.last.txt` |

## Lifecycle Assertions

- Fresh start: pass; the scratch repository had no managed planning root before preflight.
- Automatic preflight setup: pass; the installed native preflight invocation created and validated the pinned repository-local root.
- Automatic planning: pass; change `plan-a-readiness-probe-and-prepare-the-next-executable-task-18ca830d0b` was created, strictly validated, and bound into the Build Right sprint.
- One-item execution: pass; incomplete provider-item deltas per native execution were `1`.
- Automatic finalization: pass; archived change `2026-07-23-plan-a-readiness-probe-and-prepare-the-next-executable-task-18ca830d0b` exists and no active change remains.
- Compatible existing root: pass; an added sentinel survived the idempotent second setup.

## Proof Levels

- Native agent plus real CLI: installed skills were invoked through `codex exec --ephemeral --json`; their internal helpers used pinned OpenSpec 1.6.0.
- Real CLI: fresh setup, feature artifact generation/validation, execution progress, strict validation, sync, and archive occurred in the scratch repository.
- Deterministic: prompt audit, installed/source parity, component failure matrices, and exact lifecycle postconditions are code-checked.
- Fixture: product authority and the small Bun readiness-probe project were seeded to avoid asking the native agent to invent founder decisions.
- Simulated: negative provider/process/filesystem controls use bounded test doubles where real faults would be unsafe or nondeterministic.
- Unproven: production, customer, deployment, publication, and release behavior.
