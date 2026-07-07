---
description: "Workflow for defining a new feature: refinement + test generation"
mode: agent
agent: conductor
---

# New Feature Definition

Start the **New Feature Definition** workflow.

## Context

The user has a new functional requirement that needs to be refined and converted into test cases.

## Input Required

Provide one of the following:

- A **functional description** with acceptance criteria (paste as text).
- A **Jira ticket identifier** (e.g., `PROJ-1234`).

## Workflow

1. The Conductor will delegate to the **Refiner** subagent for functional analysis.
2. If the requirement meets the Definition of Ready:
   - The **Generator** subagent creates a comprehensive test suite.
   - The test suite is presented for review.
3. If the requirement does NOT meet the Definition of Ready:
   - A gap analysis is presented with recommendations.

## CI Mode

When run non-interactively in CI (e.g. via the `jira-webhook-trigger.yml`
workflow, `Execution Context: CI`), instruct the **Generator** subagent as
follows — this is the explicit instruction the Generator's Step 5 guard
requires, not merely a description of it:

> **Execution Context: CI.** After generating the test suite, create one
> Jira **Sub-task** per generated scenario using the `create-jira-issue`
> skill, linked to the source Jira issue `$ISSUE_KEY`, without asking for
> confirmation. Do **not** create or modify any repository files (no
> `.feature` files, no other files) and do **not** run any `git` command
> (no `git add`, `git commit`, `git push`). The only allowed persistence
> mechanism is the `create-jira-issue` skill.

Locally (`Execution Context: Local`), the Generator always asks the user
first before persisting anything, and may create repository `.feature`
files when the user confirms that path.

## Expected Output

- Validated acceptance criteria with identified corner cases.
- A structured test suite covering all criteria (if DoR is met).

---

**Provide your functional description or Jira ticket ID below:**
