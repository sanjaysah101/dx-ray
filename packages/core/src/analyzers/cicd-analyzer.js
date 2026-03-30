const { BaseAnalyzer } = require("./base-analyzer");
const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

/**
 * CI/CD Pipeline Analyzer (Track A)
 *
 * Scans CI/CD configuration for:
 * - Pipeline configuration presence and type
 * - Build step analysis
 * - Caching configuration
 * - Parallelization opportunities
 * - Security scanning steps
 * - Deployment configuration
 * - Estimated build time bottlenecks
 */
class CICDAnalyzer extends BaseAnalyzer {
  constructor(targetDir, options = {}) {
    super(targetDir, options);
    this.trackName = "cicd";
  }

  async analyze() {
    try {
      const pipeline = await this._detectPipeline();

      if (!pipeline) {
        this.addFinding({
          severity: "critical",
          title: "No CI/CD Pipeline Detected",
          description:
            "No CI/CD configuration found. Continuous integration is essential for catching bugs early and maintaining code quality.",
        });
        this.addSuggestion({
          title: "Set Up CI/CD Pipeline",
          description:
            "Add a GitHub Actions workflow (.github/workflows/ci.yml) to run tests and linting on every push and PR.",
          priority: "high",
          impact: "high",
          effort: "medium",
        });
        return this.buildResult();
      }

      await this._analyzePipelineConfig(pipeline);
      await this._checkCaching(pipeline);
      await this._checkSecuritySteps(pipeline);
      await this._checkParallelization(pipeline);

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

  /**
   * Detect which CI/CD system is in use
   */
  async _detectPipeline() {
    const ciSystems = [
      {
        name: "GitHub Actions",
        patterns: [".github/workflows/*.yml", ".github/workflows/*.yaml"],
      },
      { name: "GitLab CI", patterns: [".gitlab-ci.yml"] },
      { name: "Jenkins", patterns: ["Jenkinsfile"] },
      { name: "CircleCI", patterns: [".circleci/config.yml"] },
      { name: "Travis CI", patterns: [".travis.yml"] },
      { name: "Azure Pipelines", patterns: ["azure-pipelines.yml"] },
      { name: "Bitbucket Pipelines", patterns: ["bitbucket-pipelines.yml"] },
    ];

    for (const ci of ciSystems) {
      for (const pattern of ci.patterns) {
        const files = await glob(pattern, {
          cwd: this.targetDir,
          absolute: true,
          nodir: true,
        });
        if (files.length > 0) {
          const configs = [];
          for (const file of files) {
            try {
              const content = await fs.promises.readFile(file, "utf-8");
              configs.push({
                file: path.relative(this.targetDir, file),
                content,
              });
            } catch {
              // Skip unreadable
            }
          }
          return { name: ci.name, configs };
        }
      }
    }

    return null;
  }

  /**
   * Analyze pipeline configuration
   */
  async _analyzePipelineConfig(pipeline) {
    this.metrics.pipeline = {
      system: pipeline.name,
      configFiles: pipeline.configs.map((c) => c.file),
      workflowCount: pipeline.configs.length,
    };

    let totalSteps = 0;
    let hasTests = false;
    let hasLinting = false;
    let hasBuild = false;
    let hasDeploy = false;
    let hasNotifications = false;

    for (const config of pipeline.configs) {
      const content = config.content.toLowerCase();

      // Count steps (rough estimate)
      const stepMatches = content.match(/- (run|uses|name):/g);
      totalSteps += stepMatches ? stepMatches.length : 0;

      // Check for common CI steps
      if (/test|jest|vitest|mocha|pytest|rspec/.test(content)) hasTests = true;
      if (/lint|eslint|biome|prettier|rubocop|flake8/.test(content))
        hasLinting = true;
      if (/build|compile|webpack|vite|tsc/.test(content)) hasBuild = true;
      if (/deploy|publish|release|aws|gcp|azure|vercel|netlify/.test(content))
        hasDeploy = true;
      if (/slack|discord|email|notify|teams/.test(content))
        hasNotifications = true;
    }

    this.metrics.pipelineSteps = {
      totalSteps,
      hasTests,
      hasLinting,
      hasBuild,
      hasDeploy,
      hasNotifications,
    };

    if (!hasTests) {
      this.addFinding({
        severity: "critical",
        title: "No Tests in CI Pipeline",
        description:
          "CI pipeline does not appear to run tests. Tests should be a mandatory step in every pipeline.",
      });
      this.addSuggestion({
        title: "Add Test Step to CI",
        description:
          "Add a test step to your CI pipeline: `npm test` or equivalent.",
        priority: "high",
        impact: "high",
        effort: "low",
      });
    }

    if (!hasLinting) {
      this.addFinding({
        severity: "warning",
        title: "No Linting in CI Pipeline",
        description:
          "CI pipeline does not run linting. Linting in CI catches code quality issues before merge.",
      });
      this.addSuggestion({
        title: "Add Lint Step to CI",
        description: "Add `npm run lint` as a CI step before tests.",
        priority: "medium",
        impact: "medium",
        effort: "low",
      });
    }

    if (totalSteps > 15) {
      this.addFinding({
        severity: "warning",
        title: "Complex CI Pipeline",
        description: `Pipeline has ~${totalSteps} steps. Complex pipelines are slower and harder to debug. Consider splitting into parallel jobs.`,
        data: { totalSteps },
      });
    }
  }

  /**
   * Check if caching is configured
   */
  async _checkCaching(pipeline) {
    let hasCaching = false;

    for (const config of pipeline.configs) {
      const content = config.content.toLowerCase();
      if (/cache|actions\/cache|restore-keys/.test(content)) {
        hasCaching = true;
        break;
      }
    }

    this.metrics.caching = { enabled: hasCaching };

    if (!hasCaching) {
      this.addFinding({
        severity: "warning",
        title: "No CI Caching Configured",
        description:
          "No dependency caching detected in CI. Caching node_modules or package manager cache can reduce build times by 30-60%.",
      });
      this.addSuggestion({
        title: "Enable CI Caching",
        description:
          "Add `actions/cache` for node_modules or use `actions/setup-node` with built-in caching to speed up builds.",
        priority: "high",
        impact: "high",
        effort: "low",
      });
    }
  }

  /**
   * Check for security scanning steps
   */
  async _checkSecuritySteps(pipeline) {
    let hasSecurity = false;

    for (const config of pipeline.configs) {
      const content = config.content.toLowerCase();
      if (
        /snyk|dependabot|codeql|trivy|audit|security|sonar|semgrep/.test(
          content,
        )
      ) {
        hasSecurity = true;
        break;
      }
    }

    this.metrics.security = { hasSecurityScanning: hasSecurity };

    if (!hasSecurity) {
      this.addFinding({
        severity: "warning",
        title: "No Security Scanning in CI",
        description:
          "No security scanning tools detected in CI pipeline. Consider adding dependency auditing and code scanning.",
      });
      this.addSuggestion({
        title: "Add Security Scanning",
        description:
          "Add `npm audit` or integrate Snyk/CodeQL for automated security scanning in CI.",
        priority: "high",
        impact: "high",
        effort: "low",
      });
    }
  }

  /**
   * Check for parallelization
   */
  async _checkParallelization(pipeline) {
    let hasParallel = false;

    for (const config of pipeline.configs) {
      const content = config.content.toLowerCase();
      if (/matrix|parallel|concurrency|strategy/.test(content)) {
        hasParallel = true;
        break;
      }
    }

    this.metrics.parallelization = { enabled: hasParallel };

    if (!hasParallel && (this.metrics.pipelineSteps?.totalSteps || 0) > 8) {
      this.addFinding({
        severity: "info",
        title: "No Parallelization in CI",
        description:
          "Pipeline has many steps but no parallelization. Running jobs in parallel can significantly reduce total build time.",
      });
      this.addSuggestion({
        title: "Parallelize CI Jobs",
        description:
          "Split independent steps (lint, test, build) into parallel jobs using matrix strategy or separate workflow jobs.",
        priority: "medium",
        impact: "high",
        effort: "medium",
      });
    }
  }
}

module.exports = { CICDAnalyzer };
