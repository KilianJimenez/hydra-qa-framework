---
description: "Skill: Generate a complete mobile E2E test from a feature file"
---

# 🧪 Create E2E Apps Test

## Purpose
Generate the complete Appium + WebdriverIO automation code for a Gherkin feature file, including Screen Objects and step definitions.

## Inputs
- **Feature File Path**: `${{FEATURE_FILE}}` — Path to the `.feature` file in `/features/`
- **Platform**: `${{PLATFORM}}` — Target platform (android | ios | both)

## Steps

1. **Read** the feature file and parse all scenarios and steps

2. **Identify** the screens involved:
   - Map each `Given` step to a screen navigation/load
   - Map each `When` step to a screen action
   - Map each `Then` step to a screen assertion

3. **Discover selectors** (if Appium MCP is available):
   - Use `appium_get_page_source` or `generate_locators` to inspect the app
   - Map discovered elements to Screen Object selectors

4. **Check** if Screen Objects already exist in `automation-apps/src/screens/`:
   - If yes, extend them with any missing methods
   - If no, scaffold new ones using the `create-screen-object` skill

5. **Create** step definitions in `automation-apps/src/steps/<feature-name>.steps.ts`:
   - Import required screen objects
   - Map each Gherkin step to a function
   - Instantiate screen objects at module level

6. **Tag** the feature file with platform tags: `@mobile @android` / `@ios`

7. **Validate** — Check for TypeScript errors

## Output
- Screen Object file(s) in `automation-apps/src/screens/`
- Step definition file in `automation-apps/src/steps/`

## Validation Checklist
- [ ] All Gherkin steps have matching step definitions
- [ ] No WebdriverIO API calls in step definitions
- [ ] All screen objects extend `BaseScreen`
- [ ] `waitForScreenLoaded()` is implemented in each screen object
- [ ] Cross-platform selectors are used
- [ ] No TypeScript errors
- [ ] Feature file has proper platform tags

