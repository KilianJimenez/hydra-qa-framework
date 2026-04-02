---
description: "Workflow for technical debt: automation only (no manual testing)"
mode: agent
agent: conductor
---

# Technical Debt Task

Start the **Technical Debt** workflow.

## Context

A technical debt task has been completed. Since this is an internal code improvement, only automated testing is required (no manual testing phase).

## Input Required

Provide:

- A **description** of the technical debt changes.
- The **affected areas** of the application.
- Any **existing test cases** that should be updated or created.

## Workflow

1. The Conductor delegates directly to the **Automator** subagent (skips manual testing).
2. The Automator evaluates existing test coverage for the affected areas.
3. The Automator creates or updates automated E2E tests as needed.

## Expected Output

- Automation summary with code changes.
- Updated or new E2E tests covering the affected areas.

---

**Provide the technical debt description and affected areas below:**
