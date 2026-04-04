export type LicenseTier = 'free' | 'pro' | 'team';
export interface LicenseValidation {
    valid: boolean;
    tier: LicenseTier;
    customerId?: string;
    expiresAt?: string;
    error?: string;
}
/**
 * Validate a Polar.sh-issued license key via the public customer-portal
 * endpoint (no server-side access token required — safe from CI runners).
 */
export declare function validateLicense(key: string | undefined, orgId?: string): Promise<LicenseValidation>;
export declare const PREMIUM_FEATURES: readonly ["ai", "multi-format"];
export type PremiumFeature = (typeof PREMIUM_FEATURES)[number];
/** Check whether a given license tier grants access to a premium feature. */
export declare function hasFeatureAccess(tier: LicenseTier, feature: PremiumFeature): boolean;
