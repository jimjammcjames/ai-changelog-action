import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import * as path from 'path';
import { ActionInputs, CategoryConfig } from './types';
import { generateChangelog } from './core';

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
    outputFormat: (core.getInput('output-format') || 'markdown') as 'markdown' | 'json' | 'html',
    licenseKey: core.getInput('license-key') || process.env.AI_CHANGELOG_LICENSE_KEY || '',
    polarOrgId: core.getInput('polar-org-id') || process.env.POLAR_ORG_ID || '',
  };
}

async function run(): Promise<void> {
  try {
    const inputs = getInputs();

    const result = await generateChangelog(
      inputs,
      (msg) => core.info(msg),
      (msg) => core.warning(msg),
    );

    // Set outputs
    core.setOutput('changelog', result.changelog.markdown);
    core.setOutput('version', result.changelog.version);
    core.setOutput('commit-count', result.changelog.commitCount.toString());
    core.setOutput('categories-found', JSON.stringify(result.changelog.categoriesFound));

    if (result.premiumActive) {
      if (result.breakingReport) {
        core.setOutput('breaking-changes', JSON.stringify(result.breakingReport));
      }
      if (result.versionRecommendation) {
        core.setOutput('version-recommendation', JSON.stringify(result.versionRecommendation));
      }
    }

    // Write to file
    if (inputs.output === 'file' || inputs.output === 'both') {
      const filePath = path.resolve(inputs.changelogPath);
      let existingContent = '';

      if (fs.existsSync(filePath)) {
        existingContent = fs.readFileSync(filePath, 'utf-8');
        const headerPattern = new RegExp(`^${escapeRegex(inputs.header)}\\n+`, 'm');
        existingContent = existingContent.replace(headerPattern, '');
      }

      const newContent = existingContent
        ? `${result.changelog.markdown}\n${existingContent}`
        : result.changelog.markdown;

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

        const releaseBody = result.changelog.markdown
          .replace(new RegExp(`^${escapeRegex(inputs.header)}\\n+`), '')
          .trim();

        try {
          await octokit.rest.repos.createRelease({
            owner,
            repo,
            tag_name: result.changelog.version,
            name: result.changelog.version,
            body: releaseBody,
            draft: false,
            prerelease: result.changelog.version.includes('-'),
          });
          core.info(`✅ GitHub release created for ${result.changelog.version}`);
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          core.warning(`Failed to create release: ${errMsg}`);
        }
      }
    }

    if (inputs.output === 'stdout') {
      process.stdout.write(result.changelog.markdown);
    }

    core.info(`🎉 Changelog generated: ${result.changelog.commitCount} commits in ${result.changelog.categoriesFound.length} categories`);

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
