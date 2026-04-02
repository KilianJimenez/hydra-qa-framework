# E2E Automation Architecture

## Overview

The E2E test automation layer follows a **BDD + Page Object Model** architecture using **Playwright** as the browser automation engine and **playwright-bdd** for Gherkin integration.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Feature Files                        │
│              (Gherkin - Business Language)              │
│         e2e/features/**/*.feature                       │
└────────────────────────┬────────────────────────────────┘
                         │ maps to
┌────────────────────────▼────────────────────────────────┐
│                   Step Definitions                      │
│              (Glue between BDD and Code)                │
│         e2e/steps/**/*.steps.ts                         │
└────────────────────────┬────────────────────────────────┘
                         │ uses
┌────────────────────────▼────────────────────────────────┐
│                    Page Objects                         │
│             (UI Abstractions - POM Pattern)             │
│         e2e/pages/**/*.page.ts                          │
│         e2e/pages/components/**/*.component.ts          │
└────────────────────────┬────────────────────────────────┘
                         │ extends
┌────────────────────────▼────────────────────────────────┐
│                     BasePage                            │
│              (Abstract Base Class)                      │
│         e2e/pages/base.page.ts                          │
└────────────────────────┬────────────────────────────────┘
                         │ uses
┌────────────────────────▼────────────────────────────────┐
│                   Playwright API                        │
│              (Browser Automation Engine)                │
└─────────────────────────────────────────────────────────┘
```

## Layers

### 1. Feature Files (`e2e/features/`)

- Written in **Gherkin** syntax (Given/When/Then).
- Organized by **functional area** in subdirectories.
- Describe behavior in **business language**, not technical language.
- Use tags for test categorization (`@smoke`, `@regression`, `@auth`).

```
e2e/features/
├── auth/
│   ├── login.feature
│   └── registration.feature
├── dashboard/
│   └── overview.feature
└── settings/
    └── profile.feature
```

### 2. Step Definitions (`e2e/steps/`)

- **Glue layer** between Gherkin steps and page objects.
- One file per functional area (e.g., `auth.steps.ts`).
- Import `Given`, `When`, `Then` from the fixtures file.
- Delegate all interactions to page objects — **no raw Playwright calls**.
- Use **Cucumber expressions** for parameter matching (`{string}`, `{int}`).

```
e2e/steps/
├── auth.steps.ts
├── dashboard.steps.ts
└── common.steps.ts
```

### 3. Page Objects (`e2e/pages/`)

- One class per page or significant view.
- Extend `BasePage` for common functionality.
- Encapsulate **selectors** (private), **actions** (public), and **assertions** (public).
- Use Playwright's semantic locators (`getByRole`, `getByLabel`, `getByText`).

```
e2e/pages/
├── base.page.ts
├── components/
│   ├── navbar.component.ts
│   └── modal.component.ts
├── auth/
│   ├── login.page.ts
│   └── registration.page.ts
└── dashboard/
    └── dashboard.page.ts
```

### 4. Components (`e2e/pages/components/`)

- Reusable UI elements that appear across multiple pages.
- Accept a `Locator` (root element) in the constructor — not `Page`.
- Do **not** extend `BasePage`.
- Composed into page objects as properties.

### 5. Fixtures (`e2e/fixtures/`)

- Extend `playwright-bdd`'s base `test` with custom fixtures.
- Register page objects as fixtures for dependency injection into steps.
- Export `Given`, `When`, `Then` bound to the extended test.

### 6. Support (`e2e/support/`)

- Shared utilities: test data factories, constants, helper functions.
- No direct UI interaction — purely logic and data.

### 7. Configuration (`e2e/config/`)

- Environment-specific settings (URLs, timeouts).
- Driven by `TEST_ENV` environment variable.
- Supports: `local`, `dev`, `staging`, `production`.

## Data Flow

```
Gherkin Step → Step Definition → Page Object → Playwright API → Browser
     ↑                                ↑
     |                                |
  Feature file                  Fixtures (DI)
```

1. **playwright-bdd** reads `.feature` files and generates Playwright test files.
2. Generated tests invoke step definitions matching each Gherkin step.
3. Step definitions receive **page object fixtures** via dependency injection.
4. Page objects execute browser interactions using the **Playwright API**.

## Test Execution

```bash
# 1. Generate tests from features
npx bddgen

# 2. Run all tests
npx playwright test

# Or combine both:
npm test
```

### Run by tag

```bash
npx bddgen && npx playwright test --grep @smoke
```

### Run by project (browser)

```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Environment selection

```bash
TEST_ENV=staging npm test
```

## Design Principles

1. **Separation of concerns** — Each layer has a single responsibility.
2. **DRY** — Reuse steps, page objects, and components. No duplication.
3. **Readability** — Feature files readable by non-technical stakeholders.
4. **Maintainability** — UI changes affect only page objects, not steps or features.
5. **Scalability** — New features add new files, not modify existing ones.
6. **Independence** — Each scenario is self-contained and can run in isolation.
