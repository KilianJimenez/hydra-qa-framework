---
description: "Prompt to generate Gherkin test scenarios from a Jira user story"
---

# Generate Test Scenarios from Jira Story

## Input
- **Jira Ticket**: `${{JIRA_TICKET_ID}}`

## Task
Analyze the Jira user story and generate comprehensive Gherkin test scenarios.

## Steps

1. Fetch the Jira ticket `${{JIRA_TICKET_ID}}` and extract:
   - Summary
   - Description
   - Acceptance Criteria
   - Linked issues / dependencies
   - Component / labels

2. For each acceptance criterion, generate at least:
   - 1 Happy Path scenario
   - 1 Negative scenario
   - 1 Boundary/Edge case (if applicable)

3. Output a complete `.feature` file following this structure:
   ```gherkin
   @${{JIRA_TICKET_ID}} @<domain> @<component>
   Feature: <Story summary>
     As a <role>
     I want to <action>
     So that <benefit>

     <scenarios...>
   ```

4. Save the file to `/features/<module>/<feature-name>.feature`

5. Provide a summary table:
   | Scenario | Type | AC Coverage |
   |----------|------|-------------|
   | ... | Happy Path | AC-1 |
   | ... | Negative | AC-1 |

6. Flag any gaps or ambiguities in the acceptance criteria

