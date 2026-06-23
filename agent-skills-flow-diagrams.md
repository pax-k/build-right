# Agent Skills Flow Diagrams

This document visualizes the implemented flows for:

- `skills/build-right-preflight`
- `skills/build-right-execution`

The diagrams are intentionally operational: they show what the main agent does,
where founder input is required, where web research or subagents may help, and
where files are created or updated.

## Build Right Preflight

```mermaid
flowchart TD
  A["Invoke skill: /build-right-preflight or $build-right-preflight"] --> B["Read required references and templates"]
  B --> C["Inspect project state"]
  C --> D{"Project type?"}

  D -->|"Blank or new"| E["Prepare starter scaffold plan"]
  D -->|"Existing project"| F["Inventory docs, tasks, code surfaces, validation, release gates"]

  E --> G["Announce file plan"]
  F --> G

  G --> H{"Safe to write by default?"}
  H -->|"No: risky overwrite or planning-only mode"| I["Stop for user decision"]
  H -->|"Yes"| J["Create or update blueprint status and starter artifacts"]
  J --> J1["Set source mode and prototype confidence"]

  J1 --> K["Gather founder context dump"]
  K --> L["Interview founder in small batches"]
  L --> M["Create draft source material"]
  M --> N["Tag claims"]

  N --> N1["founder-claimed"]
  N --> N2["ai-inferred"]
  N --> N3["prototype-assumption"]
  N --> N4["repo-evidence-backed"]
  N --> N5["public-evidence-backed"]
  N --> N6["customer-evidence-backed"]
  N --> N7["unknown"]

  N --> O["Founder validates important claims"]
  O --> P["Record decisions and open questions"]
  P --> Q["Evidence layer"]

  Q --> R{"Useful public research?"}
  R -->|"Yes"| S["Run Research Lane"]
  R -->|"No"| T["Continue with current evidence state"]

  S --> U["Record public evidence in competitor, pricing, or market notes"]
  U --> V["Clarify only important conflicts or ambiguity"]
  T --> W["Produce canonical product docs"]
  V --> W

  W --> X["Build source index"]
  X --> Y["Scan conflicts"]
  Y --> Z["Extract MVP scope"]
  Z --> AA["Define manual ops before automation"]
  AA --> AB["Create operating rules, release gates, AI working rules"]
  AB --> AC["Create Sprint 0 and first executable task"]
  AC --> AC1["Add assumption basis, reversibility, learning objective, source under test, and learning notes"]
  AC1 --> AD{"Readiness gate"}

  AD -->|"Ready for foundation work"| AE["Go for Sprint 0"]
  AD -->|"Product features not ready"| AF["No-go for product features"]
  AD -->|"Blocked"| AG["First blocker: task path"]
  AD -->|"Ready task exists"| AH["First executable AI task: task path"]
```

## Pre-Execution Research Lane

```mermaid
flowchart TD
  A["Founder input comes first"] --> B["Extract explicit and inferred claims"]
  B --> C{"Which claims need public evidence?"}

  C -->|"Competitors or alternatives"| D["Research competitor landscape"]
  C -->|"Pricing assumptions"| E["Research public pricing benchmarks"]
  C -->|"Pain or vocabulary"| F["Research public pain language"]
  C -->|"Regulatory, platform, channel"| G["Research public constraints"]
  C -->|"No useful public evidence"| H["Keep claim as founder-claimed, ai-inferred, prototype-assumption, or unknown"]

  D --> I["Record source links and confidence"]
  E --> I
  F --> I
  G --> I

  I --> J["Upgrade public claims only to public-evidence-backed"]
  J --> K{"Does research conflict with founder claims?"}

  K -->|"Yes, material conflict"| L["Ask focused founder clarification"]
  K -->|"No or minor"| M["Update evidence notes and source index"]

  L --> M
  M --> N["Canonical doc update by main agent"]

  H --> O["Capture evidence gap"]
  O --> N
```

## Evidence Status Contract

```mermaid
flowchart TD
  A["Claim or task assumption"] --> B{"Evidence source?"}

  B -->|"Founder stated it"| C["founder-claimed"]
  B -->|"AI inferred it"| D["ai-inferred"]
  B -->|"Useful for reversible prototype only"| E["prototype-assumption"]
  B -->|"Local files, manifests, commands, releases"| F["repo-evidence-backed"]
  B -->|"Public web sources"| G["public-evidence-backed"]
  B -->|"Direct customer or sales evidence"| H["customer-evidence-backed"]
  B -->|"No basis yet"| I["unknown"]

  C --> J["Needs founder validation before product truth"]
  D --> J
  E --> K["Must record reversibility and learning objective"]
  F --> L["Can support repository/package/release claims"]
  G --> M["Can support market or public-source claims only"]
  H --> N["Can support customer truth when direct evidence is strong enough"]
  I --> O["Keep blocked or ask focused question"]
```

## Pre-Execution Delegation Lane

```mermaid
flowchart TD
  A["Main agent identifies optional delegation need"] --> B{"Good subagent fit?"}

  B -->|"No: founder decision or authoritative write"| C["Main agent handles directly"]
  B -->|"Yes: bounded research, inventory, critique, audit"| D["Create narrow subagent prompt"]

  D --> E["Include objective, context, scope, sources, output format, stop condition"]
  E --> F{"Delegation type"}

  F -->|"Research"| G["Competitor, pricing, or public pain language subagent"]
  F -->|"Inventory"| H["Existing project inventory subagent"]
  F -->|"Critique"| I["Conflict scan subagent"]
  F -->|"Audit"| J["Readiness audit subagent"]

  G --> K["Subagent returns findings, evidence, confidence, recommendations"]
  H --> K
  I --> K
  J --> K

  K --> L["Main agent synthesizes"]
  L --> M["Main agent decides file plan and writes updates"]
  M --> N["Main agent updates trackers and closes gates"]

  C --> N
```

## Build Right Execution

```mermaid
flowchart TD
  A["Invoke skill: /build-right-execution or $build-right-execution"] --> B["Read workflow, evidence contract, task template"]
  B --> C["Select exactly one task"]
  C --> D{"Task exists and is bounded?"}

  D -->|"No task or no execution surface"| E["Route to pre-execution or create smallest Sprint 0 blocker"]
  D -->|"Too broad"| F["Split or create follow-up task"]
  D -->|"Ready"| G["Read task, tracker, authority docs, local instructions"]

  G --> G1["Record assumption basis, reversibility, learning objective, source under test"]
  G1 --> H["Print task intake"]
  H --> I["Inspect workspace and git state"]
  I --> J{"Skill/manual trial?"}
  J -->|"Yes"| J1["Compare installed source with repo-local source"]
  J -->|"No"| J2["No source comparison needed"]
  J1 --> J3{"Source matches?"}
  J3 -->|"No"| J4["Record mismatch, mark partial-needs-rerun, do not advance gate"]
  J3 -->|"Yes"| J2
  J2 --> K["Capture baseline evidence"]
  K --> L["Diagnose gap"]
  L --> M["Create narrow implementation plan"]
  M --> N0["Implement smallest change"]
  N0 --> N["Verify in layers"]

  N --> O{"Optional subagent review useful?"}
  O -->|"Yes"| P["Run evidence completeness or scope creep review"]
  O -->|"No"| Q["Proceed to evidence capture"]

  P --> R["Main agent reviews gaps"]
  R --> S{"Gaps found?"}
  S -->|"Yes"| T["Fix within task boundary or create follow-up"]
  T --> N
  S -->|"No"| Q

  Q --> U["Record evidence, learning notes, files changed, blockers, follow-ups"]
  U --> V["Update only relevant tracker and docs"]
  V --> W{"Project expects commit?"}
  W -->|"Yes"| X["Stage only task-related files and commit"]
  W -->|"No"| Y["Hand off changed files, verification, evidence, blockers"]
  X --> Z["Closeout with what was proved and next task"]
  Y --> Z
```

## Manual Trial Release Gate

```mermaid
flowchart TD
  A["Manual trial task selected"] --> B["Sync installed Codex skill from repo-local source"]
  B --> C["Diff installed skill against repo-local skill"]
  C --> D{"Diff clean?"}

  D -->|"No"| E["Record mismatch and block release gate"]
  D -->|"Yes"| F["Run trial against installed skill path"]

  F --> G["Capture scratch target or selected task"]
  G --> H["Check required contract markers"]
  H --> I{"Trial passed?"}

  I -->|"No"| J["Mark task partial-needs-rerun or fail"]
  I -->|"Yes"| K["Update manual-trials evidence"]

  K --> L["Update release gates"]
  L --> M["Update release checklist"]
  M --> N["Advance first blocker to next manual trial"]
```

## Execution Subagent Review Lane

```mermaid
flowchart TD
  A["Implementation and verification completed"] --> B{"Need independent review?"}

  B -->|"No"| C["Main agent records evidence and closes task"]
  B -->|"Yes"| D{"Review type"}

  D -->|"Evidence completeness"| E["Subagent checks baseline, verification, files changed, blockers, follow-ups"]
  D -->|"Scope creep"| F["Subagent compares acceptance criteria to changed files and evidence"]

  E --> G["Subagent returns gaps only, no edits"]
  F --> G

  G --> H["Main agent evaluates findings"]
  H --> I{"Action required?"}

  I -->|"No"| C
  I -->|"Yes, in scope"| J["Main agent fixes and re-verifies"]
  I -->|"Yes, out of scope"| K["Main agent creates follow-up issue"]

  J --> C
  K --> C
```

## Ownership Boundary

```mermaid
flowchart LR
  A["Founder"] -->|"Validates terrain, promise, customer, MVP boundary"| B["Main agent"]
  B -->|"Gathers, drafts, critiques, audits"| C["Subagents"]
  C -->|"Findings only unless explicitly delegated"| B
  B -->|"Writes canonical docs, updates trackers, closes gates"| D["Project artifacts"]
  B -->|"Asks only for material conflicts or decisions"| A
```
