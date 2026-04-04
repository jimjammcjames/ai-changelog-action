import { ParsedCommit } from './types';
export interface BreakingChange {
    hash: string;
    shortHash: string;
    author: string;
    description: string;
    scope: string;
    reason: string;
}
export interface BreakingChangeReport {
    hasBreakingChanges: boolean;
    changes: BreakingChange[];
    summary: string;
}
export declare function detectBreakingChanges(commits: ParsedCommit[]): BreakingChangeReport;
