import { ParsedCommit, ChangelogEntry, CategoryConfig } from './types';

const DEFAULT_CATEGORIES: CategoryConfig = {
  feat: '✨ Features',
  fix: '🐛 Bug Fixes',
  docs: '📚 Documentation',
  style: '💅 Styling',
  refactor: '♻️ Refactoring',
  perf: '⚡ Performance',
  test: '✅ Tests',
  build: '📦 Build',
  ci: '🔧 CI/CD',
  chore: '🧹 Chores',
  revert: '⏪ Reverts',
  other: '📝 Other Changes',
};

export function categorizeCommits(
  commits: ParsedCommit[],
  customCategories: CategoryConfig,
  excludeTypes: string[],
): ChangelogEntry[] {
  const categories = { ...DEFAULT_CATEGORIES, ...customCategories };
  const excluded = new Set(excludeTypes.map(t => t.trim().toLowerCase()));

  return commits
    .filter(c => !excluded.has(c.type))
    .map(commit => ({
      type: commit.type,
      scope: commit.scope,
      description: commit.description,
      hash: commit.hash,
      shortHash: commit.shortHash,
      author: commit.author,
      date: commit.date,
      breaking: commit.breaking,
      prNumber: commit.prNumber,
    }));
}

export function getCategoryLabel(type: string, customCategories: CategoryConfig): string {
  const categories = { ...DEFAULT_CATEGORIES, ...customCategories };
  return categories[type] || categories['other'] || '📝 Other Changes';
}

export function groupByCategory(entries: ChangelogEntry[]): Map<string, ChangelogEntry[]> {
  const groups = new Map<string, ChangelogEntry[]>();

  // Breaking changes first
  const breaking = entries.filter(e => e.breaking);
  if (breaking.length > 0) {
    groups.set('💥 Breaking Changes', breaking);
  }

  // Then by type
  for (const entry of entries) {
    if (entry.breaking) continue; // already in breaking section
    const existing = groups.get(entry.type) || [];
    existing.push(entry);
    groups.set(entry.type, existing);
  }

  return groups;
}

export function groupByScope(entries: ChangelogEntry[]): Map<string, ChangelogEntry[]> {
  const groups = new Map<string, ChangelogEntry[]>();

  for (const entry of entries) {
    const key = entry.scope || 'general';
    const existing = groups.get(key) || [];
    existing.push(entry);
    groups.set(key, existing);
  }

  return groups;
}

export function groupByDate(entries: ChangelogEntry[]): Map<string, ChangelogEntry[]> {
  const groups = new Map<string, ChangelogEntry[]>();

  for (const entry of entries) {
    const date = entry.date.split('T')[0];
    const existing = groups.get(date) || [];
    existing.push(entry);
    groups.set(date, existing);
  }

  return groups;
}

export { DEFAULT_CATEGORIES };
