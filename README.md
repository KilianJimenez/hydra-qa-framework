# 🐍 HydraQA

![HydraQA Logo](/resources/hydraqa-logo.png)

**HydraQA** is a next-generation, AI-augmented QA Automation framework built around **specialized agents** that cover the entire quality lifecycle — from Jira refinement and manual testing to cross-platform E2E automation and codebase maintenance.

Inspired by the Hydra, the framework uses multiple specialized heads (agents) working in coordination to tackle quality challenges from every angle.

---

## 🎯 Goals

- Define **functional test cases** from Jira requirements, user stories, or observed behavior
- Assist and execute **intelligent manual testing** guided by AI agents
- Automate **E2E tests for web** (Playwright) **and mobile** (Appium + WebdriverIO)
- Orchestrate QA workflows using **Skills, Prompts, and MCP tools**
- Maintain and evolve the test suite with **AI-driven maintenance agents**

---

## 🧠 Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    🧠 AI ORCHESTRATION LAYER             │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌────────┐  │
│  │ Refinement │ │  Manual    │ │ E2E Web  │ │ E2E    │  │
│  │   Agent    │ │  Testing   │ │  Agent   │ │ Apps   │  │
│  │            │ │  Agent     │ │          │ │ Agent  │  │
│  └─────┬──────┘ └─────┬──────┘ └────┬─────┘ └───┬────┘  │
│        │              │             │            │       │
│  ┌─────┴──────────────┴─────────────┴────────────┴────┐  │
│  │              🔧 Maintenance Agent                  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Skills ─── Prompts ─── Instructions ─── MCP Tools       │
└──────────────────────────┬───────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   features/  │  │ automation-  │  │ automation-  │
│   (Gherkin)  │  │ web/         │  │ apps/        │
│              │  │ (Playwright) │  │ (Appium)     │
└──────────────┘  └──────────────┘  └──────────────┘
```

The AI layer (agents, skills, prompts, instructions) is **fully decoupled** from the automation domains. Agents orchestrate; automation projects execute.

---

## 📁 Folder Structure

```
hydra-qa-framework/
│
├── .github/                          ← AI & CI/CD layer
│   ├── agents/                       ← Agent definitions
│   │   ├── refinement.agent.md         → Jira story → test scenarios
│   │   ├── manual-testing.agent.md     → Guided manual & exploratory testing
│   │   ├── e2e-web.agent.md            → Playwright web automation
│   │   ├── e2e-apps.agent.md           → Appium mobile automation
│   │   └── maintenance.agent.md        → Flaky test fixes, refactoring
│   │
│   ├── instructions/                 ← Agent behavioral instructions
│   │   ├── general.instructions.md     → Framework-wide rules
│   │   ├── e2e-web/                    → Playwright-specific instructions
│   │   └── e2e-apps/                   → Appium-specific instructions
│   │
│   ├── prompts/                      ← Reusable prompt templates
│   │   ├── generate-test-scenarios.prompt.md
│   │   ├── automate-web-test.prompt.md
│   │   ├── automate-mobile-test.prompt.md
│   │   ├── exploratory-testing.prompt.md
│   │   └── analyze-flaky-test.prompt.md
│   │
│   ├── skills/                       ← Reusable agent capabilities
│   │   ├── create-skills/              → Meta-skill (creates new skills)
│   │   ├── create-page-object/         → Scaffold Playwright page objects
│   │   ├── create-screen-object/       → Scaffold Appium screen objects
│   │   ├── create-e2e-web-test/        → Full web test generation
│   │   ├── create-e2e-apps-test/       → Full mobile test generation
│   │   ├── analyze-flaky-test/         → Flaky test investigation
│   │   └── health-check/              → Codebase quality audit
│   │
│   └── workflows/                    ← GitHub Actions CI/CD
│       ├── e2e-web.yml                 → Web test pipeline (multi-browser)
│       └── e2e-mobile.yml             → Mobile test pipeline (Android/iOS)
│
├── features/                         ← Gherkin BDD scenarios (shared)
│   └── signup/
│       └── signup.feature
│
├── automation-web/                   ← Playwright + Cucumber (TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   ├── cucumber.js
│   └── src/
│       ├── config/                     → Environment configuration
│       ├── pages/                      → Page Object Model classes
│       │   ├── base.page.ts              → Base class for all pages
│       │   └── signup.page.ts            → Sign Up page object
│       ├── steps/                      → Cucumber step definitions
│       │   └── signup.steps.ts
│       ├── support/                    → Hooks, World, fixtures
│       │   └── hooks.ts
│       ├── data/                       → Test data factories
│       │   └── test-data.factory.ts
│       └── utils/                      → Logger, helpers
│           └── logger.ts
│
├── automation-apps/                  ← Appium + WebdriverIO + Cucumber (TS)
│   ├── package.json
│   ├── tsconfig.json
│   ├── wdio.conf.ts
│   └── src/
│       ├── config/                     → Device capabilities
│       │   └── capabilities.config.ts
│       ├── screens/                    → Screen Object Model classes
│       │   ├── base.screen.ts            → Base class for all screens
│       │   └── signup.screen.ts          → Sign Up screen object
│       ├── steps/                      → Cucumber step definitions
│       │   └── signup.steps.ts
│       ├── support/                    → Hooks, session management
│       │   ├── hooks.ts
│       │   └── session-manager.ts
│       ├── data/                       → Test data factories
│       │   └── test-data.factory.ts
│       └── utils/                      → Logger, helpers
│           └── logger.ts
│
└── resources/                        ← Shared assets
    └── hydraqa-logo.png
```

---

## 🤖 Agents

Each agent maps to a real QA workflow and has its own skills, prompts, and MCP tool access.

| Agent | Workflow | MCP Tools | Key Skills |
|-------|----------|-----------|------------|
| **🔍 Refinement** | Jira story → Gherkin test scenarios | Atlassian | `generate-test-scenarios` |
| **🧪 Manual Testing** | Guided scripted & exploratory testing | Playwright, Appium | `execute-manual-test`, `explore-feature` |
| **🌐 E2E Web** | Automate web tests with Playwright | Playwright | `create-e2e-web-test`, `create-page-object` |
| **📱 E2E Apps** | Automate mobile tests with Appium | Appium MCP | `create-e2e-apps-test`, `create-screen-object` |
| **🔧 Maintenance** | Stabilize, refactor, evolve the suite | — | `analyze-flaky-test`, `health-check` |

---

## 🔄 QA Workflow Pipeline

```
Jira Story ──▶ Refinement Agent ──▶ .feature file
                                         │
                    ┌────────────────────┤
                    ▼                    ▼
           Manual Testing Agent    E2E Automation Agents
           (scripted / exploratory)  (web / mobile)
                    │                    │
                    ▼                    ▼
              Bug Reports          Automated Tests
              Session Reports      CI/CD Pipeline
                    │                    │
                    └────────┬───────────┘
                             ▼
                    Maintenance Agent
                    (stability, refactoring, health)
```

### Workflow in Practice

1. **Refinement** — The Refinement Agent reads a Jira ticket, analyzes the acceptance criteria, and generates a `.feature` file with comprehensive Gherkin scenarios (happy path, negative, edge cases).

2. **Manual Testing** — Before automation, the Manual Testing Agent guides scripted testing of the feature or runs exploratory sessions to discover issues early.

3. **E2E Automation** — The E2E Web/Apps agents take the `.feature` file and generate the complete automation code: Page/Screen Objects + step definitions.

4. **Maintenance** — The Maintenance Agent continuously monitors the test suite for flaky tests, code quality issues, and improvement opportunities.

---

## 🧩 Skills System

Skills are **reusable capabilities** that agents invoke. Each skill is defined in `.github/skills/<name>/SKILL.md`.

| Skill | Agent | Purpose |
|-------|-------|---------|
| `create-skills` | Meta | Creates new skill definitions (meta-skill) |
| `create-page-object` | E2E Web | Scaffolds a Playwright Page Object class |
| `create-screen-object` | E2E Apps | Scaffolds an Appium Screen Object class |
| `create-e2e-web-test` | E2E Web | Generates complete web test from feature file |
| `create-e2e-apps-test` | E2E Apps | Generates complete mobile test from feature file |
| `analyze-flaky-test` | Maintenance | Investigates and fixes flaky tests |
| `health-check` | Maintenance | Audits codebase quality and patterns |

---

## 🌐 Web Automation (Playwright)

**Stack**: Playwright + Cucumber.js + TypeScript

### Key Patterns
- **Page Object Model** — All pages extend `BasePage` with built-in waits and assertions
- **Selector strategy** — `data-testid` → ARIA roles → CSS (priority order)
- **Tracing** — Automatic trace capture on failure for debugging
- **Multi-browser** — CI runs on Chromium, Firefox, and WebKit in parallel

### Running Tests
```bash
cd automation-web
npm install
npx playwright install

# Run all tests
npm test

# Run with visible browser
npm run test:headed

# Run with Playwright Inspector
npm run test:debug

# Run specific tags
npm run test:tag -- "@smoke"
```

---

## 📱 Mobile Automation (Appium)

**Stack**: Appium + WebdriverIO + Cucumber + TypeScript

### Key Patterns
- **Screen Object Model** — All screens extend `BaseScreen` with cross-platform selectors
- **Selector strategy** — Accessibility IDs → resource-id/predicate → XPath (priority order)
- **Session management** — Automatic health checks, restart on failure, exponential backoff
- **Cross-platform** — Single screen object supports both Android and iOS via `byId()` / `byAccessibilityId()`

### Running Tests
```bash
cd automation-apps
npm install

# Start Appium server (separate terminal)
npx appium

# Run Android tests
npm run test:android

# Run iOS tests
npm run test:ios

# Run specific tags
npm run test:android:tag -- "@smoke"
```

---

## ⚙️ CI/CD

GitHub Actions workflows in `.github/workflows/`:

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `e2e-web.yml` | Push to `main`/`develop`, PR, manual | Runs Playwright tests on 3 browsers in parallel |
| `e2e-mobile.yml` | Manual dispatch | Runs Appium tests on Android emulator or iOS simulator |

Both workflows support:
- Tag-based filtering (`@smoke`, `@regression`)
- Artifact upload (screenshots, traces, reports)
- Environment selection (staging, production)

---

## 🏷️ Tagging Convention

```gherkin
@JIRA-123 @web @signup @smoke
Scenario: User can sign up with valid credentials
```

| Tag Pattern | Purpose |
|-------------|---------|
| `@JIRA-XXX` | Traceability to Jira ticket |
| `@web` / `@mobile` / `@android` / `@ios` | Platform domain |
| `@<component>` | Feature area (signup, checkout, etc.) |
| `@smoke` / `@regression` / `@e2e` | Test suite classification |

---

## 📊 Reporting & Observability

- **Cucumber HTML/JSON** — Built-in report generation for web tests
- **Allure** — Rich reporting for both web and mobile tests
- **Winston Logger** — Structured logging with file and console transports
- **Playwright Traces** — Full interaction replay for failed web tests
- **Screenshots** — Automatic capture on test failure (both platforms)

---

## 🛡️ Best Practices

1. **BDD First** — Write `.feature` files before any automation code
2. **No Hardcoded Waits** — Use explicit waits only (`waitForDisplayed`, `waitFor`)
3. **Thin Steps** — Step definitions delegate to Page/Screen Objects
4. **Unique Test Data** — Use `TestDataFactory.generateUniqueEmail()`, not static values
5. **Traceability** — Every test links to a Jira ticket via `@JIRA-XXX` tag
6. **Cross-Platform** — Use accessibility IDs that work on both Android and iOS
7. **Health Checks** — Run the `health-check` skill regularly to audit code quality

---

## 📄 License

This project is distributed under the [MIT License](LICENSE).
