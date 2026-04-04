import { validateLicense, hasFeatureAccess } from './license';
import * as https from 'https';
import { EventEmitter } from 'events';

// ---------------------------------------------------------------------------
// Mock https.request so we never hit the network
// ---------------------------------------------------------------------------

jest.mock('https');

const mockedRequest = https.request as jest.MockedFunction<typeof https.request>;

function mockPolarResponse(statusCode: number, body: object | string): void {
  const responseBody = typeof body === 'string' ? body : JSON.stringify(body);
  const response = new EventEmitter() as any;
  response.statusCode = statusCode;

  const request = new EventEmitter() as any;
  request.write = jest.fn();
  request.end = jest.fn();
  request.destroy = jest.fn();

  mockedRequest.mockImplementation((_opts: any, callback: any) => {
    callback(response);
    process.nextTick(() => {
      response.emit('data', responseBody);
      response.emit('end');
    });
    return request;
  });
}

function mockNetworkError(message: string): void {
  const request = new EventEmitter() as any;
  request.write = jest.fn();
  request.end = jest.fn();
  request.destroy = jest.fn();

  mockedRequest.mockImplementation((_opts: any, _callback: any) => {
    process.nextTick(() => request.emit('error', new Error(message)));
    return request;
  });
}

function mockTimeout(): void {
  const request = new EventEmitter() as any;
  request.write = jest.fn();
  request.end = jest.fn();
  request.destroy = jest.fn();

  mockedRequest.mockImplementation((_opts: any, _callback: any) => {
    process.nextTick(() => request.emit('timeout'));
    return request;
  });
}

// ---------------------------------------------------------------------------
// Tests: validateLicense
// ---------------------------------------------------------------------------

describe('validateLicense', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns valid=true for a granted Pro key', async () => {
    mockPolarResponse(200, {
      id: 'lk_abc',
      organization_id: 'org_123',
      user_id: 'usr_1',
      customer_id: 'cust_1',
      status: 'granted',
      key: 'PRO-KEY-123',
      limit_activations: null,
      usage: 0,
      limit_usage: null,
      validations: 1,
      last_validated_at: '2026-04-01T00:00:00Z',
      expires_at: '2027-04-01T00:00:00Z',
      benefit_id: 'ben_1',
      benefit: {
        id: 'ben_1',
        description: 'Pro License Key',
        organization_id: 'org_123',
        properties: {},
      },
    });

    const result = await validateLicense('PRO-KEY-123', 'org_123');
    expect(result.valid).toBe(true);
    expect(result.tier).toBe('pro');
    expect(result.customerId).toBe('cust_1');
    expect(result.expiresAt).toBe('2027-04-01T00:00:00Z');
  });

  it('returns valid=true with tier=team for a Team key', async () => {
    mockPolarResponse(200, {
      id: 'lk_team',
      organization_id: 'org_123',
      user_id: 'usr_2',
      customer_id: 'cust_2',
      status: 'granted',
      key: 'TEAM-KEY-456',
      limit_activations: null,
      usage: 0,
      limit_usage: null,
      validations: 1,
      last_validated_at: '2026-04-01T00:00:00Z',
      expires_at: null,
      benefit_id: 'ben_2',
      benefit: {
        id: 'ben_2',
        description: 'Team License Key',
        organization_id: 'org_123',
        properties: {},
      },
    });

    const result = await validateLicense('TEAM-KEY-456');
    expect(result.valid).toBe(true);
    expect(result.tier).toBe('team');
    expect(result.expiresAt).toBeUndefined();
  });

  it('returns valid=false for a revoked key', async () => {
    mockPolarResponse(200, {
      id: 'lk_rev',
      organization_id: 'org_123',
      user_id: 'usr_3',
      customer_id: 'cust_3',
      status: 'revoked',
      key: 'REVOKED-KEY',
      limit_activations: null,
      usage: 0,
      limit_usage: null,
      validations: 1,
      last_validated_at: '2026-04-01T00:00:00Z',
      expires_at: null,
      benefit_id: 'ben_1',
      benefit: {
        id: 'ben_1',
        description: 'Pro License Key',
        organization_id: 'org_123',
        properties: {},
      },
    });

    const result = await validateLicense('REVOKED-KEY');
    expect(result.valid).toBe(false);
    expect(result.tier).toBe('free');
    expect(result.error).toContain('revoked');
  });

  it('returns valid=false for a 404 (invalid key)', async () => {
    mockPolarResponse(404, { detail: 'License key not found' });

    const result = await validateLicense('NONEXISTENT-KEY');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('License key not found');
  });

  it('returns valid=false with empty key', async () => {
    const result = await validateLicense('');
    expect(result.valid).toBe(false);
    expect(result.tier).toBe('free');
    expect(result.error).toContain('No license key');
  });

  it('returns valid=false with undefined key', async () => {
    const result = await validateLicense(undefined);
    expect(result.valid).toBe(false);
    expect(result.tier).toBe('free');
  });

  it('handles network errors gracefully', async () => {
    mockNetworkError('ECONNREFUSED');

    const result = await validateLicense('SOME-KEY');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Network error');
    expect(result.error).toContain('ECONNREFUSED');
  });

  it('handles timeouts gracefully', async () => {
    mockTimeout();

    const result = await validateLicense('SOME-KEY');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('timed out');
  });

  it('handles malformed JSON response gracefully', async () => {
    mockPolarResponse(200, 'not-json');

    const result = await validateLicense('SOME-KEY');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid response');
  });
});

// ---------------------------------------------------------------------------
// Tests: hasFeatureAccess
// ---------------------------------------------------------------------------

describe('hasFeatureAccess', () => {
  it('denies AI mode for free tier', () => {
    expect(hasFeatureAccess('free', 'ai')).toBe(false);
  });

  it('grants AI mode for pro tier', () => {
    expect(hasFeatureAccess('pro', 'ai')).toBe(true);
  });

  it('grants AI mode for team tier', () => {
    expect(hasFeatureAccess('team', 'ai')).toBe(true);
  });

  it('denies multi-format for free tier', () => {
    expect(hasFeatureAccess('free', 'multi-format')).toBe(false);
  });

  it('grants multi-format for pro tier', () => {
    expect(hasFeatureAccess('pro', 'multi-format')).toBe(true);
  });
});
