import { parseCommits } from '../src/git';
import { categorizeCommits, groupByCategory, groupByScope, groupByDate, DEFAULT_CATEGORIES } from '../src/categorizer';
import { formatChangelog, formatJSON, formatHTML } from '../src/formatter';
import { ActionInputs, CategoryConfig } from '../src/types';
import { validateLicense, LicenseValidation } from '../src/license';
import { detectBreakingChanges } from '../src/breaking-detect';
import { recommendVersion, parseSemver, bumpVersion } from '../src/version-recommend';

jest.mock('https');

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
    outputFormat: 'markdown',
    licenseKey: '',
    polarOrgId: '',
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

  it('parses breaking bang indicator', () => {
    const log = '---COMMIT-DELIMITER---aaa1111111111|aaa1111|Zoe|2026-01-01T00:00:00Z|feat(api)!: redesign endpoints|';
    const commits = parseCommits(log);
    expect(commits[0].breaking).toBe(true);
    expect(commits[0].type).toBe('feat');
    expect(commits[0].scope).toBe('api');
  });

  it('categorizes refactor heuristic', () => {
    const log = '---COMMIT-DELIMITER---bbb2222222222|bbb2222|Zoe|2026-01-01T00:00:00Z|Refactor database layer|';
    const commits = parseCommits(log);
    expect(commits[0].type).toBe('refactor');
  });

  it('categorizes test heuristic', () => {
    const log = '---COMMIT-DELIMITER---ccc3333333333|ccc3333|Zoe|2026-01-01T00:00:00Z|Test coverage for auth module|';
    const commits = parseCommits(log);
    expect(commits[0].type).toBe('test');
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

  it('maps commit fields correctly to entries', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const first = entries[0];
    expect(first.type).toBe('feat');
    expect(first.scope).toBe('auth');
    expect(first.author).toBe('Alice');
    expect(first.hash).toBe('abc1234567890');
    expect(first.shortHash).toBe('abc1234');
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

  it('does not duplicate breaking entries in their type group', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const groups = groupByCategory(entries);
    const fixGroup = groups.get('fix');
    // The breaking "fix" commit should not appear in the fix group
    expect(fixGroup).toBeUndefined();
  });
});

describe('groupByScope', () => {
  it('groups entries by scope', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const groups = groupByScope(entries);
    expect(groups.has('auth')).toBe(true);
    expect(groups.has('general')).toBe(true);
  });
});

describe('groupByDate', () => {
  it('groups entries by date', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const groups = groupByDate(entries);
    expect(groups.has('2026-04-01')).toBe(true);
    expect(groups.has('2026-03-31')).toBe(true);
    expect(groups.has('2026-03-30')).toBe(true);
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

  it('omits compare link when disabled', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const inputs = makeInputs({ includeCompareLink: false });
    const result = formatChangelog(entries, inputs, 'v1.0.0', 'https://github.com/test/repo', 'v0.9.0..v1.0.0');
    expect(result.markdown).not.toContain('[Full diff]');
  });

  it('omits PR links when disabled', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const inputs = makeInputs({ includePrLinks: false });
    const result = formatChangelog(entries, inputs, 'v1.0.0', 'https://github.com/test/repo', 'v0.9.0..v1.0.0');
    expect(result.markdown).not.toContain('[#42]');
  });
});

describe('formatJSON', () => {
  it('produces valid JSON structure', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const inputs = makeInputs({ outputFormat: 'json' });
    const json = formatJSON(entries, inputs, 'v1.0.0');

    expect(json.version).toBe('v1.0.0');
    expect(json.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(json.commitCount).toBe(5);
    expect(json.sections.length).toBeGreaterThan(0);
    expect(json.sections[0]).toHaveProperty('category');
    expect(json.sections[0]).toHaveProperty('entries');
  });

  it('includes breaking changes section', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const inputs = makeInputs({ outputFormat: 'json' });
    const json = formatJSON(entries, inputs, 'v1.0.0');

    const breakingSection = json.sections.find(s => s.category.includes('Breaking'));
    expect(breakingSection).toBeDefined();
    expect(breakingSection!.entries.length).toBe(1);
  });

  it('handles empty entries', () => {
    const inputs = makeInputs({ outputFormat: 'json' });
    const json = formatJSON([], inputs, 'v1.0.0');
    expect(json.commitCount).toBe(0);
    expect(json.sections).toHaveLength(0);
  });
});

describe('formatHTML', () => {
  it('produces valid HTML', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const inputs = makeInputs({ outputFormat: 'html' });
    const html = formatHTML(entries, inputs, 'v1.0.0', 'https://github.com/test/repo', 'v0.9.0..v1.0.0');

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<h1>');
    expect(html).toContain('v1.0.0');
    expect(html).toContain('</html>');
    expect(html).toContain('<li>');
  });

  it('escapes HTML entities', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const inputs = makeInputs({ outputFormat: 'html', header: '# My <Special> Changelog' });
    const html = formatHTML(entries, inputs, 'v1.0.0', null, 'HEAD');
    expect(html).toContain('&lt;Special&gt;');
    expect(html).not.toContain('<Special>');
  });

  it('handles empty entries', () => {
    const inputs = makeInputs({ outputFormat: 'html' });
    const html = formatHTML([], inputs, 'v1.0.0', null, 'HEAD');
    expect(html).toContain('No notable changes');
  });
});

describe('validateLicense', () => {
  const mockHttps = require('https');

  function setupMockResponse(statusCode: number, body: object): void {
    const bodyStr = JSON.stringify(body);
    const mockReq = {
      on: jest.fn().mockReturnThis(),
      write: jest.fn(),
      end: jest.fn(),
      destroy: jest.fn(),
    };

    mockHttps.request.mockImplementation((_opts: unknown, callback: (res: Record<string, unknown>) => void) => {
      const listeners: Record<string, ((d?: string) => void)[]> = {};
      const mockRes = {
        statusCode,
        on(event: string, cb: (data?: string) => void) {
          if (!listeners[event]) listeners[event] = [];
          listeners[event].push(cb);
          return mockRes;
        },
      };
      callback(mockRes);
      // fire data then end
      for (const cb of listeners['data'] || []) cb(bodyStr);
      for (const cb of listeners['end'] || []) cb();
      return mockReq;
    });
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects empty key', async () => {
    const result = await validateLicense('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('No license key');
  });

  it('rejects undefined key', async () => {
    const result = await validateLicense(undefined);
    expect(result.valid).toBe(false);
  });

  it('validates granted key via Polar API', async () => {
    setupMockResponse(200, {
      id: 'test-id',
      organization_id: 'org-1',
      user_id: 'user-1',
      customer_id: 'cust-1',
      status: 'granted',
      key: 'test-key',
      limit_activations: null,
      usage: 0,
      limit_usage: null,
      validations: 1,
      last_validated_at: '2026-04-01',
      expires_at: null,
      benefit_id: 'ben-1',
      benefit: { id: 'ben-1', description: 'Pro plan', organization_id: 'org-1', properties: {} },
    });

    const result = await validateLicense('some-key', 'org-1');
    expect(result.valid).toBe(true);
    expect(result.tier).toBe('pro');
    expect(result.customerId).toBe('cust-1');
  });

  it('rejects revoked key', async () => {
    setupMockResponse(200, {
      id: 'test-id',
      organization_id: 'org-1',
      user_id: 'user-1',
      customer_id: 'cust-1',
      status: 'revoked',
      key: 'test-key',
      limit_activations: null,
      usage: 0,
      limit_usage: null,
      validations: 1,
      last_validated_at: '2026-04-01',
      expires_at: null,
      benefit_id: 'ben-1',
      benefit: { id: 'ben-1', description: 'Pro plan', organization_id: 'org-1', properties: {} },
    });

    const result = await validateLicense('some-key');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('revoked');
  });

  it('handles API error responses', async () => {
    setupMockResponse(400, { detail: 'Invalid key format' });

    const result = await validateLicense('bad-key');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid key format');
  });
});

describe('detectBreakingChanges', () => {
  it('detects conventional breaking changes', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const report = detectBreakingChanges(commits);
    expect(report.hasBreakingChanges).toBe(true);
    expect(report.changes.length).toBeGreaterThanOrEqual(1);
    expect(report.changes[0].shortHash).toBe('def4567');
  });

  it('returns empty report when no breaking changes', () => {
    const log = '---COMMIT-DELIMITER---aaa1111111111|aaa1111|Zoe|2026-01-01T00:00:00Z|feat: add button|';
    const commits = parseCommits(log);
    const report = detectBreakingChanges(commits);
    expect(report.hasBreakingChanges).toBe(false);
    expect(report.changes).toHaveLength(0);
  });

  it('detects removal indicators', () => {
    const log = '---COMMIT-DELIMITER---bbb2222222222|bbb2222|Zoe|2026-01-01T00:00:00Z|remove deprecated api endpoint|';
    const commits = parseCommits(log);
    const report = detectBreakingChanges(commits);
    expect(report.hasBreakingChanges).toBe(true);
    expect(report.changes[0].reason).toContain('Removal');
  });

  it('detects migration indicators', () => {
    const log = '---COMMIT-DELIMITER---ccc3333333333|ccc3333|Zoe|2026-01-01T00:00:00Z|database migration for v2 schema|';
    const commits = parseCommits(log);
    const report = detectBreakingChanges(commits);
    expect(report.hasBreakingChanges).toBe(true);
    expect(report.changes[0].reason).toContain('Migration');
  });

  it('generates summary with commit hashes', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const report = detectBreakingChanges(commits);
    expect(report.summary).toContain('def4567');
  });
});

describe('parseSemver', () => {
  it('parses standard semver', () => {
    expect(parseSemver('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3, prerelease: '' });
  });

  it('parses v-prefixed semver', () => {
    expect(parseSemver('v1.0.0')).toEqual({ major: 1, minor: 0, patch: 0, prerelease: '' });
  });

  it('parses prerelease', () => {
    expect(parseSemver('v2.1.0-beta.1')).toEqual({ major: 2, minor: 1, patch: 0, prerelease: 'beta.1' });
  });

  it('returns null for non-semver', () => {
    expect(parseSemver('not-a-version')).toBeNull();
    expect(parseSemver('Unreleased (2026-04-01)')).toBeNull();
  });
});

describe('bumpVersion', () => {
  it('bumps major', () => {
    expect(bumpVersion('v1.2.3', 'major')).toBe('v2.0.0');
  });

  it('bumps minor', () => {
    expect(bumpVersion('v1.2.3', 'minor')).toBe('v1.3.0');
  });

  it('bumps patch', () => {
    expect(bumpVersion('v1.2.3', 'patch')).toBe('v1.2.4');
  });

  it('preserves v prefix', () => {
    expect(bumpVersion('v0.9.0', 'minor')).toBe('v0.10.0');
  });

  it('works without v prefix', () => {
    expect(bumpVersion('1.0.0', 'major')).toBe('2.0.0');
  });

  it('returns unchanged for non-semver', () => {
    expect(bumpVersion('latest', 'major')).toBe('latest');
  });
});

describe('recommendVersion', () => {
  it('recommends major for breaking changes', () => {
    const commits = parseCommits(SAMPLE_LOG);
    const entries = categorizeCommits(commits, {}, []);
    const breakingReport = detectBreakingChanges(commits);
    const rec = recommendVersion(entries, breakingReport, 'v1.0.0');
    expect(rec.bump).toBe('major');
    expect(rec.recommendedVersion).toBe('v2.0.0');
  });

  it('recommends minor for features without breaking', () => {
    const log = '---COMMIT-DELIMITER---aaa1111111111|aaa1111|Zoe|2026-01-01T00:00:00Z|feat: add button|';
    const commits = parseCommits(log);
    const entries = categorizeCommits(commits, {}, []);
    const breakingReport = detectBreakingChanges(commits);
    const rec = recommendVersion(entries, breakingReport, 'v1.0.0');
    expect(rec.bump).toBe('minor');
    expect(rec.recommendedVersion).toBe('v1.1.0');
  });

  it('recommends patch for fixes only', () => {
    const log = '---COMMIT-DELIMITER---aaa1111111111|aaa1111|Zoe|2026-01-01T00:00:00Z|fix: typo|';
    const commits = parseCommits(log);
    const entries = categorizeCommits(commits, {}, []);
    const breakingReport = detectBreakingChanges(commits);
    const rec = recommendVersion(entries, breakingReport, 'v1.0.0');
    expect(rec.bump).toBe('patch');
    expect(rec.recommendedVersion).toBe('v1.0.1');
  });

  it('returns null recommendedVersion for non-semver current', () => {
    const log = '---COMMIT-DELIMITER---aaa1111111111|aaa1111|Zoe|2026-01-01T00:00:00Z|fix: typo|';
    const commits = parseCommits(log);
    const entries = categorizeCommits(commits, {}, []);
    const breakingReport = detectBreakingChanges(commits);
    const rec = recommendVersion(entries, breakingReport, 'Unreleased (2026-04-01)');
    expect(rec.bump).toBe('patch');
    expect(rec.recommendedVersion).toBeNull();
  });
});
