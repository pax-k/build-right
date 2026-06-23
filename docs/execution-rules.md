# Execution Rules

## Authority Order

1. AGENTS.md and nested local instructions.
2. docs/blueprint-status.md.
3. docs/source-index.md.
4. docs/execution-rules.md.
5. docs/release-gates.md.
6. RELEASE_CHECKLIST.md.
7. Selected task file under tasks/issues/.
8. Existing source files and templates.

## AI May Decide

- Documentation organization that preserves existing repo meaning.
- Implementation details inside a selected task boundary.
- Test or validation commands that use Bun and match current package structure.
- Follow-up issue wording for unrelated discoveries.
- Whether evidence belongs in a task log, release gate, decision log, or conflict tracker.

## AI Must Ask

- Product promise changes.
- Primary user, buyer, or MVP boundary changes.
- Public positioning changes that alter the intended audience.
- Risky overwrites of substantial existing content.
- Changes requiring secrets, paid services, production access, publishing, or irreversible external actions.
- Whether to publish a new release, change public positioning, or claim skills.sh directory indexing before search evidence exists.

## Stop/Ask Gates

Do not advance to the next task when the current result exposes one of these
gates:

- founder-owned product, positioning, buyer/user, or MVP decision required
- external discovery, search indexing, publishing, secrets, paid services, or
  production access required
- failed verification, stale task state, source mismatch, or ambiguous evidence
- required subagent review skipped without an equivalent substitute

Ask the user when a user answer is required. Create a follow-up only when the
blocker is AI-owned, bounded, and evidence-backed.

## Subagent Review Triggers

Use subagent review when tooling is available and a selected task changes
release gates, release checklist, manual-trial evidence, verifier behavior,
skill workflows, contracts, templates, or multiple trackers. Also use it when
verification failed and was fixed inside the same task, or when findings imply
a founder-owned, external-state, stale-task, or source-mismatch gate.

If a trigger applies but subagent tooling is unavailable or forbidden, record
the skipped review, substitute verification, and residual risk before closing.

## Concurrent Run Safety

Before editing `tasks/`, `docs/release-gates.md`, `RELEASE_CHECKLIST.md`, or
shared evidence files, inspect `git status --short` and the selected task file.
If active or recent changes show another run owns the same task, same tracker,
or same release evidence surface, do not silently continue.

Required behavior:

- Same task or same tracker ownership conflict: wait, ask the user, or switch to
  observation-only mode.
- Shared release/evidence surface conflict: inspect first, then edit only if the
  selected task requires it and the current state still matches the task.
- Parallel work is allowed only when task ownership and touched files are
  disjoint.
- When a concurrent mutation changes the task boundary, update the tracker or
  create a follow-up instead of overwriting another run's evidence.

## Evidence Destinations

- Task evidence: `tasks/issues/*.md`.
- Sprint state: `tasks/sprint-0.md`.
- Blueprint readiness: `docs/blueprint-status.md`.
- Durable decisions: `docs/decision-log.md`.
- Conflicts and contradictions: `docs/conflicts.md`.
- Release evidence and go/no-go: `docs/release-gates.md` and `RELEASE_CHECKLIST.md`.

## Required Verification

| Change Type | Required Checks | Evidence |
| --- | --- | --- |
| Docs/task update | Inspect changed Markdown and linked paths. | Task Evidence Log |
| Skill manifest update | `bunx skills add . --list`; parse `skills.sh.json`. | Task Evidence Log and release gate |
| Skill entrypoint update | Confirm each `SKILL.md` has `name` and `description` frontmatter. | Task Evidence Log |
| Template update | Inspect template shape and run local discovery if skill packaging could be affected. | Task Evidence Log |
| TypeScript/package update | `bun test` if tests exist; `bun run` script if package scripts exist; `bun <file>` for direct scripts. | Task Evidence Log |
| Release readiness | Complete local validation, manual trial notes, and explicit go/no-go. | `docs/release-gates.md`; `RELEASE_CHECKLIST.md` |
