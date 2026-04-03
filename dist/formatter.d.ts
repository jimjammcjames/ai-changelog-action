import { ChangelogEntry, ChangelogResult, ActionInputs } from './types';
export declare function formatChangelog(entries: ChangelogEntry[], inputs: ActionInputs, version: string, repoUrl: string | null, range: string): ChangelogResult;
