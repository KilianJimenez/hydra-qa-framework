---
applyTo: "e2e/features/**/*.feature"
---

# BDD Conventions

## Gherkin Style Guide

### Feature Structure

```gherkin
@tag
Feature: [Feature Name]
  [Optional description of the feature]

  Background:
    [Shared preconditions for all scenarios]

  @tag
  Scenario: [Scenario Name]
    Given [precondition]
    When [action]
    Then [expected outcome]
```

### Writing Rules

1. **Feature names** must be descriptive and reflect the user-facing functionality.
2. **Scenario names** must describe the specific behavior being tested.
3. **Steps** must be written in **business language**, not technical language.
   - Good: `When the user submits the login form`
   - Bad: `When the user clicks the button with id="submit-btn"`
4. **One behavior per scenario** — do not test multiple things in one scenario.
5. Use `And` / `But` to continue a Given/When/Then block.

### Tags

| Tag           | Purpose                                |
| ------------- | -------------------------------------- |
| `@smoke`      | Critical path tests for smoke runs     |
| `@regression` | Full regression suite                  |
| `@wip`        | Work in progress, not ready to run     |
| `@skip`       | Temporarily skipped                    |
| `@[area]`     | Functional area (e.g., `@auth`)        |

### Scenario Outline

Use `Scenario Outline` for data-driven tests:

```gherkin
Scenario Outline: Login with different roles
  Given the user is on the login page
  When the user logs in as "<role>"
  Then the user should see the "<dashboard>" dashboard

  Examples:
    | role    | dashboard |
    | admin   | Admin     |
    | editor  | Editor    |
    | viewer  | Viewer    |
```

### Background

Use `Background` for shared preconditions across all scenarios in a feature:

```gherkin
Background:
  Given the user is authenticated
  And the user is on the settings page
```

### Step Reusability

- Write steps generically so they can be reused across features.
- Use parameterized steps with `{string}`, `{int}`, `{float}`.
- Avoid duplicating step text across different step definition files.

## File Organization

```
e2e/features/
├── auth/
│   ├── login.feature
│   └── registration.feature
├── dashboard/
│   └── overview.feature
├── settings/
│   └── profile.feature
└── common.feature          # Shared scenarios if needed
```

Each subdirectory corresponds to a functional area of the application.
