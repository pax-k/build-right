import { OPENSPEC_VERSION, type ProcessEvidence, type ProcessRunner } from "./contracts";
import { managedOpenSpecCommand, verifyManagedOpenSpec } from "./managed-runtime";
import { runBoundedProcess } from "./process-runner";
import type {
  ArtifactInstructionsResult,
  PlanningArtifact,
  PlanningChangeResult,
  PlanningFailure,
  PlanningValidationResult,
} from "./provider-contracts";

const changePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const workItemPattern = /^\d+(?:\.\d+)*$/;
const artifactPaths: Record<PlanningArtifact["id"], string> = {
  proposal: "proposal.md",
  specs: "specs/**/*.md",
  design: "design.md",
  tasks: "tasks.md",
};

export function validChangeName(value: string): boolean {
  return value.length <= 80 && changePattern.test(value);
}

export function validWorkItemId(value: string): boolean {
  return value.length <= 40 && workItemPattern.test(value);
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function boundedText(value: unknown, max: number, multiline = false): value is string {
  return typeof value === "string" && value.length <= max
    && !(multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/).test(value);
}

function dependencyIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const ids: string[] = [];
  for (const raw of value) {
    if (typeof raw === "string") {
      if (!Object.hasOwn(artifactPaths, raw)) return null;
      ids.push(raw);
      continue;
    }
    const item = record(raw);
    if (!item || typeof item.id !== "string" || !Object.hasOwn(artifactPaths, item.id)
      || item.done !== true) {
      return null;
    }
    ids.push(item.id);
  }
  return ids;
}

function failure(code: PlanningFailure["code"], message: string, evidence: ProcessEvidence[] = []): PlanningFailure {
  return { ok: false, provider: "openspec", code, message, evidence };
}

function runtimeFailureCode(code: string): PlanningFailure["code"] {
  if (code === "timeout") return "timeout";
  if (code === "unsupported-version") return "unsupported-version";
  return "provider-unavailable";
}

function processFailureCode(process: Extract<Awaited<ReturnType<ProcessRunner>>, { ok: false }>): PlanningFailure["code"] {
  if (process.code === "timeout") return "timeout";
  const summary = `${process.evidence.stdoutSummary}\n${process.evidence.stderrSummary}`;
  return /change.+not found|not found.+change/i.test(summary) ? "change-not-found" : "command-failed";
}

export class OpenSpecAdapter {
  readonly id = "openspec" as const;
  constructor(private readonly runner: ProcessRunner = runBoundedProcess) {}

  private async json(cwd: string, args: string[], options: { acceptNonZeroJson?: boolean } = {}): Promise<
    | { ok: true; value: Record<string, unknown>; evidence: ProcessEvidence }
    | PlanningFailure
  > {
    const runtime = await verifyManagedOpenSpec(cwd, this.runner);
    if (!runtime.ok) return failure(runtimeFailureCode(runtime.result.code), runtime.result.message);
    let process: Awaited<ReturnType<ProcessRunner>>;
    try {
      process = await this.runner({ command: managedOpenSpecCommand(...args), cwd });
    } catch {
      return failure("provider-unavailable", "provider process boundary failed");
    }
    if (!process.ok) {
      const mayParseCompletedFailure = options.acceptNonZeroJson && process.code === "command-failed";
      if (!mayParseCompletedFailure) {
        return failure(processFailureCode(process), process.message, [process.evidence]);
      }
    }
    try {
      const value = record(JSON.parse(process.ok ? process.stdout : process.stdout ?? ""));
      return value
        ? { ok: true, value, evidence: process.evidence }
        : failure("invalid-output", "provider returned a non-object JSON result", [process.evidence]);
    } catch {
      return failure("invalid-output", "provider returned malformed JSON", [process.evidence]);
    }
  }

  async inspect(input: { cwd: string; change: string }): Promise<PlanningChangeResult> {
    if (!validChangeName(input.change)) return failure("invalid-output", "invalid change identifier");
    const result = await this.json(input.cwd, ["status", "--change", input.change, "--json"]);
    if (!result.ok) return result;
    const name = result.value.changeName;
    const schema = result.value.schemaName;
    const artifactsRaw = result.value.artifacts;
    if (name !== input.change || schema !== "spec-driven" || typeof result.value.isComplete !== "boolean"
      || !Array.isArray(artifactsRaw)) {
      return failure("invalid-output", "status JSON is missing required fields", [result.evidence]);
    }
    const artifacts: PlanningArtifact[] = [];
    for (const raw of artifactsRaw) {
      const item = record(raw);
      if (!item || !["proposal", "specs", "design", "tasks"].includes(String(item.id))
        || typeof item.outputPath !== "string" || !["ready", "blocked", "done"].includes(String(item.status))) {
        return failure("invalid-output", "status JSON contains an invalid artifact", [result.evidence]);
      }
      const id = item.id as PlanningArtifact["id"];
      if (item.outputPath !== artifactPaths[id]) {
        return failure("invalid-output", "status JSON contains an unsafe artifact path", [result.evidence]);
      }
      const missing = item.missingDeps === undefined ? [] : item.missingDeps;
      if (!Array.isArray(missing) || !missing.every((value) => typeof value === "string" && Object.hasOwn(artifactPaths, value))
        || new Set(missing).size !== missing.length) {
        return failure("invalid-output", "status JSON contains invalid dependencies", [result.evidence]);
      }
      artifacts.push({
        id,
        outputPath: item.outputPath,
        status: item.status as PlanningArtifact["status"],
        missingDependencies: missing,
      });
    }
    const artifactIds = new Set(artifacts.map((item) => item.id));
    if (artifacts.length !== 4 || artifactIds.size !== 4
      || !Object.keys(artifactPaths).every((id) => artifactIds.has(id as PlanningArtifact["id"]))) {
      return failure("invalid-output", "status JSON must contain the exact artifact set", [result.evidence]);
    }
    const allArtifactsDone = artifacts.every((item) => item.status === "done");
    if (result.value.isComplete !== allArtifactsDone) {
      return failure("invalid-output", "status JSON contains contradictory completion state", [result.evidence]);
    }
    return {
      ok: true,
      provider: "openspec",
      providerVersion: OPENSPEC_VERSION,
      change: input.change,
      schema,
      state: result.value.isComplete === true ? "all-done" : artifacts.some((item) => item.status === "blocked") ? "blocked" : "ready",
      artifacts,
      workItems: [],
      evidence: [result.evidence],
    };
  }

  async instructions(input: { cwd: string; change: string; artifact: PlanningArtifact["id"] }): Promise<ArtifactInstructionsResult> {
    if (!validChangeName(input.change)) return failure("invalid-output", "invalid change identifier");
    if (!Object.hasOwn(artifactPaths, input.artifact)) {
      return failure("invalid-output", "invalid artifact identifier");
    }
    const result = await this.json(input.cwd, ["instructions", input.artifact, "--change", input.change, "--json"]);
    if (!result.ok) return result;
    const value = result.value;
    const dependencies = dependencyIds(value.dependencies);
    if (value.changeName !== input.change || value.artifactId !== input.artifact
      || value.outputPath !== artifactPaths[input.artifact] || !boundedText(value.instruction, 96_000, true)
      || !boundedText(value.template, 96_000, true) || dependencies === null) {
      return failure("invalid-output", "artifact instructions JSON is invalid", [result.evidence]);
    }
    return {
      ok: true, provider: "openspec", change: input.change, artifact: input.artifact,
      outputPath: value.outputPath, instruction: value.instruction, template: value.template,
      dependencies, evidence: [result.evidence],
    };
  }

  async applyInstructions(input: { cwd: string; change: string }): Promise<PlanningChangeResult> {
    if (!validChangeName(input.change)) return failure("invalid-output", "invalid change identifier");
    const result = await this.json(input.cwd, ["instructions", "apply", "--change", input.change, "--json"]);
    if (!result.ok) return result;
    const value = result.value;
    if (value.changeName !== input.change || value.schemaName !== "spec-driven"
      || !["blocked", "ready", "all-done", "all_done"].includes(String(value.state))
      || !Array.isArray(value.tasks) || value.tasks.length > 999) {
      return failure("invalid-output", "apply instructions JSON is invalid", [result.evidence]);
    }
    const workItems = [];
    const workItemIds = new Set<string>();
    for (const raw of value.tasks) {
      const item = record(raw);
      const id = item?.id;
      const title = item?.description ?? item?.title;
      const status = item?.status;
      const done = item?.done;
      if (typeof id !== "string" || !validWorkItemId(id) || !boundedText(title, 200)
        || (typeof done !== "boolean" && !["pending", "complete", "done"].includes(String(status)))) {
        return failure("invalid-output", "apply instructions contain an invalid work item", [result.evidence]);
      }
      if (workItemIds.has(id)) {
        return failure("invalid-output", "apply instructions contain duplicate work items", [result.evidence]);
      }
      workItemIds.add(id);
      workItems.push({
        id,
        title,
        complete: typeof done === "boolean" ? done : status === "complete" || status === "done",
        sourcePath: `openspec/changes/${input.change}/tasks.md`,
      });
    }
    const allWorkComplete = workItems.every((item) => item.complete);
    const providerAllDone = value.state === "all-done" || value.state === "all_done";
    if (providerAllDone !== allWorkComplete
      || (value.state === "ready" && (workItems.length === 0 || allWorkComplete))) {
      return failure("invalid-output", "apply instructions contain contradictory completion state", [result.evidence]);
    }
    return {
      ok: true,
      provider: "openspec",
      providerVersion: OPENSPEC_VERSION,
      change: input.change,
      schema: value.schemaName,
      state: providerAllDone ? "all-done" : value.state === "ready" ? "ready" : "blocked",
      artifacts: [],
      workItems,
      evidence: [result.evidence],
    };
  }

  async validate(input: { cwd: string; change: string }): Promise<PlanningValidationResult> {
    if (!validChangeName(input.change)) return failure("invalid-output", "invalid change identifier");
    const result = await this.json(
      input.cwd,
      ["validate", input.change, "--strict", "--json"],
      { acceptNonZeroJson: true },
    );
    if (!result.ok) return result;
    const items = result.value.items;
    if (!Array.isArray(items) || items.length > 100) return failure("invalid-output", "validation JSON is missing items", [result.evidence]);
    const target = items.map(record).find((item) => item?.id === input.change);
    if (!target || typeof target.valid !== "boolean" || !Array.isArray(target.issues) || target.issues.length > 100) {
      return failure("invalid-output", "validation JSON is missing the requested change", [result.evidence]);
    }
    const issues = target.issues.map(record);
    if (issues.some((item) => !item || !boundedText(item.message, 4_000, true))) {
      return failure("invalid-output", "validation JSON contains invalid issues", [result.evidence]);
    }
    if (result.evidence.exitCode !== 0 && (target.valid !== false || issues.length === 0)) {
      return failure(
        "command-failed",
        "strict validation command failed without an explicit invalid result",
        [result.evidence],
      );
    }
    return { ok: true, provider: "openspec", change: input.change, valid: target.valid, issues: issues.map((item) => item!.message as string), evidence: [result.evidence] };
  }
}
