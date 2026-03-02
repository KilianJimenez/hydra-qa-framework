---
description: "Skill: Scaffold a new Playwright Page Object class"
---

# 🏗️ Create Page Object

## Purpose
Scaffold a new Page Object class for web automation following the HydraQA POM pattern.

## Inputs
- **Page Name**: `${{PAGE_NAME}}` — PascalCase name (e.g., `LoginPage`, `DashboardPage`)
- **Page Path**: `${{PAGE_PATH}}` — URL path relative to baseUrl (e.g., `/login`, `/dashboard`)
- **Elements**: `${{ELEMENTS}}` — List of interactive elements on the page (name + type + selector)

## Steps

1. Create a new file at `automation-web/src/pages/<page-name>.page.ts`

2. Use this template:

```typescript
import { Page, Locator } from 'playwright';
import { BasePage } from './base.page';

/**
 * ${{PAGE_NAME}} — Page Object for the <description> page.
 */
export class ${{PAGE_NAME}} extends BasePage {
  readonly path = '${{PAGE_PATH}}';

  // ── Locators ──────────────────────────────────

  // For each element, create a private getter:
  private get <elementName>(): Locator {
    return this.page.getByTestId('<test-id>');
  }

  // ── Actions ───────────────────────────────────

  // For each interactive element, create an action method:
  async <actionName>(): Promise<void> {
    await this.click(this.<elementName>);
  }

  // ── Assertions ────────────────────────────────

  async expect<Element>Visible(): Promise<void> {
    await this.expectVisible(this.<elementName>);
  }
}
```

3. Ensure the class:
   - Extends `BasePage`
   - Has a `readonly path` property
   - Uses private getters for locators
   - Uses `getByTestId` as the primary selector strategy
   - Has action methods that use inherited `click()`, `fill()`, etc.
   - Has assertion methods that use inherited `expectVisible()`, `expectText()`, etc.

## Output
- New page object file at `automation-web/src/pages/<page-name>.page.ts`

## Validation
- No TypeScript errors in the generated file
- Class properly extends `BasePage`
- All locators use the recommended selector strategy

