# Agent System

## Overview

The Hydra QA Framework uses an orchestrated system of AI agents to manage the full QA lifecycle. The system follows a **hub-and-spoke model** where a central orchestrator (Conductor) coordinates specialized subagents.

## Agent Architecture

```
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Conductor   │ (Orchestrator)
                    │  agent.md    │
                    └──┬──┬──┬──┬──┘
                       │  │  │  │
           ┌───────────┘  │  │  └─────────-─┐
           │              │  │              │
    ┌──────▼──────┐ ┌────-▼──▼────┐ ┌───────▼───────┐
    │   Refiner   │ │ Generator   │ │    Manual     │
    │  subagent   │ │  subagent   │ │   subagent    │
    └─────────────┘ └───────────-─┘ └───────────────┘
                                          │
                                   ┌──────▼───────┐
                                   │  Automator   │
                                   │   subagent   │
                                   └──────────────┘
```

## Agents

### Conductor (Orchestrator)

**File**: `.github/agents/conductor.agent.md`  
**Model**: Claude Sonnet 4.6

The Conductor is the **only agent that interacts directly with the user**. It serves as the central orchestrator that:

- Receives user requests and identifies the appropriate workflow.
- Generates an execution plan and presents it for confirmation.
- Delegates tasks to the appropriate subagents in sequence.
- Manages mandatory pause points where user input is required.
- Summarizes subagent outputs before presenting results.

**Key responsibilities:**
- Workflow identification and routing.
- Plan generation and presentation.
- Subagent coordination and sequencing.
- User interaction management.
- Error escalation.

---

### Refiner (Subagent)

**File**: `.github/agents/refiner-subagent.agent.md`  
**Model**: Claude Sonnet 4.6

The Refiner performs **functional analysis** on task descriptions to determine if they meet the Definition of Ready (DoR).

**Input**: Functional description or Jira ticket ID.  
**Output**: DoR verdict (READY/NOT READY) with validated acceptance criteria or gap analysis.

**Key responsibilities:**
- Functional area detection and context loading.
- Completeness analysis of descriptions and acceptance criteria.
- Corner case identification (boundary, negative, concurrency, state).
- DoR verdict with actionable output.

---

### Generator (Subagent)

**File**: `.github/agents/generator-subagent.agent.md`  
**Model**: Claude Sonnet 4.6

The Generator creates **comprehensive test suites** from validated acceptance criteria.

**Input**: Validated acceptance criteria + corner cases from the Refiner.  
**Output**: Structured test suite optimized for manual execution.

**Key responsibilities:**
- Test case generation (positive, negative, boundary, edge).
- Test suite optimization for execution flow.
- Coverage validation (every AC and corner case covered).
- Optional creation in external test management tools.

---

### Manual Tester (Subagent)

**File**: `.github/agents/manual-subagent.agent.md`  
**Model**: Claude Sonnet 4.6

The Manual Tester **executes test cases through browser interaction** and collects evidence.

**Input**: Test cases + environment information.  
**Output**: Execution report with evidence (URLs, elements, results).

**Key responsibilities:**
- Step-by-step test execution in a real browser.
- Evidence collection at every interaction point.
- PASS/FAIL determination per test case.
- Defect report creation (on user request).

**Note**: This agent uses Playwright MCP browser tools for real browser interaction.

---

### Automator (Subagent)

**File**: `.github/agents/automation-subagent.agent.md`  
**Model**: Claude Sonnet 4.6

The Automator **converts manual test cases into automated E2E tests** using the framework's tech stack.

**Input**: Test cases + execution evidence from Manual Tester.  
**Output**: Code changes (feature files, steps, page objects) + execution results.

**Key responsibilities:**
- Existing coverage analysis before writing code.
- Page object creation/extension following POM pattern.
- Feature file creation in Gherkin syntax.
- Step definition implementation.
- Fixture registration.
- Test execution and validation.

**Note**: This agent directly modifies the codebase in the `e2e/` directory.

## Agent Communication

Agents communicate **exclusively through the Conductor**. Subagents never interact with each other directly.

```
Subagent A → Conductor → Subagent B
```

The Conductor passes relevant context between subagents:
- Refiner → *acceptance criteria* → Generator
- Generator → *test cases* → Manual
- Manual → *execution evidence* → Automator

## Configuration

All agent definitions are in `.github/agents/`. Each agent file contains:

- **YAML frontmatter**: Model, tools, and metadata.
- **Role description**: What the agent does.
- **Process definition**: Step-by-step execution flow.
- **Output format**: Expected output structure.
- **Rules**: Behavioral constraints.

Instructions that agents reference are in `.github/instructions/`.
