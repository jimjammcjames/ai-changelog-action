import { ActionInputs, ChangelogResult } from './types';
import { BreakingChangeReport } from './breaking-detect';
import { VersionRecommendation } from './version-recommend';
export interface GenerateResult {
    changelog: ChangelogResult;
    breakingReport?: BreakingChangeReport;
    versionRecommendation?: VersionRecommendation;
    premiumActive: boolean;
}
export declare function generateChangelog(inputs: ActionInputs, log?: (msg: string) => void, warn?: (msg: string) => void): Promise<GenerateResult>;
