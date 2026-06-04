/**
 * Hydra QA Framework — CI Workflow Runner
 *
 * Orchestrates AI-powered QA workflows via GitHub Models API.
 * Supports: new-feature-definition, implementation-developed
 *
 * Usage:
 *   node run-workflow.mjs <workflow> [options]
 *
 * Environment:
 *   GITHUB_TOKEN          - GitHub token with Models API access (Copilot subscription)
 *   GITHUB_MODELS_MODEL   - Model to use (default: openai/gpt-4.1)
 *   WORKFLOW_INPUT         - JSON string with workflow-specific inputs
 *   GITHUB_STEP_SUMMARY   - Path to write GitHub Actions job summary (optional)
 */

import OpenAI from 'openai';
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { fetchJiraIssue } from './get-jira-issue.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const GITHUB_MODELS_ENDPOINT = 'https://models.github.ai/inference';
const DEFAULT_MODEL = 'openai/gpt-4.1';

function getClient() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required. Set a GitHub PAT with Models API access.');
  }
  return new OpenAI({
    baseURL: GITHUB_MODELS_ENDPOINT,
    apiKey: token,
  });
}

function getModel() {
  return process.env.GITHUB_MODELS_MODEL || DEFAULT_MODEL;
}

function loadAgentPrompt(agentFile) {
  const path = resolve(ROOT, '.github/agents', agentFile);
  const content = readFileSync(path, 'utf-8');
  // Strip YAML frontmatter
  return content.replace(/^---[\s\S]*?---\n/, '').trim();
}

function writeSummary(content) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    appendFileSync(summaryPath, content + '\n');
  }
  console.log(content);
}

async function callModel(client, systemPrompt, userMessage) {
  const model = getModel();
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 8000,
  });
  return response.choices[0].message.content;
}

// --- Workflow: New Feature Definition ---

async function runNewFeatureDefinition(client, input) {
  let { description } = input;
  if (!description) {
    throw new Error('Input "description" is required for new-feature-definition workflow.');
  }

  writeSummary('## Workflow: New Feature Definition\n');

  // If input looks like a Jira key (e.g. PROJ-1234), fetch the issue first
  if (/^[A-Z]+-\d+$/.test(description.trim())) {
    writeSummary(`### Fetching Jira Issue: ${description.trim()}\n`);
    description = await fetchJiraIssue(description.trim());
    writeSummary('Issue fetched and normalized.\n');
  }

  writeSummary('### Step 1: Functional Refinement\n');

  // Step 1: Refiner
  const refinerPrompt = loadAgentPrompt('refiner-subagent.agent.md');
  const refinerResult = await callModel(client, refinerPrompt, description);

  writeSummary(refinerResult);

  // Check if DoR is READY
  const isReady = /refinement result:\s*ready/i.test(refinerResult);

  if (!isReady) {
    writeSummary('\n### Status: NOT READY\n');
    writeSummary('The requirement does not meet the Definition of Ready. Review the gaps above and update the requirements.\n');
    return { status: 'not_ready', refinerResult, generatorResult: null };
  }

  // Step 2: Generator
  writeSummary('\n### Step 2: Test Case Generation\n');

  const generatorPrompt = loadAgentPrompt('generator-subagent.agent.md');
  const generatorInput = `Based on the following refinement output, generate a comprehensive test suite.\n\n${refinerResult}`;
  const generatorResult = await callModel(client, generatorPrompt, generatorInput);

  writeSummary(generatorResult);
  writeSummary('\n### Status: COMPLETED\n');

  return { status: 'ready', refinerResult, generatorResult };
}

// --- Workflow: Implementation Developed ---

async function runImplementationDeveloped(client, input) {
  const { testCases, environmentUrl, setupInstructions } = input;
  if (!testCases) {
    throw new Error('Input "testCases" is required for implementation-developed workflow.');
  }

  writeSummary('## Workflow: Implementation Developed (CI Mode)\n');
  writeSummary('> **Note:** In CI mode, manual testing is skipped. The workflow proceeds directly to automation.\n');

  // In CI mode, we skip manual testing (requires interactive browser)
  // and go directly to automation code generation
  writeSummary('### Step 1: Automation Code Generation\n');

  const automatorPrompt = loadAgentPrompt('automation-subagent.agent.md');
  const automatorInput = [
    'Generate automated E2E tests for the following test cases.',
    '',
    '## Test Cases',
    testCases,
    '',
    environmentUrl ? `## Environment URL\n${environmentUrl}` : '',
    setupInstructions ? `## Setup Instructions\n${setupInstructions}` : '',
    '',
    '## Instructions',
    '- Follow the Page Object Model pattern.',
    '- Use playwright-bdd with Gherkin feature files.',
    '- Output the full code for each file that needs to be created or modified.',
    '- Use semantic locators (getByRole, getByLabel, getByText).',
  ].filter(Boolean).join('\n');

  const automatorResult = await callModel(client, automatorPrompt, automatorInput);

  writeSummary(automatorResult);
  writeSummary('\n### Status: COMPLETED\n');
  writeSummary('Review the generated automation code above and apply changes to the repository.\n');

  return { status: 'completed', automatorResult };
}

// --- Main ---

async function main() {
  const workflow = process.argv[2];
  if (!workflow) {
    console.error('Usage: node run-workflow.mjs <workflow>');
    console.error('Workflows: new-feature-definition, implementation-developed');
    process.exit(1);
  }

  const inputRaw = process.env.WORKFLOW_INPUT || '{}';
  let input;
  try {
    input = JSON.parse(inputRaw);
  } catch {
    throw new Error(`Invalid WORKFLOW_INPUT JSON: ${inputRaw}`);
  }

  const client = getClient();

  let result;
  switch (workflow) {
    case 'new-feature-definition':
      result = await runNewFeatureDefinition(client, input);
      break;
    case 'implementation-developed':
      result = await runImplementationDeveloped(client, input);
      break;
    default:
      throw new Error(`Unknown workflow: ${workflow}. Use: new-feature-definition, implementation-developed`);
  }

  // Write result as JSON for downstream steps
  const outputPath = process.env.WORKFLOW_OUTPUT || resolve(__dirname, 'output.json');
  writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\nResult written to: ${outputPath}`);
}

main().catch((err) => {
  console.error('❌ Workflow failed:', err.message);
  process.exit(1);
});
