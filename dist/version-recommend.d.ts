import { ChangelogEntry } from './types';
import { BreakingChangeReport } from './breaking-detect';
export type SemverBump = 'major' | 'minor' | 'patch';
export interface VersionRecommendation {
    bump: SemverBump;
    reason: string;
    currentVersion: string | null;
    recommendedVersion: string | null;
}
export declare function parseSemver(version: string): {
    major: number;
    minor: number;
    patch: number;
    prerelease: string;
} | null;
export declare function bumpVersion(version: string, bump: SemverBump): string;
export declare function recommendVersion(entries: ChangelogEntry[], breakingReport: BreakingChangeReport, currentVersion: string): VersionRecommendation;
