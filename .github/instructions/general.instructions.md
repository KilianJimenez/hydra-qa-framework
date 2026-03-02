---
description: "General instructions for all HydraQA agents"
---

# 🐍 HydraQA — General Agent Instructions

You are an AI agent operating inside the **HydraQA** test automation framework.
You support a Senior QA Automation Engineer across the full quality lifecycle.

## Framework Context

HydraQA is a multi-platform BDD automation framework:

| Domain | Stack |
|--------|-------|
| **Web** | Playwright + Cucumber (TypeScript) |
| **Mobile** | Appium + WebdriverIO + Cucumber (TypeScript) |
| **BDD** | Gherkin `.feature` files in `/features/` |

### Folder Structure

```
hydra-qa-framework/
├── .github/
│   ├── agents/         ← Agent definitions
│   ├── instructions/   ← Agent instructions (this file)
│   ├── prompts/        ← Reusable prompt templates
│   └── skills/         ← Skill definitions
├── features/           ← Gherkin .feature files (shared across domains)
│   └── <module>/
│       └── <module>.feature
├── automation-web/     ← Playwright automation project
│   └── src/
│       ├── config/     ← Environment & browser config
│       ├── pages/      ← Page Object Model classes
│       ├── steps/      ← Cucumber step definitions
│       ├── support/    ← Hooks, world, fixtures
│       ├── data/       ← Test data factories
│       └── utils/      ← Shared utilities (logger, helpers)
├── automation-apps/    ← Appium automation project
│   └── src/
│       ├── config/     ← Device capabilities config
│       ├── screens/    ← Screen Object Model classes
│       ├── steps/      ← Cucumber step definitions
│       ├── support/    ← Hooks, session management
│       ├── data/       ← Test data factories
│       └── utils/      ← Shared utilities
└── resources/          ← Shared assets
```

## Core Principles

1. **BDD First** — All test scenarios are defined in Gherkin `.feature` files before any automation code.
2. **Separation of Concerns** — AI agents/skills are decoupled from automation code. Agents orchestrate; automation executes.
3. **Traceability** — Every test links back to a Jira ticket via tags: `@JIRA-ID`.
4. **Reusability** — Prefer skills and page/screen objects. Avoid duplicating logic.
5. **Stability** — Built-in waits, retries, session recovery. No flaky shortcuts.

## Tagging Convention

Feature file tags follow this format:
```gherkin
@JIRA-123 @web @signup @smoke
Scenario: ...
```
- `@JIRA-XXX` — Links to Jira ticket
- `@web` / `@mobile` / `@android` / `@ios` — Platform domain
- `@<component>` — Feature area (signup, checkout, etc.)
- `@smoke` / `@regression` / `@e2e` — Test suite classification

## Code Conventions

- **TypeScript** for all automation code
- **Page Object Model** (web) / **Screen Object Model** (mobile)
- Selectors: prefer `data-testid` (web), accessibility IDs (mobile)
- No hardcoded waits (`sleep`). Use explicit waits only.
- All page/screen objects extend a base class
- Step definitions should be thin — delegate to page/screen objects

## When Generating Code

- Always include JSDoc comments for public methods
- Add proper TypeScript types — no `any`
- Follow existing patterns in the codebase
- Validate with `get_errors` after any file edit

