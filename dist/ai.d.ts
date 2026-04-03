import { ParsedCommit, ChangelogEntry } from './types';
export declare function enhanceWithAI(commits: ParsedCommit[], provider: 'openai' | 'anthropic', apiKey: string, model: string): Promise<ChangelogEntry[]>;
