---
description: "Workflow for breaking down a Jira Epic into User Stories via vertical slicing"
mode: agent
agent: conductor
---

# Epic Breakdown / Create User Stories

Start the **Epic Breakdown / Create User Stories** workflow.

## Context

The user (or an automated Jira Automation trigger) has a Jira **Epic** whose
description needs to be decomposed into **User Stories**, created in Jira as
child issues of the Epic. This workflow goes straight from the Epic
description to generated User Stories — the Refiner and Generator subagents
are **not** involved (no DoR validation, no test case generation).

## Input Required

- A Jira **Epic** identifier (e.g., `PROJ-1234`).

## Workflow

1. The Conductor delegates to the **Story Writer** subagent with the Epic key.
2. The **Story Writer** fetches the Epic (via `get-jira-issue`) and decomposes
   its description into cohesive User Stories using **vertical slicing** —
   each story is a thin, end-to-end slice cutting through all layers (UI →
   API/business logic → data) that delivers independently demonstrable,
   testable value. Horizontal/technical-layer stories (e.g. "build the DB
   schema", "create the API only") are explicitly avoided.
3. Each User Story is INVEST-aligned and follows the standard format:
   `As a <role>, I want <goal>, so that <benefit>` plus a short
   acceptance-criteria list.
4. The generated stories are presented for review (Local) or persisted
   directly (CI, see below).

## CI Mode

When run non-interactively in CI (e.g. via the `jira-webhook-trigger.yml`
workflow, `Execution Context: CI`), instruct the **Story Writer** subagent as
follows — this is the explicit instruction its persistence step requires, not
merely a description of it:

> **Execution Context: CI.** Fetch the Epic `$ISSUE_KEY` using the
> `get-jira-issue` skill, decompose its description into vertically-sliced
> User Stories, and create one Jira **Story** per generated User Story using
> the `create-jira-issue` skill, with `fields.parent.key` set to `$ISSUE_KEY`,
> without asking for confirmation. Do **not** create or modify any repository
> files (no `.feature` files, no other files) and do **not** run any `git`
> command (no `git add`, `git commit`, `git push`). The only allowed
> persistence mechanism is the `create-jira-issue` skill. Report the mapping
> of User Story → created Jira issue key back to the Conductor.

Locally (`Execution Context: Local`), the Story Writer always asks the user
first before persisting anything.

## Expected Output

- A set of vertically-sliced, INVEST-aligned User Stories derived from the
  Epic description.
- (CI) Each User Story created as a Jira **Story** linked to the source Epic,
  with the mapping of User Story → Jira key reported back.

---

**Provide the Epic Jira key below:**
