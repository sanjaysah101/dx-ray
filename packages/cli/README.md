# dx-ray

[![npm version](https://img.shields.io/npm/v/dx-ray.svg)](https://www.npmjs.com/package/dx-ray)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**DX-Ray** — Command-line tool to diagnose developer experience friction in your codebase.

Scan your project in seconds and get actionable insights about code quality, testing, documentation, DevOps, and team processes.

## Quick Start

```bash
# Install globally
npm install -g dx-ray

# Run a scan
dx-ray scan

# View in web dashboard
dx-ray dashboard

# Generate a report
dx-ray report --output dx-report.json
```

## Features

🔍 **7 Diagnostic Tracks**

- Git health and commit patterns
- Code quality and standards
- CI/CD pipeline setup
- Test coverage and health
- Documentation freshness
- Dependency management
- Code review process

📊 **Scoring System**

- 0-100 overall DX score
- A-F grade rating
- Per-track breakdown
- Before/after comparison

🎨 **Beautiful Output**

- Colored terminal dashboard
- Web interface with real-time updates
- JSON report generation
- Historical scan tracking

## Installation

```bash
npm install -g dx-ray
```

Or use without installing:

```bash
npx dx-ray scan
```

## Commands

### scan

Run a complete DX health scan on your project:

```bash
dx-ray scan [options]

Options:
  -d, --dir <path>      Target directory (default: current)
  -t, --track <name>    Scan specific track (git, code-quality, etc.)
  -o, --output <file>   Save results to JSON file
  --json                Output raw JSON instead of formatted
  --open                Open web dashboard after scanning
```

Examples:

```bash
# Scan current directory
dx-ray scan

# Scan specific directory
dx-ray scan --dir /path/to/project

# Scan specific track
dx-ray scan --track code-quality

# Save results
dx-ray scan --output results.json

# Output JSON for processing
dx-ray scan --json > results.json
```

### dashboard

Open the interactive web dashboard (Prisma Studio-style):

```bash
dx-ray dashboard [options]

Options:
  -d, --dir <path>    Target directory (default: current)
  -p, --port <port>   Server port (default: 4200)
```

Examples:

```bash
# Open dashboard for current project
dx-ray dashboard

# Use different port
dx-ray dashboard --port 3000
```

### report

Generate a detailed report:

```bash
dx-ray report [options]

Options:
  -d, --dir <path>      Target directory
  -f, --format <type>   Report format (json, summary)
  -o, --output <file>   Output file path
```

### compare

Compare two scans to measure improvements:

```bash
dx-ray compare <before.json> <after.json>
```

Shows improvements across all tracks with delta calculations.

## Understanding Your Score

**Grade A (80-100)** — Excellent

- Well-established practices
- Low friction for developers
- Strong infrastructure

**Grade B (70-79)** — Good

- Solid foundation
- Some optimization opportunities
- Minor friction points

**Grade C (60-69)** — Moderate

- Inconsistent practices
- Notable friction areas
- Plan improvements

**Grade D (50-59)** — Concerning

- Significant issues
- High developer friction
- Requires action

**Grade F (0-49)** — Critical

- Multiple critical problems
- Severe friction
- Major overhaul needed

## Example Output

```
╔══════════════════════════════════════════╗
║    DX Health Score: 80/100  [B]         ║
╚══════════════════════════════════════════╝

████████████████████████░░░░░░░░░░░░░░░░░░░░░░ 80%

Findings Summary
✖ Critical: 2
⚠ Warning: 8
ℹ Info: 6
✓ Suggestions: 11

Track Results
┌─────────────────┬────────┬─────────┬───────────┐
│ Track           │ Score  │ Status  │ Findings  │
├─────────────────┼────────┼─────────┼───────────┤
│ 📊 git          │   93   │ Healthy │    1      │
│ 🔍 code-quality │   59   │ Warning │    8      │
│ ⚙️  cicd         │   93   │ Healthy │    1      │
│ 🧪 tests        │   66   │ Warning │    4      │
│ 📝 docs         │   91   │ Healthy │    2      │
│ 📦 dependencies │  100   │ Healthy │    0      │
│ 👀 pr-review    │  100   │ Healthy │    0      │
└─────────────────┴────────┴─────────┴───────────┘
```

## Scan Results

Results are automatically saved to `.dx-ray/latest-scan.json` and `.dx-ray/history/` for future reference.

## CI/CD Integration

Use in your GitHub Actions workflow:

```yaml
- name: DX-Ray Scan
  run: dx-ray scan --output results.json

- name: Check DX Score
  run: |
    SCORE=$(jq '.score' results.json)
    if [ "$SCORE" -lt 70 ]; then
      echo "DX Score too low: $SCORE"
      exit 1
    fi
```

## Configuration

Create `.dx-rayrc.json` to customize behavior:

```json
{
  "ignore": ["node_modules", ".next", "dist"],
  "tracks": ["code-quality", "tests", "docs"],
  "thresholds": {
    "critical": 80,
    "warning": 60
  }
}
```

## Use Cases

✅ **Before/After Metrics** — Track improvements over time
✅ **Team Onboarding** — Identify friction for new developers
✅ **Code Review** — Include DX metrics in PR reviews
✅ **Refactoring Prioritization** — Focus on high-impact improvements
✅ **Team Dashboards** — Visualize DX health trends
✅ **CI/CD Gating** — Fail builds if DX regression detected

## Troubleshooting

### Scan hangs or times out

- Check for large directories with many files
- Use `--track` to scan specific tracks
- Check available disk space

### No scan results

- Ensure target directory exists
- Check file permissions
- Verify no antivirus interference

### Dashboard not loading

- Ensure port is available
- Check firewall settings
- Try different port: `dx-ray dashboard --port 3000`

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](https://github.com/yourusername/dx-ray/blob/main/CONTRIBUTING.md)

## License

MIT © 2026

## Links

- [Core Library](https://www.npmjs.com/package/dxray-core)
- [GitHub](https://github.com/yourusername/dx-ray)
- [Documentation](https://dx-ray.dev)

## Support

Report bugs and request features on [GitHub](https://github.com/yourusername/dx-ray/issues)
