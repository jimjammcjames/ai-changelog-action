import { ActionInputs, ChangelogEntry, ChangelogResult } from './types';
import { getGitLog, detectRange, detectVersion, getRepoUrl, parseCommits } from './git';
import { categorizeCommits } from './categorizer';
import { formatChangelog } from './formatter';
import { enhanceWithAI } from './ai';
import { validateLicense } from './license';
import { detectBreakingChanges, BreakingChangeReport } from './breaking-detect';
import { recommendVersion, VersionRecommendation } from './version-recommend';

export interface GenerateResult {
  changelog: ChangelogResult;
  breakingReport?: BreakingChangeReport;
  versionRecommendation?: VersionRecommendation;
  premiumActive: boolean;
}

export async function generateChangelog(
  inputs: ActionInputs,
  log?: (msg: string) => void,
  warn?: (msg: string) => void,
): Promise<GenerateResult> {
  const info = log || (() => {});
  const warning = warn || (() => {});

  info('🔍 Detecting commit range...');
  const range = inputs.includeRange || await detectRange();
  info(`📋 Range: ${range}`);

  info('📖 Reading git log...');
  const rawLog = await getGitLog(range, inputs.maxCommits);
  const commits = parseCommits(rawLog);
  info(`Found ${commits.length} commits`);

  if (commits.length === 0) {
    warning('No commits found in range. Generating empty changelog.');
  }

  const version = await detectVersion(range, inputs.version);
  const repoUrl = await getRepoUrl();
  info(`🏷️ Version: ${version}`);

  let entries: ChangelogEntry[];
  if (inputs.mode === 'ai' && inputs.aiApiKey) {
    info('🤖 Enhancing with AI...');
    try {
      entries = await enhanceWithAI(commits, inputs.aiProvider, inputs.aiApiKey, inputs.aiModel);
    } catch (err) {
      warning(`AI enhancement failed, falling back to conventional: ${err}`);
      entries = categorizeCommits(commits, inputs.categories, inputs.excludeTypes);
    }
  } else {
    if (inputs.mode === 'ai' && !inputs.aiApiKey) {
      warning('AI mode requested but no api-key provided. Falling back to conventional.');
    }
    entries = categorizeCommits(commits, inputs.categories, inputs.excludeTypes);
  }

  // Check premium features via Polar.sh
  const licenseResult = await validateLicense(inputs.licenseKey, inputs.polarOrgId);
  const premiumActive = licenseResult.valid;
  if (licenseResult.error && inputs.licenseKey) {
    warning(`License validation: ${licenseResult.error}`);
  }

  let breakingReport: BreakingChangeReport | undefined;
  let versionRecommendation: VersionRecommendation | undefined;

  if (premiumActive) {
    info('🔑 Premium features activated');

    breakingReport = detectBreakingChanges(commits);
    if (breakingReport.hasBreakingChanges) {
      info(`⚠️ ${breakingReport.summary}`);
    }

    versionRecommendation = recommendVersion(entries, breakingReport, version);
    info(`📊 Recommended bump: ${versionRecommendation.bump} → ${versionRecommendation.recommendedVersion || 'N/A'}`);
  }

  info('📝 Formatting changelog...');
  const result = formatChangelog(entries, inputs, version, repoUrl, range);

  return {
    changelog: result,
    breakingReport,
    versionRecommendation,
    premiumActive,
  };
}
