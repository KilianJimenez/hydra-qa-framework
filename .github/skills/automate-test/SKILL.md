---
name: automate-test
description: >
  Automate a new test scenario end-to-end. Use when asked to automate,
  implement, create, or write an E2E test, Playwright test, BDD scenario,
  or automated test case. Also use when given test cases to convert into
  automation code.
license: MIT
---

## When to Use

- User asks to **automate a test case** or set of test cases.
- User provides **manual test results** and wants them converted to E2E tests.
- User asks to **create a new feature file** with step definitions and page objects.
- The Conductor delegates test cases to the Automator subagent.

---

## Step 1 — Understand the Test Scope

| Input type | Action |
|---|---|
| Test case list | Parse test IDs, titles, steps, and expected results. |
| Manual evidence | Extract URLs, selectors, interactions, and test data from execution evidence. |
| Feature description | Identify the functional area and required pages/components. |

Determine:

- **Functional area** (e.g., `auth`, `loyalty`, `checkout`).
- **Pages involved** (which URLs and views are navigated).
- **User interactions** (clicks, fills, navigations).
- **Assertions** (what to verify).

---

## Step 2 — Load Business Context

1. Check `.github/instructions/business/` for a context file matching the functional area.
2. If found, read and apply its rules (countries, environments, test data conventions).

---

## Step 3 — Coverage Analysis

Before writing any code, search the existing codebase:

| Check | Location |
|---|---|
| Existing features | `e2e/features/**/*.feature` |
| Existing steps | `e2e/steps/**/*.ts` |
| Existing pages | `e2e/pages/**/*.ts` |
| Existing fixtures | `e2e/fixtures/fixtures.ts` |

Report findings:

```
### Coverage Analysis
- **Fully covered**: [TCs already automated]
- **Partially covered**: [TCs with some reusable steps/pages]
- **New**: [TCs requiring new automation]
```

Skip automation for fully covered TCs.

---

## Step 4 — Implement Page Objects

For each page involved in the test:

1. Check if a page object exists in `e2e/pages/`.
2. If it exists → extend with new selectors/methods as needed.
3. If it does not exist → create a new page object.

**Rules:**

| Rule | Detail |
|---|---|
| Extend `BasePage` | Import from `e2e/pages/base.page.ts` |
| Selectors | `private readonly`, semantic locators |
| Actions | Return `Promise<void>`, verb-named |
| Assertions | Prefix with `expect`, use Playwright `expect()` |
| Getters | Prefix with `get` |
| Components | Separate class in `e2e/pages/components/`, accepts `Locator` |

**Locator priority:**

1. `getByRole()` 2. `getByLabel()` 3. `getByText()` 4. `getByTestId()` 5. CSS (last resort)

**Example:**

```typescript
// e2e/pages/loyalty/loyalty-home.page.ts
import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class LoyaltyHomePage extends BasePage {
  protected readonly url = '/loyalty/home/';

  private readonly benefitsSection = this.page.getByRole('region', { name: 'My tier benefits' });

  constructor(page: Page) {
    super(page);
  }

  async expectBenefitsSectionToBeVisible(): Promise<void> {
    await expect(this.benefitsSection).toBeVisible();
  }
}
```

---

## Step 5 — Write Feature Files

Create or update feature files in `e2e/features/[functional-area]/`.

**Rules:**

| Rule | Detail |
|---|---|
| Location | `e2e/features/[area]/[name].feature` |
| Tags | `@[area]`, `@smoke` or `@regression` |
| Language | Business language, no technical details |
| One behavior | One assertion goal per scenario |
| Parameterize | Use `Scenario Outline` + `Examples` for data variations |
| Background | Use for shared preconditions across scenarios |

**Example:**

```gherkin
@loyalty @regression
Feature: Loyalty Home Benefits

  Background:
    Given the user is logged in as a loyalty member

  Scenario: User sees benefits for their current tier
    When the user navigates to the loyalty home page
    Then the user should see the benefits section
```

---

## Step 6 — Implement Step Definitions

Create or update step files in `e2e/steps/[functional-area].steps.ts`.

**Rules:**

| Rule | Detail |
|---|---|
| Imports | `Given`, `When`, `Then` from `e2e/fixtures/fixtures.ts` |
| Interactions | Delegate to page objects only, no raw `page` calls |
| Parameters | Use Cucumber expressions: `{string}`, `{int}` |
| One action per step | Each step does exactly one thing |
| Reusable | Write generically for cross-feature reuse |

**Example:**

```typescript
// e2e/steps/loyalty.steps.ts
import { Given, When, Then } from '../fixtures/fixtures';

Given('the user is logged in as a loyalty member', async ({ loginPage }) => {
  await loginPage.navigate();
  await loginPage.fillEmail('test@example.com');
  await loginPage.fillPassword('TestPassword123');
  await loginPage.submit();
});

When('the user navigates to the loyalty home page', async ({ loyaltyHomePage }) => {
  await loyaltyHomePage.navigate();
});

Then('the user should see the benefits section', async ({ loyaltyHomePage }) => {
  await loyaltyHomePage.expectBenefitsSectionToBeVisible();
});
```

---

## Step 7 — Register Fixtures

Update `e2e/fixtures/fixtures.ts` to register new page objects:

```typescript
import { test as base, createBdd } from 'playwright-bdd';
import { LoyaltyHomePage } from '../pages/loyalty/loyalty-home.page';

type Fixtures = {
  loyaltyHomePage: LoyaltyHomePage;
};

export const test = base.extend<Fixtures>({
  loyaltyHomePage: async ({ page }, use) => {
    await use(new LoyaltyHomePage(page));
  },
});

export const { Given, When, Then } = createBdd(test);
```

---

## Step 8 — Validate

Run these commands in order:

```bash
# Generate test files from features
npx bddgen

# Run only the new tests by tag
npx playwright test --grep @[area]

# Check for type errors
npx tsc --noEmit
```

All tests must pass before delivering.

---

## Output Format

```markdown
## Automation Summary

### Changes Made
- **New page objects**: [list with file paths]
- **Modified page objects**: [list with file paths]
- **New features**: [list with file paths]
- **New step definitions**: [list with file paths]
- **Modified fixtures**: [file path]

### Coverage
| TC ID | Status | Feature File |
|-------|--------|--------------|
| TC-001 | Automated | features/[area]/[name].feature |

### Test Execution
- **Total**: [count]
- **Passed**: [count]
- **Failed**: [count]
```

---

## Decision Tree

```
Received test cases to automate
│
├─ Search existing features/steps/pages
│  ├─ TC fully covered → Skip, report as existing
│  ├─ TC partially covered → Extend existing code
│  └─ TC new → Create full implementation
│
├─ For each new/partial TC:
│  ├─ Page object exists? → Extend it
│  │  └─ No → Create new page object
│  ├─ Steps reusable? → Import and reuse
│  │  └─ No → Create new step definitions
│  └─ Feature file exists? → Add scenario
│     └─ No → Create new feature file
│
├─ Register new fixtures
├─ Run bddgen + tests
└─ Report results
```

---

## Anti-Patterns

| Anti-pattern | Correct approach |
|---|---|
| Raw `page` calls in steps | Delegate to page objects |
| Hardcoded test data | Use env config or parameterization |
| `waitForTimeout()` | Use Playwright auto-waiting |
| Multiple assertions per scenario | One behavior per scenario |
| Technical language in Gherkin | Business language only |
| God page objects | Split by section or component |
| Assertions inside action methods | Separate actions from assertions |
