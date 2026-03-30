# dxray-core

[![npm version](https://img.shields.io/npm/v/dxray-core.svg)](https://www.npmjs.com/package/dxray-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Core analysis engine for **DX-Ray** — diagnose developer experience friction in your codebase.

## Features

Analyzes 7 critical dimensions of developer experience:

- **Git Health** — Commit patterns, bus factor, late-night work detection
- **Code Quality** — ESLint/Prettier config, TypeScript adoption, complexity analysis
- **CI/CD Pipelines** — GitHub Actions setup, caching, security scanning
- **Test Coverage** — Test framework detection, coverage ratios, test health
- **Documentation** — README freshness, staleness detection, inline docs
- **Dependencies** — Version analysis, lock files, heavy packages, security updates
- **PR Review Process** — Merge patterns, review bottlenecks, reviewer distribution

## Installation

```bash
npm install dxray-core
```

## Usage

```javascript
const { DXRay } = require("dxray-core");

// Create scanner instance
const dxray = new DXRay({ targetDir: process.cwd() });

// Scan all tracks
await dxray.scan();

// Or scan specific tracks
await dxray.scanTrack("code-quality");
await dxray.scanTrack("dependencies");

// Access results
const results = dxray.results;
console.log(`Overall Score: ${results.score}/100 (Grade: ${results.grade})`);
console.log(`Findings: ${results.summary.totalFindings}`);
console.log(`Suggestions: ${results.summary.totalSuggestions}`);

// Analyze per-track
for (const [track, data] of Object.entries(results.tracks)) {
  console.log(`${track}: ${data.score} - ${data.status}`);
}
```

## Result Structure

```javascript
{
  timestamp: "2026-03-30T12:47:36.717Z",
  targetDir: "/path/to/project",
  score: 80,        // 0-100
  grade: "B",       // A-F
  summary: {
    totalFindings: 16,
    criticalFindings: 2,
    warningFindings: 8,
    infoFindings: 6,
    totalSuggestions: 11,
    tracksScanned: 7
  },
  tracks: {
    git: { score, findings, suggestions, metrics },
    "code-quality": { score, findings, suggestions, metrics },
    cicd: { score, findings, suggestions, metrics },
    // ... 7 tracks total
  }
}
```

## Analyzer Modules

### GitAnalyzer

Analyzes version control patterns:

- Commit frequency and distribution
- Bus factor (contributor concentration)
- Late-night work patterns
- Hotspot detection

### CodeQualityAnalyzer

Checks code standards and practices:

- Linting configuration (ESLint, Biome)
- Code formatting (Prettier)
- Type safety (TypeScript)
- Code complexity indicators
- TODO/FIXME tracking

### CICDAnalyzer

Evaluates CI/CD setup:

- Pipeline configuration
- Caching strategies
- Security scanning
- Build parallelization

### TestHealthAnalyzer

Measures testing practices:

- Test framework detection
- Coverage analysis
- Test-to-code ratio
- Framework maturity

### DocsAnalyzer

Checks documentation quality:

- README freshness
- Staleness detection
- Inline documentation
- API documentation

### DependencyAnalyzer

Analyzes dependencies:

- Version management
- Lock file presence
- Large package detection
- Duplicate dependencies
- Security updates

### PRAnalyzer

Reviews code review process:

- Merge patterns
- Review bottlenecks
- Reviewer distribution
- Review time metrics

## Scoring System

DX-Ray uses a 0-100 scale with letter grades:

- **A (80-100)** — Excellent developer experience
- **B (70-79)** — Good foundation with room for improvement
- **C (60-69)** — Moderate; address key issues
- **D (50-59)** — Significant friction; requires action
- **F (0-49)** — Critical problems; major overhaul needed

Each track is scored independently and weighted into the overall DX score.

## Options

```javascript
new DXRay({
  targetDir: process.cwd(), // Directory to scan
  ignoreDirs: [
    // Directories to ignore
    "node_modules",
    ".git",
    "dist",
    "build",
  ],
});
```

## API Reference

### `scan(tracks?: string[])`

Scans specified tracks (or all if not specified).

### `scanTrack(trackName: string)`

Scans a single track by name.

### `generateReport(format: 'json'|'summary')`

Generates a formatted report of scan results.

## Use Cases

- **CI/CD Integration** — Fail builds if DX score drops below threshold
- **Team Dashboards** — Track DX health over time
- **Code Review** — Include DX metrics in PR reviews
- **Onboarding** — Identify friction points for new team members
- **Refactoring** — Prioritize improvements by impact

## License

MIT © 2026

## Links

- [DX-Ray CLI](https://www.npmjs.com/package/dx-ray)
- [GitHub](https://github.com/yourusername/dx-ray)
- [Documentation](https://dx-ray.dev)
