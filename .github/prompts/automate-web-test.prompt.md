---
description: "Prompt to automate a feature file as a web E2E test"
---

# Automate Web E2E Test

## Input
- **Feature File**: `${{FEATURE_FILE_PATH}}`

## Task
Create the complete Playwright automation for the given `.feature` file.

## Steps

1. Read the feature file at `${{FEATURE_FILE_PATH}}`

2. Identify all pages/screens involved in the scenarios

3. For each page, create or update a Page Object in `automation-web/src/pages/`:
   - Extend `BasePage`
   - Define the `path` property
   - Add locators as private getters (prefer `getByTestId`)
   - Add action methods (click, fill, select)
   - Add assertion methods (expectVisible, expectText)

4. Create step definitions in `automation-web/src/steps/`:
   - Map each Gherkin step to a TypeScript function
   - Instantiate page objects in `Given` steps
   - Delegate all interactions to page object methods
   - Use `HydraWorld` for shared context

5. If test data is needed, use or extend `TestDataFactory` in `automation-web/src/data/`

6. Validate the implementation by checking for TypeScript errors

7. Provide a summary:
   - Files created/modified
   - Page Objects used
   - Any assumptions made about selectors

