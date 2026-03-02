---
description: "Skill: Run a framework health check across the test suite"
---

# 🏥 Health Check

## Purpose
Audit the test automation codebase for common issues, anti-patterns, and improvement opportunities.

## Inputs
- **Scope**: `${{SCOPE}}` — `all` | `web` | `mobile` (default: all)

## Steps

1. **Scan** the codebase for anti-patterns:

   ### Code Quality Checks
   - [ ] No `sleep()` / `pause()` calls
   - [ ] No hardcoded URLs, credentials, or test data
   - [ ] No raw Playwright/WebdriverIO calls in step definitions
   - [ ] All page objects extend `BasePage`
   - [ ] All screen objects extend `BaseScreen`
   - [ ] All screen objects implement `waitForScreenLoaded()`
   - [ ] Proper TypeScript types (no `any`)

   ### Selector Quality Checks
   - [ ] Web: `getByTestId` used as primary strategy
   - [ ] Mobile: `byAccessibilityId` used as primary strategy
   - [ ] No fragile XPath selectors
   - [ ] No index-based selectors

   ### Traceability Checks
   - [ ] All feature files have `@JIRA-XXX` tags
   - [ ] All skipped tests have a linked Jira ticket comment
   - [ ] Feature files have domain tags (`@web`, `@mobile`)

   ### Structure Checks
   - [ ] No orphan step definitions (steps not used by any feature)
   - [ ] No duplicate step definitions
   - [ ] No empty page/screen object files
   - [ ] Test data uses factories, not inline values

2. **Score** each category: ✅ Pass | ⚠️ Warning | ❌ Fail

3. **Report** findings with specific file/line references

4. **Recommend** prioritized improvements

## Output

```markdown
## 🏥 HydraQA Health Check Report

**Date**: <timestamp>
**Scope**: <web | mobile | all>

### Summary
| Category | Status | Issues |
|----------|--------|--------|
| Code Quality | ✅/⚠️/❌ | <count> |
| Selectors | ✅/⚠️/❌ | <count> |
| Traceability | ✅/⚠️/❌ | <count> |
| Structure | ✅/⚠️/❌ | <count> |

### Details
<per-issue details with file paths and recommendations>

### Priority Actions
1. <highest impact fix>
2. <next fix>
3. <next fix>
```

