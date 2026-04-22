---
name: report-to-user
description: >
  Present subagent output to the user in a structured, workflow-aware format.
  Use when the Conductor receives a result from any subagent (Refiner,
  Generator, Manual Tester, Automator) and must relay it to the user.
license: MIT
---

## When to Use

- After **Refiner** returns a DoR verdict (READY or NOT READY).
- After **Generator** produces test cases.
- After **Manual Tester** returns execution results.
- After **Automator** returns automation code and run results.
- At any **mandatory pause point** requiring user confirmation before proceeding.

---

## Reporting Rules by Workflow

### Workflow 1 — New Feature Definition

| Subagent result | What to report |
|---|---|
| Refiner → DoR OK | Summary of acceptance criteria validated + next step (Generator) |
| Refiner → DoR KO | List of identified gaps + pause for user input |
| Generator → done | Full generated test cases in Gherkin format |

### Workflow 2 — Implementation Developed

| Subagent result | What to report |
|---|---|
| Manual → all PASS | Execution summary + inform that automation will start |
| Manual → some FAIL | Failed test IDs + descriptions + pause to ask user decision |
| Automator → done | Code changes summary + test run results |

### Workflow 3 — Bug Fix

Same reporting rules as Workflow 2.

### Workflow 4 — Technical Debt

| Subagent result | What to report |
|---|---|
| Automator → done | Code changes summary + test run results |

---

## Output Format

Always use this structure when reporting to the user:

```markdown
## Workflow: [workflow name]
### Status: [in-progress | completed | blocked]
### Current Step: [step description]

### Output:
[Exact output of what the subagent produced or found]
```

---

## Critical Patterns

- **Always state the current workflow and step** so the user has context.
- **At pause points**, explicitly state what decision or input is required.
- **For DoR KO**, list each gap as a bullet point with a brief explanation.
- **For test case results**, include pass/fail counts and highlight failures.
- **For automation output**, list files created or modified, not full diffs.

---

## Pause Point Template

Use this block whenever a mandatory pause point is reached:

```markdown
> **Action required**
> [Clear description of what the user needs to decide or provide]
> Options: [list options if applicable]
```

---

## Subagent-Specific Report Guidelines

### Refiner output

- State DoR verdict prominently: **READY** or **NOT READY**.
- If NOT READY, list gaps as numbered items.
- If READY, output exact gherkin format.

### Generator output

- Present test cases in full Gherkin format.
- Group by feature or functional area.
- Include total count: `N test cases generated`.

### Manual Tester output

- Table with columns: `Test ID | Title | Result | Notes`.
- Summary line: `X passed, Y failed`.
- For failures, include a brief description of the failure reason.

### Automator output

- List files created or modified with workspace-relative paths.
- Include Playwright run summary: total tests, passed, failed.
- If failures exist, list them with their error message.
