---
description: "Skill: Scaffold a new Appium Screen Object class"
---

# 🏗️ Create Screen Object

## Purpose
Scaffold a new Screen Object class for mobile automation following the HydraQA SOM pattern with cross-platform support.

## Inputs
- **Screen Name**: `${{SCREEN_NAME}}` — PascalCase name (e.g., `LoginScreen`, `HomeScreen`)
- **Elements**: `${{ELEMENTS}}` — List of interactive elements (name + android selector + iOS selector)
- **Platform**: `${{PLATFORM}}` — Target platform (android | ios | both)

## Steps

1. Create a new file at `automation-apps/src/screens/<screen-name>.screen.ts`

2. Use this template:

```typescript
import { BaseScreen } from './base.screen';

/**
 * ${{SCREEN_NAME}} — Screen Object for the <description> screen.
 */
export class ${{SCREEN_NAME}} extends BaseScreen {

  // ── Selectors ─────────────────────────────────

  // For shared selectors (accessibility ID):
  private get <elementName>(): string {
    return this.byAccessibilityId('<accessibility-id>');
  }

  // For platform-specific selectors:
  private get <elementName>(): string {
    return this.byId('<android-resource-id>', '<ios-accessibility-id>');
  }

  // ── Screen Load ───────────────────────────────

  async waitForScreenLoaded(): Promise<void> {
    await this.waitForElement(this.<keyElement>);
  }

  // ── Actions ───────────────────────────────────

  async <actionName>(): Promise<void> {
    await this.tap(this.<elementName>);
  }

  // ── Assertions ────────────────────────────────

  async is<Element>Displayed(): Promise<boolean> {
    return this.isDisplayed(this.<elementName>);
  }
}
```

3. Ensure the class:
   - Extends `BaseScreen`
   - Implements `waitForScreenLoaded()`
   - Uses cross-platform selector helpers (`byAccessibilityId`, `byId`)
   - Uses private getters for selectors
   - Has action methods that use inherited `tap()`, `typeText()`, etc.

## Output
- New screen object file at `automation-apps/src/screens/<screen-name>.screen.ts`

## Validation
- No TypeScript errors in the generated file
- Class properly extends `BaseScreen`
- `waitForScreenLoaded()` is implemented
- Selectors use cross-platform helpers

