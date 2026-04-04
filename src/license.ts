import * as https from 'https';

export type LicenseTier = 'free' | 'pro' | 'team';

export interface LicenseValidation {
  valid: boolean;
  tier: LicenseTier;
  customerId?: string;
  expiresAt?: string;
  error?: string;
}

interface PolarValidationResponse {
  id: string;
  organization_id: string;
  user_id: string;
  customer_id: string;
  status: 'granted' | 'revoked' | 'disabled';
  key: string;
  limit_activations: number | null;
  usage: number;
  limit_usage: number | null;
  validations: number;
  last_validated_at: string;
  expires_at: string | null;
  benefit_id: string;
  benefit: {
    id: string;
    description: string;
    organization_id: string;
    properties: Record<string, unknown>;
  };
}

const POLAR_API_BASE = 'https://api.polar.sh';
const VALIDATION_PATH = '/v1/customer-portal/license-keys/validate';

const TIER_PATTERNS: Array<{ pattern: RegExp; tier: LicenseTier }> = [
  { pattern: /\bteam\b/i, tier: 'team' },
  { pattern: /\bpro\b/i, tier: 'pro' },
];

function detectTier(benefit: PolarValidationResponse['benefit'] | undefined): LicenseTier {
  if (!benefit?.description) return 'pro';
  for (const { pattern, tier } of TIER_PATTERNS) {
    if (pattern.test(benefit.description)) return tier;
  }
  return 'pro';
}

/**
 * Validate a Polar.sh-issued license key via the public customer-portal
 * endpoint (no server-side access token required — safe from CI runners).
 */
export async function validateLicense(
  key: string | undefined,
  orgId?: string,
): Promise<LicenseValidation> {
  if (!key || key.trim().length === 0) {
    return { valid: false, tier: 'free', error: 'No license key provided' };
  }

  const body: Record<string, string> = { key: key.trim() };
  if (orgId) body.organization_id = orgId;

  const payload = JSON.stringify(body);

  return new Promise<LicenseValidation>((resolve) => {
    const req = https.request(
      {
        hostname: new URL(POLAR_API_BASE).hostname,
        path: VALIDATION_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 10_000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const parsed: PolarValidationResponse = JSON.parse(data);
              if (parsed.status === 'granted') {
                resolve({
                  valid: true,
                  tier: detectTier(parsed.benefit),
                  customerId: parsed.customer_id,
                  expiresAt: parsed.expires_at ?? undefined,
                });
              } else {
                resolve({
                  valid: false,
                  tier: 'free',
                  error: `License key status: ${parsed.status}`,
                });
              }
            } else {
              const msg = tryParseError(data) || `HTTP ${res.statusCode}`;
              resolve({ valid: false, tier: 'free', error: msg });
            }
          } catch {
            resolve({ valid: false, tier: 'free', error: 'Invalid response from license server' });
          }
        });
      },
    );

    req.on('error', (err) => {
      resolve({ valid: false, tier: 'free', error: `Network error: ${err.message}` });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ valid: false, tier: 'free', error: 'License validation request timed out' });
    });

    req.write(payload);
    req.end();
  });
}

function tryParseError(body: string): string | null {
  try {
    const parsed = JSON.parse(body);
    return parsed.detail ?? parsed.message ?? parsed.error ?? null;
  } catch {
    return null;
  }
}

export const PREMIUM_FEATURES = ['ai', 'multi-format'] as const;
export type PremiumFeature = (typeof PREMIUM_FEATURES)[number];

/** Check whether a given license tier grants access to a premium feature. */
export function hasFeatureAccess(tier: LicenseTier, feature: PremiumFeature): boolean {
  if (tier === 'team' || tier === 'pro') return true;
  return false;
}
