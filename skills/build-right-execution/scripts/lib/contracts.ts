export type OutputFormat = "markdown" | "json";

export type Decision =
  | "execute-task"
  | "continue-active-task"
  | "ask-founder"
  | "wait-external"
  | "create-blocker"
  | "no-ready-task"
  | "invalid-state";

export type GateType =
  | "invalid-state"
  | "founder-owned"
  | "external-state"
  | "open-conflict"
  | "source-mismatch"
  | "stale"
  | "failed-verification"
  | "release-claim"
  | "planning-provider-unavailable"
  | "planning-provider-invalid"
  | "planning-drift"
  | "spec-validation-failed"
  | "spec-sync-pending";

export type ContinueArgs = {
  cwd: string;
  format: OutputFormat;
  includeCompleted: boolean;
  strict: boolean;
  help: boolean;
};

export type EvidenceRef = {
  source: string;
  summary: string;
};

export type Gate = {
  type: GateType;
  status: string;
  source: string;
  reason: string;
};

export type TaskSummary = {
  id: string;
  title: string;
  status: string;
  path: string;
  tracker: string;
  evidence: string;
  order: number;
  owner?: string;
  type?: string;
  assumptionBasis?: string;
  missingContractFields: string[];
  planningBinding?: {
    provider: "openspec";
    change: string;
    workItem: string;
  };
  planningBindingError?: string;
  planningWorkItemComplete?: boolean;
  completionEvidenceValid?: boolean;
};

export type ResolverInput = {
  cwd: string;
  invalidGates: Gate[];
  founderGates: Gate[];
  externalFollowUps: Gate[];
  aiBlockingGates: Gate[];
  readyTasks: TaskSummary[];
  activeTasks: TaskSummary[];
  plannedTasks?: TaskSummary[];
  completedTasks: TaskSummary[];
  evidence: EvidenceRef[];
  missingExecutionSurface: boolean;
};

export type ContinueResult = {
  cwd: string;
  decision: Decision;
  nextAction: string;
  nextTask: TaskSummary | null;
  blockingGates: Gate[];
  readyTasks: TaskSummary[];
  activeTasks: TaskSummary[];
  completedTasks: TaskSummary[];
  externalFollowUps: Gate[];
  evidence: EvidenceRef[];
  confidence: "high" | "medium" | "low";
};
