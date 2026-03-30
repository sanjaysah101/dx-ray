const { BaseAnalyzer } = require("./base-analyzer");
const fs = require("fs");
const path = require("path");
const { glob } = require("glob");
const simpleGit = require("simple-git");

/**
 * Documentation Freshness Analyzer (Track C)
 *
 * Scans documentation for:
 * - README presence and quality
 * - Documentation staleness (last updated vs code changes)
 * - API documentation coverage
 * - Code-to-doc drift
 * - Contributing guide presence
 * - Changelog maintenance
 */
class DocsAnalyzer extends BaseAnalyzer {
  constructor(targetDir, options = {}) {
    super(targetDir, options);
    this.trackName = "docs";
    this.git = simpleGit(targetDir);
  }

  async analyze() {
    try {
      await this._checkEssentialDocs();
      await this._analyzeDocFreshness();
      await this._analyzeReadmeQuality();
      await this._analyzeInlineDocumentation();

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

  async _checkEssentialDocs() {
    const essentialDocs = {
      "README.md": {
        severity: "critical",
        description: "Project overview and setup instructions",
      },
      "CONTRIBUTING.md": {
        severity: "info",
        description: "Contribution guidelines for new developers",
      },
      "CHANGELOG.md": {
        severity: "info",
        description: "Track of changes across versions",
      },
      LICENSE: { severity: "warning", description: "Open source license file" },
      ".env.example": {
        severity: "warning",
        description: "Example environment variables for onboarding",
      },
    };

    const found = {};
    const missing = {};

    for (const [file, meta] of Object.entries(essentialDocs)) {
      const variants = [file, file.toLowerCase(), file.toUpperCase()];
      let exists = false;
      for (const variant of variants) {
        try {
          await fs.promises.access(path.join(this.targetDir, variant));
          exists = true;
          break;
        } catch {
          // Not found
        }
      }

      if (exists) {
        found[file] = meta;
      } else {
        missing[file] = meta;
        this.addFinding({
          severity: meta.severity,
          title: `Missing ${file}`,
          description: `${file} not found. ${meta.description}.`,
        });
      }
    }

    this.metrics.essentialDocs = {
      found: Object.keys(found),
      missing: Object.keys(missing),
      completeness: Math.round(
        (Object.keys(found).length / Object.keys(essentialDocs).length) * 100,
      ),
    };

    if (missing["README.md"]) {
      this.addSuggestion({
        title: "Create a README.md",
        description:
          "Every project needs a README with: project description, setup instructions, usage examples, and contribution guidelines.",
        priority: "high",
        impact: "high",
        effort: "low",
      });
    }
  }

  async _analyzeDocFreshness() {
    const docPatterns = ["**/*.md", "**/docs/**", "**/documentation/**"];
    const ignorePatterns = [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/CHANGELOG.md",
    ];

    const docFiles = await glob(docPatterns, {
      cwd: this.targetDir,
      ignore: ignorePatterns,
      nodir: true,
    });

    if (docFiles.length === 0) return;

    const staleThresholdDays = 180; // 6 months
    const now = new Date();
    let staleCount = 0;
    const docAges = [];

    let isGitRepo = false;
    try {
      isGitRepo = await this.git.checkIsRepo();
    } catch {
      // Not a git repo
    }

    for (const docFile of docFiles) {
      try {
        let lastModified;

        if (isGitRepo) {
          // Use git log for accurate last-modified date
          const log = await this.git.log({ file: docFile, maxCount: 1 });
          if (log.latest) {
            lastModified = new Date(log.latest.date);
          }
        }

        if (!lastModified) {
          // Fallback to file system mtime
          const stat = await fs.promises.stat(
            path.join(this.targetDir, docFile),
          );
          lastModified = stat.mtime;
        }

        const ageDays = Math.round(
          (now - lastModified) / (1000 * 60 * 60 * 24),
        );
        docAges.push({
          file: docFile,
          ageDays,
          lastModified: lastModified.toISOString(),
        });

        if (ageDays > staleThresholdDays) {
          staleCount++;
        }
      } catch {
        // Skip
      }
    }

    docAges.sort((a, b) => b.ageDays - a.ageDays);

    const stalePct = Math.round((staleCount / docFiles.length) * 100);

    this.metrics.docFreshness = {
      totalDocs: docFiles.length,
      staleDocs: staleCount,
      stalePercentage: stalePct,
      oldestDocs: docAges.slice(0, 10),
      averageAgeDays:
        docAges.length > 0
          ? Math.round(
              docAges.reduce((sum, d) => sum + d.ageDays, 0) / docAges.length,
            )
          : 0,
    };

    if (stalePct > 40) {
      this.addFinding({
        severity: "warning",
        title: "Stale Documentation",
        description: `${stalePct}% of documentation files haven't been updated in 6+ months. Stale docs mislead developers and slow onboarding.`,
        data: { stalePct, staleCount, total: docFiles.length },
      });
      this.addSuggestion({
        title: "Review and Update Stale Docs",
        description: `${staleCount} docs are stale. Start with: ${docAges[0]?.file} (${docAges[0]?.ageDays} days old).`,
        priority: "medium",
        impact: "medium",
        effort: "medium",
      });
    }
  }

  async _analyzeReadmeQuality() {
    let readmePath;
    for (const name of ["README.md", "readme.md", "Readme.md"]) {
      try {
        const fullPath = path.join(this.targetDir, name);
        await fs.promises.access(fullPath);
        readmePath = fullPath;
        break;
      } catch {
        // Not found
      }
    }

    if (!readmePath) return;

    const content = await fs.promises.readFile(readmePath, "utf-8");
    const lines = content.split("\n");

    const qualityChecks = {
      hasTitle: /^#\s/.test(content),
      hasDescription: lines.length > 3,
      hasInstallation: /install|setup|getting started/i.test(content),
      hasUsage: /usage|example|how to/i.test(content),
      hasContributing: /contribut/i.test(content),
      hasLicense: /license/i.test(content),
      hasBadges: /\[!\[/.test(content) || /shields\.io/.test(content),
      hasCodeExamples: /```/.test(content),
      wordCount: content.split(/\s+/).length,
    };

    this.metrics.readmeQuality = qualityChecks;

    const missingSection = [];
    if (!qualityChecks.hasInstallation)
      missingSection.push("Installation/Setup");
    if (!qualityChecks.hasUsage) missingSection.push("Usage/Examples");
    if (!qualityChecks.hasCodeExamples) missingSection.push("Code Examples");

    if (missingSection.length > 0) {
      this.addFinding({
        severity: "info",
        title: "README Missing Key Sections",
        description: `README is missing: ${missingSection.join(", ")}. A complete README helps new developers get started quickly.`,
        data: { missingSections: missingSection },
      });
    }

    if (qualityChecks.wordCount < 50) {
      this.addFinding({
        severity: "warning",
        title: "README Too Short",
        description: `README has only ${qualityChecks.wordCount} words. A good README should thoroughly explain the project.`,
      });
    }
  }

  async _analyzeInlineDocumentation() {
    const sourceFiles = await glob("**/*.{js,jsx,ts,tsx}", {
      cwd: this.targetDir,
      ignore: [
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "**/.next/**",
      ],
      nodir: true,
    });

    if (sourceFiles.length === 0) return;

    let filesWithJSDoc = 0;
    let totalFunctions = 0;
    let documentedFunctions = 0;

    // Sample up to 50 files
    const sample = sourceFiles.slice(0, 50);

    for (const file of sample) {
      try {
        const content = await fs.promises.readFile(
          path.join(this.targetDir, file),
          "utf-8",
        );

        if (/\/\*\*/.test(content)) filesWithJSDoc++;

        // Count exported functions
        const funcMatches = content.match(
          /export\s+(default\s+)?function|export\s+const\s+\w+\s*=/g,
        );
        if (funcMatches) {
          totalFunctions += funcMatches.length;
          // Check if preceded by JSDoc
          const jsdocFuncs = content.match(/\/\*\*[\s\S]*?\*\/\s*\n\s*export/g);
          documentedFunctions += jsdocFuncs ? jsdocFuncs.length : 0;
        }
      } catch {
        // Skip
      }
    }

    const docPct =
      totalFunctions > 0
        ? Math.round((documentedFunctions / totalFunctions) * 100)
        : 0;

    this.metrics.inlineDocumentation = {
      sampledFiles: sample.length,
      filesWithJSDoc,
      totalExportedFunctions: totalFunctions,
      documentedFunctions,
      documentationPercentage: docPct,
    };

    if (docPct < 20 && totalFunctions > 10) {
      this.addFinding({
        severity: "info",
        title: "Low Inline Documentation",
        description: `Only ${docPct}% of exported functions have JSDoc comments. Good inline docs improve IDE experience and onboarding.`,
        data: { docPct },
      });
    }
  }
}

module.exports = { DocsAnalyzer };
