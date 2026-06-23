const proc = Bun.spawn(["bun", "test", "tests/skill-trials.test.ts"], {
  stdout: "inherit",
  stderr: "inherit",
});

process.exit(await proc.exited);
