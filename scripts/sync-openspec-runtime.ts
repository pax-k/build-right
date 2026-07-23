import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";

const sourceRoot = "src/openspec";
const destinations = [
  "skills/build-right-preflight/scripts/lib/openspec",
  "skills/build-right-feature-planning/scripts/lib/openspec",
  "skills/build-right-execution/scripts/lib/openspec",
];
const sourceFiles = (await readdir(sourceRoot)).filter((file) => file.endsWith(".ts")).sort();
const hasher = new Bun.CryptoHasher("sha256");
for (const file of sourceFiles) {
  hasher.update(file);
  hasher.update(await Bun.file(join(sourceRoot, file)).arrayBuffer());
}
const manifest = `${JSON.stringify({
  version: 1,
  algorithm: "sha256",
  hash: hasher.digest("hex"),
  files: sourceFiles,
}, null, 2)}\n`;
const expectedFiles = [...sourceFiles, "source-manifest.json"].sort();
const check = Bun.argv.includes("--check");
let mismatch = false;

for (const destination of destinations) {
  let destinationExists = true;
  try {
    destinationExists = (await stat(destination)).isDirectory();
  } catch {
    destinationExists = false;
  }
  if (!destinationExists) {
    if (check) {
      mismatch = true;
      continue;
    }
    await mkdir(destination, { recursive: true });
  }
  const destinationFiles = (await readdir(destination)).sort();
  const extraFiles = destinationFiles.filter((file) => !expectedFiles.includes(file));
  if (extraFiles.length > 0) {
    mismatch = true;
    if (!check) {
      await Promise.all(extraFiles.map((file) => rm(join(destination, file), { recursive: true, force: true })));
    }
  }
  for (const file of sourceFiles) {
    const source = await Bun.file(join(sourceRoot, file)).text();
    const targetPath = join(destination, file);
    const target = await Bun.file(targetPath).exists() ? await Bun.file(targetPath).text() : "";
    if (target !== source) {
      mismatch = true;
      if (!check) await Bun.write(targetPath, source);
    }
  }
  const manifestPath = join(destination, "source-manifest.json");
  const targetManifest = await Bun.file(manifestPath).exists() ? await Bun.file(manifestPath).text() : "";
  if (targetManifest !== manifest) {
    mismatch = true;
    if (!check) await Bun.write(manifestPath, manifest);
  }
}

if (check && mismatch) {
  console.error("bundled managed planning runtime differs from src/openspec");
  process.exit(1);
}
if (!check) {
  console.log(`synchronized ${sourceFiles.length} managed runtime files to ${destinations.length} lifecycle skills`);
}
