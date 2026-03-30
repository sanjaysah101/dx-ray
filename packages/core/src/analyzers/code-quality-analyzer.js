const { BaseAnalyzer } = require('./base-analyzer');
const fs = require('fs');
const path = require('path');
const fastGlob = require('fast-glob');

/**
 * Code Quality Analyzer
 * 
 * Scans the codebase for quality signals:
 * - ESLint/Biome/Prettier configuration presence
 * - TypeScript adoption (type safety)
 * - Code complexity indicators
 * - File size analysis (god files)
 * - TODO/FIXME/HACK density
 * - Console.log pollution
 * - Dead code indicators
 * - Language distribution
 */
class CodeQualityAnalyzer extends BaseAnalyzer {
  constructor(targetDir, options = {}) {
    super(targetDir, options);
    this.trackName = 'code-quality';
  }

  async analyze() {
    try {
      // Detect project type and tooling
      await this._detectTooling();
      
      // Scan source files
      await this._analyzeSourceFiles();
      
      // Check for type safety
      await this._analyzeTypeSafety();
      
      // Check linting configuration
      await this._analyzeLintConfig();
      
      // Check formatting configuration
      await this._analyzeFormattingConfig();

      return this.buildResult();
    } catch (err) {
      return {
        track: this.trackName,
        status: 'error',
        error: err.message,
        score: 0,
        severity: 'unknown',
        findings: [],
        suggestions: [],
      };
    }
  }

  /**
   * Detect what tooling is configured in the project
   */
  async _detectTooling() {
    const checks = {
      eslint: ['.eslintrc', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', 'eslint.config.js', 'eslint.config.mjs'],
      prettier: ['.prettierrc', '.prettierrc.js', '.prettierrc.json', 'prettier.config.js'],
      biome: ['biome.json', 'biome.jsonc'],
      typescript: ['tsconfig.json'],
      husky: ['.husky'],
      lintStaged: ['.lintstagedrc', '.lintstagedrc.json', 'lint-staged.config.js'],
      editorconfig: ['.editorconfig'],
      jest: ['jest.config.js', 'jest.config.ts', 'jest.config.mjs'],
      vitest: ['vitest.config.js', 'vitest.config.ts'],
      commitlint: ['commitlint.config.js', '.commitlintrc.json'],
    };

    const tooling = {};
    for (const [tool, files] of Object.entries(checks)) {
      tooling[tool] = false;
      for (const file of files) {
        const fullPath = path.join(this.targetDir, file);
        try {
          await fs.promises.access(fullPath);
          tooling[tool] = true;
          break;
        } catch {
          // File doesn't exist
        }
      }
    }

    // Also check package.json for inline configs
    try {
      const pkgPath = path.join(this.targetDir, 'package.json');
      const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf-8'));
      if (pkg.eslintConfig) tooling.eslint = true;
      if (pkg.prettier) tooling.prettier = true;
      if (pkg['lint-staged']) tooling.lintStaged = true;
    } catch {
      // No package.json
    }

    this.metrics.tooling = tooling;

    // Score tooling coverage
    const essentialTools = ['eslint', 'prettier', 'typescript', 'husky'];
    const missingEssential = essentialTools.filter(t => !tooling[t]);

    if (missingEssential.length > 0) {
      for (const tool of missingEssential) {
        const toolSuggestions = {
          eslint: {
            title: 'Add ESLint for Code Linting',
            description: 'ESLint catches bugs and enforces code standards. Run `npm init @eslint/config` to set up.',
            severity: 'warning',
          },
          prettier: {
            title: 'Add Prettier for Code Formatting',
            description: 'Prettier eliminates formatting debates. Run `npm install -D prettier` and create `.prettierrc`.',
            severity: 'info',
          },
          typescript: {
            title: 'Consider TypeScript for Type Safety',
            description: 'TypeScript catches type-related bugs at compile time. Studies show it can reduce bugs by 15-25%. Run `npx tsc --init` to start.',
            severity: 'warning',
          },
          husky: {
            title: 'Add Git Hooks with Husky',
            description: 'Husky runs linting and tests before commits, preventing bad code from entering the repo. Run `npx husky-init`.',
            severity: 'info',
          },
        };

        const sug = toolSuggestions[tool];
        this.addFinding({
          severity: sug.severity,
          title: `Missing: ${tool.charAt(0).toUpperCase() + tool.slice(1)}`,
          description: sug.description,
          data: { tool },
        });
        this.addSuggestion({
          title: sug.title,
          description: sug.description,
          priority: tool === 'eslint' || tool === 'typescript' ? 'high' : 'medium',
          impact: 'high',
          effort: 'low',
        });
      }
    }
  }

  /**
   * Analyze source files for quality signals
   */
  async _analyzeSourceFiles() {
    const sourcePatterns = [
      '**/*.{js,jsx,ts,tsx,mjs,cjs}',
    ];
    const ignorePatterns = [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/vendor/**',
      '**/*.min.js',
    ];

    let files;
    try {
      files = await fastGlob(sourcePatterns, {
        cwd: this.targetDir,
        ignore: ignorePatterns,
        absolute: true,
      });
    } catch {
      return;
    }

    if (files.length === 0) return;

    let totalLines = 0;
    let totalTodos = 0;
    let totalFixmes = 0;
    let totalHacks = 0;
    let totalConsoleLogs = 0;
    let largeFiles = [];
    let complexFiles = [];
    const languageDistribution = { js: 0, jsx: 0, ts: 0, tsx: 0, other: 0 };

    for (const file of files) {
      try {
        const content = await fs.promises.readFile(file, 'utf-8');
        const lines = content.split('\n');
        const lineCount = lines.length;
        totalLines += lineCount;

        // Language distribution
        const ext = path.extname(file).slice(1);
        if (languageDistribution[ext] !== undefined) {
          languageDistribution[ext]++;
        } else {
          languageDistribution.other++;
        }

        // Large file detection
        if (lineCount > 500) {
          largeFiles.push({ file: path.relative(this.targetDir, file), lines: lineCount });
        }

        // TODO/FIXME/HACK counting
        for (const line of lines) {
          if (/\/\/\s*TODO/i.test(line) || /\/\*\s*TODO/i.test(line)) totalTodos++;
          if (/\/\/\s*FIXME/i.test(line) || /\/\*\s*FIXME/i.test(line)) totalFixmes++;
          if (/\/\/\s*HACK/i.test(line) || /\/\*\s*HACK/i.test(line)) totalHacks++;
          if (/console\.(log|warn|error|debug|info)\s*\(/.test(line) && !/\/\//.test(line.split('console')[0])) {
            totalConsoleLogs++;
          }
        }

        // Simple complexity check — deeply nested code
        let maxNesting = 0;
        let currentNesting = 0;
        for (const line of lines) {
          currentNesting += (line.match(/{/g) || []).length;
          currentNesting -= (line.match(/}/g) || []).length;
          maxNesting = Math.max(maxNesting, currentNesting);
        }
        if (maxNesting > 8) {
          complexFiles.push({ file: path.relative(this.targetDir, file), maxNesting });
        }
      } catch {
        // Skip unreadable files
      }
    }

    // Sort and limit
    largeFiles.sort((a, b) => b.lines - a.lines);
    complexFiles.sort((a, b) => b.maxNesting - a.maxNesting);

    this.metrics.sourceFiles = {
      totalFiles: files.length,
      totalLines,
      averageFileSize: Math.round(totalLines / files.length),
      languageDistribution,
      largeFiles: largeFiles.slice(0, 10),
      complexFiles: complexFiles.slice(0, 10),
      todos: totalTodos,
      fixmes: totalFixmes,
      hacks: totalHacks,
      consoleLogs: totalConsoleLogs,
    };

    // Findings
    if (largeFiles.length > 0) {
      this.addFinding({
        severity: 'warning',
        title: `${largeFiles.length} Large Files Detected`,
        description: `Found ${largeFiles.length} files with more than 500 lines. Large files are harder to maintain and review. Biggest: ${largeFiles[0].file} (${largeFiles[0].lines} lines).`,
        data: { largeFiles: largeFiles.slice(0, 5) },
      });
      this.addSuggestion({
        title: 'Break Down Large Files',
        description: `Split large files into smaller, focused modules. Start with ${largeFiles[0].file}.`,
        priority: 'medium',
        impact: 'medium',
        effort: 'medium',
      });
    }

    if (totalConsoleLogs > 20) {
      this.addFinding({
        severity: 'warning',
        title: 'Console.log Pollution',
        description: `Found ${totalConsoleLogs} console.log statements in the codebase. These should be replaced with a proper logging library or removed.`,
        data: { count: totalConsoleLogs },
      });
      this.addSuggestion({
        title: 'Replace Console.log with Proper Logging',
        description: 'Use a structured logging library (e.g., pino, winston) and add an ESLint rule to disallow console.log.',
        priority: 'medium',
        impact: 'medium',
        effort: 'low',
      });
    }

    if (totalFixmes + totalHacks > 10) {
      this.addFinding({
        severity: 'warning',
        title: 'Technical Debt Markers',
        description: `Found ${totalFixmes} FIXME and ${totalHacks} HACK comments. These indicate known technical debt that should be addressed.`,
        data: { fixmes: totalFixmes, hacks: totalHacks },
      });
    }

    if (totalTodos > 20) {
      this.addFinding({
        severity: 'info',
        title: 'High TODO Count',
        description: `Found ${totalTodos} TODO comments. Consider creating issues for these and tracking them properly.`,
        data: { todos: totalTodos },
      });
    }
  }

  /**
   * Analyze type safety — JS vs TS adoption
   */
  async _analyzeTypeSafety() {
    const lang = this.metrics.sourceFiles?.languageDistribution;
    if (!lang) return;

    const jsFiles = (lang.js || 0) + (lang.jsx || 0);
    const tsFiles = (lang.ts || 0) + (lang.tsx || 0);
    const total = jsFiles + tsFiles;

    if (total === 0) return;

    const tsPct = Math.round((tsFiles / total) * 100);

    this.metrics.typeSafety = {
      jsFiles,
      tsFiles,
      typescriptPercentage: tsPct,
      isFullyTyped: tsPct === 100,
    };

    if (tsPct === 0 && total > 5) {
      this.addFinding({
        severity: 'warning',
        title: 'No TypeScript Adoption',
        description: 'The entire codebase is JavaScript. TypeScript can catch 15-25% of bugs at compile time and significantly improve developer experience with better IDE support.',
        data: { jsFiles, tsFiles },
      });
      this.addSuggestion({
        title: 'Migrate to TypeScript',
        description: 'Start with `npx tsc --init` and rename files incrementally from .js to .ts. Begin with utility files and shared types.',
        priority: 'high',
        impact: 'high',
        effort: 'high',
      });
    } else if (tsPct > 0 && tsPct < 50) {
      this.addFinding({
        severity: 'info',
        title: 'Partial TypeScript Adoption',
        description: `Only ${tsPct}% of files use TypeScript. Consider migrating more files for better type safety.`,
        data: { tsPct },
      });
    }
  }

  /**
   * Analyze ESLint configuration quality
   */
  async _analyzeLintConfig() {
    if (!this.metrics.tooling?.eslint) return;

    // Check for common ESLint plugins
    try {
      const pkgPath = path.join(this.targetDir, 'package.json');
      const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf-8'));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      const usefulPlugins = {
        'eslint-plugin-sonarjs': 'SonarJS (bug detection)',
        'eslint-plugin-security': 'Security rules',
        'eslint-plugin-import': 'Import/export rules',
        'eslint-plugin-unused-imports': 'Unused import detection',
        '@typescript-eslint/eslint-plugin': 'TypeScript rules',
      };

      const missingPlugins = [];
      for (const [plugin, name] of Object.entries(usefulPlugins)) {
        if (!allDeps[plugin]) {
          missingPlugins.push({ plugin, name });
        }
      }

      this.metrics.eslintPlugins = {
        installed: Object.keys(usefulPlugins).filter(p => allDeps[p]),
        missing: missingPlugins,
      };

      if (missingPlugins.length > 2) {
        this.addFinding({
          severity: 'info',
          title: 'ESLint Could Be More Comprehensive',
          description: `Missing useful ESLint plugins: ${missingPlugins.map(p => p.name).join(', ')}`,
          data: { missingPlugins },
        });
      }
    } catch {
      // No package.json
    }
  }

  /**
   * Check formatting configuration
   */
  async _analyzeFormattingConfig() {
    const hasPrettier = this.metrics.tooling?.prettier;
    const hasBiome = this.metrics.tooling?.biome;
    const hasEditorConfig = this.metrics.tooling?.editorconfig;

    if (!hasPrettier && !hasBiome) {
      this.addFinding({
        severity: 'info',
        title: 'No Auto-Formatter Configured',
        description: 'No Prettier or Biome configuration found. Auto-formatting eliminates style debates and keeps code consistent.',
      });
    }

    if (!hasEditorConfig) {
      this.addFinding({
        severity: 'info',
        title: 'No .editorconfig',
        description: 'An .editorconfig file ensures consistent formatting across different editors and IDEs.',
      });
    }
  }
}

module.exports = { CodeQualityAnalyzer };
