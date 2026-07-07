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
workflow), and the calling prompt explicitly instructs it, the **Generator**
subagent creates one Jira **Sub-task** per generated scenario using the
`create-jira-issue` skill, linked to the source Jira issue, without asking
for confirmation. Locally, the Generator always asks the user first.

## Expected Output

- Validated acceptance criteria with identified corner cases.
- A structured test suite covering all criteria (if DoR is met).

---

**Provide your functional description or Jira ticket ID below:**
