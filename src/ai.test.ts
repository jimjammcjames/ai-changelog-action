import { enhanceWithAI } from '../src/ai';
import { ParsedCommit } from '../src/types';

jest.mock('https');
jest.mock('http');

const mockHttps = require('https');

function makeMockCommit(overrides: Partial<ParsedCommit> = {}): ParsedCommit {
  return {
    hash: 'abc1234567890',
    shortHash: 'abc1234',
    subject: 'feat: test commit',
    body: '',
    author: 'Alice',
    date: '2026-04-01T10:00:00Z',
    type: 'feat',
    scope: '',
    description: 'test commit',
    breaking: false,
    prNumber: null,
    raw: 'raw-data',
    ...overrides,
  };
}

function setupHttpsMock(statusCode: number, responseBody: string): void {
  const mockReq = {
    on: jest.fn().mockReturnThis(),
    write: jest.fn(),
    end: jest.fn(),
  };

  mockHttps.request.mockImplementation((_url: unknown, _opts: unknown, callback: (res: Record<string, unknown>) => void) => {
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
    for (const cb of listeners['data'] || []) cb(responseBody);
    for (const cb of listeners['end'] || []) cb();
    return mockReq;
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('enhanceWithAI', () => {
  const commits = [makeMockCommit()];

  describe('openai provider', () => {
    it('returns parsed entries from OpenAI response', async () => {
      const aiResponse = JSON.stringify({
        choices: [{
          message: {
            content: JSON.stringify([{
              hash: 'abc1234567890',
              shortHash: 'abc1234',
              type: 'feat',
              scope: '',
              description: 'test commit',
              author: 'Alice',
              date: '2026-04-01T10:00:00Z',
              breaking: false,
              prNumber: null,
            }]),
          },
        }],
      });

      setupHttpsMock(200, aiResponse);
      const result = await enhanceWithAI(commits, 'openai', 'sk-test', 'gpt-4o-mini');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('feat');
    });

    it('throws on HTTP error', async () => {
      setupHttpsMock(500, 'Internal Server Error');
      await expect(enhanceWithAI(commits, 'openai', 'sk-test', 'gpt-4o-mini')).rejects.toThrow('HTTP 500');
    });
  });

  describe('anthropic provider', () => {
    it('returns parsed entries from Anthropic response', async () => {
      const aiResponse = JSON.stringify({
        content: [{
          text: JSON.stringify([{
            hash: 'abc1234567890',
            shortHash: 'abc1234',
            type: 'fix',
            scope: 'api',
            description: 'fix api bug',
            author: 'Alice',
            date: '2026-04-01T10:00:00Z',
            breaking: false,
            prNumber: null,
          }]),
        }],
      });

      setupHttpsMock(200, aiResponse);
      const result = await enhanceWithAI(commits, 'anthropic', 'sk-ant-test', 'claude-3-haiku');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('fix');
    });
  });

  describe('unsupported provider', () => {
    it('throws for unknown provider', async () => {
      await expect(
        enhanceWithAI(commits, 'unknown' as any, 'key', 'model')
      ).rejects.toThrow('Unsupported AI provider');
    });
  });
});
