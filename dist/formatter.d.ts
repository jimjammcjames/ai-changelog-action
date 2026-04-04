import { ChangelogEntry, ChangelogResult, ChangelogJSON, ActionInputs } from './types';
export declare function formatChangelog(entries: ChangelogEntry[], inputs: ActionInputs, version: string, repoUrl: string | null, range: string): ChangelogResult;
export declare function formatJSON(entries: ChangelogEntry[], inputs: ActionInputs, version: string, groups?: Map<string, ChangelogEntry[]>): ChangelogJSON;
export declare function formatHTML(entries: ChangelogEntry[], inputs: ActionInputs, version: string, repoUrl: string | null, range: string, groups?: Map<string, ChangelogEntry[]>): string;
