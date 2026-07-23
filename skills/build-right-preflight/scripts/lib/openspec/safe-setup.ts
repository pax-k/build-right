import {
  cp,
  lstat,
  mkdtemp,
  open,
  readdir,
  readFile,
  realpath,
  rm,
  stat,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import {
  BUILD_RIGHT_VERSION,
  OPENSPEC_SCHEMA,
  OPENSPEC_VERSION,
  type ProcessRunner,
  type SetupEvidence,
  type SetupResult,
} from "./contracts";
import { managedOpenSpecCommand, verifyManagedOpenSpec } from "./managed-runtime";
import { runBoundedProcess } from "./process-runner";
import { atomicRenameNoReplace } from "./atomic-install";

const allowedTopLevel = new Set(["changes", "config.yaml", "specs"]);
const maxTreeEntries = 2_000;
const maxTreeBytes = 16 * 1024 * 1024;

async function pathExists(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function validateBoundedTree(root: string): Promise<
  | { ok: true }
  | { ok: false; code: "malformed-root" | "externalized-root"; message: string }
> {
  const pending = [root];
  let seen = 0;
  let bytes = 0;
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) break;
    for (const entry of await readdir(current, { withFileTypes: true })) {
      seen += 1;
      if (seen > maxTreeEntries) {
        return { ok: false, code: "malformed-root", message: `openspec tree exceeds ${maxTreeEntries} entries` };
      }
      const path = join(current, entry.name);
      const info = await lstat(path);
      if (info.isSymbolicLink()) {
        return { ok: false, code: "externalized-root", message: "openspec tree must not contain symbolic links" };
      }
      if (!info.isDirectory() && !info.isFile()) {
        return { ok: false, code: "malformed-root", message: "openspec tree contains a special filesystem node" };
      }
      if (info.isFile()) {
        bytes += info.size;
        if (bytes > maxTreeBytes) {
          return { ok: false, code: "malformed-root", message: `openspec tree exceeds ${maxTreeBytes} bytes` };
        }
      }
      if (entry.isDirectory()) pending.push(path);
    }
  }
  return { ok: true };
}

export async function validateManagedOpenSpecRoot(cwd: string, root: string): Promise<
  | { ok: true }
  | { ok: false; code: "malformed-root" | "externalized-root"; message: string }
> {
  const rootInfo = await lstat(root);
  if (rootInfo.isSymbolicLink()) {
    return { ok: false, code: "externalized-root", message: "openspec root must not be a symbolic link" };
  }
  if (!rootInfo.isDirectory()) {
    return { ok: false, code: "malformed-root", message: "openspec root is not a directory" };
  }
  const canonicalCwd = await realpath(cwd);
  const canonicalRoot = await realpath(root);
  if (canonicalRoot !== join(canonicalCwd, "openspec")) {
    return { ok: false, code: "externalized-root", message: "openspec root resolves outside the target repository" };
  }
  const topLevel = await readdir(root);
  if (
    topLevel.some((name) => !allowedTopLevel.has(name))
    || !topLevel.includes("config.yaml")
    || !topLevel.includes("changes")
    || !topLevel.includes("specs")
  ) {
    return { ok: false, code: "malformed-root", message: "openspec root has missing or unexpected top-level entries" };
  }
  const configInfo = await lstat(join(root, "config.yaml"));
  const changesInfo = await lstat(join(root, "changes"));
  const specsInfo = await lstat(join(root, "specs"));
  if (!configInfo.isFile() || !changesInfo.isDirectory() || !specsInfo.isDirectory()) {
    return { ok: false, code: "malformed-root", message: "openspec required entries have invalid filesystem types" };
  }
  const config = await readFile(join(root, "config.yaml"), "utf8");
  const schemas = config.match(/^schema:\s*(.+)$/gm) ?? [];
  if (schemas.length !== 1 || schemas[0]?.trim() !== `schema: ${OPENSPEC_SCHEMA}`) {
    return { ok: false, code: "malformed-root", message: `openspec config must use schema ${OPENSPEC_SCHEMA}` };
  }

  return validateBoundedTree(root);
}

async function validateScratchRoot(root: string): Promise<
  | { ok: true }
  | { ok: false; code: "unsafe-output"; message: string }
> {
  try {
    const topLevel = await readdir(root);
    if (
      topLevel.some((name) => !allowedTopLevel.has(name))
      || !topLevel.includes("config.yaml")
      || !topLevel.includes("changes")
      || !topLevel.includes("specs")
    ) {
      return { ok: false, code: "unsafe-output", message: "managed init produced an unexpected openspec tree" };
    }
    const configInfo = await lstat(join(root, "config.yaml"));
    const changesInfo = await lstat(join(root, "changes"));
    const specsInfo = await lstat(join(root, "specs"));
    if (!configInfo.isFile() || !changesInfo.isDirectory() || !specsInfo.isDirectory()) {
      return { ok: false, code: "unsafe-output", message: "managed init produced invalid entry types" };
    }
    const config = await readFile(join(root, "config.yaml"), "utf8");
    const schemas = config.match(/^schema:\s*(.+)$/gm) ?? [];
    if (schemas.length !== 1 || schemas[0]?.trim() !== `schema: ${OPENSPEC_SCHEMA}`) {
      return { ok: false, code: "unsafe-output", message: "managed init produced an incompatible config" };
    }
    const tree = await validateBoundedTree(root);
    if (!tree.ok) {
      return { ok: false, code: "unsafe-output", message: tree.message };
    }
    return { ok: true };
  } catch {
    return { ok: false, code: "unsafe-output", message: "managed init output could not be validated" };
  }
}

async function waitForCompetingSetup(
  cwd: string,
  lockPath: string,
  deadline: number,
  staleAfterMs: number,
): Promise<SetupResult | "retry" | null> {
  const target = join(cwd, "openspec");
  while (Date.now() < deadline) {
    if (await pathExists(target)) {
      const validation = await validateManagedOpenSpecRoot(cwd, target);
      if (!validation.ok) return { ok: false, code: validation.code, message: validation.message, evidence: [] };
      return {
        ok: true,
        state: "race-preserved",
        root: target,
        evidence: [{
          provider: "openspec",
          buildRightVersion: BUILD_RIGHT_VERSION,
          providerVersion: OPENSPEC_VERSION,
          command: managedOpenSpecCommand("--version"),
          result: "race-preserved",
          createdPaths: [],
        }],
      };
    }
    if (!(await pathExists(lockPath))) return "retry";
    const lockInfo = await stat(lockPath);
    if (Date.now() - lockInfo.mtimeMs > staleAfterMs) {
      let ownerPid = 0;
      try {
        ownerPid = Number(JSON.parse(await readFile(lockPath, "utf8")).pid ?? 0);
      } catch {
        ownerPid = 0;
      }
      let ownerAlive = false;
      if (ownerPid > 0) {
        try {
          process.kill(ownerPid, 0);
          ownerAlive = true;
        } catch {
          ownerAlive = false;
        }
      }
      if (!ownerAlive) {
        await rm(lockPath, { force: true });
        return "retry";
      }
    }
    await Bun.sleep(20);
  }
  return null;
}

export async function ensureOpenSpec(
  input: { cwd: string; runner?: ProcessRunner; timeoutMs?: number },
): Promise<SetupResult> {
  const cwd = resolve(input.cwd);
  const runner = input.runner ?? runBoundedProcess;
  const timeoutMs = input.timeoutMs ?? 30_000;
  try {
    if (!(await stat(cwd)).isDirectory()) {
      return { ok: false, code: "setup-failed", message: "target repository is not a directory", evidence: [] };
    }
  } catch {
    return { ok: false, code: "setup-failed", message: "target repository is unavailable", evidence: [] };
  }

  const runtimeCwd = await mkdtemp(join(tmpdir(), "build-right-openspec-runtime-"));
  const runtime = await verifyManagedOpenSpec(runtimeCwd, runner);
  const runtimeEntries = await readdir(runtimeCwd);
  await rm(runtimeCwd, { recursive: true, force: true });
  if (!runtime.ok) return runtime.result;
  if (runtimeEntries.length > 0) {
    return { ok: false, code: "unsafe-output", message: "managed version check mutated its isolated workspace", evidence: [] };
  }

  const target = join(cwd, "openspec");
  if (await pathExists(target)) {
    const validation = await validateManagedOpenSpecRoot(cwd, target);
    if (!validation.ok) return { ok: false, code: validation.code, message: validation.message, evidence: [] };
    const evidence: SetupEvidence = {
      provider: "openspec",
      buildRightVersion: BUILD_RIGHT_VERSION,
      providerVersion: OPENSPEC_VERSION,
      command: runtime.command,
      result: "preserved",
      createdPaths: [],
      process: runtime.process.evidence,
    };
    return { ok: true, state: "preserved", root: target, evidence: [evidence] };
  }

  const lockPath = join(cwd, ".build-right-openspec-setup.lock");
  const lockNonce = randomUUID();
  let lock: Awaited<ReturnType<typeof open>>;
  try {
    lock = await open(lockPath, "wx", 0o600);
    await lock.writeFile(JSON.stringify({ pid: process.pid, nonce: lockNonce, createdAt: Date.now() }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      return { ok: false, code: "setup-failed", message: "cannot acquire managed setup lock", evidence: [] };
    }
    const deadline = Date.now() + timeoutMs;
    const raced = await waitForCompetingSetup(cwd, lockPath, deadline, timeoutMs * 2);
    if (raced === "retry") {
      return ensureOpenSpec({ ...input, cwd, timeoutMs: Math.max(1, deadline - Date.now()) });
    }
    return raced ?? { ok: false, code: "timeout", message: "timed out waiting for concurrent managed setup", evidence: [] };
  }

  let scratch = "";
  let stage = "";
  try {
    if (await pathExists(target)) {
      const validation = await validateManagedOpenSpecRoot(cwd, target);
      if (!validation.ok) return { ok: false, code: validation.code, message: validation.message, evidence: [] };
      return { ok: true, state: "race-preserved", root: target, evidence: [] };
    }
    scratch = await mkdtemp(join(tmpdir(), "build-right-openspec-init-"));
    const command = managedOpenSpecCommand("init", scratch, "--tools", "none", "--profile", "core");
    let process: Awaited<ReturnType<ProcessRunner>>;
    try {
      process = await runner({ command, cwd: scratch, timeoutMs });
    } catch {
      return { ok: false, code: "provider-unavailable", message: "managed init boundary failed", evidence: [] };
    }
    if (!process.ok) {
      return {
        ok: false,
        code: process.code === "timeout" ? "timeout" : "provider-unavailable",
        message: process.message,
        evidence: [{
          provider: "openspec",
          buildRightVersion: BUILD_RIGHT_VERSION,
          providerVersion: OPENSPEC_VERSION,
          command,
          result: "failed",
          createdPaths: [],
          process: process.evidence,
        }],
      };
    }
    const scratchEntries = await readdir(scratch);
    if (scratchEntries.length !== 1 || scratchEntries[0] !== "openspec") {
      return { ok: false, code: "unsafe-output", message: "managed init produced files outside openspec/", evidence: [] };
    }
    const scratchRoot = join(scratch, "openspec");
    const scratchValidation = await validateScratchRoot(scratchRoot);
    if (!scratchValidation.ok) {
      return { ok: false, code: scratchValidation.code, message: scratchValidation.message, evidence: [] };
    }
    stage = await mkdtemp(join(cwd, ".build-right-openspec-stage-"));
    await cp(scratchRoot, join(stage, "openspec"), { recursive: true, force: false, errorOnExist: true });
    const stageValidation = await validateManagedOpenSpecRoot(stage, join(stage, "openspec"));
    if (!stageValidation.ok) {
      return { ok: false, code: "unsafe-output", message: stageValidation.message, evidence: [] };
    }
    if (await pathExists(target)) {
      const validation = await validateManagedOpenSpecRoot(cwd, target);
      if (!validation.ok) return { ok: false, code: validation.code, message: validation.message, evidence: [] };
      return { ok: true, state: "race-preserved", root: target, evidence: [] };
    }
    if (!atomicRenameNoReplace(join(stage, "openspec"), target)) {
      if (await pathExists(target)) {
        const validation = await validateManagedOpenSpecRoot(cwd, target);
        if (!validation.ok) return { ok: false, code: validation.code, message: validation.message, evidence: [] };
        return { ok: true, state: "race-preserved", root: target, evidence: [] };
      }
      return { ok: false, code: "setup-failed", message: "atomic no-replace install failed", evidence: [] };
    }
    return {
      ok: true,
      state: "created",
      root: target,
      evidence: [{
        provider: "openspec",
        buildRightVersion: BUILD_RIGHT_VERSION,
        providerVersion: OPENSPEC_VERSION,
        command,
        result: "created",
        createdPaths: ["openspec/"],
        process: process.evidence,
      }],
    };
  } catch {
    return { ok: false, code: "setup-failed", message: "managed setup failed at the filesystem boundary", evidence: [] };
  } finally {
    await lock.close();
    try {
      const owner = JSON.parse(await readFile(lockPath, "utf8")) as { nonce?: string };
      if (owner.nonce === lockNonce) await rm(lockPath, { force: true });
    } catch {
      // A missing or replaced lock is not owned by this setup attempt.
    }
    if (scratch) await rm(scratch, { recursive: true, force: true });
    if (stage) await rm(stage, { recursive: true, force: true });
  }
}
