# Contributing to DX-Ray

Thank you for your interest in contributing to DX-Ray! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/dx-ray.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`

## Development

```bash
# Run the CLI locally
node packages/cli/bin/dx-ray.js scan --dir /path/to/project

# Run tests
npm test

# Start the web dashboard in dev mode
npm run dev
```

## Project Structure

- `packages/core/` — Core analysis engine (analyzers + report generator)
- `packages/cli/` — CLI tool (Commander.js + embedded dashboard server)
- `apps/web/` — Next.js web dashboard

## Adding a New Analyzer

1. Create a new file in `packages/core/src/analyzers/`
2. Extend `BaseAnalyzer`
3. Implement the `analyze()` method
4. Register it in `packages/core/src/index.js`

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `refactor:` — Code refactoring
- `test:` — Tests
- `chore:` — Maintenance

## Pull Requests

1. Keep PRs focused and small
2. Add tests for new features
3. Update documentation
4. Ensure all checks pass
