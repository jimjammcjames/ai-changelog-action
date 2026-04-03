import * as exec from '@actions/exec';
import { ParsedCommit } from './types';

const CONVENTIONAL_REGEX = /^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s*(?<description>.+)/;
const PR_REGEX = /\(#(?<pr>\d+)\)\s*$/;

export async function getGitLog(range: string, maxCommits: number): Promise<string> {
  let output = '';
  const delimiter = '---COMMIT-DELIMITER---';
  const format = `${delimiter}%H|%h|%an|%aI|%s|%b`;

  await exec.exec('git', [
    'log',
    range,
    `--pretty=format:${format}`,
    `--max-count=${maxCommits}`,
  ], {
    listeners: {
      stdout: (data: Buffer) => { output += data.toString(); },
    },
    silent: true,
  });

  return output;
}

export async function detectRange(): Promise<string> {
  let tags = '';
  try {
    await exec.exec('git', ['tag', '--sort=-version:refname', '--merged', 'HEAD'], {
      listeners: {
        stdout: (data: Buffer) => { tags += data.toString(); },
      },
      silent: true,
    });
  } catch {
    // no tags — fall back to all commits
  }

  const tagList = tags.trim().split('\n').filter(Boolean);

  if (tagList.length >= 2) {
    return `${tagList[1]}..${tagList[0]}`;
  } else if (tagList.length === 1) {
    return `${tagList[0]}..HEAD`;
  }

  // No tags: use all commits
  let firstCommit = '';
  try {
    await exec.exec('git', ['rev-list', '--max-parents=0', 'HEAD'], {
      listeners: {
        stdout: (data: Buffer) => { firstCommit += data.toString(); },
      },
      silent: true,
    });
  } catch {
    return 'HEAD';
  }

  const first = firstCommit.trim().split('\n')[0];
  return first ? `${first}..HEAD` : 'HEAD';
}

export async function detectVersion(range: string, explicitVersion: string): Promise<string> {
  if (explicitVersion) return explicitVersion;

  let tags = '';
  try {
    await exec.exec('git', ['tag', '--sort=-version:refname', '--merged', 'HEAD', '--list', 'v*'], {
      listeners: {
        stdout: (data: Buffer) => { tags += data.toString(); },
      },
      silent: true,
    });
  } catch {
    // ignore
  }

  const tagList = tags.trim().split('\n').filter(Boolean);
  if (tagList.length > 0) return tagList[0];

  const today = new Date().toISOString().split('T')[0];
  return `Unreleased (${today})`;
}

export async function getRepoUrl(): Promise<string | null> {
  let remote = '';
  try {
    await exec.exec('git', ['remote', 'get-url', 'origin'], {
      listeners: {
        stdout: (data: Buffer) => { remote += data.toString(); },
      },
      silent: true,
    });
  } catch {
    return null;
  }

  remote = remote.trim();
  // Convert SSH to HTTPS
  if (remote.startsWith('git@')) {
    remote = remote.replace(':', '/').replace('git@', 'https://');
  }
  return remote.replace(/\.git$/, '');
}

export function parseCommits(rawLog: string): ParsedCommit[] {
  const delimiter = '---COMMIT-DELIMITER---';
  const chunks = rawLog.split(delimiter).filter(c => c.trim());

  return chunks.map(chunk => {
    const parts = chunk.split('|');
    const hash = parts[0]?.trim() || '';
    const shortHash = parts[1]?.trim() || '';
    const author = parts[2]?.trim() || '';
    const date = parts[3]?.trim() || '';
    const subject = parts[4]?.trim() || '';
    const body = parts.slice(5).join('|').trim();

    const conventionalMatch = subject.match(CONVENTIONAL_REGEX);
    const prMatch = subject.match(PR_REGEX);

    let type = 'other';
    let scope = '';
    let description = subject;
    let breaking = false;

    if (conventionalMatch?.groups) {
      type = conventionalMatch.groups.type.toLowerCase();
      scope = conventionalMatch.groups.scope || '';
      description = conventionalMatch.groups.description.trim();
      breaking = !!conventionalMatch.groups.breaking ||
        body.includes('BREAKING CHANGE') ||
        body.includes('BREAKING-CHANGE');
    } else {
      // Heuristic categorization for non-conventional commits
      const lowerSubject = subject.toLowerCase();
      if (lowerSubject.startsWith('fix') || lowerSubject.includes('bugfix') || lowerSubject.includes('hotfix')) {
        type = 'fix';
      } else if (lowerSubject.startsWith('add') || lowerSubject.startsWith('feat') || lowerSubject.includes('implement')) {
        type = 'feat';
      } else if (lowerSubject.startsWith('doc') || lowerSubject.includes('readme')) {
        type = 'docs';
      } else if (lowerSubject.startsWith('refactor') || lowerSubject.startsWith('clean')) {
        type = 'refactor';
      } else if (lowerSubject.startsWith('test')) {
        type = 'test';
      } else if (lowerSubject.includes('breaking')) {
        type = 'feat';
        breaking = true;
      }
    }

    return {
      hash,
      shortHash,
      subject,
      body,
      author,
      date,
      type,
      scope,
      description,
      breaking,
      prNumber: prMatch?.groups?.pr || null,
      raw: chunk,
    };
  });
}
