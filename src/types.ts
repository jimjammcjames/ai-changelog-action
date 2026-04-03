export interface ParsedCommit {
  hash: string;
  shortHash: string;
  subject: string;
  body: string;
  author: string;
  date: string;
  type: string;
  scope: string;
  description: string;
  breaking: boolean;
  prNumber: string | null;
  raw: string;
}

export interface CategoryConfig {
  [type: string]: string;
}

export interface ChangelogEntry {
  type: string;
  scope: string;
  description: string;
  hash: string;
  shortHash: string;
  author: string;
  date: string;
  breaking: boolean;
  prNumber: string | null;
}

export interface ChangelogSection {
  category: string;
  entries: ChangelogEntry[];
}

export interface ChangelogResult {
  markdown: string;
  version: string;
  commitCount: number;
  categoriesFound: string[];
}

export interface ActionInputs {
  mode: 'conventional' | 'ai';
  aiProvider: 'openai' | 'anthropic';
  aiApiKey: string;
  aiModel: string;
  output: 'file' | 'release' | 'both' | 'stdout';
  changelogPath: string;
  includeRange: string;
  categories: CategoryConfig;
  groupBy: 'category' | 'scope' | 'date';
  includeAuthors: boolean;
  includePrLinks: boolean;
  includeCompareLink: boolean;
  version: string;
  header: string;
  excludeTypes: string[];
  maxCommits: number;
}
