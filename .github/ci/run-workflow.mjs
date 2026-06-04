/**
 * Hydra QA Framework — CI Workflow Runner
 *
 * Orchestrates AI-powered QA workflows via GitHub Models API.
 * The Conductor LLM drives orchestration via tool calling; each subagent
 * is exposed as a tool and invoked by the Conductor as needed.
 *
 * Supports: new-feature-definition, implementation-developed
 *
 * Usage:
 *   node run-workflow.mjs <workflow> [options]
 *
 * Environment:
 *   GITHUB_TOKEN          - GitHub token with Models API access (Copilot subscription)
 *   GITHUB_MODELS_MODEL   - Model to use (default: openai/gpt-4.1)
 *   WORKFLOW_INPUT        - JSON string with workflow-specific inputs
 *   GITHUB_STEP_SUMMARY   - Path to write GitHub Actions job summary (optional)
 */

import OpenAI from 'openai';
import { readFileSync, writeFileSync, appendFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { fetchJiraIssue } from './get-jira-issue.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const GITHUB_MODELS_ENDPOINT = 'https://models.github.ai/inference';
const DEFAULT_MODEL = 'openai/gpt-4.1';
const MAX_CONDUCTOR_ITERATIONS = 10;

// CI-specific conductor prompt: non-interactive, tool-driven orchestration only.
// Intentionally not loaded from conductor.agent.md — that file targets the interactive
// VS Code chat runtime and includes pause points and user confirmations incompatible with CI.
const CI_CONDUCTOR_SYSTEM_PROMPT = `
You are the Conductor, orchestrating QA workflows in CI mode (non-interactive).

CI mode rules:
- Execute end-to-end without pauses or user confirmations.
- Use ONLY the tools provided. Do not reference files, terminals, or external resources.
- After all tools complete, produce a final Markdown summary of the workflow results.

## Workflow: New Feature Definition
1. Call run_refiner with the functional description.
2. Parse the tool result JSON and read the "verdict" field.
3. If verdict is "READY": call run_generator with the refinement output from the "content" field.
4. If verdict is "NOT_READY": report the gaps from the "content" field and stop — do not call run_generator.

## Workflow: Implementation Developed (CI Mode)
1. Manual testing is UNAVAILABLE in CI — skip it entirely.
2. Call run_automator directly with the provided test cases.
`.trim();

// Appended to every subagent system prompt to suppress interactive behavior.
const CI_SUBAGENT_OVERRIDE = `

## CI Mode Constraints
- Do not ask follow-up questions or request user confirmation.
- Do not reference file system operations, terminals, or browser tools.
- Return your complete output immediately in the format defined above.
`.trim();

// --- Subagent tool definitions ---

const SUBAGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'run_refiner',
      description:
        'Run the Refiner subagent to analyze a functional description and validate the Definition of Ready (DoR). Returns a JSON object with "verdict" ("READY" or "NOT_READY") and "content" (full analysis).',
      parameters: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'Functional description or normalized Jira issue content to analyze.',
          },
        },
        required: ['description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_generator',
      description:
        'Run the Generator subagent to produce Gherkin test cases from validated acceptance criteria.',
      parameters: {
        type: 'object',
        properties: {
          refinement_output: {
            type: 'string',
            description: 'Full analysis output from the Refiner subagent (must be READY verdict).',
          },
        },
        required: ['refinement_output'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_automator',
      description:
        'Run the Automator subagent to generate Playwright BDD automation code for the given test cases.',
      parameters: {
        type: 'object',
        properties: {
          test_cases: {
            type: 'string',
            description: 'Test cases to automate in Gherkin or plain text format.',
          },
          environment_url: {
            type: 'string',
            description: 'Target environment URL (optional).',
          },
          setup_instructions: {
            type: 'string',
            description: 'Environment setup instructions (optional).',
          },
        },
        required: ['test_cases'],
      },
    },
  },
];

const TOOL_TO_AGENT = {
  run_refiner: 'refiner-subagent.agent.md',
  run_generator: 'generator-subagent.agent.md',
  run_automator: 'automation-subagent.agent.md',
};

// --- Helpers ---

function getClient() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required. Set a GitHub PAT with Models API access.');
  }
  return new OpenAI({ baseURL: GITHUB_MODELS_ENDPOINT, apiKey: token });
}

function getModel() {
  return process.env.GITHUB_MODELS_MODEL || DEFAULT_MODEL;
}

function loadAgentPrompt(agentFile) {
  const path = resolve(ROOT, '.github/agents', agentFile);
  const content = readFileSync(path, 'utf-8');
  return content.replace(/^---[\s\S]*?---\n/, '').trim();
}

function writeSummary(content) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) appendFileSync(summaryPath, content + '\n');
  console.log(content);
}

// --- Subagent execution ---

async function callSubagent(client, systemPrompt, userMessage) {
  const response = await client.chat.completions.create({
    model: getModel(),
    messages: [
      { role: 'system', content: systemPrompt + '\n\n' + CI_SUBAGENT_OVERRIDE },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 8000,
  });
  return response.choices[0].message.content;
}

async function executeTool(client, toolName, args) {
  if (!TOOL_TO_AGENT[toolName]) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  const systemPrompt = loadAgentPrompt(TOOL_TO_AGENT[toolName]);
  const userMessage = Object.entries(args)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `## ${k}\n${v}`)
    .join('\n\n');

  const output = await callSubagent(client, systemPrompt, userMessage);

  // Refiner returns structured JSON so the Conductor can branch on verdict reliably.
  if (toolName === 'run_refiner') {
    const isReady = /refinement result:\s*ready/i.test(output);
    return JSON.stringify({ verdict: isReady ? 'READY' : 'NOT_READY', content: output });
  }

  return output;
}

// --- Conductor agentic loop ---

async function runConductorLoop(client, workflowMessage) {
  const messages = [
    { role: 'system', content: CI_CONDUCTOR_SYSTEM_PROMPT },
    { role: 'user', content: workflowMessage },
  ];

  const toolResults = [];

  for (let iteration = 0; iteration < MAX_CONDUCTOR_ITERATIONS; iteration++) {
    const response = await client.chat.completions.create({
      model: getModel(),
      messages,
      tools: SUBAGENT_TOOLS,
      tool_choice: 'auto',
      temperature: 0.3,
      max_tokens: 8000,
    });

    const message = response.choices[0].message;
    messages.push(message);

    if (!message.tool_calls?.length) {
      return { output: message.content, toolResults };
    }

    for (const toolCall of message.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments);
      writeSummary(`\n> 🔧 Invoking: **${toolCall.function.name}**\n`);

      let result;
      try {
        result = await executeTool(client, toolCall.function.name, args);
      } catch (err) {
        result = JSON.stringify({ ok: false, error: err.message });
      }

      // Write readable content to the summary (unwrap structured JSON if present).
      try {
        const parsed = JSON.parse(result);
        writeSummary(parsed.content ?? result);
      } catch {
        writeSummary(result);
      }

      toolResults.push({ tool: toolCall.function.name, args, result });
      messages.push({ role: 'tool', tool_call_id: toolCall.id, content: result });
    }
  }

  throw new Error(`Conductor loop exceeded maximum iterations (${MAX_CONDUCTOR_ITERATIONS}).`);
}

// --- Workflow entry point ---

function buildWorkflowMessage(workflowName, input) {
  switch (workflowName) {
    case 'new-feature-definition': {
      if (!input.description) {
        throw new Error('Input "description" is required for new-feature-definition workflow.');
      }
      return ['## Workflow: New Feature Definition', '', '## Functional Description', input.description].join('\n');
    }
    case 'implementation-developed': {
      if (!input.testCases) {
        throw new Error('Input "testCases" is required for implementation-developed workflow.');
      }
      return [
        '## Workflow: Implementation Developed',
        '',
        '## Test Cases',
        input.testCases,
        input.environmentUrl ? `\n## Environment URL\n${input.environmentUrl}` : '',
        input.setupInstructions ? `\n## Setup Instructions\n${input.setupInstructions}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    }
    default:
      throw new Error(`Unknown workflow: ${workflowName}. Use: new-feature-definition, implementation-developed`);
  }
}

async function runWorkflow(client, workflowName, input) {
  writeSummary(`## Workflow: ${workflowName}\n`);

  // Jira pre-fetch must happen in JS — the LLM cannot run shell commands in CI.
  if (workflowName === 'new-feature-definition' && /^[A-Z]+-\d+$/.test(input.description?.trim())) {
    writeSummary(`### Fetching Jira Issue: ${input.description.trim()}\n`);
    input = { ...input, description: await fetchJiraIssue(input.description.trim()) };
    writeSummary('Issue fetched and normalized.\n');
  }

  const workflowMessage = buildWorkflowMessage(workflowName, input);
  const { output, toolResults } = await runConductorLoop(client, workflowMessage);

  writeSummary('\n### Status: COMPLETED\n');
  if (output) writeSummary(output);

  return { workflow: workflowName, status: 'completed', output, toolResults };
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
  const result = await runWorkflow(client, workflow, input);

  const outputPath = process.env.WORKFLOW_OUTPUT || resolve(__dirname, 'output.json');
  writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\nResult written to: ${outputPath}`);
}

main().catch((err) => {
  console.error('❌ Workflow failed:', err.message);
  process.exit(1);
});
