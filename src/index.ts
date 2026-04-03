import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import * as path from 'path';
import { ActionInputs, CategoryConfig } from './types';
import { getGitLog, detectRange, detectVersion, getRepoUrl, parseCommits } from './git';
import { categorizeCommits } from './categorizer';
import { formatChangelog } from './formatter';
import { enhanceWithAI } from './ai';

function getInputs(): ActionInputs {
  let categories: CategoryConfig = {};
  const categoriesRaw = core.getInput('categories');
  if (categoriesRaw) {
    try {
      categories = JSON.parse(categoriesRaw);
    } catch {
      core.warning('Invalid categories JSON, using defaults');
    }
  }

  const excludeRaw = core.getInput('exclude-types');
  const excludeTypes = excludeRaw ? excludeRaw.split(',').map(s => s.trim()) : [];

  return {
    mode: (core.getInput('mode') || 'conventional') as 'conventional' | 'ai',
    aiProvider: (core.getInput('ai-provider') || 'openai') as 'openai' | 'anthropic',
    aiApiKey: core.getInput('ai-api-key'),
    aiModel: core.getInput('ai-model') || 'gpt-4o-mini',
    output: (core.getInput('output') || 'file') as 'file' | 'release' | 'both' | 'stdout',
    changelogPath: core.getInput('changelog-path') || 'CHANGELOG.md',
    includeRange: core.getInput('include-range'),
    categories,
    groupBy: (core.getInput('group-by') || 'category') as 'category' | 'scope' | 'date',
    includeAuthors: core.getBooleanInput('include-authors'),
    includePrLinks: core.getBooleanInput('include-pr-links'),
    includeCompareLink: core.getBooleanInput('include-compare-link'),
    version: core.getInput('version'),
    header: core.getInput('header') || '# Changelog',
    excludeTypes,
    maxCommits: parseInt(core.getInput('max-commits') || '500', 10),
  };
}

async function run(): Promise<void> {
  try {
    const inputs = getInputs();

    core.info('🔍 Detecting commit range...');
    const range = inputs.includeRange || await detectRange();
    core.info(`📋 Range: ${range}`);

    core.info('📖 Reading git log...');
    const rawLog = await getGitLog(range, inputs.maxCommits);
    const commits = parseCommits(rawLog);
    core.info(`Found ${commits.length} commits`);

    if (commits.length === 0) {
      core.warning('No commits found in range. Generating empty changelog.');
    }

    const version = await detectVersion(range, inputs.version);
    const repoUrl = await getRepoUrl();
    core.info(`🏷️ Version: ${version}`);

    let entries;
    if (inputs.mode === 'ai' && inputs.aiApiKey) {
      core.info('🤖 Enhancing with AI...');
      try {
        entries = await enhanceWithAI(commits, inputs.aiProvider, inputs.aiApiKey, inputs.aiModel);
      } catch (err) {
        core.warning(`AI enhancement failed, falling back to conventional: ${err}`);
        entries = categorizeCommits(commits, inputs.categories, inputs.excludeTypes);
      }
    } else {
      if (inputs.mode === 'ai' && !inputs.aiApiKey) {
        core.warning('AI mode requested but no api-key provided. Falling back to conventional.');
      }
      entries = categorizeCommits(commits, inputs.categories, inputs.excludeTypes);
    }

    core.info('📝 Formatting changelog...');
    const result = formatChangelog(entries, inputs, version, repoUrl, range);

    // Set outputs
    core.setOutput('changelog', result.markdown);
    core.setOutput('version', result.version);
    core.setOutput('commit-count', result.commitCount.toString());
    core.setOutput('categories-found', JSON.stringify(result.categoriesFound));

    // Write to file
    if (inputs.output === 'file' || inputs.output === 'both') {
      const filePath = path.resolve(inputs.changelogPath);
      let existingContent = '';

      if (fs.existsSync(filePath)) {
        existingContent = fs.readFileSync(filePath, 'utf-8');
        // Remove existing header to prepend new version
        const headerPattern = new RegExp(`^${escapeRegex(inputs.header)}\\n+`, 'm');
        existingContent = existingContent.replace(headerPattern, '');
      }

      const newContent = existingContent
        ? `${result.markdown}\n${existingContent}`
        : result.markdown;

      fs.writeFileSync(filePath, newContent, 'utf-8');
      core.info(`✅ Changelog written to ${inputs.changelogPath}`);
    }

    // Create/update GitHub release
    if (inputs.output === 'release' || inputs.output === 'both') {
      const token = process.env.GITHUB_TOKEN;
      if (!token) {
        core.warning('GITHUB_TOKEN not available. Cannot create release.');
      } else {
        const octokit = github.getOctokit(token);
        const { owner, repo } = github.context.repo;

        // Extract just the version content (without the top-level header)
        const releaseBody = result.markdown
          .replace(new RegExp(`^${escapeRegex(inputs.header)}\\n+`), '')
          .trim();

        try {
          await octokit.rest.repos.createRelease({
            owner,
            repo,
            tag_name: version,
            name: version,
            body: releaseBody,
            draft: false,
            prerelease: version.includes('-'),
          });
          core.info(`✅ GitHub release created for ${version}`);
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          core.warning(`Failed to create release: ${errMsg}`);
        }
      }
    }

    // Always output to stdout
    if (inputs.output === 'stdout') {
      process.stdout.write(result.markdown);
    }

    core.info(`🎉 Changelog generated: ${result.commitCount} commits in ${result.categoriesFound.length} categories`);

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

run();
