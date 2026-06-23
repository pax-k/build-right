type Check = {
  name: string;
  run: () => Promise<void>;
};

const failures: string[] = [];
let manifestSkillNames: string[] | null = null;

async function read(path: string): Promise<string> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    throw new Error(`missing file: ${path}`);
  }
  return file.text();
}

async function exists(path: string): Promise<boolean> {
  return Bun.file(path).exists();
}

async function manifestSkills(): Promise<string[]> {
  if (manifestSkillNames) {
    return manifestSkillNames;
  }

  const manifest = JSON.parse(await read("skills.sh.json")) as {
    groupings?: Array<{ skills?: string[] }>;
  };
  manifestSkillNames = manifest.groupings?.flatMap((group) => group.skills ?? []) ?? [];
  return manifestSkillNames;
}

function frontmatter(markdown: string, path: string): Record<string, string> {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    throw new Error(`${path} is missing YAML frontmatter`);
  }

  const data: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (pair) {
      data[pair[1]] = pair[2].trim();
    }
  }
  return data;
}

async function assertIncludes(path: string, markers: string[]): Promise<void> {
  const text = await read(path);
  const missing = markers.filter((marker) => !text.includes(marker));
  if (missing.length > 0) {
    throw new Error(`${path} missing markers: ${missing.join(", ")}`);
  }
}

async function markdownFilesUnder(prefix: string): Promise<string[]> {
  const glob = new Bun.Glob(`${prefix}/**/*.md`);
  const files: string[] = [];
  for await (const file of glob.scan({ cwd: ".", onlyFiles: true })) {
    files.push(file);
  }
  return files;
}

async function filesUnder(prefix: string): Promise<string[]> {
  const glob = new Bun.Glob(`${prefix}/**/*`);
  const files: string[] = [];
  for await (const file of glob.scan({ cwd: ".", onlyFiles: true })) {
    files.push(file.slice(prefix.length + 1));
  }
  return files.sort();
}

async function filesUnderAbsolute(prefix: string): Promise<string[]> {
  const glob = new Bun.Glob("**/*");
  const files: string[] = [];
  for await (const file of glob.scan({ cwd: prefix, onlyFiles: true })) {
    files.push(file);
  }
  return files.sort();
}

function arraysEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

const checks: Check[] = [
  {
    name: "skills.sh.json parses and manifest skill paths exist",
    run: async () => {
      const skills = await manifestSkills();
      if (skills.length === 0) {
        throw new Error("skills.sh.json does not list any skills");
      }

      for (const skill of skills) {
        const skillPath = `skills/${skill}/SKILL.md`;
        const text = await read(skillPath);
        const yaml = frontmatter(text, skillPath);
        if (yaml.name !== skill) {
          throw new Error(`${skillPath} frontmatter name is ${yaml.name}, expected ${skill}`);
        }
        if (!yaml.description) {
          throw new Error(`${skillPath} frontmatter is missing description`);
        }
      }
    },
  },
  {
    name: "installed user-scope skills match repo-local source when installed",
    run: async () => {
      const home = Bun.env.CODEX_HOME ?? `${Bun.env.HOME}/.codex`;
      const skills = await manifestSkills();

      for (const skill of skills) {
        const repoRoot = `skills/${skill}`;
        const installedRoot = `${home}/skills/${skill}`;
        if (!(await exists(`${installedRoot}/SKILL.md`))) {
          console.log(`skip - ${skill} is not installed at ${installedRoot}`);
          continue;
        }

        const repoFiles = await filesUnder(repoRoot);
        const installedFiles = await filesUnderAbsolute(installedRoot);
        if (!arraysEqual(repoFiles, installedFiles)) {
          throw new Error(`${skill} installed files differ from repo-local files`);
        }

        for (const file of repoFiles) {
          const repoText = await read(`${repoRoot}/${file}`);
          const installedText = await Bun.file(`${installedRoot}/${file}`).text();
          if (repoText !== installedText) {
            throw new Error(`${skill}/${file} differs between repo-local and installed source`);
          }
        }
      }
    },
  },
  {
    name: "current preflight and execution contract markers exist",
    run: async () => {
      await assertIncludes("skills/build-right-preflight/assets/templates/docs/blueprint-status.md", [
        "Source mode",
        "Prototype confidence",
        "Prototype assumptions labeled",
      ]);
      await assertIncludes("skills/build-right-preflight/assets/templates/tasks/issue-template.md", [
        "Assumption basis",
        "Reversibility",
        "Learning objective",
        "Learning Notes",
      ]);
      await assertIncludes("skills/build-right-execution/assets/templates/task-template.md", [
        "Assumption basis",
        "Reversibility",
        "Learning objective",
        "Learning Notes",
      ]);
      await assertIncludes("docs/evidence/manual-trials.md", [
        "Agent-Agnostic Trial Evidence Packet",
        "Run label",
        "Agent/tool surface",
        "Skill source",
        "Proved",
        "Simulated",
        "Unproven",
        "Follow-ups",
      ]);
    },
  },
  {
    name: "durable docs and tasks do not contain agent-specific evidence handles",
    run: async () => {
      const forbidden = [/codex:\/\/threads/i, /codex_app\.read_thread/i];
      const files = [
        ...(await markdownFilesUnder("docs")),
        ...(await markdownFilesUnder("tasks")),
      ];

      for (const file of files) {
        const text = await read(file);
        for (const pattern of forbidden) {
          if (pattern.test(text)) {
            throw new Error(`${file} contains forbidden handle pattern ${pattern}`);
          }
        }
      }
    },
  },
  {
    name: "release evidence references the deterministic verifier",
    run: async () => {
      await assertIncludes("docs/release-gates.md", ["scripts/verify-skill-trials.ts"]);
    },
  },
  {
    name: "task files are complete and indexed in trackers",
    run: async () => {
      const issueFiles = (await markdownFilesUnder("tasks/issues")).sort();
      if (issueFiles.length === 0) {
        throw new Error("no task issue files found");
      }

      const sprint = await read("tasks/sprint-0.md");
      const postRelease = await read("tasks/post-release-backlog.md");
      await assertIncludes("tasks/sprint-0.md", ["Status: complete-direct-install-ready"]);
      await assertIncludes("tasks/post-release-backlog.md", ["Status: complete-ai-executable"]);

      const trackers = `${sprint}\n${postRelease}`;
      for (const file of issueFiles) {
        const id = file.match(/\/(\d{3})-[^/]+\.md$/)?.[1];
        if (!id) {
          throw new Error(`${file} does not use a three-digit task id`);
        }

        const text = await read(file);
        const status = text.match(/^Status:\s*(.+)$/m)?.[1]?.trim();
        if (status !== "complete") {
          throw new Error(`${file} has status ${status ?? "missing"}, expected complete`);
        }

        if (!trackers.includes(`| ${id} |`) || !trackers.includes(file)) {
          throw new Error(`${file} is not indexed in sprint or post-release tracker`);
        }
      }
    },
  },
];

for (const check of checks) {
  try {
    await check.run();
    console.log(`ok - ${check.name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`${check.name}: ${message}`);
    console.error(`fail - ${check.name}: ${message}`);
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} verifier check(s) failed.`);
  process.exit(1);
}

console.log(`\n${checks.length} verifier checks passed.`);
