---
description: "Skill: Generate a complete web E2E test from a feature file"
---

# 🧪 Create E2E Web Test

## Purpose
Generate the complete Playwright automation code for a Gherkin feature file, including Page Objects and step definitions.

## Inputs
- **Feature File Path**: `${{FEATURE_FILE}}` — Path to the `.feature` file in `/features/`
- **Base URL**: `${{BASE_URL}}` — (optional) Override for the application URL

## Steps

1. **Read** the feature file and parse all scenarios and steps

2. **Identify** the pages involved:
   - Map each `Given` step to a page navigation
   - Map each `When` step to a page action
   - Map each `Then` step to a page assertion

3. **Check** if Page Objects already exist in `automation-web/src/pages/`:
   - If yes, extend them with any missing methods
   - If no, scaffold new ones using the `create-page-object` skill

4. **Create** step definitions in `automation-web/src/steps/<feature-name>.steps.ts`:
   - Import required page objects
   - Map each Gherkin step to a function
   - Use `HydraWorld` interface for shared state
   - Delegate all logic to page object methods

5. **Add** test data if needed via `TestDataFactory`

6. **Validate** — Check for TypeScript errors

## Output
- Page Object file(s) in `automation-web/src/pages/`
- Step definition file in `automation-web/src/steps/`
- (Optional) Updated test data factory

## Validation Checklist
- [ ] All Gherkin steps have matching step definitions
- [ ] No Playwright API calls in step definitions
- [ ] All page objects extend `BasePage`
- [ ] Selectors use `getByTestId` as primary strategy
- [ ] No TypeScript errors
- [ ] Feature file has proper tags

