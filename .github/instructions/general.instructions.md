---
applyTo: "**"
---

# Hydra QA Framework — General Instructions

## Framework Overview

Hydra QA Framework is an orchestrated agent system for managing the full QA lifecycle:
functional refinement, test generation, manual testing, and E2E test automation.

## Project Structure

```
hydra-qa-framework/
├── .github/
│   ├── agents/          # Agent definitions (conductor + subagents)
│   ├── instructions/    # Context-specific instructions for agents
│   └── prompts/         # Reusable prompt templates for workflows
├── e2e/
│   ├── features/        # Gherkin feature files (BDD)
│   ├── steps/           # Step definitions (playwright-bdd)
│   ├── pages/           # Page Object Model classes
│   ├── fixtures/        # Playwright custom fixtures
│   ├── support/         # Helpers, utilities, constants
│   └── config/          # Environment configuration
├── docs/                # Framework documentation
├── resources/           # Static resources (logos, assets)
├── playwright.config.ts # Playwright + BDD configuration
├── package.json
└── tsconfig.json
```

## Language & Style

- All code and documentation must be written in **English**.
- Use **TypeScript** for all automation code.
- Use **Gherkin** for feature files.
- Follow clean code principles: meaningful names, small functions, single responsibility.

## Agent System

The framework operates with 5 agents:

1. **Conductor** — Orchestrator, interacts with the user.
2. **Refiner** — Functional analysis and DoR validation.
3. **Generator** — Test case creation from acceptance criteria.
4. **Manual Tester** — Manual test execution via browser.
5. **Automator** — E2E test automation with Playwright + BDD.

See `.github/agents/` for full agent definitions.
