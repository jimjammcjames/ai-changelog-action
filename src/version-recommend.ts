import { ChangelogEntry } from './types';
import { BreakingChangeReport } from './breaking-detect';

export type SemverBump = 'major' | 'minor' | 'patch';

export interface VersionRecommendation {
  bump: SemverBump;
  reason: string;
  currentVersion: string | null;
  recommendedVersion: string | null;
}

const SEMVER_REGEX = /^v?(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/;

export function parseSemver(version: string): { major: number; minor: number; patch: number; prerelease: string } | null {
  const match = version.match(SEMVER_REGEX);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || '',
  };
}

export function bumpVersion(version: string, bump: SemverBump): string {
  const parsed = parseSemver(version);
  if (!parsed) return version;

  const prefix = version.startsWith('v') ? 'v' : '';

  switch (bump) {
    case 'major':
      return `${prefix}${parsed.major + 1}.0.0`;
    case 'minor':
      return `${prefix}${parsed.major}.${parsed.minor + 1}.0`;
    case 'patch':
      return `${prefix}${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
  }
}

export function recommendVersion(
  entries: ChangelogEntry[],
  breakingReport: BreakingChangeReport,
  currentVersion: string,
): VersionRecommendation {
  const parsed = parseSemver(currentVersion);

  if (breakingReport.hasBreakingChanges) {
    return {
      bump: 'major',
      reason: `Breaking changes detected: ${breakingReport.summary}`,
      currentVersion,
      recommendedVersion: parsed ? bumpVersion(currentVersion, 'major') : null,
    };
  }

  const hasFeatures = entries.some(e => e.type === 'feat');
  if (hasFeatures) {
    return {
      bump: 'minor',
      reason: 'New features added without breaking changes',
      currentVersion,
      recommendedVersion: parsed ? bumpVersion(currentVersion, 'minor') : null,
    };
  }

  return {
    bump: 'patch',
    reason: 'Bug fixes and maintenance changes only',
    currentVersion,
    recommendedVersion: parsed ? bumpVersion(currentVersion, 'patch') : null,
  };
}
