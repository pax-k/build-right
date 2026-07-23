import type { ProcessEvidence } from "./contracts";

export type PlanningArtifact = {
  id: "proposal" | "specs" | "design" | "tasks";
  outputPath: string;
  status: "ready" | "blocked" | "done";
  missingDependencies: string[];
};

export type PlanningWorkItem = {
  id: string;
  title: string;
  complete: boolean;
  sourcePath: string;
};

export type PlanningFailureCode =
  | "provider-unavailable"
  | "unsupported-version"
  | "invalid-output"
  | "command-failed"
  | "change-not-found"
  | "timeout";

export type PlanningFailure = {
  ok: false;
  provider: "openspec";
  code: PlanningFailureCode;
  message: string;
  evidence: ProcessEvidence[];
};

export type PlanningChangeResult =
  | {
      ok: true;
      provider: "openspec";
      providerVersion: string;
      change: string;
      schema: string;
      state: "blocked" | "ready" | "all-done";
      artifacts: PlanningArtifact[];
      workItems: PlanningWorkItem[];
      evidence: ProcessEvidence[];
    }
  | PlanningFailure;

export type PlanningValidationResult =
  | { ok: true; provider: "openspec"; change: string; valid: boolean; issues: string[]; evidence: ProcessEvidence[] }
  | PlanningFailure;

export type ArtifactInstructionsResult =
  | {
      ok: true;
      provider: "openspec";
      change: string;
      artifact: PlanningArtifact["id"];
      outputPath: string;
      instruction: string;
      template: string;
      dependencies: string[];
      evidence: ProcessEvidence[];
    }
  | PlanningFailure;

export interface PlanningProvider {
  readonly id: "openspec";
  inspect(input: { cwd: string; change: string }): Promise<PlanningChangeResult>;
  instructions(input: {
    cwd: string;
    change: string;
    artifact: PlanningArtifact["id"];
  }): Promise<ArtifactInstructionsResult>;
  validate(input: { cwd: string; change: string }): Promise<PlanningValidationResult>;
  applyInstructions(input: { cwd: string; change: string }): Promise<PlanningChangeResult>;
}
