# Workflows

## Overview

The Hydra QA Framework supports four main workflows, each tailored to a specific phase of the QA lifecycle. All workflows are orchestrated by the **Conductor** agent and triggered via prompt templates in `.github/prompts/`.

## Quick Reference

| Workflow               | Prompt File              | Agents Involved                        |
| ---------------------- | ------------------------ | -------------------------------------- |
| New Feature Definition | `new-feature.prompt.md`  | Conductor → Refiner → Generator        |
| Implementation Ready   | `implementation-ready.prompt.md` | Conductor → Manual → Automator  |
| Bug Fix                | `bug-fix.prompt.md`      | Conductor → Manual → Automator         |
| Technical Debt         | `tech-debt.prompt.md`    | Conductor → Automator                  |

---

## Workflow 1: New Feature Definition

**When to use**: A new functional requirement or user story needs to be analyzed and converted into test cases.

### Flow

```
User provides functional description or Jira ID
         │
         ▼
    ┌─────────┐
    │Conductor│ — Identifies workflow, presents plan
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ Refiner │ — Analyzes completeness, identifies corner cases
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │Conductor│ — Receives DoR verdict, decides next step
    └────┬────┘
         │
    ┌────┴────┐
    │         │
  READY    NOT READY
    │         │
    ▼         ▼
┌─────────┐  User receives gap analysis
│Generator│  with recommendations
└────┬────┘
     │
     ▼
    ┌─────────┐
    │Conductor│
    └────┬────┘
         │
         ▼
User receives structured test suite
```

### Steps

1. **User** provides a functional description (text or Jira ticket ID).
2. **Conductor** validates the input and delegates to the **Refiner**.
3. **Refiner** performs:
   - Functional area detection.
   - Completeness analysis against DoR criteria.
   - Corner case identification.
   - Issues a verdict: READY or NOT READY.
4. **If READY**:
   - Conductor delegates to **Generator** with validated criteria.
   - Generator creates atomic test cases covering all ACs and corner cases.
   - Generator optimizes the suite for execution flow.
   - User receives the test suite.
5. **If NOT READY**:
   - User receives a gap analysis with specific recommendations.
   - Workflow pauses until the user provides updated requirements.

### Pause Points

- After Refiner returns NOT READY (user must address gaps).
- After Generator presents test cases (user reviews before proceeding).

---

## Workflow 2: Implementation Developed

**When to use**: A feature implementation is complete and ready for QA validation.

### Flow

```
User provides test cases + environment URL
         │
         ▼
    ┌─────────┐
    │Conductor│ — Identifies workflow, presents plan
    └────┬────┘
         │
         ▼
    ┌────────┐
    │ Manual │ — Executes tests in browser, collects evidence
    └────┬───┘
         │
         ▼
    ┌─────────┐
    │Conductor│ — Receives test results, evaluates outcome
    └────┬────┘
         │
    ┌────┴────┐
    │         │
 ALL PASS  SOME FAIL
    │         │
    ▼         ▼
┌──────────┐  User decides:
│Automator │  - Report defect?
└────┬─────┘  - Automate passing tests?
     │
     ▼
    ┌─────────┐
    │Conductor│
    └────┬────┘
         │
         ▼
User receives code changes + results
```

### Steps

1. **User** provides test cases, environment URL, and setup instructions.
2. **Conductor** delegates to the **Manual** subagent.
3. **Manual** executes each test case:
   - Navigates to the application.
   - Executes steps, recording URLs, elements, and results.
   - Marks each test as PASS or FAIL.
4. **If all tests PASS**:
   - Conductor delegates to **Automator** with execution evidence.
   - Automator checks for existing coverage, then creates/updates automation.
   - User receives code changes and execution results.
5. **If any test FAILS**:
   - Conductor presents results and asks the user:
     - **Report defect?** → Manual creates a structured defect report.
     - **Automate passing tests?** → Automator processes only passing tests.
     - **Both?** → Both actions execute sequentially.

### Pause Points

- After Manual reports failures (user decides on defect reporting and automation).

---

## Workflow 3: Bug Fix

**When to use**: A defect has been fixed and the fix needs verification.

### Flow

Identical to **Workflow 2 (Implementation Developed)**. The user provides:

- The defect description or ID.
- Related test cases.
- Environment URL with the fix deployed.

The Manual subagent re-executes the relevant tests to verify the fix. If all pass, the Automator creates/updates regression tests.

---

## Workflow 4: Technical Debt

**When to use**: A technical debt task (refactoring, dependency update, performance improvement) has been completed.

### Flow

```
User provides description + affected areas
         │
         ▼
    ┌─────────┐
    │Conductor│ — Identifies workflow, presents plan
    └────┬────┘
         │
         ▼
    ┌──────────┐
    │Automator │ — Evaluates coverage, creates/updates tests
    └────┬─────┘
         │
         ▼
User receives code changes + results
```

### Key Difference

**No manual testing phase.** Technical debt tasks involve internal code changes, so the Conductor delegates directly to the Automator, skipping the Manual subagent.

### Steps

1. **User** provides a description of changes and affected functional areas.
2. **Conductor** delegates directly to the **Automator**.
3. **Automator**:
   - Analyzes existing test coverage for affected areas.
   - Creates new tests or updates existing ones.
   - Runs tests and reports results.
4. **User** receives automation summary with code changes.

---

## Summary: Agent Participation per Workflow

| Workflow             | Conductor | Refiner | Generator | Manual | Automator |
| -------------------- | :-------: | :-----: | :-------: | :----: | :-------: |
| New Feature          |     ✅     |    ✅    |     ✅     |   —    |     —     |
| Implementation Ready |     ✅     |    —    |     —     |   ✅    |     ✅     |
| Bug Fix              |     ✅     |    —    |     —     |   ✅    |     ✅     |
| Technical Debt       |     ✅     |    —    |     —     |   —    |     ✅     |
