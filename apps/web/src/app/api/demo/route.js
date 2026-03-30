import { NextResponse } from 'next/server';

/**
 * Demo data endpoint — returns realistic anonymized scan results
 * for demonstration purposes. This shows what DX-Ray looks like
 * when scanning a real-world codebase.
 */
export async function GET() {
  return NextResponse.json(getDemoData());
}

function getDemoData() {
  return {
    timestamp: new Date().toISOString(),
    targetDir: '/projects/acme-webapp',
    score: 52,
    grade: 'F',
    summary: {
      totalFindings: 28,
      criticalFindings: 6,
      warningFindings: 14,
      infoFindings: 8,
      totalSuggestions: 22,
      tracksScanned: 7,
      tracksWithErrors: 0,
    },
    tracks: {
      git: {
        track: 'git',
        status: 'complete',
        score: 58,
        severity: 'critical',
        metrics: {
          commitPatterns: {
            totalCommits: 1247,
            peakHour: 23,
            lateNightPercentage: 34,
            weekendPercentage: 22,
            hourDistribution: [12, 8, 5, 3, 2, 1, 4, 18, 45, 78, 95, 102, 88, 92, 105, 98, 87, 72, 55, 42, 38, 35, 28, 18],
            dayDistribution: [89, 198, 215, 223, 210, 195, 117],
          },
          commitMessages: {
            shortMessages: 187,
            shortMessagePercentage: 15,
            noConventionalPrefix: 823,
            noPrefixPercentage: 66,
            wipCommits: 34,
            fixTypoCommits: 28,
          },
          busFactor: {
            value: 1,
            totalAuthors: 8,
            topContributors: [
              { author: 'alex@acme.dev', commits: 612, percentage: 49 },
              { author: 'jordan@acme.dev', commits: 234, percentage: 19 },
              { author: 'sam@acme.dev', commits: 156, percentage: 13 },
              { author: 'casey@acme.dev', commits: 98, percentage: 8 },
              { author: 'taylor@acme.dev', commits: 67, percentage: 5 },
            ],
          },
          hotspotFiles: [
            { file: 'src/components/Dashboard.jsx', changes: 89, authors: 5 },
            { file: 'src/utils/api.js', changes: 67, authors: 4 },
            { file: 'src/store/reducers.js', changes: 54, authors: 3 },
            { file: 'src/pages/checkout.jsx', changes: 48, authors: 6 },
            { file: 'src/config/routes.js', changes: 42, authors: 2 },
          ],
          branches: { total: 47, current: 'main' },
          commitSizes: {
            averageSize: 245,
            largeCommits: 89,
            largeCommitPercentage: 28,
          },
        },
        findings: [
          {
            id: 'git-1', track: 'git', severity: 'critical',
            title: 'Critical Bus Factor',
            description: 'Bus factor is 1. alex@acme.dev has made 49% of all commits. If they leave, the project is at serious risk.',
          },
          {
            id: 'git-2', track: 'git', severity: 'warning',
            title: 'High Late-Night Commit Rate',
            description: '34% of commits happen between 10 PM and 5 AM. This indicates unsustainable work patterns.',
          },
          {
            id: 'git-3', track: 'git', severity: 'warning',
            title: 'Significant Weekend Work',
            description: '22% of commits happen on weekends, suggesting work-life balance issues.',
          },
          {
            id: 'git-4', track: 'git', severity: 'warning',
            title: 'Too Many Large Commits',
            description: '28% of commits change more than 500 lines. Large commits are harder to review.',
          },
          {
            id: 'git-5', track: 'git', severity: 'warning',
            title: 'Code Hotspots Detected',
            description: 'Dashboard.jsx has been changed 89 times. Frequently changed files are bug magnets.',
          },
          {
            id: 'git-6', track: 'git', severity: 'info',
            title: 'No Conventional Commit Format',
            description: '66% of commits don\'t follow conventional commit format.',
          },
        ],
        suggestions: [
          {
            title: 'Improve Knowledge Distribution',
            description: 'Implement pair programming and cross-team code reviews to reduce bus factor risk.',
            priority: 'high', impact: 'high', effort: 'medium',
          },
          {
            title: 'Address Late-Night Work Patterns',
            description: 'Review sprint planning and workload distribution to reduce burnout risk.',
            priority: 'high', impact: 'high', effort: 'low',
          },
          {
            title: 'Refactor Hotspot Files',
            description: 'Break down Dashboard.jsx (89 changes) into smaller, focused components.',
            priority: 'medium', impact: 'high', effort: 'high',
          },
          {
            title: 'Enforce Commit Message Standards',
            description: 'Use commitlint with Conventional Commits and Husky git hooks.',
            priority: 'medium', impact: 'medium', effort: 'low',
          },
        ],
      },
      'code-quality': {
        track: 'code-quality',
        status: 'complete',
        score: 38,
        severity: 'critical',
        metrics: {
          tooling: {
            eslint: true, prettier: false, biome: false, typescript: false,
            husky: false, lintStaged: false, editorconfig: false,
            jest: true, vitest: false, commitlint: false,
          },
          sourceFiles: {
            totalFiles: 234,
            totalLines: 48720,
            averageFileSize: 208,
            languageDistribution: { js: 189, jsx: 45, ts: 0, tsx: 0, other: 0 },
            largeFiles: [
              { file: 'src/components/Dashboard.jsx', lines: 1247 },
              { file: 'src/utils/api.js', lines: 892 },
              { file: 'src/store/reducers.js', lines: 756 },
              { file: 'src/pages/checkout.jsx', lines: 634 },
            ],
            todos: 47,
            fixmes: 12,
            hacks: 8,
            consoleLogs: 156,
          },
          typeSafety: {
            jsFiles: 234, tsFiles: 0, typescriptPercentage: 0, isFullyTyped: false,
          },
        },
        findings: [
          {
            id: 'cq-1', track: 'code-quality', severity: 'warning',
            title: 'No TypeScript Adoption',
            description: 'Entire codebase is JavaScript. TypeScript catches 15-25% of bugs at compile time.',
          },
          {
            id: 'cq-2', track: 'code-quality', severity: 'warning',
            title: 'Missing: Prettier',
            description: 'No auto-formatter configured. Formatting debates waste developer time.',
          },
          {
            id: 'cq-3', track: 'code-quality', severity: 'warning',
            title: 'Missing: Husky',
            description: 'No git hooks to enforce quality checks before commits.',
          },
          {
            id: 'cq-4', track: 'code-quality', severity: 'warning',
            title: 'Console.log Pollution',
            description: '156 console.log statements found. Replace with proper logging.',
          },
          {
            id: 'cq-5', track: 'code-quality', severity: 'warning',
            title: '4 Large Files Detected',
            description: 'Dashboard.jsx has 1,247 lines. Large files are harder to maintain.',
          },
          {
            id: 'cq-6', track: 'code-quality', severity: 'warning',
            title: 'Technical Debt Markers',
            description: '12 FIXME and 8 HACK comments indicate known technical debt.',
          },
          {
            id: 'cq-7', track: 'code-quality', severity: 'info',
            title: 'High TODO Count',
            description: '47 TODO comments. Consider creating issues for tracking.',
          },
        ],
        suggestions: [
          {
            title: 'Migrate to TypeScript',
            description: 'Start with utility files and shared types. TypeScript reduces bugs by 15-25%.',
            priority: 'high', impact: 'high', effort: 'high',
          },
          {
            title: 'Add Prettier for Formatting',
            description: 'Run `npm install -D prettier` and create .prettierrc to eliminate style debates.',
            priority: 'medium', impact: 'medium', effort: 'low',
          },
          {
            title: 'Add Git Hooks with Husky',
            description: 'Run `npx husky-init` to enforce linting and tests before commits.',
            priority: 'medium', impact: 'high', effort: 'low',
          },
          {
            title: 'Replace Console.log with Proper Logging',
            description: 'Use pino or winston for structured logging. Add ESLint no-console rule.',
            priority: 'medium', impact: 'medium', effort: 'low',
          },
        ],
      },
      cicd: {
        track: 'cicd',
        status: 'complete',
        score: 48,
        severity: 'critical',
        metrics: {
          pipeline: { system: 'GitHub Actions', configFiles: ['.github/workflows/ci.yml'], workflowCount: 1 },
          pipelineSteps: {
            totalSteps: 12, hasTests: true, hasLinting: true,
            hasBuild: true, hasDeploy: false, hasNotifications: false,
          },
          caching: { enabled: false },
          security: { hasSecurityScanning: false },
          parallelization: { enabled: false },
        },
        findings: [
          {
            id: 'ci-1', track: 'cicd', severity: 'warning',
            title: 'No CI Caching Configured',
            description: 'No dependency caching detected. Caching can reduce build times by 30-60%.',
          },
          {
            id: 'ci-2', track: 'cicd', severity: 'warning',
            title: 'No Security Scanning in CI',
            description: 'No security scanning tools detected. Add npm audit or Snyk.',
          },
          {
            id: 'ci-3', track: 'cicd', severity: 'info',
            title: 'No Parallelization in CI',
            description: 'Pipeline has 12 steps but no parallelization. Running in parallel reduces build time.',
          },
          {
            id: 'ci-4', track: 'cicd', severity: 'info',
            title: 'No Deployment Pipeline',
            description: 'No deployment step detected. Consider adding automated deployments.',
          },
        ],
        suggestions: [
          {
            title: 'Enable CI Caching',
            description: 'Add actions/cache for node_modules. Expected improvement: 30-60% faster builds.',
            priority: 'high', impact: 'high', effort: 'low',
          },
          {
            title: 'Add Security Scanning',
            description: 'Add `npm audit` or integrate Snyk/CodeQL for automated security scanning.',
            priority: 'high', impact: 'high', effort: 'low',
          },
          {
            title: 'Parallelize CI Jobs',
            description: 'Split lint, test, and build into parallel jobs to reduce total build time.',
            priority: 'medium', impact: 'high', effort: 'medium',
          },
        ],
      },
      tests: {
        track: 'tests',
        status: 'complete',
        score: 42,
        severity: 'critical',
        metrics: {
          testFrameworks: {
            jest: true, vitest: false, mocha: false,
            cypress: false, playwright: false, testingLibrary: true,
          },
          testFiles: {
            testFileCount: 23,
            sourceFileCount: 234,
            testToSourceRatio: 0.1,
          },
          coverageReport: {
            lines: 34, branches: 22, functions: 28, statements: 33,
          },
          testPatterns: {
            totalTestCases: 67,
            totalAssertions: 89,
            snapshotTests: 42,
            averageAssertionsPerTest: 1.3,
            testsWithNoAssertions: 5,
          },
        },
        findings: [
          {
            id: 'test-1', track: 'tests', severity: 'critical',
            title: 'Low Test Coverage Ratio',
            description: 'Only 23 test files for 234 source files (0.1 ratio). Aim for 1:1.',
          },
          {
            id: 'test-2', track: 'tests', severity: 'warning',
            title: 'Low Code Coverage',
            description: 'Line coverage is 34%. Aim for at least 70%.',
          },
          {
            id: 'test-3', track: 'tests', severity: 'warning',
            title: 'Snapshot Test Overuse',
            description: '42 snapshot tests out of 67 total (63%). Over-reliance on snapshots.',
          },
          {
            id: 'test-4', track: 'tests', severity: 'info',
            title: 'No E2E Testing Framework',
            description: 'No Cypress or Playwright detected. E2E tests catch integration issues.',
          },
        ],
        suggestions: [
          {
            title: 'Increase Test Coverage',
            description: 'Prioritize testing critical paths: checkout, auth, and data processing.',
            priority: 'high', impact: 'high', effort: 'high',
          },
          {
            title: 'Reduce Snapshot Test Dependency',
            description: 'Replace large snapshots with specific assertions for better test quality.',
            priority: 'medium', impact: 'medium', effort: 'medium',
          },
          {
            title: 'Add E2E Testing',
            description: 'Install Playwright for end-to-end testing of critical user flows.',
            priority: 'medium', impact: 'high', effort: 'high',
          },
        ],
      },
      docs: {
        track: 'docs',
        status: 'complete',
        score: 65,
        severity: 'warning',
        metrics: {
          essentialDocs: {
            found: ['README.md', 'LICENSE'],
            missing: ['CONTRIBUTING.md', 'CHANGELOG.md', '.env.example'],
            completeness: 40,
          },
          docFreshness: {
            totalDocs: 12,
            staleDocs: 7,
            stalePercentage: 58,
            averageAgeDays: 234,
            oldestDocs: [
              { file: 'docs/architecture.md', ageDays: 456 },
              { file: 'docs/api-guide.md', ageDays: 389 },
              { file: 'docs/deployment.md', ageDays: 312 },
            ],
          },
          readmeQuality: {
            hasTitle: true, hasDescription: true, hasInstallation: true,
            hasUsage: false, hasContributing: false, hasLicense: true,
            hasBadges: false, hasCodeExamples: true, wordCount: 234,
          },
        },
        findings: [
          {
            id: 'doc-1', track: 'docs', severity: 'warning',
            title: 'Stale Documentation',
            description: '58% of docs haven\'t been updated in 6+ months. Stale docs mislead developers.',
          },
          {
            id: 'doc-2', track: 'docs', severity: 'info',
            title: 'Missing CONTRIBUTING.md',
            description: 'No contribution guidelines for new developers.',
          },
          {
            id: 'doc-3', track: 'docs', severity: 'info',
            title: 'Missing .env.example',
            description: 'No example environment variables file for onboarding.',
          },
          {
            id: 'doc-4', track: 'docs', severity: 'info',
            title: 'README Missing Key Sections',
            description: 'README is missing: Usage/Examples, Contributing guidelines.',
          },
        ],
        suggestions: [
          {
            title: 'Review and Update Stale Docs',
            description: '7 docs are stale. Start with architecture.md (456 days old).',
            priority: 'medium', impact: 'medium', effort: 'medium',
          },
          {
            title: 'Create .env.example',
            description: 'Add example environment variables to speed up onboarding.',
            priority: 'medium', impact: 'medium', effort: 'low',
          },
        ],
      },
      dependencies: {
        track: 'dependencies',
        status: 'complete',
        score: 71,
        severity: 'warning',
        metrics: {
          dependencies: { direct: 67, dev: 34, peer: 3, total: 101 },
          versionStrategy: { pinned: 12, range: 85, wildcard: 4 },
          lockFile: { file: 'package-lock.json', manager: 'npm' },
        },
        findings: [
          {
            id: 'dep-1', track: 'dependencies', severity: 'critical',
            title: 'Wildcard Dependencies',
            description: '4 dependencies use wildcard (*) or "latest" versions. Non-reproducible builds.',
          },
          {
            id: 'dep-2', track: 'dependencies', severity: 'warning',
            title: 'High Dependency Count',
            description: '67 direct production dependencies. Large trees increase security risk.',
          },
          {
            id: 'dep-3', track: 'dependencies', severity: 'info',
            title: 'Heavy Dependency: moment',
            description: 'moment is 300KB+. Use date-fns or dayjs instead (2-7KB).',
          },
          {
            id: 'dep-4', track: 'dependencies', severity: 'info',
            title: 'No Engine Constraints',
            description: 'No engines field in package.json. Specify Node.js version.',
          },
        ],
        suggestions: [
          {
            title: 'Pin Dependency Versions',
            description: 'Replace wildcard versions with specific ranges for reproducible builds.',
            priority: 'high', impact: 'high', effort: 'low',
          },
          {
            title: 'Replace moment with date-fns',
            description: 'Save 293KB+ by switching from moment to date-fns or dayjs.',
            priority: 'low', impact: 'medium', effort: 'medium',
          },
          {
            title: 'Audit Dependencies',
            description: 'Run `npx depcheck` to find and remove unused dependencies.',
            priority: 'medium', impact: 'medium', effort: 'medium',
          },
        ],
      },
      'pr-review': {
        track: 'pr-review',
        status: 'complete',
        score: 55,
        severity: 'critical',
        metrics: {
          mergePatterns: {
            totalMerges: 156,
            totalCommits: 1247,
            mergePercentage: 13,
            avgHoursBetweenMerges: 96,
          },
          reviewDistribution: {
            mergers: [
              { author: 'alex@acme.dev', merges: 98 },
              { author: 'jordan@acme.dev', merges: 34 },
              { author: 'sam@acme.dev', merges: 24 },
            ],
            totalAuthors: 8,
          },
        },
        findings: [
          {
            id: 'pr-1', track: 'pr-review', severity: 'warning',
            title: 'Slow Merge Cadence',
            description: 'Average time between merges is 96 hours (~4 days). Faster cycles reduce integration risk.',
          },
          {
            id: 'pr-2', track: 'pr-review', severity: 'warning',
            title: 'Review Bottleneck',
            description: 'alex@acme.dev handles 63% of all merges. Single point of failure.',
          },
        ],
        suggestions: [
          {
            title: 'Speed Up Code Reviews',
            description: 'Set a team SLA: first review within 4 hours. Use automated checks.',
            priority: 'high', impact: 'high', effort: 'medium',
          },
          {
            title: 'Distribute Review Responsibility',
            description: 'Use CODEOWNERS and round-robin reviewer assignment.',
            priority: 'high', impact: 'high', effort: 'low',
          },
        ],
      },
    },
  };
}
