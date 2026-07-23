import type { ProcessRunner } from "./contracts";
import { managedOpenSpecCommand, verifyManagedOpenSpec } from "./managed-runtime";
import { runBoundedProcess } from "./process-runner";
import { validChangeName } from "./adapter";
import { isAbsolute, join, relative, resolve } from "node:path";
import { constants } from "node:fs";
import { cp, lstat, mkdtemp, open, readdir, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { validateManagedOpenSpecRoot } from "./safe-setup";
import { atomicRenameNoReplace, atomicSwapDirectories, tryAdvisoryFileLock } from "./atomic-install";

export type ArchiveReadinessProof = {
  decision: "archive-ready";
  repositoryRoot: string;
  change: string;
  checkedAt: string;
  checks: {
    openspecValidation: "pass";
    tasksComplete: true;
    buildRightEvidenceComplete: true;
    projectVerification: "pass";
    conflictsClosed: true;
    releaseGatesSatisfied: true;
    specSyncState: "synced" | "sync-ready";
  };
  blockingGates: [];
};

function validReadiness(proof: ArchiveReadinessProof, change: string, repositoryRoot: string): boolean {
  const checkedAt = Date.parse(proof?.checkedAt);
  return proof?.decision === "archive-ready"
    && proof.change === change
    && proof.repositoryRoot === repositoryRoot
    && Number.isFinite(checkedAt)
    && Date.now() - checkedAt >= 0
    && Date.now() - checkedAt <= 5 * 60_000
    && proof.checks?.openspecValidation === "pass"
    && proof.checks.tasksComplete === true
    && proof.checks.buildRightEvidenceComplete === true
    && proof.checks.projectVerification === "pass"
    && proof.checks.conflictsClosed === true
    && proof.checks.releaseGatesSatisfied === true
    && (proof.checks.specSyncState === "synced" || proof.checks.specSyncState === "sync-ready")
    && Array.isArray(proof.blockingGates)
    && proof.blockingGates.length === 0;
}

async function treeSnapshot(root: string): Promise<Map<string, string>> {
  const rootInfo = await lstat(root);
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) throw new Error("unsafe snapshot root");
  const snapshot = new Map<string, string>([[".", `directory:${rootInfo.mode.toString(8)}`]]);
  const pending = [root];
  let entryCount = 0;
  let totalBytes = 0;
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) break;
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      const key = relative(root, path);
      const info = await lstat(path);
      entryCount += 1;
      if (entryCount > 2_000 || info.isSymbolicLink() || (!info.isDirectory() && !info.isFile())) {
        throw new Error("unsafe snapshot entry");
      }
      if (info.isDirectory()) {
        snapshot.set(`${key}/`, `directory:${info.mode.toString(8)}`);
        pending.push(path);
      } else {
        totalBytes += info.size;
        if (info.size > 2 * 1024 * 1024 || totalBytes > 16 * 1024 * 1024) {
          throw new Error("snapshot exceeds bounds");
        }
        const content = await readFile(path);
        const digest = new Bun.CryptoHasher("sha256").update(content).digest("hex");
        snapshot.set(key, `file:${info.mode.toString(8)}:${digest}`);
      }
    }
  }
  return snapshot;
}

async function validInitialChange(root: string): Promise<boolean> {
  try {
    const rootInfo = await lstat(root);
    if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) return false;
    const entries = await readdir(root);
    if (entries.length !== 1 || entries[0] !== ".openspec.yaml") return false;
    const configPath = join(root, ".openspec.yaml");
    const configInfo = await lstat(configPath);
    if (!configInfo.isFile() || configInfo.isSymbolicLink() || configInfo.size > 256) return false;
    const config = await readFile(configPath, "utf8");
    return /^schema: spec-driven\ncreated: \d{4}-\d{2}-\d{2}\n?$/.test(config);
  } catch {
    return false;
  }
}

async function pathAbsent(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return false;
  } catch (error) {
    return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT");
  }
}

function snapshotsEqual(left: Map<string, string>, right: Map<string, string>): boolean {
  return left.size === right.size && [...left].every(([path, value]) => right.get(path) === value);
}

async function authoritySnapshot(root: string): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  for (const directory of ["docs", "tasks"]) {
    const snapshot = await treeSnapshot(join(root, directory));
    for (const [path, value] of snapshot) result.set(`${directory}/${path}`, value);
  }
  return result;
}

function archiveDiffAllowed(
  before: Map<string, string>,
  after: Map<string, string>,
  change: string,
  archivedAs: string,
): boolean {
  const activePrefix = `changes/${change}/`;
  const archivePrefix = `changes/archive/${archivedAs}/`;
  if ([...before.keys()].some((path) => path.startsWith(archivePrefix))) return false;
  for (const [path, value] of before) {
    if (path.startsWith(activePrefix) || path.startsWith("specs/")) continue;
    if (after.get(path) !== value) return false;
  }
  for (const [path, value] of after) {
    if (path === "changes/archive/" || path.startsWith(archivePrefix) || path.startsWith("specs/")) continue;
    if (before.get(path) !== value) return false;
  }
  return ![...after.keys()].some((path) => path.startsWith(activePrefix));
}

export class OpenSpecOrchestrator {
  constructor(
    private readonly runner: ProcessRunner = runBoundedProcess,
    private readonly swapDirectories: (left: string, right: string) => boolean = atomicSwapDirectories,
  ) {}

  async createChange(input: { cwd: string; change: string }) {
    if (!validChangeName(input.change)) return { ok: false as const, code: "invalid-identifier" as const };
    const cwd = resolve(input.cwd);
    const targetRoot = join(cwd, "openspec");
    const targetChange = join(targetRoot, "changes", input.change);
    let scratch = "";
    let stage = "";
    try {
      const targetValidation = await validateManagedOpenSpecRoot(cwd, targetRoot);
      if (!targetValidation.ok) return { ok: false as const, code: targetValidation.code, evidence: [] };
      if (await validInitialChange(targetChange)) {
        return { ok: true as const, mutation: "create-change" as const, change: input.change, state: "preserved" as const, evidence: [] };
      }
      try {
        await lstat(targetChange);
        return { ok: false as const, code: "change-conflict" as const, evidence: [] };
      } catch {}

      scratch = await mkdtemp(join(tmpdir(), "build-right-openspec-change-"));
      const runtime = await verifyManagedOpenSpec(scratch, this.runner);
      if (!runtime.ok) return { ok: false as const, code: runtime.result.code, evidence: runtime.result.evidence };
      await cp(targetRoot, join(scratch, "openspec"), { recursive: true, force: false, errorOnExist: true });
      const before = await treeSnapshot(join(scratch, "openspec"));
      const command = managedOpenSpecCommand("new", "change", input.change);
      let process: Awaited<ReturnType<ProcessRunner>>;
      try {
        process = await this.runner({ command, cwd: scratch });
      } catch {
        return { ok: false as const, code: "provider-unavailable" as const, evidence: [] };
      }
      if (!process.ok) return { ok: false as const, code: process.code, evidence: [process.evidence] };
      const scratchEntries = await readdir(scratch);
      if (scratchEntries.length !== 1 || scratchEntries[0] !== "openspec") {
        return { ok: false as const, code: "unsafe-output" as const, evidence: [process.evidence] };
      }
      const scratchRoot = join(scratch, "openspec");
      const scratchValidation = await validateManagedOpenSpecRoot(scratch, scratchRoot);
      if (!scratchValidation.ok) return { ok: false as const, code: "unsafe-output" as const, evidence: [process.evidence] };
      const after = await treeSnapshot(scratchRoot);
      const allowedPrefix = `changes/${input.change}/`;
      for (const [path, hash] of before) {
        if (after.get(path) !== hash) {
          return { ok: false as const, code: "unsafe-output" as const, evidence: [process.evidence] };
        }
      }
      if ([...after.keys()].some((path) => !before.has(path) && !path.startsWith(allowedPrefix))) {
        return { ok: false as const, code: "unsafe-output" as const, evidence: [process.evidence] };
      }
      const scratchChange = join(scratchRoot, "changes", input.change);
      if (!(await validInitialChange(scratchChange))) {
        return { ok: false as const, code: "unsafe-output" as const, evidence: [process.evidence] };
      }
      stage = await mkdtemp(join(cwd, ".build-right-openspec-change-stage-"));
      await cp(scratchChange, join(stage, input.change), { recursive: true, force: false, errorOnExist: true });
      if (!(await validInitialChange(join(stage, input.change)))) {
        return { ok: false as const, code: "unsafe-output" as const, evidence: [process.evidence] };
      }
      if (!atomicRenameNoReplace(join(stage, input.change), targetChange)) {
        if (await validInitialChange(targetChange)) {
          return { ok: true as const, mutation: "create-change" as const, change: input.change, state: "race-preserved" as const, evidence: [process.evidence] };
        }
        return { ok: false as const, code: "change-conflict" as const, evidence: [process.evidence] };
      }
      return { ok: true as const, mutation: "create-change" as const, change: input.change, state: "created" as const, evidence: [process.evidence] };
    } catch {
      return { ok: false as const, code: "filesystem-failure" as const, evidence: [] };
    } finally {
      if (scratch) await rm(scratch, { recursive: true, force: true });
      if (stage) await rm(stage, { recursive: true, force: true });
    }
  }

  async finalize(input: {
    cwd: string;
    change: string;
    readiness: ArchiveReadinessProof;
    refreshReadiness: () => Promise<ArchiveReadinessProof | null>;
  }) {
    if (!validChangeName(input.change)) return { ok: false as const, code: "invalid-identifier" as const };
    let canonicalRoot: string;
    let proofRoot: string;
    try {
      [canonicalRoot, proofRoot] = await Promise.all([
        realpath(input.cwd),
        realpath(input.readiness.repositoryRoot),
      ]);
    } catch {
      return { ok: false as const, code: "not-archive-ready" as const };
    }
    if (canonicalRoot !== proofRoot || !validReadiness(input.readiness, input.change, canonicalRoot)) {
      return { ok: false as const, code: "not-archive-ready" as const };
    }

    let lock: Awaited<ReturnType<typeof open>> | undefined;
    let scratch = "";
    let stage = "";
    let swapped = false;
    let committed = false;
    let preserveStageForRecovery = false;
    try {
      lock = await open(
        join(canonicalRoot, "tasks", ".build-right-openspec-finalize.lock"),
        constants.O_CREAT | constants.O_RDWR | (constants.O_NOFOLLOW ?? 0),
        0o600,
      );
      if (!tryAdvisoryFileLock(lock.fd)) {
        return { ok: false as const, code: "finalization-busy" as const };
      }
      const readiness = await input.refreshReadiness();
      if (!readiness || !validReadiness(readiness, input.change, canonicalRoot)) {
        return { ok: false as const, code: "not-archive-ready" as const };
      }

      const managedRoot = join(canonicalRoot, "openspec");
      const activeChange = join(managedRoot, "changes", input.change);
      const beforeValidation = await validateManagedOpenSpecRoot(canonicalRoot, managedRoot);
      if (!beforeValidation.ok || await pathAbsent(activeChange)) {
        return { ok: false as const, code: "not-archive-ready" as const };
      }
      const [mainSpecsBefore, managedBefore, activeBefore, authorityBefore] = await Promise.all([
        treeSnapshot(join(managedRoot, "specs")),
        treeSnapshot(managedRoot),
        treeSnapshot(activeChange),
        authoritySnapshot(canonicalRoot),
      ]);

      scratch = await mkdtemp(join(tmpdir(), "build-right-openspec-finalize-"));
      const scratchManagedRoot = join(scratch, "openspec");
      await cp(managedRoot, scratchManagedRoot, { recursive: true, force: false, errorOnExist: true });
      const runtime = await verifyManagedOpenSpec(scratch, this.runner);
      if (!runtime.ok) {
        return { ok: false as const, code: runtime.result.code, evidence: runtime.result.evidence };
      }
      const command = managedOpenSpecCommand("archive", input.change, "--yes", "--json");
      let process: Awaited<ReturnType<ProcessRunner>>;
      try {
        process = await this.runner({ command, cwd: scratch });
      } catch {
        return { ok: false as const, code: "provider-unavailable" as const, evidence: [] };
      }
      if (!process.ok) return { ok: false as const, code: process.code, evidence: [process.evidence] };

      let output: Record<string, unknown>;
      try {
        const parsed = JSON.parse(process.stdout);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
        output = parsed as Record<string, unknown>;
      } catch {
        return { ok: false as const, code: "invalid-output" as const, evidence: [process.evidence] };
      }
      const archive = output.archive;
      if (!archive || typeof archive !== "object" || Array.isArray(archive)) {
        return { ok: false as const, code: "archive-failed" as const, evidence: [process.evidence] };
      }
      const value = archive as Record<string, unknown>;
      const scratchCanonical = await realpath(scratch);
      const archiveRoot = join(scratchCanonical, "openspec", "changes", "archive");
      if (value.change !== input.change || typeof value.archivedAs !== "string"
        || !new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${input.change}$`).test(value.archivedAs)
        || typeof value.path !== "string" || !isAbsolute(value.path)
        || resolve(value.path) !== join(archiveRoot, value.archivedAs)
        || typeof value.specsUpdated !== "boolean") {
        return { ok: false as const, code: "invalid-output" as const, evidence: [process.evidence] };
      }
      const scratchEntries = await readdir(scratchCanonical);
      if (scratchEntries.length !== 1 || scratchEntries[0] !== "openspec") {
        return { ok: false as const, code: "unsafe-output" as const, evidence: [process.evidence] };
      }
      const scratchRootValidation = await validateManagedOpenSpecRoot(scratchCanonical, scratchManagedRoot);
      if (!scratchRootValidation.ok) {
        return { ok: false as const, code: "archive-postcondition-failed" as const, evidence: [process.evidence] };
      }
      const archivedPath = join(archiveRoot, value.archivedAs);
      let archiveInfo: Awaited<ReturnType<typeof lstat>>;
      let archiveCanonical: string;
      let mainSpecsAfter: Map<string, string>;
      let managedAfter: Map<string, string>;
      let archivedSnapshot: Map<string, string>;
      try {
        [archiveInfo, archiveCanonical, mainSpecsAfter, managedAfter, archivedSnapshot] = await Promise.all([
          lstat(archivedPath),
          realpath(archivedPath),
          treeSnapshot(join(scratchManagedRoot, "specs")),
          treeSnapshot(scratchManagedRoot),
          treeSnapshot(archivedPath),
        ]);
      } catch {
        return { ok: false as const, code: "archive-postcondition-failed" as const, evidence: [process.evidence] };
      }
      if (!archiveInfo.isDirectory() || archiveInfo.isSymbolicLink()
        || archiveCanonical !== archivedPath
        || !(await pathAbsent(join(scratchManagedRoot, "changes", input.change)))
        || !snapshotsEqual(activeBefore, archivedSnapshot)
        || !archiveDiffAllowed(managedBefore, managedAfter, input.change, value.archivedAs)
        || snapshotsEqual(mainSpecsBefore, mainSpecsAfter) === value.specsUpdated) {
        return { ok: false as const, code: "archive-postcondition-failed" as const, evidence: [process.evidence] };
      }

      const specsValidationCommand = managedOpenSpecCommand(
        "validate", "--specs", "--strict", "--json", "--no-interactive",
      );
      let specsValidation: Awaited<ReturnType<ProcessRunner>>;
      try {
        specsValidation = await this.runner({ command: specsValidationCommand, cwd: scratchCanonical });
      } catch {
        return { ok: false as const, code: "provider-unavailable" as const, evidence: [process.evidence] };
      }
      if (!specsValidation.ok) {
        return {
          ok: false as const,
          code: "archive-postcondition-failed" as const,
          evidence: [process.evidence, specsValidation.evidence],
        };
      }
      try {
        const parsed = JSON.parse(specsValidation.stdout);
        const record = parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed as Record<string, unknown>
          : null;
        const items = record?.items;
        if (!Array.isArray(items)
          || (value.specsUpdated === true && items.length === 0)
          || items.some((item) => !item || typeof item !== "object" || Array.isArray(item)
            || (item as Record<string, unknown>).valid !== true)) {
          return {
            ok: false as const,
            code: "archive-postcondition-failed" as const,
            evidence: [process.evidence, specsValidation.evidence],
          };
        }
      } catch {
        return {
          ok: false as const,
          code: "archive-postcondition-failed" as const,
          evidence: [process.evidence, specsValidation.evidence],
        };
      }
      const afterValidatorRoot = await validateManagedOpenSpecRoot(scratchCanonical, scratchManagedRoot);
      if (!afterValidatorRoot.ok
        || !snapshotsEqual(managedAfter, await treeSnapshot(scratchManagedRoot))) {
        return {
          ok: false as const,
          code: "archive-postcondition-failed" as const,
          evidence: [process.evidence, specsValidation.evidence],
        };
      }

      if (!snapshotsEqual(authorityBefore, await authoritySnapshot(canonicalRoot))
        || !snapshotsEqual(managedBefore, await treeSnapshot(managedRoot))) {
        return {
          ok: false as const,
          code: "finalization-race" as const,
          evidence: [process.evidence, specsValidation.evidence],
        };
      }
      stage = await mkdtemp(join(canonicalRoot, ".build-right-openspec-finalize-stage-"));
      const stagedRoot = join(stage, "openspec");
      await cp(scratchManagedRoot, stagedRoot, { recursive: true, force: false, errorOnExist: true });
      if (!snapshotsEqual(await treeSnapshot(scratchManagedRoot), await treeSnapshot(stagedRoot))) {
        return {
          ok: false as const,
          code: "archive-publication-failed" as const,
          evidence: [process.evidence, specsValidation.evidence],
        };
      }
      if (!this.swapDirectories(stagedRoot, managedRoot)) {
        return {
          ok: false as const,
          code: "archive-publication-failed" as const,
          evidence: [process.evidence, specsValidation.evidence],
        };
      }
      swapped = true;
      const published = await validateManagedOpenSpecRoot(canonicalRoot, managedRoot);
      const publicationValid = published.ok
        && snapshotsEqual(await treeSnapshot(managedRoot), managedAfter)
        && snapshotsEqual(await treeSnapshot(stagedRoot), managedBefore)
        && snapshotsEqual(await authoritySnapshot(canonicalRoot), authorityBefore);
      if (!publicationValid) {
        if (this.swapDirectories(stagedRoot, managedRoot)) {
          swapped = false;
          return {
            ok: false as const,
            code: "archive-publication-failed" as const,
            evidence: [process.evidence, specsValidation.evidence],
          };
        }
        preserveStageForRecovery = true;
        return {
          ok: false as const,
          code: "recovery-required" as const,
          recoveryPath: stage,
          evidence: [process.evidence, specsValidation.evidence],
        };
      }
      committed = true;
      return {
        ok: true as const,
        mutation: "finalize" as const,
        change: input.change,
        archivedAs: value.archivedAs,
        archivedPath: join(canonicalRoot, "openspec", "changes", "archive", value.archivedAs),
        specsUpdated: value.specsUpdated,
        evidence: [process.evidence, specsValidation.evidence],
      };
    } catch {
      if (swapped && !committed && stage) {
        try {
          if (this.swapDirectories(join(stage, "openspec"), join(canonicalRoot, "openspec"))) {
            swapped = false;
            return { ok: false as const, code: "filesystem-failure" as const, evidence: [] };
          }
        } catch {}
        preserveStageForRecovery = true;
        return {
          ok: false as const,
          code: "recovery-required" as const,
          recoveryPath: stage,
          evidence: [],
        };
      }
      return { ok: false as const, code: "filesystem-failure" as const, evidence: [] };
    } finally {
      await lock?.close().catch(() => undefined);
      if (scratch) await rm(scratch, { recursive: true, force: true });
      if (stage && !preserveStageForRecovery) await rm(stage, { recursive: true, force: true });
    }
  }
}
