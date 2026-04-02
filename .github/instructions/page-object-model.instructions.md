---
applyTo: "e2e/pages/**/*.ts"
---

# Page Object Model Conventions

## Architecture

All page objects extend from `BasePage` and encapsulate page-specific interactions.

```
e2e/pages/
├── base.page.ts              # Abstract base page class
├── components/               # Reusable UI components
│   └── navbar.component.ts
├── auth/
│   ├── login.page.ts
│   └── registration.page.ts
├── dashboard/
│   └── dashboard.page.ts
└── settings/
    └── profile.page.ts
```

## BasePage Contract

Every page object must:

1. Extend `BasePage`.
2. Accept `Page` in the constructor.
3. Define a `url` property for navigation.
4. Implement `navigate()` to go to the page.
5. Implement `expectToBeVisible()` to verify the page loaded correctly.

## Design Rules

### Selectors

- Declare selectors as **private readonly** properties.
- Use Playwright's built-in locator methods (see coding standards for priority).
- Name selectors descriptively: `emailInput`, `submitButton`, `errorAlert`.

### Methods

- **Actions**: Methods that perform user interactions (`fill`, `click`, `select`).
  - Return `Promise<void>` or `Promise<NewPage>` for navigation.
  - Name with verbs: `fillEmail()`, `submit()`, `selectOption()`.

- **Assertions**: Methods that verify page state.
  - Prefix with `expect`: `expectErrorMessage()`, `expectToBeVisible()`.
  - Use Playwright's `expect()` internally.

- **Getters**: Methods that retrieve data from the page.
  - Prefix with `get`: `getHeaderText()`, `getRowCount()`.

### Components

For reusable UI elements that appear on multiple pages (navbar, sidebar, modals):

1. Create a component class in `e2e/pages/components/`.
2. Components do NOT extend `BasePage`.
3. Components accept a `Locator` (their root element) in the constructor.
4. Pages compose components via properties.

```typescript
// e2e/pages/components/navbar.component.ts
import { Locator } from '@playwright/test';

export class NavbarComponent {
  private readonly root: Locator;

  constructor(root: Locator) {
    this.root = root;
  }

  async clickMenuItem(name: string): Promise<void> {
    await this.root.getByRole('link', { name }).click();
  }
}
```

### Page Composition

```typescript
// e2e/pages/dashboard/dashboard.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { NavbarComponent } from '../components/navbar.component';

export class DashboardPage extends BasePage {
  readonly navbar: NavbarComponent;

  constructor(page: Page) {
    super(page);
    this.navbar = new NavbarComponent(page.getByRole('navigation'));
  }
}
```

## Anti-Patterns to Avoid

- **God page objects**: A single page object with hundreds of methods. Split by section or component.
- **Exposed selectors**: Never expose locators publicly. Wrap them in methods.
- **Assertions in actions**: Action methods should not assert. Keep actions and assertions separate.
- **Hardcoded waits**: Never use `waitForTimeout()`. Rely on Playwright auto-waiting.
- **Business logic in pages**: Page objects interact with the UI, not implement business rules.
