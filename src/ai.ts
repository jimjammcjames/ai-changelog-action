import * as https from 'https';
import * as http from 'http';
import { ParsedCommit, ChangelogEntry } from './types';

interface AIResponse {
  entries: ChangelogEntry[];
}

function httpRequest(url: string, options: https.RequestOptions, body: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function buildPrompt(commits: ParsedCommit[]): string {
  const commitList = commits.map(c =>
    `- ${c.hash.slice(0, 7)} | ${c.subject}${c.body ? ' | ' + c.body.slice(0, 200) : ''}`
  ).join('\n');

  return `You are a changelog writer. Given the following git commits, produce a structured JSON changelog.

For each commit, determine:
1. "type": one of feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, other
2. "scope": the component/area affected (empty string if unclear)
3. "description": a clear, user-friendly one-line description
4. "breaking": true/false

Return ONLY valid JSON array. Each object: {"hash","shortHash","type","scope","description","author","date","breaking","prNumber"}

Commits:
${commitList}

Respond with only the JSON array, no markdown fences or extra text.`;
}

export async function enhanceWithAI(
  commits: ParsedCommit[],
  provider: 'openai' | 'anthropic',
  apiKey: string,
  model: string,
): Promise<ChangelogEntry[]> {
  const prompt = buildPrompt(commits);

  let responseText: string;

  if (provider === 'openai') {
    const body = JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000,
    });

    responseText = await httpRequest('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    }, body);

    const parsed = JSON.parse(responseText);
    const content = parsed.choices?.[0]?.message?.content || '[]';
    return JSON.parse(content);

  } else if (provider === 'anthropic') {
    const body = JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    responseText = await httpRequest('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    }, body);

    const parsed = JSON.parse(responseText);
    const content = parsed.content?.[0]?.text || '[]';
    return JSON.parse(content);

  } else {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
