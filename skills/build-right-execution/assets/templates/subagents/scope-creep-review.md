Objective:
Compare task acceptance criteria with changed files and evidence to detect
scope creep.

Context to read:
- <selected task file>
- <changed files or diff summary>
- <evidence log or verification summary>

Scope:
- Include: unrelated changes, hidden product decisions, missing tests, missing
  follow-up issues, and risky broadened behavior.
- Exclude: editing files, final closeout, committing, tracker updates.

Sources:
- Provided task file, changed files, and evidence only.

Output format:
- Findings
- Source paths
- Severity
- Recommended follow-up or rollback discussion

Stop condition:
Return scope concerns and evidence. Do not edit files.
