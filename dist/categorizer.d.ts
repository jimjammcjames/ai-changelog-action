import { ParsedCommit, ChangelogEntry, CategoryConfig } from './types';
declare const DEFAULT_CATEGORIES: CategoryConfig;
export declare function categorizeCommits(commits: ParsedCommit[], customCategories: CategoryConfig, excludeTypes: string[]): ChangelogEntry[];
export declare function getCategoryLabel(type: string, customCategories: CategoryConfig): string;
export declare function groupByCategory(entries: ChangelogEntry[]): Map<string, ChangelogEntry[]>;
export declare function groupByScope(entries: ChangelogEntry[]): Map<string, ChangelogEntry[]>;
export declare function groupByDate(entries: ChangelogEntry[]): Map<string, ChangelogEntry[]>;
export { DEFAULT_CATEGORIES };
