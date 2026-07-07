---
name: create-jira-issue
description: >-
  Skill for creating a Jira issue (Sub-task, Story, or other issue type) by
  calling the Atlassian REST API v3 directly, linked to a parent/epic issue.
  Use when an agent needs to persist a generated test scenario as a Jira
  sub-task linked to a parent issue (e.g. the Generator subagent creating one
  sub-task per Gherkin scenario in CI mode), or a generated User Story as a
  Jira Story linked to its source Epic (e.g. the Story Writer subagent).
user-invocable: true
---

# Create Jira Issue

Create a Jira issue by calling the **Atlassian REST API v3** directly. This
skill supports any `issuetype` (e.g. `Sub-task`, `Story`), always linked to a
parent issue via `fields.parent`:

- **Sub-task per test scenario**, linked to the parent issue being processed
  (primary/original use case, e.g. the Generator subagent).
- **Story per generated User Story**, linked to its source Epic (team-managed
  project → `fields.parent.key = <Epic key>`, e.g. the Story Writer subagent).

The `fields.parent` mechanism is the same regardless of `issuetype` — only
the `issuetype.name` value and the semantics of "parent" (literal parent for
Sub-tasks, Epic for Stories in a team-managed project) change.

## Prerequisites — Environment Variables

Same as `get-jira-issue`:

| Variable          | Description                                                               | Example                              |
| ----------------- | ------------------------------------------------------------------------- | ------------------------------------- |
| `JIRA_BASE_URL`   | Base URL of the Jira Cloud instance (no trailing slash)                   | `https://your-org.atlassian.net`     |
| `JIRA_EMAIL`      | Email address of the Jira account used for authentication                 | `qa-bot@your-org.com`                |
| `JIRA_API_TOKEN`  | Atlassian API token (generate at https://id.atlassian.com/manage-profile/security/api-tokens) | `ATATxxxxxxxx` |

Export them from `.env` if they are not set.

## API Endpoint

```
POST {JIRA_BASE_URL}/rest/api/3/issue
```

## Authentication

Same Basic Auth scheme as `get-jira-issue`:

```
Authorization: Basic base64("{JIRA_EMAIL}:{JIRA_API_TOKEN}")
Content-Type: application/json
```

## Parameters

| Parameter    | Description                                                          | Default     | Examples              |
| ------------ | --------------------------------------------------------------------- | ----------- | ---------------------- |
| `issuetype`  | The `fields.issuetype.name` value to create.                          | `Sub-task`  | `Sub-task`, `Story`   |
| `PARENT_KEY` | The Jira key this new issue links to via `fields.parent.key`.         | —           | Parent issue (Sub-task) or Epic key (Story) |

Both use cases share the exact same request shape — only `issuetype` and the
semantics of `PARENT_KEY` differ.

## Creating an Issue Linked to a Parent/Epic

1. **Build the Basic-auth header**:

   ```bash
   AUTH=$(printf '%s' "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64 -w 0)
   ```

2. **Get the parent/epic issue's project key** (needed for
   `fields.project.key`). If not already known, fetch it once with the
   `get-jira-issue` skill or:

   ```bash
   PARENT_KEY="PROJ-1234"          # Sub-task parent, or Epic key for a Story
   PROJECT_KEY=$(echo "$PARENT_KEY" | cut -d- -f1)
   ISSUE_TYPE="Sub-task"           # or "Story" when linking a User Story to its Epic
   ```

3. **Build the ADF description** from the Gherkin scenario text. Wrap the raw
   Gherkin in a `codeBlock` node so formatting is preserved:

   ```bash
   SCENARIO_TEXT='Scenario: Login with valid credentials
     Given the user is on the login page
     When the user submits valid credentials
     Then the user is redirected to the dashboard'

   DESCRIPTION_ADF=$(jq -n --arg text "$SCENARIO_TEXT" \
     '{version:1,type:"doc",content:[
       {type:"codeBlock",attrs:{language:"gherkin"},content:[{type:"text",text:$text}]}
     ]}')
   ```

4. **Build the request body and create the issue**:

   ```bash
   SUMMARY="Scenario: Login with valid credentials"   # keep ≤ 255 chars

   BODY=$(jq -n \
     --arg project "$PROJECT_KEY" \
     --arg parent "$PARENT_KEY" \
     --arg summary "$SUMMARY" \
     --arg issuetype "$ISSUE_TYPE" \
     --argjson description "$DESCRIPTION_ADF" \
     '{fields:{
        project:{key:$project},
        parent:{key:$parent},
        summary:$summary,
        issuetype:{name:$issuetype},
        description:$description
     }}')

   curl -s -w "\n%{http_code}" \
     -X POST \
     -H "Authorization: Basic ${AUTH}" \
     -H "Content-Type: application/json" \
     -d "$BODY" \
     "${JIRA_BASE_URL}/rest/api/3/issue" > create-issue-response.txt
   ```

5. **Check the result** — the last line of `create-issue-response.txt` is the
   HTTP status code; the rest is the JSON body. On success (201) the body
   contains `.key` (e.g. `PROJ-1235`) — report it to the user/CI log. On
   failure, apply the Error Handling table below.

## Looping Over Multiple Scenarios (Sub-task use case)

To create one sub-task per scenario, iterate the generated Gherkin scenarios
(e.g., split by `Scenario:` / `Scenario Outline:` blocks) and repeat steps 3–5
for each, reusing `PARENT_KEY`, `PROJECT_KEY`, and `ISSUE_TYPE="Sub-task"`:

```bash
for i in "${!SCENARIOS[@]}"; do
  SCENARIO_TEXT="${SCENARIOS[$i]}"
  SUMMARY=$(echo "$SCENARIO_TEXT" | head -n1 | sed 's/^Scenario\(( Outline)\)\?: *//' | cut -c1-255)
  # ... build DESCRIPTION_ADF and BODY as above (ISSUE_TYPE="Sub-task"), then POST ...
done
```

Collect the created issue keys and report the full list (scenario → Jira key)
back to the Conductor/user at the end.

## Looping Over Multiple User Stories (Story-under-Epic use case)

To create one Story per generated User Story, linked to the source Epic,
iterate the generated stories and repeat steps 3–5 for each, reusing
`PARENT_KEY` (the Epic key), `PROJECT_KEY`, and `ISSUE_TYPE="Story"`:

```bash
PARENT_KEY="PROJ-1000"        # Epic key
PROJECT_KEY=$(echo "$PARENT_KEY" | cut -d- -f1)
ISSUE_TYPE="Story"

for i in "${!USER_STORIES[@]}"; do
  STORY_TEXT="${USER_STORIES[$i]}"       # "As a ... I want ... so that ..." + AC list
  SUMMARY=$(echo "$STORY_TEXT" | head -n1 | cut -c1-255)

  DESCRIPTION_ADF=$(jq -n --arg text "$STORY_TEXT" \
    '{version:1,type:"doc",content:[
       {type:"paragraph",content:[{type:"text",text:$text}]}
     ]}')

  BODY=$(jq -n \
    --arg project "$PROJECT_KEY" \
    --arg parent "$PARENT_KEY" \
    --arg summary "$SUMMARY" \
    --arg issuetype "$ISSUE_TYPE" \
    --argjson description "$DESCRIPTION_ADF" \
    '{fields:{
       project:{key:$project},
       parent:{key:$parent},
       summary:$summary,
       issuetype:{name:$issuetype},
       description:$description
    }}')

  curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Authorization: Basic ${AUTH}" \
    -H "Content-Type: application/json" \
    -d "$BODY" \
    "${JIRA_BASE_URL}/rest/api/3/issue" > create-issue-response.txt
  # ... check status per Error Handling below, extract .key ...
done
```

Collect the created issue keys and report the full mapping (User Story →
Jira key) back to the Conductor/user at the end.

## Error Handling

| HTTP Status | Situation                     | Action                                                                    |
| ----------- | ------------------------------ | -------------------------------------------------------------------------- |
| 201         | Created                        | Extract `.key` from the response body and report it.                      |
| 400         | Invalid fields / bad ADF       | Report: "Failed to create issue: invalid request. Check field values." |
| 401 / 403   | Auth failure                   | Report: "Authentication failed. Check JIRA_EMAIL and JIRA_API_TOKEN."     |
| 404         | Parent/Epic issue or project not found | Report: "Parent/Epic issue [key] not found. Verify the identifier."        |
| 0 / timeout | Network unreachable           | Report: "Cannot reach Jira. Check JIRA_BASE_URL and network connectivity."|

## Behavior by Mode

- **Local (interactive)**: always ask the user for confirmation before
  creating any issue.
- **CI (`--no-ask-user`)**: create issues automatically, without asking,
  when explicitly instructed to do so by the calling prompt/workflow.

## Examples

**Sub-task under parent issue:** Parent `PROJ-1234`, one generated scenario
"Login with valid credentials".

**Result:** A new `Sub-task` `PROJ-1235` created under `PROJ-1234`, with the
Gherkin scenario stored in its description as a code block.

**Story under Epic:** Epic `PROJ-1000`, one generated User Story "As a
registered user, I want to reset my password, so that I can regain access to
my account".

**Result:** A new `Story` `PROJ-1050` created with `fields.parent.key =
PROJ-1000`, with the story statement and acceptance criteria stored in its
description.
