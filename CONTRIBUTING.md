# Contributing to AI Changelog Generator

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/jimjammcjames/ai-changelog-action.git
cd ai-changelog-action
npm install
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript and bundle with ncc |
| `npm test` | Run tests with Jest |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | Lint with ESLint |

## Workflow

1. Fork the repo and create a branch from `main`.
2. Make your changes in `src/`.
3. Add or update tests in `src/*.test.ts`.
4. Run `npm test && npm run build` — both must pass.
5. Commit the updated `dist/` folder (it's the compiled action entry point).
6. Open a pull request against `main`.

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add scope grouping option
fix(ai): handle empty commit messages gracefully
docs: update input reference table
```

## Code Style

- TypeScript strict mode.
- No `any` unless truly unavoidable (and commented).
- Keep functions small and well-named — prefer clarity over cleverness.

## Reporting Issues

Open an issue with:
- What you expected
- What actually happened
- Steps to reproduce
- Action version and runner OS

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
