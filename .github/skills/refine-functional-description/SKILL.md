---
name: refine-functional-description
description: >
  Full refinement workflow for functional descriptions. Use when asked to
  refine, analyze, review, or validate a feature, user story, ticket, or
  acceptance criteria. Also use when a Jira ID is provided as input and the
  task involves test readiness, DoR verdict, or gap analysis.
license: MIT
---

## When to Use

- User provides a **plain-text** functional description or acceptance criteria to analyze.
- User provides a **Jira ticket ID** (e.g., `ONLINE-123`) and asks to refine or analyze it.
- User asks for a **DoR verdict**, gap analysis, or corner case identification.
- The Conductor delegates a functional description to the Refiner subagent.

---

## Step 1 — Resolve Input

| Input type | Action |
|---|---|
| Plain text | Use text directly as the functional description. |
| Jira ID (e.g. `ONLINE-123`) | Use Atlassian MCP to fetch the JIRA ticket by ID with the ticket ID. Extract title, description, and acceptance criteria from the response. |

> **Do not guess** ticket content. Always fetch before analyzing.

---

## Step 2 — Detect Functional Area and Load Context

1. Identify the functional area from the description (e.g., loyalty programs, checkout, authentication).
2. If a match exists, read that file and apply its business rules during analysis.
3. If no match exists, proceed with the provided information only.

---

## Step 3 — Completeness Analysis

Evaluate the input against these criteria. Mark each ✅ (met) or ❌ (gap).

| Criterion | Question |
|---|---|
| **Clear objective** | Is the purpose of the task clearly stated? |
| **User stories** | Are user stories well-defined with "As a… I want… So that…"? |
| **Acceptance criteria** | Are there explicit, testable acceptance criteria? |
| **Scope boundaries** | Is it clear what is in-scope and out-of-scope? |
| **Dependencies** | Are external dependencies or preconditions documented? |
| **Edge cases** | Are boundary conditions and error scenarios considered? |
| **Non-functional reqs** | Are performance, security, or accessibility requirements mentioned? |

---

## Step 4 — Corner Case Identification

For each acceptance criterion, identify:

- Boundary value scenarios.
- Negative paths (invalid inputs, unauthorized access, missing data).
- State transition edge cases.
- Integration failure scenarios.
- Concurrency or race conditions (only if the feature implies concurrent operations).

---

## Step 5 — DoR Verdict

**READY**: All acceptance criteria are explicit and testable. Proceed to Generator.

**NOT READY**: One or more acceptance criteria are missing, ambiguous, or untestable. Return gap analysis to user.

> Never mark READY if acceptance criteria are missing or untestable.

---

## Output Format

### If READY

```markdown
## Refinement Result: READY

### Functional Area: [area]

### Acceptance Criteria (validated):
1. [AC-1]: [description] ✅
2. [AC-2]: [description] ✅

### Additional Corner Cases Identified:
1. [CC-1]: [description]
2. [CC-2]: [description]

### Complete Criteria for Testing:
[Merged list of original ACs + identified corner cases, ready for test generation]
```

### If NOT READY

```markdown
## Refinement Result: NOT READY

### Functional Area: [area]

### Gaps Identified:
1. [GAP-1]: [what is missing or unclear]
2. [GAP-2]: [what is missing or unclear]

### Recommendations:
[Specific suggestions to address each gap]

### Partial Acceptance Criteria (if any):
[Criteria that are already well-defined]
```

---

## Rules

- Be thorough but pragmatic — do not invent requirements that are not implied.
- Always list corner cases even when the verdict is READY.
- Output is returned in the conversation only — do not write to Jira or Confluence.
- When using a Jira ID, fetch the full issue before any analysis.
- Apply business context files when available; do not assume domain knowledge otherwise.
