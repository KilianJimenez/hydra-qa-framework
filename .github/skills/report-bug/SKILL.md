---
description: "Skill: Create a Jira bug ticket from a testing finding"
---

# 🐛 Report Bug

## Purpose
Create a structured Jira bug ticket from a defect discovered during manual or automated testing.

## Inputs
- **Summary**: `${{BUG_SUMMARY}}` — One-line description of the defect
- **Project Key**: `${{PROJECT_KEY}}` — Jira project key (e.g., `PROJ`)
- **Severity**: `${{SEVERITY}}` — Critical | High | Medium | Low
- **Platform**: `${{PLATFORM}}` — web | android | ios
- **Steps to Reproduce**: `${{STEPS}}` — Ordered list of steps
- **Expected Result**: `${{EXPECTED}}` — What should happen
- **Actual Result**: `${{ACTUAL}}` — What actually happens
- **Evidence**: `${{EVIDENCE}}` — Screenshots, logs, trace files (optional)

## Steps

1. **Validate** that all required inputs are provided

2. **Format** the bug description in Markdown:
   ```markdown
   ## Steps to Reproduce
   1. <step 1>
   2. <step 2>
   3. <step 3>

   ## Expected Result
   <what should happen>

   ## Actual Result
   <what actually happens>

   ## Environment
   - Platform: <web/android/ios>
   - Browser/Device: <details>
   - Environment: <staging/production>

   ## Evidence
   <screenshot references or descriptions>

   ## Additional Context
   <any extra info>
   ```

3. **Create** the Jira ticket:
   - Issue Type: `Bug`
   - Priority: Map severity to Jira priority (Critical→Highest, High→High, Medium→Medium, Low→Low)
   - Labels: `bug`, `${{PLATFORM}}`, `qa-found`
   - Add the formatted description

4. **Return** the created ticket ID and URL

## Output
- Jira ticket ID (e.g., `PROJ-456`)
- Confirmation message with ticket link

## Validation
- Ticket exists in Jira with correct type, priority, and description
- Description follows the structured format
- Labels are applied correctly

