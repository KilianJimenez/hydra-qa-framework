---
description: "Instructions for the E2E Apps automation agent using Appium + WebdriverIO"
applyTo: "automation-apps/**"
---

# 📱 E2E Apps Agent — Appium + WebdriverIO Instructions

## Your Role

You automate mobile E2E tests using **Appium + WebdriverIO + Cucumber BDD** in TypeScript.
You work inside `automation-apps/`. You support both **Android** and **iOS**.

## Architecture

```
automation-apps/src/
├── config/         → Device capabilities (Android, iOS)
├── screens/        → Screen Object Model classes (extend BaseScreen)
├── steps/          → Cucumber step definitions (thin, delegate to screens)
├── support/        → Hooks, SessionManager
├── data/           → Test data factories
└── utils/          → Helpers
```

## Screen Object Rules

1. Every screen class **extends `BaseScreen`** from `screens/base.screen.ts`
2. Implement `waitForScreenLoaded()` — waits for the screen's key element
3. Selectors are **private getters** returning `string` selectors
4. Use cross-platform selector helpers:
   - `this.byAccessibilityId('id')` → `~id` (works on both platforms)
   - `this.byId('android-resource-id', 'ios-accessibility-id')` → platform-aware
5. Public methods are **actions** and **assertions**

## Selector Priority

| Priority | Android | iOS |
|----------|---------|-----|
| 1st | Accessibility ID (`~id`) | Accessibility ID (`~id`) |
| 2nd | `resourceId` via UiSelector | `-ios predicate string` |
| 3rd | XPath (avoid if possible) | `-ios class chain` |

## Step Definition Rules

1. Import screen objects, call their methods
2. No direct WebdriverIO calls in step files
3. Screen objects are instantiated at module level (stateless)

## Session Management

- `SessionManager` handles session health checks and automatic restarts
- Before each scenario: health check + restart if needed
- After failure: screenshot is captured and attached
- Use `SessionManager.resetApp(appId)` for clean-state scenarios

## Generating a New Test

When asked to automate a mobile feature:

1. Read the `.feature` file in `/features/`
2. Create/update the Screen Object in `automation-apps/src/screens/`
3. Create step definitions in `automation-apps/src/steps/`
4. Ensure proper tagging: `@JIRA-XXX @mobile @android|@ios @<component>`
5. Run the test on the target platform

## Platform-Specific Notes

### Android
- Use `UiAutomator2` automation name
- `autoGrantPermissions: true` to skip permission dialogs
- For scrolling: `mobile: scrollGesture`

### iOS
- Use `XCUITest` automation name
- Permission dialogs need explicit handling via `mobile: alert`
- For scrolling: `mobile: scroll`

## Stability Tips

- Always use `waitForDisplayed()` before interactions
- Use `waitForScreenLoaded()` at the start of each scenario
- Avoid `pause()` or `sleep()` — use explicit waits
- Use `SessionManager.restartSessionIfNeeded()` for flaky session recovery

