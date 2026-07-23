export const BUILD_RIGHT_USER_PROMPTS = {
  preflight: "Use $build-right-preflight.\nPrepare this project for evidence-driven AI execution.",
  featurePlanning: "Use $build-right-feature-planning.\nPlan a readiness probe and prepare the next executable task.",
  execution: "Use $build-right-execution.\nExecute the next ready AI-owned task.",
} as const;

export type ZeroMentionPromptAudit = {
  ok: boolean;
  prompts: string[];
  failures: string[];
};

const requiredSkillByPrompt = [
  "$build-right-preflight",
  "$build-right-feature-planning",
  "$build-right-execution",
] as const;

const forbiddenUserTerms = [
  /\bopenspec\b/i,
  /\b(?:install|initialize|init|validate|sync|archive)\b.*\b(?:provider|planning engine)\b/i,
  /\b(?:provider|planning engine)\b.*\b(?:install|initialize|init|validate|sync|archive)\b/i,
];

export function auditZeroMentionPrompts(
  prompts: readonly string[] = Object.values(BUILD_RIGHT_USER_PROMPTS),
): ZeroMentionPromptAudit {
  const failures: string[] = [];
  if (prompts.length !== requiredSkillByPrompt.length) {
    failures.push(`expected exactly ${requiredSkillByPrompt.length} user prompts, received ${prompts.length}`);
  }
  prompts.forEach((prompt, index) => {
    const requiredSkill = requiredSkillByPrompt[index];
    if (!requiredSkill || !prompt.includes(requiredSkill)) {
      failures.push(`prompt ${index + 1} does not invoke ${requiredSkill ?? "the expected Build Right skill"}`);
    }
    if (forbiddenUserTerms.some((pattern) => pattern.test(prompt))) {
      failures.push(`prompt ${index + 1} exposes managed planning internals`);
    }
  });
  return { ok: failures.length === 0, prompts: [...prompts], failures };
}

export function incompletePlanningWorkItems(markdown: string): number {
  return markdown.match(/^\s*-\s*\[\s\]\s+/gm)?.length ?? 0;
}
