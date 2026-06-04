/**
 * Hydra QA Framework — Jira Issue Fetcher
 *
 * Calls the Atlassian REST API v3 directly to retrieve a Jira issue
 * and returns its content normalized to plain text.
 *
 * Usage:
 *   node get-jira-issue.mjs <issueKey>
 *
 * Environment:
 *   JIRA_BASE_URL   - Base URL of the Jira Cloud instance (e.g. https://your-org.atlassian.net)
 *   JIRA_EMAIL      - Email address used for Basic Auth
 *   JIRA_API_TOKEN  - Atlassian API token (https://id.atlassian.com/manage-profile/security/api-tokens)
 */

const REQUIRED_ENV = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];

function getEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  return {
    baseUrl: process.env.JIRA_BASE_URL.replace(/\/$/, ''),
    email: process.env.JIRA_EMAIL,
    apiToken: process.env.JIRA_API_TOKEN,
  };
}

function buildAuthHeader(email, apiToken) {
  const credentials = Buffer.from(`${email}:${apiToken}`).toString('base64');
  return `Basic ${credentials}`;
}

async function fetchIssue(baseUrl, authHeader, issueKey) {
  const url = `${baseUrl}/rest/api/3/issue/${issueKey}`;
  const response = await fetch(url, {
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
    },
  });

  if (response.status === 404) {
    throw new Error(`Issue "${issueKey}" was not found. Verify the identifier.`);
  }
  if (response.status === 401 || response.status === 403) {
    throw new Error(`Authentication failed (HTTP ${response.status}). Check JIRA_EMAIL and JIRA_API_TOKEN.`);
  }
  if (!response.ok) {
    throw new Error(`Jira API returned HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Converts an Atlassian Document Format (ADF) node to plain text recursively.
 */
function adfToText(node) {
  if (!node) return '';

  if (typeof node === 'string') return node;

  if (node.type === 'text') return node.text ?? '';

  if (node.type === 'hardBreak') return '\n';

  if (node.type === 'paragraph') {
    const text = (node.content ?? []).map(adfToText).join('');
    return text + '\n';
  }

  if (node.type === 'heading') {
    const text = (node.content ?? []).map(adfToText).join('');
    return `${'#'.repeat(node.attrs?.level ?? 1)} ${text}\n`;
  }

  if (node.type === 'bulletList' || node.type === 'orderedList') {
    return (node.content ?? []).map((item, i) => {
      const text = (item.content ?? []).map(adfToText).join('').trim();
      return node.type === 'orderedList' ? `${i + 1}. ${text}` : `- ${text}`;
    }).join('\n') + '\n';
  }

  if (node.type === 'listItem') {
    return (node.content ?? []).map(adfToText).join('');
  }

  if (node.type === 'blockquote' || node.type === 'codeBlock') {
    return (node.content ?? []).map(adfToText).join('') + '\n';
  }

  if (node.content) {
    return node.content.map(adfToText).join('');
  }

  return '';
}

function extractDescription(fields) {
  const desc = fields.description;
  if (!desc) return '(no description provided)';
  if (typeof desc === 'string') return desc;
  if (desc.type === 'doc') return adfToText(desc).trim();
  return JSON.stringify(desc);
}

/**
 * Looks for acceptance criteria in custom fields and the description body.
 * Returns a plain-text block, or an empty string if none found.
 */
function extractAcceptanceCriteria(fields, descriptionText) {
  // Check common custom field names
  const acFieldKeys = Object.keys(fields).filter((k) => k.startsWith('customfield_'));
  for (const key of acFieldKeys) {
    const value = fields[key];
    if (!value) continue;
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    const lower = str.toLowerCase();
    if (lower.includes('acceptance') || lower.includes('criteria') || lower.includes('definition of done')) {
      return typeof value === 'string' ? value : adfToText(value).trim();
    }
  }

  // Fall back: look for a section in the description
  const acSectionPattern = /(?:acceptance criteria|definition of done|ac)[\s:*_]*([\s\S]+?)(?=\n#{1,3} |\n\n#{1,3} |$)/i;
  const match = descriptionText.match(acSectionPattern);
  if (match) return match[1].trim();

  return '';
}

function normalize(issue) {
  const { key, fields } = issue;

  const summary = fields.summary ?? '(no summary)';
  const issueType = fields.issuetype?.name ?? 'Unknown';
  const priority = fields.priority?.name ?? 'Unknown';
  const status = fields.status?.name ?? 'Unknown';
  const assignee = fields.assignee?.displayName ?? 'Unassigned';
  const labels = (fields.labels ?? []).join(', ') || 'None';
  const components = (fields.components ?? []).map((c) => c.name).join(', ') || 'None';

  const description = extractDescription(fields);
  const acceptanceCriteria = extractAcceptanceCriteria(fields, description);

  return [
    `## Jira Issue: ${key}`,
    '',
    `**Summary:** ${summary}`,
    '',
    `**Type:** ${issueType}`,
    `**Priority:** ${priority}`,
    `**Status:** ${status}`,
    `**Assignee:** ${assignee}`,
    '',
    '**Description:**',
    description,
    '',
    acceptanceCriteria
      ? `**Acceptance Criteria:**\n${acceptanceCriteria}`
      : '**Acceptance Criteria:** (not found — check the issue manually)',
    '',
    `**Labels:** ${labels}`,
    `**Components:** ${components}`,
  ].join('\n');
}

/**
 * Exported function for use by other CI scripts (e.g. run-workflow.mjs).
 * Fetches a Jira issue and returns the normalized plain-text content.
 */
export async function fetchJiraIssue(issueKey) {
  const { baseUrl, email, apiToken } = getEnv();
  const authHeader = buildAuthHeader(email, apiToken);
  const issue = await fetchIssue(baseUrl, authHeader, issueKey);
  return normalize(issue);
}

async function main() {
  const issueKey = process.argv[2];
  if (!issueKey) {
    console.error('Usage: node get-jira-issue.mjs <issueKey>');
    console.error('Example: node get-jira-issue.mjs PROJ-1234');
    process.exit(1);
  }

  const output = await fetchJiraIssue(issueKey);
  process.stdout.write(output + '\n');
}

main().catch((err) => {
  console.error(`❌ Failed to fetch Jira issue: ${err.message}`);
  process.exit(1);
});
