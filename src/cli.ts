#!/usr/bin/env node

import { ActionInputs, CategoryConfig, OutputFormat } from './types';
import { generateChangelog } from './core';
import * as fs from 'fs';
import * as path from 'path';

function printUsage(): void {
  console.log(`
ai-changelog - AI-powered changelog generator

Usage:
  ai-changelog [options]

Options:
  --mode <mode>           Generation mode: "conventional" (default) or "ai"
  --ai-provider <p>       AI provider: "openai" (default) or "anthropic"
  --ai-api-key <key>      API key for AI provider
  --ai-model <model>      AI model (default: gpt-4o-mini)
  --output <target>       Output target: "stdout" (default), "file", or "both"
  --changelog-path <path> Path for changelog file (default: CHANGELOG.md)
  --include-range <range> Git revision range (auto-detected if not set)
  --categories <json>     JSON map of custom category labels
  --group-by <method>     Grouping: "category" (default), "scope", "date"
  --include-authors       Show commit authors (default: true)
  --no-authors            Hide commit authors
  --include-pr-links      Link to pull requests (default: true)
  --no-pr-links           Disable PR links
  --include-compare-link  Add compare link (default: true)
  --no-compare-link       Disable compare link
  --version <ver>         Version label (auto-detected if not set)
  --header <header>       Custom header (default: "# Changelog")
  --exclude-types <types> Comma-separated types to exclude (e.g. "chore,ci")
  --max-commits <n>       Maximum commits to process (default: 500)
  --format <fmt>          Output format: "markdown" (default), "json", "html"
  --license-key <key>     Polar.sh license key for premium features
  --polar-org-id <id>     Polar.sh organization ID (optional)
  --help                  Show this help message

Premium Features (require --license-key):
  --breaking-report       Show detailed breaking change analysis
  --version-recommend     Show semantic version recommendation

Examples:
  ai-changelog
  ai-changelog --format json --output stdout
  ai-changelog --mode ai --ai-api-key sk-... --output file
  ai-changelog --license-key AICL-... --breaking-report --version-recommend
`);
}

function parseArgs(argv: string[]): { inputs: ActionInputs; showBreaking: boolean; showVersionRec: boolean } {
  const args = argv.slice(2);
  let showBreaking = false;
  let showVersionRec = false;

  const opts: Record<string, string> = {};
  const flags: Set<string> = new Set();

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }
    if (arg === '--breaking-report') {
      showBreaking = true;
      continue;
    }
    if (arg === '--version-recommend') {
      showVersionRec = true;
      continue;
    }
    if (arg === '--no-authors') { flags.add('no-authors'); continue; }
    if (arg === '--no-pr-links') { flags.add('no-pr-links'); continue; }
    if (arg === '--no-compare-link') { flags.add('no-compare-link'); continue; }
    if (arg === '--include-authors') { flags.add('include-authors'); continue; }
    if (arg === '--include-pr-links') { flags.add('include-pr-links'); continue; }
    if (arg === '--include-compare-link') { flags.add('include-compare-link'); continue; }

    if (arg.startsWith('--') && i + 1 < args.length) {
      opts[arg.slice(2)] = args[++i];
    }
  }

  let categories: CategoryConfig = {};
  if (opts['categories']) {
    try { categories = JSON.parse(opts['categories']); } catch { /* use defaults */ }
  }

  const excludeRaw = opts['exclude-types'] || '';
  const excludeTypes = excludeRaw ? excludeRaw.split(',').map(s => s.trim()) : [];

  const inputs: ActionInputs = {
    mode: (opts['mode'] || 'conventional') as 'conventional' | 'ai',
    aiProvider: (opts['ai-provider'] || 'openai') as 'openai' | 'anthropic',
    aiApiKey: opts['ai-api-key'] || process.env.AI_API_KEY || '',
    aiModel: opts['ai-model'] || 'gpt-4o-mini',
    output: (opts['output'] || 'stdout') as 'file' | 'release' | 'both' | 'stdout',
    changelogPath: opts['changelog-path'] || 'CHANGELOG.md',
    includeRange: opts['include-range'] || '',
    categories,
    groupBy: (opts['group-by'] || 'category') as 'category' | 'scope' | 'date',
    includeAuthors: !flags.has('no-authors'),
    includePrLinks: !flags.has('no-pr-links'),
    includeCompareLink: !flags.has('no-compare-link'),
    version: opts['version'] || '',
    header: opts['header'] || '# Changelog',
    excludeTypes,
    maxCommits: parseInt(opts['max-commits'] || '500', 10),
    outputFormat: (opts['format'] || 'markdown') as OutputFormat,
    licenseKey: opts['license-key'] || process.env.AI_CHANGELOG_LICENSE_KEY || '',
    polarOrgId: opts['polar-org-id'] || process.env.POLAR_ORG_ID || '',
  };

  return { inputs, showBreaking, showVersionRec };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function main(): Promise<void> {
  const { inputs, showBreaking, showVersionRec } = parseArgs(process.argv);

  try {
    const result = await generateChangelog(
      inputs,
      (msg) => process.stderr.write(`${msg}\n`),
      (msg) => process.stderr.write(`⚠ ${msg}\n`),
    );

    // Write to file if requested
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
      process.stderr.write(`✅ Changelog written to ${inputs.changelogPath}\n`);
    }

    // Output to stdout
    if (inputs.output === 'stdout' || inputs.output === 'both') {
      const format = inputs.outputFormat || 'markdown';
      switch (format) {
        case 'json':
          process.stdout.write(JSON.stringify(result.changelog.json, null, 2) + '\n');
          break;
        case 'html':
          process.stdout.write((result.changelog.html || '') + '\n');
          break;
        default:
          process.stdout.write(result.changelog.markdown + '\n');
      }
    }

    // Premium: breaking change report
    if (showBreaking) {
      if (!result.premiumActive) {
        process.stderr.write('⚠ Breaking change report requires a valid license key (--license-key)\n');
      } else if (result.breakingReport) {
        process.stderr.write('\n── Breaking Change Report ──\n');
        if (result.breakingReport.changes.length === 0) {
          process.stderr.write('No breaking changes detected.\n');
        } else {
          for (const bc of result.breakingReport.changes) {
            process.stderr.write(`  ⚠ ${bc.shortHash} — ${bc.description}\n`);
            process.stderr.write(`    Reason: ${bc.reason}\n`);
            if (bc.scope) process.stderr.write(`    Scope: ${bc.scope}\n`);
          }
        }
      }
    }

    // Premium: version recommendation
    if (showVersionRec) {
      if (!result.premiumActive) {
        process.stderr.write('⚠ Version recommendation requires a valid license key (--license-key)\n');
      } else if (result.versionRecommendation) {
        const rec = result.versionRecommendation;
        process.stderr.write('\n── Version Recommendation ──\n');
        process.stderr.write(`  Bump: ${rec.bump}\n`);
        process.stderr.write(`  Reason: ${rec.reason}\n`);
        if (rec.recommendedVersion) {
          process.stderr.write(`  Suggested: ${rec.currentVersion} → ${rec.recommendedVersion}\n`);
        }
      }
    }

    const summary = `🎉 ${result.changelog.commitCount} commits in ${result.changelog.categoriesFound.length} categories`;
    process.stderr.write(`${summary}\n`);

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: ${msg}\n`);
    process.exit(1);
  }
}

main();
