---
description: "Workflow for testing a developed implementation: manual testing + automation"
mode: agent
agent: conductor
---

# Implementation Ready for Testing

Start the **Implementation Developed** workflow.

## Context

A feature implementation is complete and ready for QA validation.

## Input Required

Provide:

- The **test cases** to execute (or reference to previously generated tests).
- The **environment URL** where the implementation is deployed.
- Any **credentials** or setup instructions needed.

## Workflow

1. The Conductor delegates to the **Manual** subagent to execute all tests.
2. If all tests pass:
   - The **Automator** subagent converts passing tests into automated E2E tests.
3. If any test fails:
   - You will be asked whether to report a defect and/or automate the passing tests.

## Expected Output

- Manual test execution report with evidence.
- Automated E2E tests (code changes) for passing scenarios.

---

**Provide the test cases, environment URL, and any setup instructions below:**
