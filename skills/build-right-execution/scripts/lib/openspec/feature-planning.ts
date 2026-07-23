import { constants } from "node:fs";
import { lstat, mkdir, open, readdir, realpath, rename, rm, unlink } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { OpenSpecAdapter, validChangeName, validWorkItemId } from "./adapter";
import { OpenSpecOrchestrator } from "./orchestrator";
import type { PlanningArtifact, PlanningWorkItem } from "./provider-contracts";
import { atomicRenameNoReplace, tryAdvisoryFileLock } from "./atomic-install";
import { validateManagedOpenSpecRoot } from "./safe-setup";

const artifactOrder: PlanningArtifact["id"][] = ["proposal", "specs", "design", "tasks"];
const maxFeatureLength = 2_000;

export type FeaturePlanningFailure = {
  ok: false;
  code: "invalid-input" | "unsafe-path" | "provider-failure" | "validation-failed" | "binding-conflict" | "filesystem-failure";
  message: string;
};

export type FeaturePlanningStep =
  | { ok: true; action: "write-artifact"; change: string; artifact: PlanningArtifact["id"]; outputPath: string; instruction: string; template: string; dependencies: string[] }
  | { ok: true; action: "bind-tasks"; change: string; workItems: PlanningWorkItem[] }
  | { ok: true; action: "ready-for-execution"; change: string; taskPaths: string[] };

type PlanningAdapter = Pick<OpenSpecAdapter, "inspect" | "instructions" | "validate" | "applyInstructions">;
type PlanningOrchestrator = Pick<OpenSpecOrchestrator, "createChange">;

function fail(code: FeaturePlanningFailure["code"], message: string): FeaturePlanningFailure {
  return { ok: false, code, message };
}

function featureHash(feature: string): string {
  return new Bun.CryptoHasher("sha256").update(feature).digest("hex").slice(0, 10);
}

export function deriveChangeName(feature: string): string | null {
  const normalized = feature.trim().normalize("NFKD");
  if (!normalized || normalized.length > maxFeatureLength || /[\u0000-\u001f\u007f]/.test(normalized)) return null;
  const slug = normalized
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  if (!slug) return null;
  return `${slug}-${featureHash(normalized)}`;
}

async function pathIsDirectory(path: string): Promise<boolean> {
  try {
    return (await lstat(path)).isDirectory() && !(await lstat(path)).isSymbolicLink();
  } catch {
    return false;
  }
}

async function managedChangesRoot(cwd: string): Promise<string | null> {
  const openspecRoot = join(cwd, "openspec");
  const changesRoot = join(openspecRoot, "changes");
  try {
    const validation = await validateManagedOpenSpecRoot(cwd, openspecRoot);
    if (!validation.ok) return null;
    const [cwdReal, openspecReal, openspecStat, changesStat] = await Promise.all([
      realpath(cwd),
      realpath(openspecRoot),
      lstat(openspecRoot),
      lstat(changesRoot),
    ]);
    if (openspecStat.isSymbolicLink() || !openspecStat.isDirectory()
      || changesStat.isSymbolicLink() || !changesStat.isDirectory()
      || relative(cwdReal, openspecReal).startsWith("..")) return null;
    return changesRoot;
  } catch {
    return null;
  }
}

export async function advanceFeaturePlanning(
  input: { cwd: string; change: string },
  adapter: PlanningAdapter = new OpenSpecAdapter(),
): Promise<FeaturePlanningStep | FeaturePlanningFailure> {
  const state = await adapter.inspect(input);
  if (!state.ok) return fail("provider-failure", `${state.code}: ${state.message}`);

  if (state.state !== "all-done") {
    const next = artifactOrder
      .map((id) => state.artifacts.find((artifact) => artifact.id === id))
      .find((artifact) => artifact?.status === "ready");
    if (!next) return fail("provider-failure", "artifact graph is incomplete but exposes no ready artifact");
    const instructions = await adapter.instructions({ ...input, artifact: next.id });
    if (!instructions.ok) return fail("provider-failure", `${instructions.code}: ${instructions.message}`);
    return {
      ok: true,
      action: "write-artifact",
      change: input.change,
      artifact: next.id,
      outputPath: instructions.outputPath,
      instruction: instructions.instruction,
      template: instructions.template,
      dependencies: instructions.dependencies,
    };
  }

  const validation = await adapter.validate(input);
  if (!validation.ok) return fail("provider-failure", `${validation.code}: ${validation.message}`);
  if (!validation.valid) return fail("validation-failed", validation.issues.join("; ") || "strict planning validation failed");
  const apply = await adapter.applyInstructions(input);
  if (!apply.ok) return fail("provider-failure", `${apply.code}: ${apply.message}`);
  if (apply.state === "blocked" || apply.workItems.length === 0) {
    return fail("provider-failure", "validated planning change has no executable work items");
  }
  if (apply.workItems.some((item) => item.complete)) {
    return fail("binding-conflict", "unbound provider work items are already complete");
  }
  return { ok: true, action: "bind-tasks", change: input.change, workItems: apply.workItems };
}

export async function prepareFeaturePlanning(
  input: { cwd: string; feature: string },
  dependencies: {
    adapter?: PlanningAdapter;
    orchestrator?: PlanningOrchestrator;
  } = {},
): Promise<FeaturePlanningStep | FeaturePlanningFailure> {
  const change = deriveChangeName(input.feature);
  if (!change) return fail("invalid-input", "feature request cannot produce a bounded change identifier");
  const cwd = resolve(input.cwd);
  const changesRoot = await managedChangesRoot(cwd);
  if (!changesRoot) return fail("unsafe-path", "managed planning root is missing or externalized");
  const changeRoot = join(changesRoot, change);
  const exists = await pathIsDirectory(changeRoot);
  if (!exists) {
    const created = await (dependencies.orchestrator ?? new OpenSpecOrchestrator()).createChange({ cwd, change });
    if (!created.ok) {
      if (!(await pathIsDirectory(changeRoot))) {
        return fail("provider-failure", `change creation failed: ${created.code}`);
      }
    }
  }
  return advanceFeaturePlanning({ cwd, change }, dependencies.adapter ?? new OpenSpecAdapter());
}

export async function writeFeatureArtifact(
  input: {
    cwd: string;
    change: string;
    artifact: PlanningArtifact["id"];
    content?: string;
    capability?: string;
    specs?: Array<{ capability: string; content: string }>;
  },
  adapter: PlanningAdapter = new OpenSpecAdapter(),
): Promise<FeaturePlanningStep | FeaturePlanningFailure> {
  if (!validChangeName(input.change)) return fail("invalid-input", "artifact identity is invalid");
  const cwd = resolve(input.cwd);
  const changesRoot = await managedChangesRoot(cwd);
  if (!changesRoot) return fail("unsafe-path", "managed planning root is missing or externalized");
  const changeRoot = join(changesRoot, input.change);
  try {
    const [changeInfo, canonicalChange] = await Promise.all([lstat(changeRoot), realpath(changeRoot)]);
    if (!changeInfo.isDirectory() || changeInfo.isSymbolicLink()
      || canonicalChange !== join(await realpath(changesRoot), input.change)) {
      return fail("unsafe-path", "change root is missing or externalized");
    }
  } catch {
    return fail("unsafe-path", "change root is missing or externalized");
  }

  const current = await advanceFeaturePlanning({ cwd, change: input.change }, adapter);
  if (!current.ok) return current;
  if (current.action !== "write-artifact" || current.artifact !== input.artifact) {
    return fail("binding-conflict", "artifact is not the next dependency-ready planning output");
  }

  if (input.artifact === "specs") {
    const specsRoot = join(changeRoot, "specs");
    const supplied = input.specs ?? (
      input.capability && typeof input.content === "string"
        ? [{ capability: input.capability, content: input.content }]
        : []
    );
    let stage = "";
    try {
      const proposal = await Bun.file(join(changeRoot, "proposal.md")).text();
      const declared = [...proposal.matchAll(/^\s*- `([a-z0-9]+(?:-[a-z0-9]+)*)`:\s+/gm)].map((match) => match[1] ?? "");
      if (declared.length === 0 || declared.length > 100 || new Set(declared).size !== declared.length) {
        return fail("invalid-input", "canonical proposal must declare 1-100 unique capabilities");
      }
      if (supplied.length !== declared.length || new Set(supplied.map((item) => item.capability)).size !== supplied.length
        || supplied.some((item) => !declared.includes(item.capability))) {
        return fail("invalid-input", "spec publication must provide the complete declared capability set exactly once");
      }
      let totalBytes = 0;
      for (const item of supplied) {
        const bytes = new TextEncoder().encode(item.content).byteLength;
        if (!item.content || bytes > 256 * 1024 || /\u0000/.test(item.content)) {
          return fail("invalid-input", `spec content for ${item.capability} is invalid or exceeds 256 KiB`);
        }
        totalBytes += bytes;
      }
      if (totalBytes > 4 * 1024 * 1024) return fail("invalid-input", "combined spec content exceeds 4 MiB");
      try {
        await lstat(specsRoot);
        return fail("binding-conflict", "spec output already exists; refusing a partial or overwrite publication");
      } catch (error) {
        if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) {
          return fail("filesystem-failure", "spec output path could not be inspected");
        }
      }
      stage = join(changeRoot, `.build-right-specs-stage-${process.pid}-${crypto.randomUUID()}`);
      await mkdir(stage);
      for (const item of supplied) {
        const capabilityRoot = join(stage, item.capability);
        await mkdir(capabilityRoot);
        await Bun.write(join(capabilityRoot, "spec.md"), item.content);
      }
      if (!atomicRenameNoReplace(stage, specsRoot)) {
        return fail("binding-conflict", "spec output won a concurrent publication race; no overwrite performed");
      }
    } catch {
      return fail("filesystem-failure", "spec output directory could not be created safely");
    } finally {
      if (stage) await rm(stage, { recursive: true, force: true });
    }
    return advanceFeaturePlanning({ cwd, change: input.change }, adapter);
  }

  if (typeof input.content !== "string" || input.content.length === 0
    || new TextEncoder().encode(input.content).byteLength > 256 * 1024 || /\u0000/.test(input.content)) {
    return fail("invalid-input", "artifact content is invalid or exceeds the 256 KiB limit");
  }
  const target = join(changeRoot, current.outputPath);
  try {
    await lstat(target);
    return fail("binding-conflict", "artifact output already exists; refusing to overwrite planning authority");
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) {
      return fail("filesystem-failure", "artifact output path could not be inspected");
    }
  }
  const temporary = join(dirname(target), `.${basename(target)}.${process.pid}.${crypto.randomUUID()}.tmp`);
  try {
    await Bun.write(temporary, input.content);
    if (!atomicRenameNoReplace(temporary, target)) {
      return fail("binding-conflict", "artifact output won a concurrent write race; no overwrite performed");
    }
  } catch {
    return fail("filesystem-failure", "artifact output could not be published atomically");
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
  return advanceFeaturePlanning({ cwd, change: input.change }, adapter);
}

function safeTitle(title: string): string | null {
  const value = title.trim();
  return value && value.length <= 200 && !/[\r\n\u0000-\u001f\u007f|]/.test(value) ? value : null;
}

function taskSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "work-item";
}

function taskMarkdown(id: string, title: string, change: string, item: PlanningWorkItem, status: "ready" | "planned"): string {
  return `# ${id}: ${title}

Status: ${status}
Type: implementation
Owner: AI

Planning provider: openspec
Change ref: ${change}
Work item ref: ${item.id}
Assumption basis: repo-evidence-backed
Requirement basis: openspec/changes/${change}/tasks.md#${item.id}
Reversibility: moderate
Learning objective: prove the referenced planning work item through implementation and verification
Source under test: repo-local path

## Goal

Implement only the behavior referenced by work item ${item.id}; OpenSpec remains the canonical checklist.

## Non-Goals

- Duplicate or expand the canonical planning requirement in this binding.

## Required Reading

- openspec/changes/${change}/tasks.md
- openspec/changes/${change}/design.md
- openspec/changes/${change}/specs/

## Acceptance Criteria

- [ ] The referenced work item is implemented, verified, and evidenced through Build Right.

## Baseline Evidence

Capture the current behavior before implementation.

## Verification

- Run the focused checks required by the referenced work item and repository.

## Evidence Log

| Date | Evidence | Result | Notes |
| --- | --- | --- | --- |

## Files Changed

- None yet.

## Verification Summary

- Not run yet.

## Learning Notes

- Proved: not yet.
- Simulated: none.
- Test next: the focused behavior for this work item.

## Blockers

- None.

## Follow-Ups

- None.
`;
}

function addTrackerRows(tracker: string, rows: string[]): string | null {
  const lines = tracker.split("\n");
  const heading = lines.findIndex((line) => line.trim() === "## Tasks");
  if (heading < 0) return null;
  const header = lines.findIndex((line, index) => index > heading && /^\|\s*ID\s*\|\s*Title\s*\|\s*Status\s*\|\s*(Evidence|Task|Path)\s*\|$/.test(line));
  if (header < 0 || !/^\|(?:\s*:?-+:?\s*\|){4}$/.test(lines[header + 1] ?? "")) return null;
  let insert = header + 2;
  while (insert < lines.length && lines[insert]?.trim().startsWith("|")) insert += 1;
  lines.splice(insert, 0, ...rows);
  return `${lines.join("\n").replace(/\n+$/, "")}\n`;
}

async function writeAtomic(
  path: string,
  content: string,
  expected: { content: string; dev: number; ino: number },
): Promise<void> {
  const temporary = join(dirname(path), `.${basename(path)}.${process.pid}.${crypto.randomUUID()}.tmp`);
  try {
    await Bun.write(temporary, content);
    const current = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    try {
      const stat = await current.stat();
      const currentContent = await current.readFile({ encoding: "utf8" });
      if (!stat.isFile() || stat.dev !== expected.dev || stat.ino !== expected.ino
        || currentContent !== expected.content) {
        throw new Error("concurrent sprint mutation detected");
      }
    } finally {
      await current.close();
    }
    await rename(temporary, path);
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}

async function bindFeatureTasksUnlocked(
  input: { cwd: string; change: string; sprint: string },
  adapter: PlanningAdapter = new OpenSpecAdapter(),
): Promise<FeaturePlanningStep | FeaturePlanningFailure> {
  const cwd = resolve(input.cwd);
  if (!/^tasks\/sprint-[A-Za-z0-9._-]+\.md$/.test(input.sprint)) {
    return fail("unsafe-path", "sprint path is outside the Build Right task surface");
  }
  const sprintPath = join(cwd, input.sprint);
  const taskRoot = join(cwd, "tasks", "issues");
  let sprintIdentity: { dev: number; ino: number };
  try {
    const [canonicalCwd, canonicalSprintParent, canonicalTaskRoot, sprintStat] = await Promise.all([
      realpath(cwd),
      realpath(dirname(sprintPath)),
      realpath(taskRoot),
      lstat(sprintPath),
    ]);
    if (relative(canonicalCwd, canonicalSprintParent).startsWith("..")
      || relative(canonicalCwd, canonicalTaskRoot).startsWith("..")
      || sprintStat.isSymbolicLink() || !sprintStat.isFile()) {
      return fail("unsafe-path", "sprint path is missing or externalized");
    }
    if ((await lstat(taskRoot)).isSymbolicLink()) return fail("unsafe-path", "task directory is externalized");
    sprintIdentity = { dev: sprintStat.dev, ino: sprintStat.ino };
  } catch {
    return fail("unsafe-path", "task or sprint surface is unavailable");
  }

  const step = await advanceFeaturePlanning({ cwd, change: input.change }, adapter);
  if (!step.ok || step.action !== "bind-tasks") {
    return step.ok ? fail("provider-failure", `planning is not binding-ready: ${step.action}`) : step;
  }

  const existingFiles = (await readdir(taskRoot)).filter((name) => /^\d{3}-.+\.md$/.test(name)).sort();
  const existingBindings = new Map<string, { path: string; id: string; title: string; status: string }>();
  const sprintText = await Bun.file(sprintPath).text();
  const executableRows = [...sprintText.matchAll(/\|\s*(?:ready|active)\s*\|/gi)].length;
  if (executableRows > 1) return fail("binding-conflict", "active sprint already contains multiple executable tasks");
  let nextId = 1;
  for (const name of existingFiles) {
    const taskStat = await lstat(join(taskRoot, name));
    if (taskStat.isSymbolicLink() || !taskStat.isFile()) return fail("unsafe-path", `task binding path is externalized: ${name}`);
    nextId = Math.max(nextId, Number(name.slice(0, 3)) + 1);
    const text = await Bun.file(join(taskRoot, name)).text();
    const providers = [...text.matchAll(/^Planning provider:\s*(.+)$/gm)].map((match) => match[1]?.trim() ?? "");
    const changes = [...text.matchAll(/^Change ref:\s*(.+)$/gm)].map((match) => match[1]?.trim() ?? "");
    const items = [...text.matchAll(/^Work item ref:\s*(.+)$/gm)].map((match) => match[1]?.trim() ?? "");
    const hasBindingField = providers.length + changes.length + items.length > 0;
    if (hasBindingField && (providers.length !== 1 || changes.length !== 1 || items.length !== 1
      || providers[0] !== "openspec" || !validChangeName(changes[0] ?? "") || !validWorkItemId(items[0] ?? ""))) {
      return fail("binding-conflict", `task ${name} violates the required planning binding triplet`);
    }
    const change = changes[0];
    const item = items[0];
    if (change === input.change && item) {
      if (existingBindings.has(item)) return fail("binding-conflict", `work item ${item} has duplicate Build Right bindings`);
      const existingTitle = text.match(/^#\s+\d{3}:\s*(.+)$/m)?.[1]?.trim() ?? "";
      const existingStatus = text.match(/^Status:\s*(.+)$/m)?.[1]?.trim() ?? "";
      if (!safeTitle(existingTitle) || !/^(planned|ready|active)$/i.test(existingStatus)) {
        return fail("binding-conflict", `work item ${item} has an invalid existing binding`);
      }
      existingBindings.set(item, {
        path: `tasks/issues/${name}`,
        id: name.slice(0, 3),
        title: existingTitle,
        status: existingStatus,
      });
    }
  }

  const planned: Array<{ item: PlanningWorkItem; id: string; title: string; path: string; content: string }> = [];
  let executableExists = executableRows === 1
    || [...existingBindings.values()].some((entry) => /^(ready|active)$/i.test(entry.status));
  for (const item of step.workItems) {
    const title = safeTitle(item.title);
    if (!title) return fail("provider-failure", `work item ${item.id} has an unsafe title`);
    if (existingBindings.has(item.id)) continue;
    if (nextId > 999) return fail("binding-conflict", "three-digit Build Right task ID space is exhausted");
    const id = String(nextId).padStart(3, "0");
    const path = `tasks/issues/${id}-${taskSlug(title)}.md`;
    const status = executableExists ? "planned" : "ready";
    planned.push({ item, id, title, path, content: taskMarkdown(id, title, input.change, item, status) });
    executableExists = true;
    nextId += 1;
  }

  const unknownBindings = [...existingBindings.keys()].filter((item) => !step.workItems.some((candidate) => candidate.id === item));
  if (unknownBindings.length > 0) return fail("binding-conflict", `bindings reference unknown work items: ${unknownBindings.join(", ")}`);
  const allPaths = [...existingBindings.values()].map((entry) => entry.path).concat(planned.map((entry) => entry.path));
  const rows = [
    ...[...existingBindings.values()]
      .filter((entry) => !sprintText.includes(entry.path))
      .map((entry) => `| ${entry.id} | ${entry.title} | ${entry.status} | ${entry.path} |`),
    ...planned.map((entry) => `| ${entry.id} | ${entry.title} | ${entry.content.match(/^Status:\s*(.+)$/m)?.[1]} | ${entry.path} |`),
  ];
  const nextSprint = rows.length > 0 ? addTrackerRows(sprintText, rows) : sprintText;
  if (nextSprint === null) return fail("binding-conflict", "sprint task table does not match the Build Right contract");
  if ([...nextSprint.matchAll(/\|\s*(?:ready|active)\s*\|/gi)].length > 1) {
    return fail("binding-conflict", "binding update would create multiple executable sprint tasks");
  }

  try {
    for (const entry of planned) {
      const handle = await open(join(cwd, entry.path), "wx");
      try {
        await handle.writeFile(entry.content);
      } finally {
        await handle.close();
      }
    }
    if (rows.length > 0) {
      await writeAtomic(sprintPath, nextSprint, { content: sprintText, ...sprintIdentity });
    }
  } catch {
    return fail("filesystem-failure", "task binding mutation failed; safe retry will reconcile created bindings");
  }
  return { ok: true, action: "ready-for-execution", change: input.change, taskPaths: allPaths };
}

async function acquirePlanningLock(cwd: string): Promise<(() => Promise<void>) | null> {
  const tasksRoot = join(cwd, "tasks");
  const lockPath = join(tasksRoot, ".build-right-feature-planning.lock");
  let canonicalTasks: string;
  try {
    canonicalTasks = await realpath(tasksRoot);
    if (relative(await realpath(cwd), canonicalTasks).startsWith("..") || (await lstat(tasksRoot)).isSymbolicLink()) return null;
  } catch {
    return null;
  }
  let handle: Awaited<ReturnType<typeof open>> | null = null;
  try {
    handle = await open(
      lockPath,
      constants.O_CREAT | constants.O_RDWR | (constants.O_NOFOLLOW ?? 0),
      0o600,
    );
    if (!tryAdvisoryFileLock(handle.fd)) {
      await handle.close();
      return null;
    }
    return async () => {
      try {
        await handle?.close();
      } catch {}
    };
  } catch {
    await handle?.close().catch(() => undefined);
    return null;
  }
}

export async function bindFeatureTasks(
  input: { cwd: string; change: string; sprint: string },
  adapter: PlanningAdapter = new OpenSpecAdapter(),
): Promise<FeaturePlanningStep | FeaturePlanningFailure> {
  const cwd = resolve(input.cwd);
  const release = await acquirePlanningLock(cwd);
  if (!release) return fail("filesystem-failure", "another feature-planning binding mutation is active or the planning lock is unsafe");
  try {
    return await bindFeatureTasksUnlocked({ ...input, cwd }, adapter);
  } finally {
    await release();
  }
}
