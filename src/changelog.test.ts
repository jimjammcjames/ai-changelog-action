import { parseCommits } from '../src/git';
import { categorizeCommits, groupByCategory, DEFAULT_CATEGORIES } from '../src/categorizer';
import { formatChangelog } from '../src/formatter';
import { ActionInputs, CategoryConfig } from '../src/types';

const SAMPLE_LOG = `---COMMIT-DELIMITER---abc1234567890|abc1234|Alice|2026-04-01T10:00:00Z|feat(auth): add OAuth2 login support (#42)|
---COMMIT-DELIMITER---def4567890123|def4567|Bob|2026-04-01T09:00:00Z|fix: resolve crash on empty input|BREAKING CHANGE: input validation now throws
---COMMIT-DELIMITER---ghi7890123456|ghi7890|Charlie|2026-03-31T15:00:00Z|docs: update API reference|
---COMMIT-DELIMITER---jkl0123456789|jkl0123|Alice|2026-03-31T14:00:00Z|chore: bump dependencies|
---COMMIT-DELIMITER---mno3456789012|mno3456|Dave|2026-03-30T12:00:00Z|Add dark mode toggle (#38)|`;

function makeInputs(overrides: Partial<ActionInputs> = {}): ActionInputs {
  return {
    mode: 'conventional',
    aiProvider: 'openai',
    aiApiKey: '',
    aiModel: 'gpt-4o-mini',
    output: 'stdout',
    changelogPath: 'CHANGELOG.md',
    includeRange: '',
    categories: {},
    groupBy: 'category',
    includeAuthors: true,
    includePrLinks: true,
    includeCompareLink: true,
    version: 'v1.0.0',
    header: '# Changelog',
    excludeTypes: [],
    maxCommits: 500,
    ...overrides,
  };
}

describe('parseCommits', () => {
  it('parses conventional commits correctly', () => {
    const commits = parseCommits(SAMPLE_LOG);
    expect(commits).toHaveLength(5);

    expect(commits[0].type).toBe('feat');
    expect(commits[0].scope).toBe('auth');
    expect(commits[0].description).toBe('add OAuth2 login support (#42)');
    expect(commits[0].author).toBe('Alice');
    expect(commits[0].prNumber).toBe('42');
  });

  it('detects breaking changes from body', () => {
    const commits = parseCommits(SAMPLE_LOG);
    expect(commits[1].breaking).toBe(true);
    expect(commits[1].type).toBe('fix');
  });

  it('heuristically categorizes non-conventional commits', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const darkMode = commits[4];
    expect(darkMode.type).toBe('feat'); // "Add" heuristic
    expect(darkMode.prNumber).toBe('38');
  });

  it('handles empty log', () => {
    const commits = parseCommits('');
    expect(commits).toHaveLength(0);
  });
});

describe('categorizeCommits', () => {
  it('excludes specified types', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, ['chore', 'docs']);
    expect(entries.every(e => e.type !== 'chore' && e.type !== 'docs')).toBe(true);
    expect(entries.length).toBe(3);
  });

  it('preserves all entries when no exclusions', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    expect(entries.length).toBe(5);
  });
});

describe('groupByCategory', () => {
  it('groups breaking changes separately', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const groups = groupByCategory(entries);
    expect(groups.has('💥 Breaking Changes')).toBe(true);
    expect(groups.get('💥 Breaking Changes')!.length).toBe(1);
  });
});

describe('formatChangelog', () => {
  it('generates valid markdown', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const inputs = makeInputs();
    const result = formatChangelog(
      entries,
      inputs,
      'v1.0.0',
      'https://github.com/test/repo',
      'v0.9.0..v1.0.0',
    );

    expect(result.markdown).toContain('# Changelog');
    expect(result.markdown).toContain('## v1.0.0');
    expect(result.markdown).toContain('### 💥 Breaking Changes');
    expect(result.markdown).toContain('### ✨ Features');
    expect(result.markdown).toContain('OAuth2');
    expect(result.markdown).toContain('[Full diff]');
    expect(result.commitCount).toBe(5);
    expect(result.categoriesFound.length).toBeGreaterThan(0);
  });

  it('handles empty entries', () => {
    const inputs = makeInputs();
    const result = formatChangelog([], inputs, 'v1.0.0', null, 'HEAD');
    expect(result.markdown).toContain('No notable changes');
    expect(result.commitCount).toBe(0);
  });

  it('respects custom categories', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, { feat: '🚀 New Stuff' }, []);
    const inputs = makeInputs({ categories: { feat: '🚀 New Stuff' } });
    const result = formatChangelog(entries, inputs, 'v1.0.0', null, 'HEAD');
    expect(result.markdown).toContain('🚀 New Stuff');
  });

  it('excludes authors when disabled', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const inputs = makeInputs({ includeAuthors: false });
    const result = formatChangelog(entries, inputs, 'v1.0.0', null, 'HEAD');
    expect(result.markdown).not.toContain('— @Alice');
  });
});
