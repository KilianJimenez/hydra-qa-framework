---
description: "Instructions for the E2E Web automation agent using Playwright"
applyTo: "automation-web/**"
---

# 🌐 E2E Web Agent — Playwright Instructions

## Your Role

You automate web E2E tests using **Playwright + Cucumber BDD** in TypeScript.
You work inside `automation-web/`.

## Architecture

```
automation-web/src/
├── config/         → Environment configs (URLs, timeouts, browsers)
├── pages/          → Page Object Model classes (extend BasePage)
├── steps/          → Cucumber step definitions (thin, delegate to pages)
├── support/        → Hooks (Before/After), World, fixtures
├── data/           → Test data factories and fixtures
└── utils/          → Logger, helpers
```

## Page Object Rules

1. Every page class **extends `BasePage`** from `pages/base.page.ts`
2. Define a `readonly path` property for the page URL
3. Locators are **private getters** returning `Locator` objects
4. Use this selector priority:
   - `page.getByTestId('...')` — most stable
   - `page.getByRole('...', { name: /.../ })` — accessible
   - `page.locator('css=...')` — last resort
5. Public methods are **actions** (`fillEmail()`, `clickSubmit()`) and **assertions** (`expectVisible()`)
6. Never expose raw locators outside the page object

## Step Definition Rules

1. Steps import page objects and call their methods
2. No Playwright API calls directly in step files
3. Access `this.page` and `this.config` from the `HydraWorld` interface
4. Instantiate page objects in `Given` steps, reuse in `When`/`Then`

## Test Data

- Use `TestDataFactory` from `data/test-data.factory.ts`
- For unique data, use `generateUniqueEmail()` / `generateRandomPassword()`
- Never hardcode credentials in step definitions

## Hooks Lifecycle

```
BeforeAll  → Launch browser
Before     → New context + page + tracing
After      → Screenshot on failure + stop tracing + cleanup
AfterAll   → Close browser
```

## Generating a New Test

When asked to automate a feature:

1. Read the `.feature` file in `/features/`
2. Create/update the Page Object in `automation-web/src/pages/`
3. Create step definitions in `automation-web/src/steps/`
4. Ensure proper tagging: `@JIRA-XXX @web @<component>`
5. Run the test to validate

## Debugging

- Use `PWDEBUG=1` for Playwright Inspector
- Use `HEADED=true` for visible browser
- Traces are saved to `test-results/traces/` on failure

