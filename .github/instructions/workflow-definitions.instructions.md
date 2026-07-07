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
                                  │ Conductor │    │              │
                                  └─────┬─────┘  Automate?     Report?
                                        │          │              │
                                  ┌─────▼─────┐ ┌──▼────────┐ ┌──▼────────┐
                                  │   User    │ │ Conductor │ │ Conductor │
                                  │ (results) │ └──┬────────┘ └──┬────────┘
                                  └───────────┘    │             │
                                             ┌─────▼──────┐  ┌───▼────┐
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

## Workflow 5: Epic Breakdown / Create User Stories

**Trigger**: A Jira **Epic** needs to be decomposed into User Stories,
typically triggered from Jira Automation with `ACTION_TO_PERFORM=create-us`.

**Goal**: Decompose the Epic's description into vertically-sliced,
INVEST-aligned User Stories and create them in Jira as child issues of the
Epic. This workflow **skips the Refiner and Generator subagents** — it goes
straight from the Epic description to generated User Stories (no DoR
validation, no test case generation).

```
┌──────┐    ┌───────────┐    ┌──────────────┐    ┌──────┐
│ User │───▶│ Conductor │───▶│ Story Writer │───▶│ User │
└──────┘    └───────────┘    └──────────────┘    └──────┘
```

**Sequence**:

1. User (or Jira Automation trigger) provides the Epic Jira key to Conductor.
2. Conductor delegates to the **Story Writer** subagent with the Epic key.
3. Story Writer fetches the Epic (`get-jira-issue`), decomposes its
   description into vertically-sliced User Stories, and:
   - **Local**: presents the stories and asks for confirmation before
     persisting.
   - **CI**: creates one Jira **Story** per User Story automatically, linked
     to the Epic via `fields.parent.key` (`create-jira-issue`).
4. Conductor returns the generated User Stories (and, in CI, the created
   Jira keys) to the user.

---

## Mandatory Pause Points

These are moments where the Conductor **must stop and wait** for user input:

| Workflow            | Pause Point                                              |
| ------------------- | -------------------------------------------------------- |
| New Feature         | After Refiner returns NOT READY                          |
| New Feature         | After Generator presents test cases                      |
| Implementation      | After Manual reports failures (decide on defect/automate)|
| Epic Breakdown      | After Story Writer presents User Stories (Local only)    |
| All                 | Before starting any workflow (confirm plan)              |

---

## CI Integration (GitHub Actions)

Workflows 1 and 2 can also be triggered from CI via GitHub Actions using GitHub Models API.

### How It Works

- The workflows are exposed as `workflow_dispatch` triggers in `.github/workflows/`.
- They use the **GitHub Models** inference endpoint (`https://models.github.ai/inference`) with your GitHub Copilot subscription token.
- The CI runner calls the same Refiner/Generator/Automator prompts used locally, but in a non-interactive mode.

### Available CI Workflows

| Workflow                | File                                          | Trigger           |
| ----------------------- | --------------------------------------------- | ----------------- |
| New Feature Definition  | `.github/workflows/new-feature-definition.yml`| `workflow_dispatch` |
| Implementation Developed| `.github/workflows/implementation-developed.yml`| `workflow_dispatch` |

### `ACTION_TO_PERFORM` → Prompt Mapping

`.github/workflows/jira-webhook-trigger.yml` forwards `ACTION_TO_PERFORM`
(and `ISSUE_KEY`) to `ci/select-prompt.sh`, which selects the Copilot CLI
prompt to invoke, and to `ci/disable-not-needed-skills.sh`, which disables
skills irrelevant to that action:

| `ACTION_TO_PERFORM` | Prompt                          | Workflow                              |
| -------------------- | -------------------------------- | -------------------------------------- |
| `refine`             | `/new-feature`                   | New Feature Definition                |
| `manual-test`        | `/implementation-ready`          | Implementation Developed              |
| `create-us`          | `/create-user-stories`           | Epic Breakdown / Create User Stories  |

### CI vs Local Differences

| Aspect             | Local (Chat)                        | CI (GitHub Actions)                     |
| ------------------ | ----------------------------------- | --------------------------------------- |
| Manual testing     | Interactive browser via MCP         | Skipped (no browser available)          |
| User pauses        | Conductor pauses for confirmation   | Runs end-to-end without pauses          |
| Defect reporting   | Interactive decision                | Not available in CI mode                |
| Output             | Chat conversation                   | Job summary + artifact (JSON)           |

### Execution Context Signal

The Conductor must never guess whether it is running in CI or locally.
Instead:

- CI workflows that invoke the Conductor directly (currently
  `.github/workflows/jira-webhook-trigger.yml`, which runs
  `copilot --agent conductor --no-ask-user`) rely on the standard `CI`
  environment variable, which GitHub Actions sets to `"true"` automatically
  on every runner (declared explicitly in the workflow's `env:` block for
  clarity).
- At the start of any workflow, the Conductor checks `$CI` to determine its
  **Execution Context** (`CI` or `Local`) and explicitly forwards this value
  to every subagent it delegates to (Refiner, Generator, Manual, Automator)
  as part of the delegation payload.
- Subagents rely solely on this explicit `Execution Context` field from the
  Conductor — they must never infer CI mode from other cues (flags, tool
  availability, prompt wording, etc.). See each subagent's `.agent.md` file
  for how this signal affects its behavior (e.g. the Generator uses it to
  decide whether to create Jira sub-tasks without asking for confirmation).

### Prerequisites

- A GitHub account with **GitHub Copilot** subscription (provides Models API access).
- The repository's `GITHUB_TOKEN` must have `models:read` permission.
- No additional secrets needed — the built-in token works.

### Running from CLI

You can also trigger these workflows locally via the GitHub CLI:

```bash
# New Feature Definition
gh workflow run "QA: New Feature Definition" \
  -f description="As a user, I want to reset my password so that I can regain access to my account..."

# Implementation Developed
gh workflow run "QA: Implementation Developed" \
  -f test-cases="TC-001: Verify password reset email is sent..." \
  -f environment-url="https://staging.myapp.com" \
  -f setup-instructions="Use test account: user@test.com / pass123"
```
