# Build Right Codex Evals

This Promptfoo suite wraps the repo-local native Codex step runner. It is a
reporting and regression layer, not the release authority.

Use cases:

- `bun test`: deterministic unit and contract checks. This remains the fastest
  local gate.
- `bun run verify:skill-trials`: Build Right verifier authority for release
  proof.
- `bun scripts/codex-native-step-trials.ts`: native proof runner. This may
  update `planning/codex-native-step-trials.md` and append failures to
  `planning/failed-tests.md`.
- `bun run evals:codex`: Promptfoo reporting over selected native Codex flows.
  The provider always passes `--json-output --no-planning-writes`, so evals
  write scratch artifacts and Promptfoo result files only.

The default suite includes one smoke case per skill, selected native regression
steps, and deterministic negative controls. Positive cases call the real
`codex exec --ephemeral --json` path. Negative controls use runner fixtures so
the assertion layer can be checked without relying on a failed model run.

Promptfoo result files are written under `evals/build-right-codex/results/` and
are intentionally untracked. Scratch repos remain under
`/tmp/build-right-native-step-trials`.
