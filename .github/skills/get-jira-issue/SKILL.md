---
name: get-jira-issue
description: >-
  Skill for retrieving the full content of a Jira issue by calling the Atlassian REST API v3 directly.
  Use when an agent receives a Jira ticket identifier (e.g., PROJ-1234) and needs to fetch
  its summary, description, and acceptance criteria before analysis or test generation.
user-invocable: true
---

# Get Jira Issue

Retrieve the full content of a Jira issue by calling the **Atlassian REST API v3** directly.

## Prerequisites — Environment Variables

The following environment variables must be set before making any API call:

| Variable          | Description                                                               | Example                              |
| ----------------- | ------------------------------------------------------------------------- | ------------------------------------ |
| `JIRA_BASE_URL`   | Base URL of the Jira Cloud instance (no trailing slash)                   | `https://your-org.atlassian.net`     |
| `JIRA_EMAIL`      | Email address of the Jira account used for authentication                 | `qa-bot@your-org.com`                |
| `JIRA_API_TOKEN`  | Atlassian API token (generate at https://id.atlassian.com/manage-profile/security/api-tokens) | `ATATxxxxxxxx` |

Export them from `.env` if they are not set.

## API Endpoint

```
GET {JIRA_BASE_URL}/rest/api/3/issue/{issueIdOrKey}
```

## Authentication

Jira REST API v3 uses **HTTP Basic Auth** with a base64-encoded `email:apiToken` credential:

```
Authorization: Basic base64("{JIRA_EMAIL}:{JIRA_API_TOKEN}")
Accept: application/json
```

## Direct API Call (curl)

This is the primary, self-contained way to retrieve a Jira issue. No external
scripts or helper files are required — only `curl`, `base64`, and `jq` (all
available in a standard shell / CI runner).

1. **Build the Basic-auth header** from `JIRA_EMAIL` and `JIRA_API_TOKEN`:

   ```bash
   AUTH=$(printf '%s' "${JIRA_EMAIL}:${JIRA_API_TOKEN}" | base64 -w 0)
   ```

2. **Call `GET /rest/api/3/issue/{key}`**:

   ```bash
   ISSUE_KEY="PROJ-1234"

   curl -s \
     -H "Authorization: Basic ${AUTH}" \
     -H "Accept: application/json" \
     "${JIRA_BASE_URL}/rest/api/3/issue/${ISSUE_KEY}" > issue.json
   ```

3. **Parse the JSON response with `jq`** to pull out the fields needed for
   refinement/generation:

   ```bash
   jq -r '.fields.summary' issue.json
   jq -r '.fields.issuetype.name' issue.json
   jq -r '.fields.priority.name // "Not set"' issue.json
   jq -r '.fields.status.name' issue.json
   jq -c '.fields.description' issue.json      # ADF — convert to text, see below
   jq -r '.fields.labels | join(", ")' issue.json
   jq -r '.fields.components | map(.name) | join(", ")' issue.json
   ```

4. **Convert the ADF `description` to plain text.** The `description` field is
   an Atlassian Document Format (ADF) tree. Walk its `content` nodes and
   concatenate all `text` leaves (recursively through `paragraph`,
   `bulletList`/`listItem`, `heading`, etc. nodes), preserving line breaks
   between block-level nodes. A minimal `jq` recursive-descent extraction:

   ```bash
   jq -r '[.fields.description | .. | .text? // empty] | join(" ")' issue.json
   ```

   For richer structure (headings, lists) prefer walking `content` explicitly
   node-by-node so headings/lists are preserved on their own lines.

5. **Extract acceptance criteria** — see below.

6. **Emit the Normalized Output Format** (below) so it can be passed directly
   to the Refiner/Generator.

If the response is non-200, apply the Error Handling table below and stop.

## Response Structure

The API returns a JSON object. Key fields for QA purposes:

| Field                          | Description                                               |
| ------------------------------ | --------------------------------------------------------- |
| `key`                          | Issue identifier (e.g., `PROJ-1234`)                      |
| `fields.summary`               | Issue title / one-line description                        |
| `fields.description`           | Full description in Atlassian Document Format (ADF)       |
| `fields.issuetype.name`        | Type: Story, Bug, Task, Sub-task, etc.                    |
| `fields.status.name`           | Current status: To Do, In Progress, Done, etc.            |
| `fields.priority.name`         | Priority: Highest, High, Medium, Low, Lowest              |
| `fields.assignee.displayName`  | Assigned team member                                      |
| `fields.labels`                | Labels attached to the issue                              |
| `fields.components`            | Affected components                                       |
| `fields.customfield_*`         | Custom fields — acceptance criteria are often stored here |

## Extracting Acceptance Criteria

Jira projects may store acceptance criteria in different locations:

1. **Custom field**: Look for `customfield_*` fields with names containing "acceptance", "criteria", or "definition".
2. **Description body**: Parse the ADF description for sections titled "Acceptance Criteria", "AC", or "Definition of Done".
3. **Comments**: Check `fields.comment.comments` if the description is incomplete.

## Normalized Output Format

After fetching, extract and normalize into plain text for downstream agents (Refiner, Generator):

```markdown
## Jira Issue: [key]

**Summary:** [fields.summary]

**Type:** [fields.issuetype.name]
**Priority:** [fields.priority.name]
**Status:** [fields.status.name]

**Description:**
[fields.description — ADF converted to plain text]

**Acceptance Criteria:**
[extracted acceptance criteria — numbered list]

**Labels:** [fields.labels]
**Components:** [fields.components]
```

## Error Handling

| HTTP Status | Situation              | Action                                                                    |
| ----------- | ---------------------- | ------------------------------------------------------------------------- |
| 404         | Issue not found        | Report: "Issue [key] was not found. Verify the identifier."               |
| 401 / 403   | Auth failure           | Report: "Authentication failed. Check JIRA_EMAIL and JIRA_API_TOKEN."     |
| 0 / timeout | Network unreachable    | Report: "Cannot reach Jira. Check JIRA_BASE_URL and network connectivity."|
| 200 (empty) | Description is missing | Proceed with summary only; flag the description gap to the Refiner.       |

## Example

**Input:** `PROJ-1234`

**Normalized output passed to Refiner:**
```markdown
## Jira Issue: PROJ-1234

**Summary:** As a user, I want to reset my password so I can regain account access

**Type:** Story
**Priority:** High
**Status:** In Progress

**Description:**
Users who forget their password must be able to request a reset link via their registered email.

**Acceptance Criteria:**
1. A "Forgot password?" link is visible on the login screen.
2. Entering a valid email sends a reset link within 60 seconds.
3. The reset link expires after 24 hours.
4. Using an expired link shows a clear error message.
5. The new password must meet the current password policy.

**Labels:** authentication, security
**Components:** User Management
```
