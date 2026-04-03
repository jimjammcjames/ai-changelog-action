# AI Changelog Generator

> Automatically generate beautiful, categorized changelogs from your git commits and pull requests — with optional AI enhancement.

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-AI%20Changelog-blue?logo=github)](https://github.com/marketplace/actions/ai-changelog-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why?

Manually writing changelogs is tedious. `ai-changelog-action` reads your git history, categorizes commits using [Conventional Commits](https://www.conventionalcommits.org/) conventions (or AI), and outputs a clean, emoji-rich markdown changelog — ready for your repo or GitHub Release.

### Two modes

| Mode | Cost | Best for |
|------|------|----------|
| **Conventional** (default) | Free forever | Teams using conventional commits |
| **AI-enhanced** | Uses your OpenAI/Anthropic key | Any commit style — AI categorizes & rewrites |

## Quick Start

### Basic (conventional commits)

```yaml
name: Generate Changelog
on:
  push:
    tags: ['v*']

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history needed

      - uses: jimjammcjames/ai-changelog-action@v1
        with:
          output: both  # Write CHANGELOG.md + create GitHub Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### AI-enhanced

```yaml
      - uses: jimjammcjames/ai-changelog-action@v1
        with:
          mode: ai
          ai-api-key: ${{ secrets.OPENAI_API_KEY }}
          ai-model: gpt-4o-mini
          output: file
```

## Inputs

| Input | Default | Description |
|-------|---------|-------------|
| `mode` | `conventional` | `conventional` (rule-based) or `ai` (AI-enhanced) |
| `ai-provider` | `openai` | AI provider: `openai` or `anthropic` |
| `ai-api-key` | — | API key for AI provider (required for `ai` mode) |
| `ai-model` | `gpt-4o-mini` | Model to use for AI generation |
| `output` | `file` | `file`, `release`, `both`, or `stdout` |
| `changelog-path` | `CHANGELOG.md` | Path for the changelog file |
| `include-range` | auto | Git revision range (e.g., `v1.0.0..HEAD`) |
| `categories` | — | Custom category labels as JSON |
| `group-by` | `category` | Group by `category`, `scope`, or `date` |
| `include-authors` | `true` | Show commit authors |
| `include-pr-links` | `true` | Link to pull requests |
| `include-compare-link` | `true` | Add version compare link |
| `version` | auto | Version label (auto-detected from tags) |
| `header` | `# Changelog` | Custom header text |
| `exclude-types` | — | Comma-separated types to exclude |
| `max-commits` | `500` | Max commits to process |

## Outputs

| Output | Description |
|--------|-------------|
| `changelog` | The generated markdown content |
| `version` | Detected or specified version |
| `commit-count` | Number of commits processed |
| `categories-found` | JSON array of categories with entries |

## Example Output

```markdown
# Changelog

## v2.1.0 (2026-04-03)

[Full diff](https://github.com/you/repo/compare/v2.0.0...v2.1.0)

### ✨ Features

- **auth:** Add OAuth2 support for GitHub login ([#42](https://github.com/you/repo/pull/42)) ([a1b2c3d](https://github.com/you/repo/commit/a1b2c3d)) — @alice
- Implement dark mode toggle ([#38](https://github.com/you/repo/pull/38)) ([d4e5f6g](https://github.com/you/repo/commit/d4e5f6g)) — @bob

### 🐛 Bug Fixes

- **api:** Fix rate limiting on /search endpoint ([e7f8g9h](https://github.com/you/repo/commit/e7f8g9h)) — @charlie

### 📚 Documentation

- Update API reference for v2 endpoints ([h0i1j2k](https://github.com/you/repo/commit/h0i1j2k)) — @alice
```

## Custom Categories

Override the default emoji labels:

```yaml
      - uses: jimjammcjames/ai-changelog-action@v1
        with:
          categories: |
            {"feat":"🚀 New Features","fix":"🔧 Fixes","docs":"📖 Docs"}
```

## Advanced Examples

### On every push to main (prepend to CHANGELOG.md)

```yaml
on:
  push:
    branches: [main]

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: jimjammcjames/ai-changelog-action@v1
        id: changelog
        with:
          output: file
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'docs: update changelog'
          file_pattern: CHANGELOG.md
```

### Use changelog output in another step

```yaml
      - uses: jimjammcjames/ai-changelog-action@v1
        id: changelog
        with:
          output: stdout
      - run: echo "${{ steps.changelog.outputs.changelog }}"
```

### Exclude noise

```yaml
      - uses: jimjammcjames/ai-changelog-action@v1
        with:
          exclude-types: chore,ci,style,test
```

## Conventional Commit Types

The action recognizes these types out of the box:

| Type | Category | Emoji |
|------|----------|-------|
| `feat` | Features | ✨ |
| `fix` | Bug Fixes | 🐛 |
| `docs` | Documentation | 📚 |
| `style` | Styling | 💅 |
| `refactor` | Refactoring | ♻️ |
| `perf` | Performance | ⚡ |
| `test` | Tests | ✅ |
| `build` | Build | 📦 |
| `ci` | CI/CD | 🔧 |
| `chore` | Chores | 🧹 |
| `revert` | Reverts | ⏪ |

Non-conventional commits are heuristically categorized or placed under "📝 Other Changes".

## Built by AI Agents 🤖

This action was designed, built, and is maintained by [DuglePlex](https://github.com/jimjammcjames) — a team of AI agents. Yes, really.

## License

MIT — see [LICENSE](LICENSE).
