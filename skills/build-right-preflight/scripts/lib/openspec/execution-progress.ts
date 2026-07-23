import { constants } from "node:fs";
import { lstat, open, realpath, rename, unlink } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { validChangeName, validWorkItemId, OpenSpecAdapter } from "./adapter";
import { tryAdvisoryFileLock } from "./atomic-install";
import type { PlanningProvider } from "./provider-contracts";
import { validateManagedOpenSpecRoot } from "./safe-setup";

const maxFileBytes = 512 * 1024;
const maxProofAgeMs = 5 * 60_000;

export type WorkItemCompletionProof = {
  decision: "work-item-ready-for-closeout";
  repositoryRoot: string;
  taskPath: string;
  sprintPath: string;
  change: string;
  workItem: string;
  checkedAt: string;
  checks: {
    implementation: "pass";
    verification: "pass";
    evidenceComplete: true;
  };
  verificationCommands: string[];
  evidenceRefs: string[];
};

type ProgressProvider = Pick<PlanningProvider, "inspect" | "validate" | "applyInstructions">;

export type WorkItemCompletionResult =
  | {
      ok: true;
      mutation: "complete-work-item";
      state: "completed" | "preserved";
      taskPath: string;
      sprintPath: string;
      change: string;
      workItem: string;
      nextTaskPath: string | null;
    }
  | {
      ok: false;
      code:
        | "invalid-proof"
        | "unsafe-path"
        | "invalid-state"
        | "provider-failure"
        | "verification-failed"
        | "busy"
        | "filesystem-failure";
      message: string;
    };

type JournalFile = { path: string; beforeHash: string; afterHash: string; before: string; after: string };
type Journal = {
  version: 1;
  repositoryRoot: string;
  taskPath: string;
  sprintPath: string;
  change: string;
  workItem: string;
  itemTitle: string;
  nextTaskPath: string | null;
  nextWorkItem: string | null;
  files: JournalFile[];
};

function fail(code: Extract<WorkItemCompletionResult, { ok: false }>["code"], message: string): WorkItemCompletionResult {
  return { ok: false, code, message };
}

function hash(content: string): string {
  return new Bun.CryptoHasher("sha256").update(content).digest("hex");
}

function boundedStrings(values: unknown, maxItems: number, maxLength: number): values is string[] {
  return Array.isArray(values) && values.length > 0 && values.length <= maxItems
    && values.every((value) => typeof value === "string" && value.length > 0 && value.length <= maxLength
      && !/[\u0000-\u001f\u007f]/.test(value));
}

function validProof(proof: WorkItemCompletionProof, root: string): boolean {
  const checkedAt = Date.parse(proof?.checkedAt);
  return proof?.decision === "work-item-ready-for-closeout"
    && proof.repositoryRoot === root
    && /^tasks\/issues\/\d{3}-[A-Za-z0-9._-]+\.md$/.test(proof.taskPath)
    && /^tasks\/sprint-[A-Za-z0-9._-]+\.md$/.test(proof.sprintPath)
    && validChangeName(proof.change)
    && validWorkItemId(proof.workItem)
    && Number.isFinite(checkedAt)
    && Date.now() - checkedAt >= 0
    && Date.now() - checkedAt <= maxProofAgeMs
    && proof.checks?.implementation === "pass"
    && proof.checks.verification === "pass"
    && proof.checks.evidenceComplete === true
    && boundedStrings(proof.verificationCommands, 50, 1_000)
    && boundedStrings(proof.evidenceRefs, 100, 1_000)
    && proof.evidenceRefs.includes(`${proof.taskPath}#evidence-log`)
    && proof.evidenceRefs.every((reference) =>
      reference === `${proof.taskPath}#evidence-log`
      || reference === `${proof.taskPath}#verification-summary`);
}

async function safeRegularFile(root: string, relativePath: string): Promise<string | null> {
  const path = join(root, relativePath);
  try {
    const info = await lstat(path);
    if (!info.isFile() || info.isSymbolicLink() || info.size > maxFileBytes) return null;
    const canonicalParent = await realpath(dirname(path));
    if (relative(root, canonicalParent).startsWith("..")) return null;
    return Bun.file(path).text();
  } catch {
    return null;
  }
}

function exactField(text: string, field: string): string | null {
  const values = [...text.matchAll(new RegExp(`^${field}:\\s*(.+)$`, "gm"))]
    .map((match) => match[1]?.trim() ?? "");
  return values.length === 1 ? values[0]! : null;
}

function markdownSection(text: string, heading: string): string {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start < 0) return "";
  const body: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line)) break;
    body.push(line);
  }
  return body.join("\n").trim();
}

function passingEvidence(text: string): string[] {
  const lines = markdownSection(text, "Evidence Log")
    .split("\n")
    .filter((line) => line.trim().startsWith("|") && line.trim().endsWith("|"));
  if (lines.length < 3) return [];
  const cells = (line: string) =>
    line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
  const headers = cells(lines[0]!);
  const evidenceIndex = headers.findIndex((header) => /^evidence$/i.test(header));
  const resultIndex = headers.findIndex((header) => /^result$/i.test(header));
  if (evidenceIndex < 0 || resultIndex < 0) return [];
  return lines.slice(2)
    .map(cells)
    .filter((row) => /^(pass|passed)$/i.test(row[resultIndex] ?? ""))
    .map((row) => row[evidenceIndex] ?? "")
    .filter((value) => value.length > 0 && !/not run|not yet|pending|n\/a|<[^>]+>/i.test(value));
}

function evidenceComplete(text: string, proof?: WorkItemCompletionProof): boolean {
  const acceptance = markdownSection(text, "Acceptance Criteria");
  const checked = [...acceptance.matchAll(/^\s*-\s+\[x\]\s+/gim)].length;
  const unchecked = [...acceptance.matchAll(/^\s*-\s+\[\s\]\s+/gm)].length;
  const evidence = passingEvidence(text);
  const verification = markdownSection(text, "Verification Summary");
  const verifiedCommands = [...verification.matchAll(/`([^`\n]+)`/g)]
    .map((match) => match[1]?.trim() ?? "");
  const commandsRecorded = proof
    ? proof.verificationCommands.every((command) =>
      evidence.some((entry) => {
        const normalized = entry.match(/^`([^`\n]+)`$/)?.[1]?.trim() ?? entry.trim();
        return normalized === command;
      }) && verifiedCommands.includes(command))
    : true;
  return checked > 0 && unchecked === 0 && evidence.length > 0 && commandsRecorded
    && /\bpass(?:ed)?\b/i.test(verification)
    && !/\bfail(?:ed|ure)?\b|\bnot run\b|\bpending\b/i.test(verification);
}

function updateTask(text: string, proof: WorkItemCompletionProof): string | null {
  if (!/^Status:\s*(ready|active)$/m.test(text)
    || exactField(text, "Planning provider") !== "openspec"
    || exactField(text, "Change ref") !== proof.change
    || exactField(text, "Work item ref") !== proof.workItem
    || !evidenceComplete(text, proof)) return null;
  return text.replace(/^Status:\s*(ready|active)$/m, "Status: complete");
}

function updateSprint(
  text: string,
  proof: WorkItemCompletionProof,
  nextTaskPath: string | null,
): { text: string; nextTaskPath: string | null } | null {
  const lines = text.split("\n");
  const rows = lines
    .map((line, index) => ({ line, index, cells: line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()) }))
    .filter(({ line, cells }) => line.trim().startsWith("|") && cells.length >= 4);
  const target = rows.filter(({ cells }) => cells[3] === proof.taskPath);
  if (target.length !== 1 || !/^(ready|active)$/i.test(target[0]!.cells[2] ?? "")) return null;
  target[0]!.cells[2] = "complete";
  lines[target[0]!.index] = `| ${target[0]!.cells.join(" | ")} |`;

  if (nextTaskPath) {
    const planned = rows.find(({ cells }) => cells[3] === nextTaskPath);
    if (!planned || !/^planned$/i.test(planned.cells[2] ?? "")) return null;
    planned.cells[2] = "ready";
    lines[planned.index] = `| ${planned.cells.join(" | ")} |`;
  }
  return { text: lines.join("\n"), nextTaskPath };
}

function updateProviderTasks(text: string, itemTitle: string): string | null {
  const lines = text.split("\n");
  const checkboxLines = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => /^\s*-\s+\[[ xX]\]\s+/.test(line));
  const matches = checkboxLines.filter(({ line }) =>
    line.replace(/^\s*-\s+\[[ xX]\]\s+/, "").trim() === itemTitle);
  const target = matches.length === 1 ? matches[0] : undefined;
  if (!target || !/^\s*-\s+\[\s\]\s+/.test(target.line)) return null;
  lines[target.index] = target.line.replace("[ ]", "[x]");
  return lines.join("\n");
}

function providerTaskTitles(text: string): string[] {
  return text.split("\n")
    .filter((line) => /^\s*-\s+\[[ xX]\]\s+/.test(line))
    .map((line) => line.replace(/^\s*-\s+\[[ xX]\]\s+/, "").trim());
}

async function writeAtomic(path: string, content: string): Promise<void> {
  const temporary = join(dirname(path), `.${basename(path)}.${process.pid}.${crypto.randomUUID()}.tmp`);
  try {
    await Bun.write(temporary, content);
    await rename(temporary, path);
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}

function journalSemanticsValid(journal: Journal, proof: WorkItemCompletionProof): boolean {
  if (journal.repositoryRoot !== proof.repositoryRoot
    || journal.taskPath !== proof.taskPath
    || journal.sprintPath !== proof.sprintPath
    || journal.change !== proof.change
    || journal.workItem !== proof.workItem
    || typeof journal.itemTitle !== "string" || journal.itemTitle.length === 0 || journal.itemTitle.length > 200
    || (journal.nextTaskPath !== null && !/^tasks\/issues\/\d{3}-[A-Za-z0-9._-]+\.md$/.test(journal.nextTaskPath))
    || (journal.nextWorkItem !== null && !validWorkItemId(journal.nextWorkItem))
    || (journal.nextTaskPath === null) !== (journal.nextWorkItem === null)) return false;
  const byPath = new Map(journal.files.map((file) => [file.path, file]));
  if (byPath.size !== journal.files.length
    || byPath.size !== (journal.nextTaskPath ? 4 : 3)) return false;
  const providerPath = `openspec/changes/${proof.change}/tasks.md`;
  const providerFile = byPath.get(providerPath);
  const taskFile = byPath.get(proof.taskPath);
  const sprintFile = byPath.get(proof.sprintPath);
  if (!providerFile || !taskFile || !sprintFile) return false;
  const expectedProvider = updateProviderTasks(providerFile.before, journal.itemTitle);
  const expectedTask = updateTask(taskFile.before, proof);
  const expectedSprint = updateSprint(sprintFile.before, proof, journal.nextTaskPath);
  if (!expectedProvider || !expectedTask || !expectedSprint
    || providerFile.after !== expectedProvider
    || taskFile.after !== expectedTask
    || sprintFile.after !== expectedSprint.text) return false;
  if (journal.nextTaskPath) {
    const promoted = byPath.get(journal.nextTaskPath);
    if (!promoted || exactField(promoted.before, "Planning provider") !== "openspec"
      || exactField(promoted.before, "Change ref") !== proof.change
      || exactField(promoted.before, "Work item ref") !== journal.nextWorkItem
      || !/^Status:\s*planned$/m.test(promoted.before)
      || promoted.after !== promoted.before.replace(/^Status:\s*planned$/m, "Status: ready")) return false;
  }
  return journal.files.every((file) =>
    hash(file.before) === file.beforeHash && hash(file.after) === file.afterHash);
}

async function recoverJournal(
  root: string,
  journalPath: string,
  proof: WorkItemCompletionProof,
): Promise<WorkItemCompletionResult | null> {
  if (!(await Bun.file(journalPath).exists())) return null;
  let journal: Journal;
  try {
    const info = await lstat(journalPath);
    if (!info.isFile() || info.isSymbolicLink() || info.size > 5 * 1024 * 1024) {
      return fail("invalid-state", "progress journal is not a bounded regular file");
    }
    journal = await Bun.file(journalPath).json() as Journal;
  } catch {
    return fail("invalid-state", "progress journal is malformed");
  }
  if (journal.version !== 1 || journal.repositoryRoot !== root || !Array.isArray(journal.files)
    || !journalSemanticsValid(journal, proof)) return fail("invalid-state", "progress journal identity or transition is invalid");
  for (const file of journal.files) {
    if (![
      /^tasks\/issues\/\d{3}-[A-Za-z0-9._-]+\.md$/,
      /^tasks\/sprint-[A-Za-z0-9._-]+\.md$/,
      /^openspec\/changes\/[a-z0-9]+(?:-[a-z0-9]+)*\/tasks\.md$/,
    ].some((pattern) => pattern.test(file.path))) {
      return fail("invalid-state", "progress journal contains an unsafe mutation");
    }
    const current = await safeRegularFile(root, file.path);
    if (current === null || ![file.beforeHash, file.afterHash].includes(hash(current))) {
      return fail("invalid-state", `progress recovery detected drift in ${file.path}`);
    }
  }
  for (const file of journal.files) {
    const current = await Bun.file(join(root, file.path)).text();
    if (hash(current) === file.beforeHash) await writeAtomic(join(root, file.path), file.after);
  }
  await unlink(journalPath);
  return null;
}

export async function completePlanningWorkItem(
  input: { cwd: string; proof: WorkItemCompletionProof },
  provider: ProgressProvider = new OpenSpecAdapter(),
): Promise<WorkItemCompletionResult> {
  let root: string;
  try {
    root = await realpath(resolve(input.cwd));
  } catch {
    return fail("unsafe-path", "repository root is unavailable");
  }
  if (!validProof(input.proof, root)) return fail("invalid-proof", "completion proof is invalid, stale, or belongs to another repository");

  const tasksRoot = join(root, "tasks");
  try {
    const info = await lstat(tasksRoot);
    if (!info.isDirectory() || info.isSymbolicLink()) return fail("unsafe-path", "task root is externalized");
  } catch {
    return fail("unsafe-path", "task root is unavailable");
  }
  const lockPath = join(tasksRoot, ".build-right-openspec-progress.lock");
  const journalPath = join(tasksRoot, ".build-right-openspec-progress-journal.json");
  let lock: Awaited<ReturnType<typeof open>> | undefined;
  try {
    lock = await open(
      lockPath,
      constants.O_CREAT | constants.O_RDWR | (constants.O_NOFOLLOW ?? 0),
      0o600,
    );
    if (!tryAdvisoryFileLock(lock.fd)) return fail("busy", "another progress closeout is active");
    const rootValidation = await validateManagedOpenSpecRoot(root, join(root, "openspec"));
    if (!rootValidation.ok) return fail("unsafe-path", `managed planning root is invalid: ${rootValidation.code}`);
    const [recoveryInspection, recoveryValidation] = await Promise.all([
      provider.inspect({ cwd: root, change: input.proof.change }),
      provider.validate({ cwd: root, change: input.proof.change }),
    ]);
    if (!recoveryInspection.ok || !recoveryValidation.ok) {
      return fail("provider-failure", "fresh planning inspection failed before recovery");
    }
    if (recoveryInspection.state !== "all-done" || !recoveryValidation.valid) {
      return fail("verification-failed", "fresh strict planning validation failed before recovery");
    }
    const recovery = await recoverJournal(root, journalPath, input.proof);
    if (recovery) return recovery;

    const taskText = await safeRegularFile(root, input.proof.taskPath);
    const sprintText = await safeRegularFile(root, input.proof.sprintPath);
    const providerPath = `openspec/changes/${input.proof.change}/tasks.md`;
    const providerText = await safeRegularFile(root, providerPath);
    if (taskText === null || sprintText === null || providerText === null) {
      return fail("unsafe-path", "closeout file is missing, externalized, special, or oversized");
    }
    if (!evidenceComplete(taskText, input.proof)) {
      return fail("verification-failed", "completion proof commands, acceptance, or passing evidence are incomplete");
    }

    const [inspection, validation, apply] = await Promise.all([
      provider.inspect({ cwd: root, change: input.proof.change }),
      provider.validate({ cwd: root, change: input.proof.change }),
      provider.applyInstructions({ cwd: root, change: input.proof.change }),
    ]);
    if (!inspection.ok || !validation.ok || !apply.ok) return fail("provider-failure", "fresh planning inspection failed");
    if (inspection.state !== "all-done" || !validation.valid) return fail("verification-failed", "fresh strict planning validation did not pass");
    const sourceTitles = providerTaskTitles(providerText);
    if (sourceTitles.length !== apply.workItems.length
      || apply.workItems.some((item, index) => item.title !== sourceTitles[index])) {
      return fail("provider-failure", "planning work-item order does not match the canonical source checklist");
    }
    const itemIndex = apply.workItems.findIndex((item) => item.id === input.proof.workItem);
    if (itemIndex < 0) return fail("invalid-state", "work item is missing");
    const targetItem = apply.workItems[itemIndex]!;
    if (targetItem.complete) {
      const completedTask = /^Status:\s*complete$/m.test(taskText);
      const completedSprint = sprintText.split("\n").some((line) => {
        const cells = line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
        return cells[3] === input.proof.taskPath && /^complete$/i.test(cells[2] ?? "");
      });
      if (!completedTask || !completedSprint || !evidenceComplete(taskText, input.proof)) {
        return fail("invalid-state", "planning work item is complete but Build Right closeout state is inconsistent");
      }
      const nextTaskPath = sprintText.split("\n")
        .map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()))
        .find((cells) => /^ready$/i.test(cells[2] ?? "") && /^tasks\/issues\//.test(cells[3] ?? ""))?.[3] ?? null;
      return {
        ok: true,
        mutation: "complete-work-item",
        state: "preserved",
        taskPath: input.proof.taskPath,
        sprintPath: input.proof.sprintPath,
        change: input.proof.change,
        workItem: input.proof.workItem,
        nextTaskPath,
      };
    }

    const nextProviderItem = apply.workItems.slice(itemIndex + 1).find((item) => !item.complete) ?? null;
    let promotedTask: { path: string; before: string; after: string } | null = null;
    if (nextProviderItem) {
      const plannedPaths = sprintText.split("\n")
        .map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()))
        .filter((cells) => /^planned$/i.test(cells[2] ?? "") && /^tasks\/issues\/\d{3}-[A-Za-z0-9._-]+\.md$/.test(cells[3] ?? ""))
        .map((cells) => cells[3]!);
      const matches: Array<{ path: string; before: string }> = [];
      for (const path of plannedPaths) {
        const before = await safeRegularFile(root, path);
        if (before !== null && exactField(before, "Planning provider") === "openspec"
          && exactField(before, "Change ref") === input.proof.change
          && exactField(before, "Work item ref") === nextProviderItem.id) {
          matches.push({ path, before });
        }
      }
      if (matches.length !== 1 || !/^Status:\s*planned$/m.test(matches[0]!.before)) {
        return fail("invalid-state", "next provider work item does not have one planned Build Right binding");
      }
      promotedTask = {
        path: matches[0]!.path,
        before: matches[0]!.before,
        after: matches[0]!.before.replace(/^Status:\s*planned$/m, "Status: ready"),
      };
    }
    const nextTask = updateTask(taskText, input.proof);
    const nextSprint = updateSprint(sprintText, input.proof, promotedTask?.path ?? null);
    const nextProvider = updateProviderTasks(providerText, targetItem.title);
    if (!nextTask || !nextSprint || !nextProvider) return fail("verification-failed", "Build Right evidence or closeout state is incomplete");
    const files: JournalFile[] = [
      { path: providerPath, beforeHash: hash(providerText), afterHash: hash(nextProvider), before: providerText, after: nextProvider },
      { path: input.proof.taskPath, beforeHash: hash(taskText), afterHash: hash(nextTask), before: taskText, after: nextTask },
      { path: input.proof.sprintPath, beforeHash: hash(sprintText), afterHash: hash(nextSprint.text), before: sprintText, after: nextSprint.text },
      ...(promotedTask ? [{
        path: promotedTask.path,
        beforeHash: hash(promotedTask.before),
        afterHash: hash(promotedTask.after),
        before: promotedTask.before,
        after: promotedTask.after,
      }] : []),
    ];
    const journal: Journal = {
      version: 1,
      repositoryRoot: root,
      taskPath: input.proof.taskPath,
      sprintPath: input.proof.sprintPath,
      change: input.proof.change,
      workItem: input.proof.workItem,
      itemTitle: targetItem.title,
      nextTaskPath: promotedTask?.path ?? null,
      nextWorkItem: nextProviderItem?.id ?? null,
      files,
    };
    await writeAtomic(journalPath, `${JSON.stringify(journal)}\n`);
    for (const file of files) {
      const current = await safeRegularFile(root, file.path);
      if (current === null || hash(current) !== file.beforeHash) {
        return fail("invalid-state", `concurrent drift detected in ${file.path}; recovery journal retained`);
      }
      await writeAtomic(join(root, file.path), file.after);
    }

    const postApply = await provider.applyInstructions({ cwd: root, change: input.proof.change });
    const postValidation = await provider.validate({ cwd: root, change: input.proof.change });
    const finalTask = await safeRegularFile(root, input.proof.taskPath);
    const finalSprint = await safeRegularFile(root, input.proof.sprintPath);
    const finalPromotedTask = nextSprint.nextTaskPath
      ? await safeRegularFile(root, nextSprint.nextTaskPath)
      : null;
    const finalFiles = await Promise.all(files.map((file) => safeRegularFile(root, file.path)));
    const finalFilesMatch = finalFiles.every((content, index) =>
      content !== null && hash(content) === files[index]!.afterHash);
    const completedItem = postApply.ok
      ? postApply.workItems.find((item) => item.id === input.proof.workItem)
      : undefined;
    if (!postApply.ok || !postValidation.ok || !postValidation.valid || !completedItem?.complete || !finalFilesMatch
      || !finalTask?.match(/^Status:\s*complete$/m)
      || !finalSprint?.includes(`| ${input.proof.taskPath} |`)
      || (nextSprint.nextTaskPath && !finalPromotedTask?.match(/^Status:\s*ready$/m))) {
      return fail("invalid-state", "post-closeout reinspection failed; recovery journal retained");
    }
    await unlink(journalPath);
    return {
      ok: true,
      mutation: "complete-work-item",
      state: "completed",
      taskPath: input.proof.taskPath,
      sprintPath: input.proof.sprintPath,
      change: input.proof.change,
      workItem: input.proof.workItem,
      nextTaskPath: nextSprint.nextTaskPath,
    };
  } catch {
    return fail("filesystem-failure", "progress closeout failed; retry will recover any durable journal");
  } finally {
    if (lock) await lock.close().catch(() => undefined);
  }
}
