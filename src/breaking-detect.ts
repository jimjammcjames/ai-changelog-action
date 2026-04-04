import { ParsedCommit } from './types';

export interface BreakingChange {
  hash: string;
  shortHash: string;
  author: string;
  description: string;
  scope: string;
  reason: string;
}

export interface BreakingChangeReport {
  hasBreakingChanges: boolean;
  changes: BreakingChange[];
  summary: string;
}

const BREAKING_INDICATORS = [
  { pattern: /BREAKING[ -]CHANGE/i, reason: 'Conventional commit BREAKING CHANGE footer' },
  { pattern: /\bremove[ds]?\b.*\b(api|endpoint|method|function|class|interface|param|field|column)\b/i, reason: 'Removal of public API surface' },
  { pattern: /\b(api|endpoint|method|function|class|interface|param|field|column)\b.*\bremove[ds]?\b/i, reason: 'Removal of public API surface' },
  { pattern: /\brename[ds]?\b.*\b(api|endpoint|method|function|class|interface|param|field|column)\b/i, reason: 'Rename of public API surface' },
  { pattern: /\b(api|endpoint|method|function|class|interface|param|field|column)\b.*\brename[ds]?\b/i, reason: 'Rename of public API surface' },
  { pattern: /\bmigrat(e|ion|ing)\b/i, reason: 'Migration required' },
  { pattern: /\bdeprecate[ds]?\b/i, reason: 'Deprecation notice' },
  { pattern: /\bdrop(ped|s)?\s+(support|compatibility)\b/i, reason: 'Dropped compatibility' },
  { pattern: /\bbackward[s]?\s*(in)?compatible\b/i, reason: 'Backward compatibility change' },
  { pattern: /\bminimum\s+(version|requirement)\b/i, reason: 'Minimum version requirement change' },
];

export function detectBreakingChanges(commits: ParsedCommit[]): BreakingChangeReport {
  const changes: BreakingChange[] = [];

  for (const commit of commits) {
    // Already flagged as breaking by conventional commit parser
    if (commit.breaking) {
      changes.push({
        hash: commit.hash,
        shortHash: commit.shortHash,
        author: commit.author,
        description: commit.description,
        scope: commit.scope,
        reason: commit.body.includes('BREAKING CHANGE') || commit.body.includes('BREAKING-CHANGE')
          ? 'Conventional commit BREAKING CHANGE footer'
          : 'Conventional commit breaking indicator (!)',
      });
      continue;
    }

    // Scan subject and body for breaking indicators
    const textToScan = `${commit.subject} ${commit.body}`;
    for (const indicator of BREAKING_INDICATORS) {
      if (indicator.pattern.test(textToScan)) {
        changes.push({
          hash: commit.hash,
          shortHash: commit.shortHash,
          author: commit.author,
          description: commit.description,
          scope: commit.scope,
          reason: indicator.reason,
        });
        break;
      }
    }
  }

  const summary = changes.length === 0
    ? 'No breaking changes detected.'
    : `Found ${changes.length} potential breaking change${changes.length > 1 ? 's' : ''}: ${changes.map(c => c.shortHash).join(', ')}`;

  return {
    hasBreakingChanges: changes.length > 0,
    changes,
    summary,
  };
}
