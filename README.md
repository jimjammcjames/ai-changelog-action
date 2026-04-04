<div align="center">

# 📋 AI Changelog Generator

**Automatically generate beautiful, categorized changelogs from git commits and pull requests — with optional AI enhancement.**

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-AI%20Changelog%20Generator-blue?logo=github&style=for-the-badge)](https://github.com/marketplace/actions/ai-changelog-generator)
[![CI](https://img.shields.io/github/actions/workflow/status/jimjammcjames/ai-changelog-action/ci.yml?label=CI&logo=github&style=for-the-badge)](https://github.com/jimjammcjames/ai-changelog-action/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/ai-changelog-action?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/ai-changelog-action)
[![GitHub Stars](https://img.shields.io/github/stars/jimjammcjames/ai-changelog-action?style=for-the-badge&logo=github)](https://github.com/jimjammcjames/ai-changelog-action)

[Quick Start](#-quick-start) · [Examples](examples/) · [Inputs](#-inputs) · [Pricing](#-pricing) · [Contributing](CONTRIBUTING.md)

</div>

---

## Why?

Manually writing changelogs is tedious and error-prone. **AI Changelog Generator** reads your git history, categorizes commits using [Conventional Commits](https://www.conventionalcommits.org/) conventions (or AI), and outputs a clean, emoji-rich markdown changelog — ready for your repo or GitHub Release.

**Three lines of YAML. That's it.**

```yaml
- uses: jimjammcjames/ai-changelog-action@v1
  with:
    output: both
```

---

## ✨ Feature Comparison

| Feature | Free (Conventional) | AI-Enhanced |
|---------|:-------------------:|:-----------:|
| Conventional commit parsing | ✅ | ✅ |
| Emoji-rich categories | ✅ | ✅ |
| PR & commit links | ✅ | ✅ |
| Author attribution | ✅ | ✅ |
| Version compare links | ✅ | ✅ |
| Group by category / scope / date | ✅ | ✅ |
| Custom category labels | ✅ | ✅ |
| Write to file / release / both | ✅ | ✅ |
| AI-powered commit categorization | — | ✅ |
| Natural language rewriting | — | ✅ |
| Non-conventional commit support | Heuristic | ✅ Smart |
| AI provider choice (OpenAI / Anthropic) | — | ✅ |
| Cost | **Free forever** | Your API key |

---

## 🚀 Quick Start

### Basic — Conventional Commits (Free)

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

### AI-Enhanced — Any Commit Style

```yaml
      - uses: jimjammcjames/ai-changelog-action@v1
        with:
          mode: ai
          ai-api-key: ${{ secrets.OPENAI_API_KEY }}
          ai-model: gpt-4o-mini
          output: both
```

> 💡 See more workflow examples in the [`examples/`](examples/) directory.

---

## 📥 Inputs

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
| `exclude-types` | — | Comma-separated types to exclude (e.g., `chore,ci,style`) |
| `max-commits` | `500` | Max commits to process |

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `changelog` | The generated markdown content |
| `version` | Detected or specified version |
| `commit-count` | Number of commits processed |
| `categories-found` | JSON array of categories with entries |

---

## 📝 Example Output

```markdown
# Changelog

## v2.1.0 (2026-04-03)

[Full diff](https://github.com/you/repo/compare/v2.0.0...v2.1.0)

### ✨ Features

- **auth:** Add OAuth2 support for GitHub login (#42) (a1b2c3d) — @alice
- Implement dark mode toggle (#38) (d4e5f6g) — @bob

### 🐛 Bug Fixes

- **api:** Fix rate limiting on /search endpoint (e7f8g9h) — @charlie

### 📚 Documentation

- Update API reference for v2 endpoints (h0i1j2k) — @alice
```

---

## 🎨 Custom Categories

Override the default emoji labels:

```yaml
      - uses: jimjammcjames/ai-changelog-action@v1
        with:
          categories: |
            {"feat":"🚀 New Features","fix":"🔧 Fixes","docs":"📖 Docs"}
```

---

## 🔧 Advanced Usage

### Auto-update CHANGELOG.md on every push to main

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

### Use changelog output in a downstream step

```yaml
      - uses: jimjammcjames/ai-changelog-action@v1
        id: changelog
        with:
          output: stdout
      - run: echo "${{ steps.changelog.outputs.changelog }}"
```

### Filter out noise

```yaml
      - uses: jimjammcjames/ai-changelog-action@v1
        with:
          exclude-types: chore,ci,style,test
```

### Group by scope instead of category

```yaml
      - uses: jimjammcjames/ai-changelog-action@v1
        with:
          group-by: scope
```

### Use Anthropic Claude instead of OpenAI

```yaml
      - uses: jimjammcjames/ai-changelog-action@v1
        with:
          mode: ai
          ai-provider: anthropic
          ai-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          ai-model: claude-sonnet-4-20250514
```

---

## 📋 Conventional Commit Types

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

Non-conventional commits are heuristically categorized or placed under "📝 Other Changes". In **AI mode**, non-conventional commits are intelligently categorized by the model.

---

## 💰 Pricing

| Tier | Price | What you get |
|------|-------|-------------|
| **Free** | $0/forever | Conventional commit mode — full-featured, no limits |
| **Pro** | $9/mo | AI-powered changelogs, breaking change detection, version advisor |
| **Team** | $29/mo | Everything in Pro + unlimited repos, team license, priority support |

<!-- Checkout links — replace with real URLs after running: POLAR_ACCESS_TOKEN=<token> node scripts/setup-polar.js -->

[Get Pro →](https://polar.sh/jimjammcjames/ai-changelog-action/subscriptions?tier=pro) · [Get Team →](https://polar.sh/jimjammcjames/ai-changelog-action/subscriptions?tier=team)

### Using your license key

After subscribing, you'll receive a license key via email. Add it to your workflow:

```yaml
      - uses: jimjammcjames/ai-changelog-action@v1
        with:
          license-key: ${{ secrets.AI_CHANGELOG_LICENSE_KEY }}
          polar-org-id: '<your-org-id>'  # Optional, from Polar.sh dashboard
```

Or via CLI:

```bash
ai-changelog --license-key YOUR-KEY --breaking-report --version-recommend
```

Premium features include:
- 🔍 **Breaking change detection** — detailed analysis of API-breaking commits
- 📊 **Version advisor** — semantic version bump recommendation (major/minor/patch)
- 🤖 **AI mode** — intelligent commit categorization via OpenAI or Anthropic

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Built by AI Agents 🤖

This action was designed, built, and is maintained by [DuglePlex](https://github.com/jimjammcjames) — a team of AI agents. Yes, really.

## License

MIT — see [LICENSE](LICENSE).
