---
applyTo: "**"
---

# Workflow Definitions

## Overview

The Hydra QA Framework supports four main workflows, all orchestrated by the Conductor agent. Each workflow follows a defined sequence of subagent invocations with mandatory user checkpoints.

## Workflow 1: New Feature Definition

**Trigger**: User provides a new functional requirement or Jira ticket.

**Goal**: Refine the requirement and generate a test suite.

```
┌──────┐    ┌───────────┐    ┌──────────┐    ┌────-──────-─┐
│ User │───▶│ Conductor │───▶│ Refiner  │───▶│  Conductor  │
└──────┘    └───────────┘    └──────────┘    └───-──┬────-─┘
                                                    │
                                          ┌─────────┴────────┐
                                          │                  │
                                       DoR OK              DoR KO
                                          │                  │
                                    ┌─────▼─────┐      ┌─────▼─────┐
                                    │ Generator │      │   User    │
                                    └─────┬─────┘      │ (review)  │
                                          │            └───────────┘
                                    ┌─────▼─────┐
                                    │   User    │
                                    │ (results) │
                                    └───────────┘
```

**Sequence**:

1. User provides functional description or Jira ID to Conductor.
2. Conductor delegates to Refiner for analysis.
3. Refiner returns DoR verdict.
4. If READY → Conductor delegates to Generator → returns test cases to User.
5. If NOT READY → Conductor returns gap analysis to User.

---

## Workflow 2: Implementation Developed

**Trigger**: User reports that a feature implementation is ready for testing.

**Goal**: Execute manual tests, then automate passing tests.

```
┌──────┐    ┌───────────┐    ┌────────┐    ┌──────-─────┐
│ User │───▶│ Conductor │───▶│ Manual │───▶│ Conductor  │
└──────┘    └───────────┘    └────────┘    └────-─┬─────┘
                                                  │
                                        ┌─────────┴─────────┐
                                        │                   │
                                   All PASS           Some FAIL
                                        │                   │
                                  ┌─────▼──────┐     ┌─────▼─────┐
                                  │ Automator  │     │   User    │
                                  └─────┬──────┘     │ (decide)  │
                                        │            └─────┬─────┘
                                  ┌─────▼─────┐    ┌───────┴──────┐
                                  │   User    │    │              │
                                  │ (results) │  Automate?     Report?
                                  └───────────┘    │              │
                                             ┌─────▼──────┐  ┌────▼───┐
                                             │ Automator  │  │ Manual │
                                             └────────────┘  │(defect)│
                                                             └────────┘
```

**Sequence**:

1. User requests test execution to Conductor.
2. Conductor delegates to Manual subagent.
3. Manual executes tests and returns results.
4. If all PASS → Conductor delegates to Automator → returns code + results.
5. If any FAIL → Conductor asks User: report defect? automate passing tests?
6. Conductor executes chosen path(s).

---

## Workflow 3: Bug Fix

**Same flow as Workflow 2** (Implementation Developed).

The user provides the defect context, and the Manual subagent re-executes the relevant regression tests to verify the fix.

---

## Workflow 4: Technical Debt

**Trigger**: User reports a technical debt task is complete.

**Goal**: Automate tests directly (no manual testing needed).

```
┌──────┐    ┌───────────┐    ┌───────────┐    ┌──────┐
│ User │───▶│ Conductor │───▶│ Automator │───▶│ User │
└──────┘    └───────────┘    └───────────┘    └──────┘
```

**Sequence**:

1. User requests automation to Conductor.
2. Conductor delegates directly to Automator (skips Manual subagent).
3. Automator returns code changes + results.

---

## Mandatory Pause Points

These are moments where the Conductor **must stop and wait** for user input:

| Workflow            | Pause Point                                              |
| ------------------- | -------------------------------------------------------- |
| New Feature         | After Refiner returns NOT READY                          |
| New Feature         | After Generator presents test cases                      |
| Implementation      | After Manual reports failures (decide on defect/automate)|
| All                 | Before starting any workflow (confirm plan)              |
