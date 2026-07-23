const parity = Bun.spawn(["bun", "run", "check:openspec-runtime"], {
  stdout: "inherit",
  stderr: "inherit",
});
if (await parity.exited !== 0) process.exit(1);

const proc = Bun.spawn(["bun", "test"], {
  stdout: "inherit",
  stderr: "inherit",
});

process.exit(await proc.exited);
