# Codex Native Skill Replay

Generated: 2026-06-24
Run root: `/tmp/build-right-codex-native-skill-replay/1782287163302-72876-c9142c7e-2c94-4a5d-88a6-3ec1c57c5aa8`
Source under test: installed user-scope skills in `/Users/pax/.codex/skills` with repo-local parity.
Status: pass

## Results

| Skill | Result | Scratch Repo | Evidence |
| --- | --- | --- | --- |
| build-right-preflight | pass | `/tmp/build-right-codex-native-skill-replay/1782287163302-72876-c9142c7e-2c94-4a5d-88a6-3ec1c57c5aa8/build-right-preflight` | `/tmp/build-right-codex-native-skill-replay/1782287163302-72876-c9142c7e-2c94-4a5d-88a6-3ec1c57c5aa8/build-right-preflight/docs/evidence/codex-native-proof.md`, `/tmp/build-right-codex-native-skill-replay/1782287163302-72876-c9142c7e-2c94-4a5d-88a6-3ec1c57c5aa8/build-right-preflight/docs/evidence/codex-events.jsonl` |
| build-right-feature-planning | pass | `/tmp/build-right-codex-native-skill-replay/1782287163302-72876-c9142c7e-2c94-4a5d-88a6-3ec1c57c5aa8/build-right-feature-planning` | `/tmp/build-right-codex-native-skill-replay/1782287163302-72876-c9142c7e-2c94-4a5d-88a6-3ec1c57c5aa8/build-right-feature-planning/docs/evidence/codex-native-proof.md`, `/tmp/build-right-codex-native-skill-replay/1782287163302-72876-c9142c7e-2c94-4a5d-88a6-3ec1c57c5aa8/build-right-feature-planning/docs/evidence/codex-events.jsonl` |
| build-right-execution | pass | `/tmp/build-right-codex-native-skill-replay/1782287163302-72876-c9142c7e-2c94-4a5d-88a6-3ec1c57c5aa8/build-right-execution` | `/tmp/build-right-codex-native-skill-replay/1782287163302-72876-c9142c7e-2c94-4a5d-88a6-3ec1c57c5aa8/build-right-execution/docs/evidence/codex-native-proof.md`, `/tmp/build-right-codex-native-skill-replay/1782287163302-72876-c9142c7e-2c94-4a5d-88a6-3ec1c57c5aa8/build-right-execution/docs/evidence/codex-events.jsonl` |

## Verification

- Installed user-scope skill directories were compared against repo-local `skills/` before replay.
- Each `codex exec --ephemeral --json` event stream was checked for the selected `SKILL.md` path.
- Each event stream was checked for required reference-file path reads.
- Each scratch repo was checked for `docs/evidence/codex-native-proof.md`.

## Residual Risk

- This proves native skill loading and bounded skill-guided execution for one replay per skill.
- Sprint 005's per-step matrix remains deterministic helper coverage; it is now backed by this native invocation smoke proof rather than being the only evidence.
