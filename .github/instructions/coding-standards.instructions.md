---
applyTo: "e2e/**/*.ts"
---

# Coding Standards — E2E Automation

## TypeScript Conventions

- Use `strict` mode in `tsconfig.json`.
- Prefer `const` over `let`. Never use `var`.
- Use explicit return types on public methods.
- Use `async/await` — never raw Promises or callbacks.
- Avoid `any` type. Use proper interfaces and types.

## Naming Conventions

| Element            | Convention          | Example                        |
| ------------------ | ------------------- | ------------------------------ |
| Files              | kebab-case          | `login.page.ts`                |
| Classes            | PascalCase          | `LoginPage`                    |
| Methods            | camelCase           | `fillEmail()`                  |
| Constants          | UPPER_SNAKE_CASE    | `DEFAULT_TIMEOUT`              |
| Interfaces/Types   | PascalCase          | `UserCredentials`              |
| Step files         | kebab-case          | `auth.steps.ts`                |
| Feature files      | kebab-case          | `login.feature`                |

## File Organization

- One page object per file.
- One step definition file per functional area.
- Feature files grouped by functional area in subdirectories.
- Shared utilities in `e2e/support/`.

## Locator Strategy (priority order)

1. `getByRole()` — Accessible role-based selectors.
2. `getByLabel()` — Form field labels.
3. `getByText()` — Visible text content.
4. `getByTestId()` — `data-testid` attributes.
5. `getByPlaceholder()` — Placeholder text.
6. CSS selectors — **Last resort only**.

## Assertions

- Use Playwright's built-in `expect()` with auto-waiting assertions.
- Prefer `toBeVisible()`, `toHaveText()`, `toHaveURL()` over manual waits.
- Never use `page.waitForTimeout()` — use auto-waiting locators instead.

## Error Handling

- Do not wrap test steps in try/catch — let Playwright handle failures.
- Use `test.fail()` annotation for known failing tests.
- Use `test.skip()` for conditionally skipped tests.

## Test Independence

- Each scenario must be independent and self-contained.
- Do not rely on test execution order.
- Clean up test data in `afterEach` or `afterAll` hooks when needed.
- Use unique test data to avoid collisions in parallel runs.
