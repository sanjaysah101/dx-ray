# DX-Ray 🔬

> **Diagnose developer experience friction. Make invisible problems visible — and fixable.**

DX-Ray scans your codebase, git history, CI/CD pipelines, test suites, documentation, and dependencies to reveal hidden friction that slows your team down. Like a medical X-ray, it shows what's broken beneath the surface.

![DX-Ray Dashboard](https://img.shields.io/badge/DX--Ray-v1.0.0-cyan?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D18-blue?style=for-the-badge)

---

## ✨ Features

### 7 Diagnostic Tracks

| Track                 | What it scans                         | Key insights                             |
| --------------------- | ------------------------------------- | ---------------------------------------- |
| 📊 **Git Analysis**   | Commit patterns, hotspots, bus factor | Late-night work, knowledge concentration |
| 🔍 **Code Quality**   | Tooling, type safety, complexity      | Missing ESLint/TS, large files, TODOs    |
| ⚙️ **CI/CD Scanner**  | Pipeline config, caching, security    | Missing tests in CI, no caching          |
| 🧪 **Test Health**    | Coverage, frameworks, patterns        | Low coverage, snapshot overuse           |
| 📝 **Docs Freshness** | README quality, staleness             | Stale docs, missing sections             |
| 📦 **Dependencies**   | Count, versions, heavy deps           | Wildcard versions, moment.js             |
| 👀 **PR Review**      | Merge patterns, bottlenecks           | Slow reviews, single reviewer            |

### Key Capabilities

- **🎯 DX Health Score** — A single 0-100 score with letter grade (A-F)
- **💡 Actionable Suggestions** — Prioritized fixes with effort/impact ratings
- **📈 Before & After** — Compare scans to measure improvement over time
- **🌐 Web Dashboard** — Beautiful dark-mode dashboard (Prisma Studio style)
- **⌨️ CLI Tool** — Full-featured command-line interface
- **📊 Historical Tracking** — Track DX health over time

---

## 🚀 Quick Start

### Install

```bash
# Clone the repo
git clone https://github.com/your-org/dx-ray.git
cd dx-ray

# Install dependencies
npm install

# Link the CLI globally (optional)
npm link --workspace=packages/cli
```

### Scan Your Codebase

```bash
# Run a full DX scan
npx dx-ray scan

# Scan a specific directory
npx dx-ray scan --dir /path/to/your/project

# Scan a specific track
npx dx-ray scan --track git
npx dx-ray scan --track code-quality

# Output as JSON
npx dx-ray scan --json

# Save results to file
npx dx-ray scan --output report.json
```

### Open the Dashboard

```bash
# Open the web dashboard (like Prisma Studio)
npx dx-ray dashboard

# Or scan and open dashboard in one command
npx dx-ray scan --open
```

### Compare Before & After

```bash
# Run initial scan
npx dx-ray scan --output before.json

# ... make improvements ...

# Run scan again
npx dx-ray scan --output after.json

# Compare results
npx dx-ray compare before.json after.json
```

---

## 📊 Example Output

```
  ╔══════════════════════════════════════════════╗
  ║       DX Health Score: 62/100  [D]          ║
  ╚══════════════════════════════════════════════╝

  ████████████████████████░░░░░░░░░░░░░░░░░░ 62%

  Findings Summary
  ✖ Critical: 3
  ⚠ Warning:  8
  ℹ Info:     5
  ✔ Suggestions: 12

  ┌──────────────────┬──────────┬────────────┬────────────┬─────────────────────────────────────────────┐
  │ Track            │ Score    │ Status     │ Findings   │ Top Issue                                   │
  ├──────────────────┼──────────┼────────────┼────────────┼─────────────────────────────────────────────┤
  │ 📊 git           │ 71       │ Warning    │ 4          │ Critical Bus Factor                         │
  │ 🔍 code-quality  │ 45       │ Critical   │ 6          │ No TypeScript Adoption                      │
  │ ⚙️ cicd          │ 55       │ Critical   │ 4          │ No Tests in CI Pipeline                     │
  │ 🧪 tests         │ 38       │ Critical   │ 5          │ No Test Files Found                         │
  │ 📝 docs          │ 78       │ Warning    │ 3          │ Stale Documentation                         │
  │ 📦 dependencies  │ 82       │ Healthy    │ 2          │ High Dependency Count                       │
  │ 👀 pr-review     │ 90       │ Healthy    │ 1          │ No Merge Commits Found                      │
  └──────────────────┴──────────┴────────────┴────────────┴─────────────────────────────────────────────┘

  💡 Top Suggestions

  1. Migrate to TypeScript [HIGH]
     TypeScript catches 15-25% of bugs at compile time...

  2. Add Test Framework [HIGH]
     Install Jest or Vitest to start writing tests...

  3. Add Tests to CI Pipeline [HIGH]
     Tests should be a mandatory step in every pipeline...
```

---

## 🏗️ Architecture

```
dx-ray/
├── packages/
│   ├── core/           # Analysis engine (shared logic)
│   │   └── src/
│   │       ├── analyzers/    # 7 track analyzers
│   │       └── report/       # Report generation
│   └── cli/            # CLI tool (Commander.js)
│       ├── bin/        # Entry point (dx-ray command)
│       └── src/        # CLI rendering & embedded server
├── apps/
│   └── web/            # Next.js dashboard
└── demo/               # Demo data for presentations
```

---

## 🎯 Evaluation Criteria

This tool is built for the **DX-Ray Hackathon** and addresses:

- ✅ **Real DX Problem** — Identifies invisible friction across 7 development dimensions
- ✅ **Actionable Insights** — Every finding comes with a prioritized, effort-rated suggestion
- ✅ **Code Quality** — Modular architecture, clean separation of concerns
- ✅ **Intuitive UX** — Beautiful CLI output + web dashboard
- ✅ **Real Data Demo** — Scans actual codebases with real metrics
- ✅ **Before & After** — Built-in comparison to show measurable improvement
- ✅ **Open Source Ready** — MIT license, docs, CI-ready
- ✅ **Cross-Track Integration** — Connects insights from all 7 tracks into a unified health score

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Development
npm install
npm run dev

# Run the CLI locally
node packages/cli/bin/dx-ray.js scan --dir /path/to/project
```

---

## 📄 License

MIT © DX-Ray Contributors
