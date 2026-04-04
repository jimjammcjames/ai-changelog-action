import { generateChangelog } from '../src/core';
import { ActionInputs } from '../src/types';
import * as git from '../src/git';
import * as ai from '../src/ai';
import * as license from '../src/license';

jest.mock('../src/git');
jest.mock('../src/ai');
jest.mock('../src/license');

const mockedGit = git as jest.Mocked<typeof git>;
const mockedAi = ai as jest.Mocked<typeof ai>;
const mockedLicense = license as jest.Mocked<typeof license>;

const SAMPLE_LOG = `---COMMIT-DELIMITER---abc1234567890|abc1234|Alice|2026-04-01T10:00:00Z|feat(auth): add OAuth2 login support (#42)|
---COMMIT-DELIMITER---def4567890123|def4567|Bob|2026-04-01T09:00:00Z|fix: resolve crash on empty input|`;

function makeInputs(overrides: Partial<ActionInputs> = {}): ActionInputs {
  return {
    mode: 'conventional',
    aiProvider: 'openai',
    aiApiKey: '',
    aiModel: 'gpt-4o-mini',
    output: 'stdout',
    changelogPath: 'CHANGELOG.md',
    includeRange: 'v0.9.0..v1.0.0',
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

beforeEach(() => {
  jest.resetAllMocks();

  mockedGit.detectRange.mockResolvedValue('v0.9.0..v1.0.0');
  mockedGit.getGitLog.mockResolvedValue(SAMPLE_LOG);
  mockedGit.parseCommits.mockImplementation(git.parseCommits);
  // Use the real parseCommits
  jest.spyOn(git, 'parseCommits').mockImplementation((rawLog: string) => {
    // Re-implement just enough for tests
    const delimiter = '---COMMIT-DELIMITER---';
    const chunks = rawLog.split(delimiter).filter(c => c.trim());
    return chunks.map(chunk => {
      const parts = chunk.split('|');
      return {
        hash: parts[0]?.trim() || '',
        shortHash: parts[1]?.trim() || '',
        author: parts[2]?.trim() || '',
        date: parts[3]?.trim() || '',
        subject: parts[4]?.trim() || '',
        body: parts.slice(5).join('|').trim(),
        type: parts[4]?.includes('feat') ? 'feat' : 'fix',
        scope: '',
        description: parts[4]?.trim() || '',
        breaking: false,
        prNumber: null,
        raw: chunk,
      };
    });
  });
  mockedGit.detectVersion.mockResolvedValue('v1.0.0');
  mockedGit.getRepoUrl.mockResolvedValue('https://github.com/test/repo');
  mockedLicense.validateLicense.mockResolvedValue({ valid: false, tier: 'free' });
});

describe('generateChangelog (core)', () => {
  it('generates changelog in conventional mode', async () => {
    const inputs = makeInputs();
    const result = await generateChangelog(inputs);

    expect(result.changelog.version).toBe('v1.0.0');
    expect(result.changelog.commitCount).toBe(2);
    expect(result.changelog.markdown).toContain('# Changelog');
    expect(result.premiumActive).toBe(false);
    expect(result.breakingReport).toBeUndefined();
    expect(result.versionRecommendation).toBeUndefined();
  });

  it('activates premium features with valid license', async () => {
    mockedLicense.validateLicense.mockResolvedValue({ valid: true, tier: 'pro', customerId: 'cust-1' });

    const inputs = makeInputs({ licenseKey: 'some-key' });
    const result = await generateChangelog(inputs);

    expect(result.premiumActive).toBe(true);
    expect(result.breakingReport).toBeDefined();
    expect(result.versionRecommendation).toBeDefined();
  });

  it('falls back to conventional when AI fails', async () => {
    mockedAi.enhanceWithAI.mockRejectedValue(new Error('API error'));

    const warnings: string[] = [];
    const inputs = makeInputs({ mode: 'ai', aiApiKey: 'sk-test' });
    const result = await generateChangelog(inputs, undefined, (msg) => warnings.push(msg));

    expect(result.changelog.commitCount).toBe(2);
    expect(warnings.some(w => w.includes('AI enhancement failed'))).toBe(true);
  });

  it('warns when AI mode has no key', async () => {
    const warnings: string[] = [];
    const inputs = makeInputs({ mode: 'ai', aiApiKey: '' });
    await generateChangelog(inputs, undefined, (msg) => warnings.push(msg));

    expect(warnings.some(w => w.includes('no api-key'))).toBe(true);
  });

  it('logs progress messages', async () => {
    const logs: string[] = [];
    const inputs = makeInputs();
    await generateChangelog(inputs, (msg) => logs.push(msg));

    expect(logs.some(m => m.includes('Detecting commit range'))).toBe(true);
    expect(logs.some(m => m.includes('Reading git log'))).toBe(true);
    expect(logs.some(m => m.includes('Formatting changelog'))).toBe(true);
  });

  it('handles empty commit range', async () => {
    mockedGit.getGitLog.mockResolvedValue('');
    jest.spyOn(git, 'parseCommits').mockReturnValue([]);

    const warnings: string[] = [];
    const inputs = makeInputs();
    const result = await generateChangelog(inputs, undefined, (msg) => warnings.push(msg));

    expect(result.changelog.commitCount).toBe(0);
    expect(warnings.some(w => w.includes('No commits found'))).toBe(true);
  });

  it('uses custom range from inputs', async () => {
    const inputs = makeInputs({ includeRange: 'abc..def' });
    await generateChangelog(inputs);

    expect(mockedGit.getGitLog).toHaveBeenCalledWith('abc..def', 500);
  });

  it('auto-detects range when not provided', async () => {
    const inputs = makeInputs({ includeRange: '' });
    await generateChangelog(inputs);

    expect(mockedGit.detectRange).toHaveBeenCalled();
  });
});
