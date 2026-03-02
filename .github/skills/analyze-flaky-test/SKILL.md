---
description: "Skill: Investigate and fix a flaky test"
---

# 🔍 Analyze Flaky Test

## Purpose
Systematically investigate the root cause of a flaky test and implement a targeted fix.

## Inputs
- **Test ID**: `${{TEST_ID}}` — Scenario name, file path, or Jira tag
- **Domain**: `${{DOMAIN}}` — web | mobile
- **Failure Log**: `${{FAILURE_LOG}}` — Error message, stack trace, or CI log snippet

## Steps

1. **Locate** the test:
   - Find the `.feature` file scenario
   - Find the step definitions
   - Find the page/screen objects used

2. **Analyze** the failure:
   - Parse the error message and stack trace
   - Identify the failing step
   - Identify the failing line in the page/screen object

3. **Classify** the root cause using the flaky test matrix:

   | Pattern | Root Cause | Fix |
   |---------|-----------|-----|
   | "Element not found" / timeout | Missing or insufficient wait | Add `waitForDisplayed()` or `waitFor()` |
   | Works locally, fails in CI | Environment diff (headless, timing) | Increase timeout, add `waitForLoadState` |
   | Fails on first run, passes on retry | Initialization race | Add screen/page load wait |
   | "Stale element" | DOM changed during interaction | Re-query locator, add stability wait |
   | Data conflict | Shared test data | Use unique generated data |
   | Session error (mobile) | Appium session issue | Add session health check |

4. **Fix** the root cause:
   - Apply the appropriate fix from the matrix
   - Add a comment explaining the fix
   - Do NOT add arbitrary `sleep()` calls

5. **Validate**:
   - Check for TypeScript errors after the fix
   - Recommend running the test 5 times to confirm stability

## Output
- Root cause classification
- Code changes with explanations
- Recommendation for preventing similar issues

## Anti-Patterns to Avoid
- ❌ Adding `sleep()` / `pause()` as a fix
- ❌ Increasing timeout without understanding why
- ❌ Catching and swallowing errors
- ❌ Skipping the test without a Jira ticket

