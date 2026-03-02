---
description: "Prompt to analyze and fix a flaky test"
---

# Analyze Flaky Test

## Input
- **Test Identifier**: `${{TEST_ID}}` (scenario name, file path, or Jira tag)
- **Domain**: `${{DOMAIN}}` (web | mobile)
- **Failure Evidence**: `${{FAILURE_LOG}}` (CI log, error message, screenshot)

## Task
Investigate the root cause of a flaky test and implement a fix.

## Analysis Framework

### Step 1: Gather Evidence
- Read the test code (feature file + step definitions + page/screen objects)
- Analyze the failure message and stack trace
- Check if the failure is consistent or intermittent
- Review CI history for the test (pass/fail pattern)

### Step 2: Classify the Root Cause

| Root Cause | Indicators | Fix |
|-----------|------------|-----|
| **Timing** | "element not found", works locally | Add explicit wait before interaction |
| **Stale Selector** | Fails after app deploy | Update selector to stable attribute |
| **Race Condition** | Intermittent, no pattern | Wait for network idle / animation end |
| **Test Data** | Fails with "already exists" | Use unique generated data |
| **Session** | "session not created" (mobile) | Add session health check + retry |
| **Environment** | Fails only in CI | Check env config, headless mode, viewport |
| **App Bug** | Consistent failure | Report as bug, skip test with Jira link |

### Step 3: Implement Fix
- Apply the appropriate fix based on classification
- Add comments explaining the fix rationale
- Ensure the fix doesn't mask real bugs

### Step 4: Validate
- Run the test 5 times locally
- Confirm it passes consistently
- Tag with `@formerly-flaky` if relevant

## Output
1. Root cause analysis (classification + explanation)
2. Code changes made
3. Validation results
4. Preventive recommendation for the team

