const { BaseAnalyzer } = require("./base-analyzer");
const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

/**
 * Test Health Analyzer (Track B)
 *
 * Scans test suites for:
 * - Test framework detection
 * - Test coverage configuration
 * - Test file ratio (test files vs source files)
 * - Test naming conventions
 * - Test complexity (assertions per test)
 * - Snapshot test overuse
 * - Missing test patterns
 */
class TestHealthAnalyzer extends BaseAnalyzer {
  constructor(targetDir, options = {}) {
    super(targetDir, options);
    this.trackName = "tests";
  }

  async analyze() {
    try {
      await this._detectTestFramework();
      await this._analyzeTestFiles();
      await this._analyzeTestCoverage();
      await this._analyzeTestPatterns();

      return this.buildResult();
    } catch (err) {
      return {
        track: this.trackName,
        status: "error",
        error: err.message,
        score: 0,
        severity: "unknown",
        findings: [],
        suggestions: [],
      };
    }
  }

  async _detectTestFramework() {
    try {
      const pkgPath = path.join(this.targetDir, "package.json");
      const pkg = JSON.parse(await fs.promises.readFile(pkgPath, "utf-8"));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      const frameworks = {
        jest: !!allDeps.jest,
        vitest: !!allDeps.vitest,
        mocha: !!allDeps.mocha,
        cypress: !!allDeps.cypress,
        playwright: !!allDeps["@playwright/test"] || !!allDeps.playwright,
        testingLibrary:
          !!allDeps["@testing-library/react"] ||
          !!allDeps["@testing-library/jest-dom"],
      };

      this.metrics.testFrameworks = frameworks;
      const detected = Object.entries(frameworks)
        .filter(([, v]) => v)
        .map(([k]) => k);

      if (detected.length === 0) {
        this.addFinding({
          severity: "critical",
          title: "No Test Framework Detected",
          description:
            "No testing framework found in dependencies. Testing is essential for code reliability.",
        });
        this.addSuggestion({
          title: "Add a Test Framework",
          description:
            "Install Jest (`npm i -D jest`) or Vitest (`npm i -D vitest`) to start writing tests.",
          priority: "high",
          impact: "high",
          effort: "medium",
        });
      }

      // Check for E2E testing
      if (!frameworks.cypress && !frameworks.playwright) {
        this.addFinding({
          severity: "info",
          title: "No E2E Testing Framework",
          description:
            "No end-to-end testing framework (Cypress/Playwright) detected. E2E tests catch integration issues.",
        });
      }
    } catch {
      // No package.json
    }
  }

  async _analyzeTestFiles() {
    const testPatterns = [
      "**/*.test.{js,jsx,ts,tsx}",
      "**/*.spec.{js,jsx,ts,tsx}",
      "**/__tests__/**/*.{js,jsx,ts,tsx}",
      "**/test/**/*.{js,jsx,ts,tsx}",
      "**/tests/**/*.{js,jsx,ts,tsx}",
    ];

    const sourcePatterns = ["**/*.{js,jsx,ts,tsx}"];
    const ignorePatterns = [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
    ];

    const [testFiles, sourceFiles] = await Promise.all([
      glob(testPatterns, {
        cwd: this.targetDir,
        ignore: ignorePatterns,
        nodir: true,
      }),
      glob(sourcePatterns, {
        cwd: this.targetDir,
        ignore: [...ignorePatterns, ...testPatterns],
        nodir: true,
      }),
    ]);

    const testRatio =
      sourceFiles.length > 0 ? testFiles.length / sourceFiles.length : 0;

    this.metrics.testFiles = {
      testFileCount: testFiles.length,
      sourceFileCount: sourceFiles.length,
      testToSourceRatio: Math.round(testRatio * 100) / 100,
      testFiles: testFiles.slice(0, 20),
    };

    if (testFiles.length === 0) {
      this.addFinding({
        severity: "critical",
        title: "No Test Files Found",
        description:
          "No test files detected in the project. Every project should have at least basic unit tests.",
      });
      this.addSuggestion({
        title: "Start Writing Tests",
        description:
          "Begin with unit tests for critical business logic. Aim for at least 60% code coverage.",
        priority: "high",
        impact: "high",
        effort: "high",
      });
    } else if (testRatio < 0.3) {
      this.addFinding({
        severity: "warning",
        title: "Low Test Coverage Ratio",
        description: `Test-to-source ratio is ${this.metrics.testFiles.testToSourceRatio}. Only ${testFiles.length} test files for ${sourceFiles.length} source files.`,
        data: { testRatio: this.metrics.testFiles.testToSourceRatio },
      });
      this.addSuggestion({
        title: "Increase Test Coverage",
        description:
          "Aim for a 1:1 test-to-source file ratio. Prioritize testing critical paths and complex logic.",
        priority: "high",
        impact: "high",
        effort: "high",
      });
    }
  }

  async _analyzeTestCoverage() {
    // Check for coverage configuration
    const coverageConfigs = [
      "jest.config.js",
      "jest.config.ts",
      "vitest.config.js",
      "vitest.config.ts",
      ".nycrc",
      ".nycrc.json",
      ".c8rc.json",
    ];

    let hasCoverageConfig = false;
    for (const config of coverageConfigs) {
      try {
        const fullPath = path.join(this.targetDir, config);
        const content = await fs.promises.readFile(fullPath, "utf-8");
        if (/coverage|collectCoverage|coverageThreshold/.test(content)) {
          hasCoverageConfig = true;
          break;
        }
      } catch {
        // File doesn't exist
      }
    }

    // Check for coverage reports
    const coverageDir = path.join(this.targetDir, "coverage");
    let hasCoverageReport = false;
    try {
      await fs.promises.access(coverageDir);
      hasCoverageReport = true;

      // Try to read coverage summary
      try {
        const summaryPath = path.join(coverageDir, "coverage-summary.json");
        const summary = JSON.parse(
          await fs.promises.readFile(summaryPath, "utf-8"),
        );
        if (summary.total) {
          this.metrics.coverageReport = {
            lines: summary.total.lines?.pct || 0,
            branches: summary.total.branches?.pct || 0,
            functions: summary.total.functions?.pct || 0,
            statements: summary.total.statements?.pct || 0,
          };

          if (summary.total.lines?.pct < 50) {
            this.addFinding({
              severity: "warning",
              title: "Low Code Coverage",
              description: `Line coverage is ${summary.total.lines.pct}%. Aim for at least 70% coverage.`,
              data: this.metrics.coverageReport,
            });
          }
        }
      } catch {
        // No summary file
      }
    } catch {
      // No coverage directory
    }

    this.metrics.coverageConfig = {
      hasConfig: hasCoverageConfig,
      hasReport: hasCoverageReport,
    };

    if (!hasCoverageConfig) {
      this.addFinding({
        severity: "info",
        title: "No Coverage Thresholds Configured",
        description:
          "No coverage thresholds found. Set minimum coverage requirements to prevent regression.",
      });
      this.addSuggestion({
        title: "Configure Coverage Thresholds",
        description:
          "Add coverageThreshold to your test config: { global: { branches: 70, functions: 70, lines: 70 } }",
        priority: "medium",
        impact: "medium",
        effort: "low",
      });
    }
  }

  async _analyzeTestPatterns() {
    const testFiles = this.metrics.testFiles?.testFiles || [];
    if (testFiles.length === 0) return;

    let snapshotTests = 0;
    let totalAssertions = 0;
    let testsWithNoAssertions = 0;
    let totalTestCases = 0;

    for (const testFile of testFiles.slice(0, 50)) {
      try {
        const fullPath = path.join(this.targetDir, testFile);
        const content = await fs.promises.readFile(fullPath, "utf-8");

        // Count snapshot tests
        const snapshots = (
          content.match(/toMatchSnapshot|toMatchInlineSnapshot/g) || []
        ).length;
        snapshotTests += snapshots;

        // Count test cases
        const testCases = (content.match(/\b(it|test)\s*\(/g) || []).length;
        totalTestCases += testCases;

        // Count assertions
        const assertions = (content.match(/expect\s*\(/g) || []).length;
        totalAssertions += assertions;

        if (testCases > 0 && assertions === 0) {
          testsWithNoAssertions++;
        }
      } catch {
        // Skip unreadable
      }
    }

    this.metrics.testPatterns = {
      totalTestCases,
      totalAssertions,
      snapshotTests,
      averageAssertionsPerTest:
        totalTestCases > 0
          ? Math.round((totalAssertions / totalTestCases) * 10) / 10
          : 0,
      testsWithNoAssertions,
    };

    if (snapshotTests > totalTestCases * 0.5 && snapshotTests > 10) {
      this.addFinding({
        severity: "warning",
        title: "Snapshot Test Overuse",
        description: `${snapshotTests} snapshot tests detected. Over-reliance on snapshots can lead to "snapshot fatigue" where developers blindly update them.`,
        data: { snapshotTests, totalTestCases },
      });
      this.addSuggestion({
        title: "Reduce Snapshot Test Dependency",
        description:
          "Replace large snapshot tests with specific assertions. Use snapshots only for stable, well-defined outputs.",
        priority: "medium",
        impact: "medium",
        effort: "medium",
      });
    }
  }
}

module.exports = { TestHealthAnalyzer };
