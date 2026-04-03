import { ParsedCommit } from './types';
export declare function getGitLog(range: string, maxCommits: number): Promise<string>;
export declare function detectRange(): Promise<string>;
export declare function detectVersion(range: string, explicitVersion: string): Promise<string>;
export declare function getRepoUrl(): Promise<string | null>;
export declare function parseCommits(rawLog: string): ParsedCommit[];
