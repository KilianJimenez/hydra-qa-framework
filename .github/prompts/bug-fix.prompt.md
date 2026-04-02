---
description: "Workflow for verifying a bug fix: re-test + automation"
mode: agent
agent: conductor
---

# Bug Fix Verification

Start the **Bug Fix** workflow.

## Context

A defect has been fixed and the fix needs to be verified through testing.

## Input Required

Provide:

- The **defect description** or **defect ID** (Jira, etc.).
- The **test cases** related to the fix (or reference to original failing tests).
- The **environment URL** where the fix is deployed.
- Any **credentials** or setup instructions needed.

## Workflow

Same as the **Implementation Developed** workflow:

1. The **Manual** subagent re-executes the relevant tests to verify the fix.
2. If all tests pass → the **Automator** subagent creates/updates automated tests.
3. If any test still fails → you decide on next steps (re-report, automate passing tests, etc.).

## Expected Output

- Verification report confirming whether the defect is resolved.
- Updated automated E2E tests covering the fix.

---

**Provide the defect details, test cases, and environment URL below:**
