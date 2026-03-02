---
description: "Meta-skill: Creates new skill definitions for HydraQA agents"
---

# 🛠️ Create Skill

This is a **meta-skill** — it creates new skills for HydraQA agents.

## What is a Skill?

A **skill** is a reusable capability that an agent can invoke. It consists of:

1. **SKILL.md** — Definition file describing the skill's purpose, inputs, outputs, and steps
2. **Supporting files** (optional) — Templates, scripts, or schemas used by the skill

Skills live in `.github/skills/<skill-name>/SKILL.md`.

## How to Create a New Skill

### Input
- **Skill Name**: `${{SKILL_NAME}}` (kebab-case, e.g., `create-page-object`)
- **Description**: `${{SKILL_DESCRIPTION}}`
- **Agent**: `${{AGENT}}` (which agent uses this skill)

### Steps

1. Create the skill directory: `.github/skills/${{SKILL_NAME}}/`

2. Create `SKILL.md` with this structure:

```markdown
---
description: "${{SKILL_DESCRIPTION}}"
---

# <Skill Title>

## Purpose
<What does this skill do and why?>

## Inputs
- **<param1>**: `${{PARAM1}}` — <description>
- **<param2>**: `${{PARAM2}}` — <description>

## Steps
1. <Step 1>
2. <Step 2>
3. <Step 3>

## Output
<What does the skill produce?>

## Example Usage
<Show how an agent invokes this skill>

## Validation
<How to verify the skill executed correctly>
```

3. Register the skill in the appropriate agent's `*.agent.md` under "Skills Available"

4. If the skill needs templates, add them to the skill directory:
   - `.github/skills/${{SKILL_NAME}}/templates/`

### Naming Convention
- Use **kebab-case** for skill directories
- Prefix with the action verb: `create-`, `analyze-`, `debug-`, `refactor-`, `generate-`, `report-`

### Skill Categories

| Category | Examples |
|----------|---------|
| **Generation** | `create-page-object`, `create-screen-object`, `create-e2e-web-test` |
| **Analysis** | `analyze-flaky-test`, `analyze-coverage`, `analyze-requirements` |
| **Execution** | `execute-manual-test`, `explore-feature` |
| **Reporting** | `report-bug`, `report-session`, `report-health` |
| **Maintenance** | `refactor-tests`, `update-selectors`, `health-check` |

## Output
- New skill directory at `.github/skills/<skill-name>/`
- `SKILL.md` file with complete skill definition
- Updated agent definition referencing the new skill

