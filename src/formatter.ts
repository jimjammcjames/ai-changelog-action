import {
  ChangelogEntry,
  ChangelogResult,
  ChangelogJSON,
  CategoryConfig,
  ActionInputs,
} from './types';
import {
  getCategoryLabel,
  groupByCategory,
  groupByScope,
  groupByDate,
} from './categorizer';

function buildGroups(entries: ChangelogEntry[], inputs: ActionInputs): Map<string, ChangelogEntry[]> {
  switch (inputs.groupBy) {
    case 'scope':
      return groupByScope(entries);
    case 'date':
      return groupByDate(entries);
    default:
      return groupByCategory(entries);
  }
}

function resolveLabel(key: string, inputs: ActionInputs): string {
  return inputs.groupBy === 'category'
    ? (key === '💥 Breaking Changes' ? key : getCategoryLabel(key, inputs.categories))
    : key;
}

export function formatChangelog(
  entries: ChangelogEntry[],
  inputs: ActionInputs,
  version: string,
  repoUrl: string | null,
  range: string,
): ChangelogResult {
  const markdown = formatMarkdown(entries, inputs, version, repoUrl, range);
  const groups = buildGroups(entries, inputs);
  const categoriesFound = [...groups.keys()].map(k => resolveLabel(k, inputs));

  const result: ChangelogResult = {
    markdown,
    version,
    commitCount: entries.length,
    categoriesFound,
  };

  const format = inputs.outputFormat || 'markdown';
  if (format === 'json' || format === 'html') {
    result.json = formatJSON(entries, inputs, version, groups);
  }
  if (format === 'html') {
    result.html = formatHTML(entries, inputs, version, repoUrl, range, groups);
  }

  return result;
}

function formatMarkdown(
  entries: ChangelogEntry[],
  inputs: ActionInputs,
  version: string,
  repoUrl: string | null,
  range: string,
): string {
  const lines: string[] = [];

  lines.push(inputs.header);
  lines.push('');

  const date = new Date().toISOString().split('T')[0];
  lines.push(`## ${version} (${date})`);
  lines.push('');

  if (inputs.includeCompareLink && repoUrl && range.includes('..')) {
    const [from, to] = range.split('..');
    lines.push(`[Full diff](${repoUrl}/compare/${from}...${to || 'HEAD'})`);
    lines.push('');
  }

  if (entries.length === 0) {
    lines.push('_No notable changes in this release._');
    return lines.join('\n');
  }

  const groups = buildGroups(entries, inputs);

  for (const [key, groupEntries] of groups) {
    const label = resolveLabel(key, inputs);

    lines.push(`### ${label}`);
    lines.push('');

    for (const entry of groupEntries) {
      let line = '- ';

      if (entry.scope && inputs.groupBy !== 'scope') {
        line += `**${entry.scope}:** `;
      }

      line += entry.description;

      if (entry.prNumber && inputs.includePrLinks && repoUrl) {
        line += ` ([#${entry.prNumber}](${repoUrl}/pull/${entry.prNumber}))`;
      }

      if (repoUrl) {
        line += ` ([${entry.shortHash}](${repoUrl}/commit/${entry.hash}))`;
      } else {
        line += ` (${entry.shortHash})`;
      }

      if (inputs.includeAuthors) {
        line += ` — @${entry.author}`;
      }

      lines.push(line);
    }

    lines.push('');
  }

  return lines.join('\n');
}

export function formatJSON(
  entries: ChangelogEntry[],
  inputs: ActionInputs,
  version: string,
  groups?: Map<string, ChangelogEntry[]>,
): ChangelogJSON {
  const resolvedGroups = groups || buildGroups(entries, inputs);
  const date = new Date().toISOString().split('T')[0];

  const sections = [...resolvedGroups.entries()].map(([key, groupEntries]) => ({
    category: resolveLabel(key, inputs),
    entries: groupEntries,
  }));

  return {
    version,
    date,
    sections,
    commitCount: entries.length,
  };
}

export function formatHTML(
  entries: ChangelogEntry[],
  inputs: ActionInputs,
  version: string,
  repoUrl: string | null,
  range: string,
  groups?: Map<string, ChangelogEntry[]>,
): string {
  const resolvedGroups = groups || buildGroups(entries, inputs);
  const date = new Date().toISOString().split('T')[0];
  const lines: string[] = [];

  lines.push('<!DOCTYPE html>');
  lines.push('<html lang="en"><head><meta charset="UTF-8">');
  lines.push(`<title>Changelog ${esc(version)}</title>`);
  lines.push('<style>body{font-family:system-ui,sans-serif;max-width:48rem;margin:2rem auto;padding:0 1rem;color:#1a1a1a}h1{border-bottom:2px solid #eee;padding-bottom:.5rem}h2{color:#333}h3{color:#555}ul{padding-left:1.5rem}li{margin:.25rem 0}a{color:#0969da}.scope{font-weight:700}.author{color:#666;font-size:.9em}.breaking{color:#d1242f;font-weight:700}</style>');
  lines.push('</head><body>');
  lines.push(`<h1>${esc(inputs.header.replace(/^#\s*/, ''))}</h1>`);
  lines.push(`<h2>${esc(version)} <small>(${esc(date)})</small></h2>`);

  if (inputs.includeCompareLink && repoUrl && range.includes('..')) {
    const [from, to] = range.split('..');
    lines.push(`<p><a href="${esc(repoUrl)}/compare/${esc(from)}...${esc(to || 'HEAD')}">Full diff</a></p>`);
  }

  if (entries.length === 0) {
    lines.push('<p><em>No notable changes in this release.</em></p>');
  } else {
    for (const [key, groupEntries] of resolvedGroups) {
      const label = resolveLabel(key, inputs);
      lines.push(`<h3>${esc(label)}</h3>`);
      lines.push('<ul>');

      for (const entry of groupEntries) {
        let li = '';
        if (entry.scope && inputs.groupBy !== 'scope') {
          li += `<span class="scope">${esc(entry.scope)}:</span> `;
        }
        li += esc(entry.description);

        if (entry.prNumber && inputs.includePrLinks && repoUrl) {
          li += ` (<a href="${esc(repoUrl)}/pull/${esc(entry.prNumber)}">#${esc(entry.prNumber)}</a>)`;
        }
        if (repoUrl) {
          li += ` (<a href="${esc(repoUrl)}/commit/${esc(entry.hash)}">${esc(entry.shortHash)}</a>)`;
        } else {
          li += ` (${esc(entry.shortHash)})`;
        }
        if (inputs.includeAuthors) {
          li += ` <span class="author">— @${esc(entry.author)}</span>`;
        }

        lines.push(`<li>${li}</li>`);
      }

      lines.push('</ul>');
    }
  }

  lines.push('</body></html>');
  return lines.join('\n');
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
