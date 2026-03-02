---
description: "Skill: Generate Gherkin test scenarios from a Jira user story"
---

# 📝 Generate Test Scenarios

## Purpose
Analyze a Jira user story and generate comprehensive, well-structured Gherkin test scenarios covering happy paths, negative cases, boundary conditions, and edge cases.

## Inputs
- **Jira Ticket ID**: `${{JIRA_TICKET_ID}}` — The Jira issue key (e.g., `PROJ-123`)
- **Cloud ID**: `${{CLOUD_ID}}` — Atlassian Cloud ID for API access

## Steps

1. **Fetch** the Jira ticket using Atlassian MCP:
   - Read summary, description, acceptance criteria
   - Check linked issues and dependencies
   - Note components, labels, and epic

2. **Extract** acceptance criteria:
   - Parse numbered AC items from the description
   - If no formal AC exists, derive them from the description
   - List them explicitly for traceability

3. **Determine** platform scope:
   - Check labels/components for platform hints
   - Default to `@web @mobile` if unclear
   - Ask for clarification if truly ambiguous

4. **Generate** scenarios for each AC:

   | AC | Happy Path | Negative | Boundary | Edge Case |
   |----|-----------|----------|----------|-----------|
   | AC-1 | ✅ | ✅ | ✅ (if applicable) | ✅ (if applicable) |
   | AC-2 | ✅ | ✅ | ✅ (if applicable) | ✅ (if applicable) |

5. **Write** the feature file:
   - Save to `/features/<module>/<feature-name>.feature`
   - Follow the tagging convention
   - Use `Background` for shared preconditions
   - Use `Scenario Outline` + `Examples` for data-driven tests
   - Include user story context in the `Feature` description

6. **Produce** a summary:
   - Total scenarios generated
   - Coverage matrix (AC × scenario type)
   - Any gaps or ambiguities flagged
   - Recommendations for additional testing

## Output
- Feature file at `/features/<module>/<feature-name>.feature`
- Coverage summary table
- List of flagged ambiguities (if any)

## Validation
- Every AC has at least one happy path and one negative scenario
- Feature file parses without Gherkin syntax errors
- All tags follow the convention: `@JIRA-XXX @<domain> @<component>`
- Steps are reusable and declarative (not imperative)

