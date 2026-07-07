---
name: create-jira-issue
description: >-
  Skill for creating a Jira issue (typically a Sub-task) by calling the Atlassian
  REST API v3 directly. Use when an agent needs to persist a generated test
  scenario as a Jira sub-task linked to a parent issue, e.g. the Generator
  subagent creating one sub-task per Gherkin scenario in CI mode.
user-invocable: true
---

# Create Jira Issue

Create a Jira issue by calling the **Atlassian REST API v3** directly. Primary
use case: creating one **Sub-task** per generated test scenario, linked to the
parent issue being processed.

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

## Creating a Sub-task Linked to a Parent Issue

1. **Build the Basic-auth header**:

   ```bash
   AUTH=$(printf '%s' "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64 -w 0)
   ```

2. **Get the parent issue's project key** (needed for `fields.project.key`).
   If not already known, fetch it once with the `get-jira-issue` skill or:

   ```bash
   PARENT_KEY="PROJ-1234"
   PROJECT_KEY=$(echo "$PARENT_KEY" | cut -d- -f1)
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

4. **Build the request body and create the sub-task**:

   ```bash
   SUMMARY="Scenario: Login with valid credentials"   # keep ≤ 255 chars

   BODY=$(jq -n \
     --arg project "$PROJECT_KEY" \
     --arg parent "$PARENT_KEY" \
     --arg summary "$SUMMARY" \
     --argjson description "$DESCRIPTION_ADF" \
     '{fields:{
        project:{key:$project},
        parent:{key:$parent},
        summary:$summary,
        issuetype:{name:"Sub-task"},
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

## Looping Over Multiple Scenarios

To create one sub-task per scenario, iterate the generated Gherkin scenarios
(e.g., split by `Scenario:` / `Scenario Outline:` blocks) and repeat steps 3–5
for each, reusing `PARENT_KEY` and `PROJECT_KEY`:

```bash
for i in "${!SCENARIOS[@]}"; do
  SCENARIO_TEXT="${SCENARIOS[$i]}"
  SUMMARY=$(echo "$SCENARIO_TEXT" | head -n1 | sed 's/^Scenario\(( Outline)\)\?: *//' | cut -c1-255)
  # ... build DESCRIPTION_ADF and BODY as above, then POST ...
done
```

Collect the created issue keys and report the full list (scenario → Jira key)
back to the Conductor/user at the end.

## Error Handling

| HTTP Status | Situation                     | Action                                                                    |
| ----------- | ------------------------------ | -------------------------------------------------------------------------- |
| 201         | Created                        | Extract `.key` from the response body and report it.                      |
| 400         | Invalid fields / bad ADF       | Report: "Failed to create sub-task: invalid request. Check field values." |
| 401 / 403   | Auth failure                   | Report: "Authentication failed. Check JIRA_EMAIL and JIRA_API_TOKEN."     |
| 404         | Parent issue or project not found | Report: "Parent issue [key] not found. Verify the identifier."        |
| 0 / timeout | Network unreachable           | Report: "Cannot reach Jira. Check JIRA_BASE_URL and network connectivity."|

## Behavior by Mode

- **Local (interactive)**: always ask the user for confirmation before
  creating any issue.
- **CI (`--no-ask-user`)**: create sub-tasks automatically, without asking,
  when explicitly instructed to do so by the calling prompt/workflow.

## Example

**Input:** Parent `PROJ-1234`, one generated scenario "Login with valid credentials".

**Result:** A new `Sub-task` `PROJ-1235` created under `PROJ-1234`, with the
Gherkin scenario stored in its description as a code block.
