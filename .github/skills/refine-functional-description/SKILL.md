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

For each acceptance criterion, consider candidate corner cases from these
categories:

- Boundary value scenarios.
- Negative paths (invalid inputs, unauthorized access, missing data).
- State transition edge cases.
- Integration failure scenarios.
- Concurrency or race conditions (only if the feature implies concurrent operations).

### Step 4a — Relevance Filter (mandatory)

A candidate corner case may only be **kept** if it passes this filter:

- **Textual basis required**: it must be justifiable with a direct quote or
  close paraphrase from the functional description (a component, constraint,
  state, or behavior actually mentioned). Write this justification alongside
  each kept corner case.
- **No speculative infra/backend invention**: do not invent failure modes for
  systems, services, or error codes that are not named in the description
  (e.g. "CDN unavailable", "unmapped backend error code", "session expires
  mid-flow") unless the description explicitly calls out that
  system/behavior/risk.
- **External/black-box components**: when the description states a component
  is provided by an external team and scopes testing to a specific happy path
  (e.g. "we will only test a simple e2e happy path"), do not generate corner
  cases for that component's internal error handling beyond what is
  explicitly documented — respect the stated scope boundary.
- **Discard with reasoning**: any candidate that fails the filter must be
  moved to the **Discarded Corner Cases** list (see Output Format) with a
  one-line reason (e.g. "no textual basis in description", "explicitly out of
  scope per description"). Do not silently drop it — surface it for
  transparency, but do not count it as a validated corner case.

There is no fixed quota — the number of surviving corner cases should track
what the description actually implies, not an arbitrary target.

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
1. [CC-1]: [description] — *basis: [quote/paraphrase from description]*
2. [CC-2]: [description] — *basis: [quote/paraphrase from description]*

### Discarded / Out of Scope Corner Cases:
1. [description] — *reason: [no textual basis in description | explicitly out of scope per description | covered by external/black-box component happy-path-only testing]*
2. [description] — *reason: [...]*

### Complete Criteria for Testing:
[Merged list of original ACs + surviving (non-discarded) corner cases, ready for test generation]
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
- Only list corner cases that pass the Step 4a Relevance Filter (direct
  textual basis); log anything else in the Discarded list instead of treating
  it as a validated corner case.
- Output is returned in the conversation only — do not write to Jira or Confluence.
- When using a Jira ID, fetch the full issue before any analysis.
- Apply business context files when available; do not assume domain knowledge otherwise.
