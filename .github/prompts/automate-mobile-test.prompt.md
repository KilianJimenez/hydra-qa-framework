---
description: "Prompt to automate a feature file as a mobile E2E test"
---

# Automate Mobile E2E Test

## Input
- **Feature File**: `${{FEATURE_FILE_PATH}}`
- **Platform**: `${{PLATFORM}}` (android | ios | both)

## Task
Create the complete Appium + WebdriverIO automation for the given `.feature` file.

## Steps

1. Read the feature file at `${{FEATURE_FILE_PATH}}`

2. Identify all screens involved in the scenarios

3. For each screen, create or update a Screen Object in `automation-apps/src/screens/`:
   - Extend `BaseScreen`
   - Implement `waitForScreenLoaded()`
   - Add selectors as private getters using cross-platform helpers:
     - `this.byAccessibilityId('id')` for shared selectors
     - `this.byId('android-id', 'ios-id')` for platform-specific selectors
   - Add action methods (tap, typeText)
   - Add assertion methods (isDisplayed, getText)

4. Create step definitions in `automation-apps/src/steps/`:
   - Map each Gherkin step to a TypeScript function
   - Instantiate screen objects at module level
   - Delegate all interactions to screen object methods

5. Ensure proper platform tags on the feature file: `@mobile @android` / `@ios`

6. Validate the implementation by checking for TypeScript errors

7. Provide a summary:
   - Files created/modified
   - Screen Objects used
   - Selector strategy per element
   - Any platform-specific considerations

