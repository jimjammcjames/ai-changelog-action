import {
  ChangelogEntry,
  ChangelogResult,
  CategoryConfig,
  ActionInputs,
} from './types';
import {
  getCategoryLabel,
  groupByCategory,
  groupByScope,
  groupByDate,
} from './categorizer';

export function formatChangelog(
  entries: ChangelogEntry[],
  inputs: ActionInputs,
  version: string,
  repoUrl: string | null,
  range: string,
): ChangelogResult {
  const lines: string[] = [];

  // Header
  lines.push(inputs.header);
  lines.push('');

  // Version heading
  const date = new Date().toISOString().split('T')[0];
  lines.push(`## ${version} (${date})`);
  lines.push('');

  // Compare link
  if (inputs.includeCompareLink && repoUrl && range.includes('..')) {
    const [from, to] = range.split('..');
    lines.push(`[Full diff](${repoUrl}/compare/${from}...${to || 'HEAD'})`);
    lines.push('');
  }

  if (entries.length === 0) {
    lines.push('_No notable changes in this release._');
    const categoriesFound: string[] = [];
    return {
      markdown: lines.join('\n'),
      version,
      commitCount: 0,
      categoriesFound,
    };
  }

  // Group entries
  let groups: Map<string, ChangelogEntry[]>;
  switch (inputs.groupBy) {
    case 'scope':
      groups = groupByScope(entries);
      break;
    case 'date':
      groups = groupByDate(entries);
      break;
    default:
      groups = groupByCategory(entries);
  }

  const categoriesFound: string[] = [];

  for (const [key, groupEntries] of groups) {
    const label = inputs.groupBy === 'category'
      ? (key === '💥 Breaking Changes' ? key : getCategoryLabel(key, inputs.categories))
      : key;

    categoriesFound.push(label);
    lines.push(`### ${label}`);
    lines.push('');

    for (const entry of groupEntries) {
      let line = '- ';

      if (entry.scope && inputs.groupBy !== 'scope') {
        line += `**${entry.scope}:** `;
      }

      line += entry.description;

      // PR link
      if (entry.prNumber && inputs.includePrLinks && repoUrl) {
        line += ` ([#${entry.prNumber}](${repoUrl}/pull/${entry.prNumber}))`;
      }

      // Commit hash
      if (repoUrl) {
        line += ` ([${entry.shortHash}](${repoUrl}/commit/${entry.hash}))`;
      } else {
        line += ` (${entry.shortHash})`;
      }

      // Author
      if (inputs.includeAuthors) {
        line += ` — @${entry.author}`;
      }

      lines.push(line);
    }

    lines.push('');
  }

  return {
    markdown: lines.join('\n'),
    version,
    commitCount: entries.length,
    categoriesFound,
  };
}
