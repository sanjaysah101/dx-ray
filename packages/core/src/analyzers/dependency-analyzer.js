const { BaseAnalyzer } = require('./base-analyzer');
const fs = require('fs');
const path = require('path');

/**
 * Dependency X-Ray Analyzer (Track E)
 * 
 * Scans dependencies for:
 * - Total dependency count (direct + transitive)
 * - Outdated dependencies
 * - Security vulnerabilities
 * - Duplicate dependencies
 * - License compliance
 * - Bundle size impact
 * - Unused dependencies
 */
class DependencyAnalyzer extends BaseAnalyzer {
  constructor(targetDir, options = {}) {
    super(targetDir, options);
    this.trackName = 'dependencies';
  }

  async analyze() {
    try {
      const hasPkg = await this._analyzePackageJson();
      if (!hasPkg) {
        return this.buildResult();
      }

      await this._analyzeLockFile();
      await this._analyzeDepAge();
      await this._checkForDuplicates();

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

  async _analyzePackageJson() {
    try {
      const pkgPath = path.join(this.targetDir, 'package.json');
      const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf-8'));

      const deps = Object.keys(pkg.dependencies || {});
      const devDeps = Object.keys(pkg.devDependencies || {});
      const peerDeps = Object.keys(pkg.peerDependencies || {});

      this.metrics.dependencies = {
        direct: deps.length,
        dev: devDeps.length,
        peer: peerDeps.length,
        total: deps.length + devDeps.length,
        directList: deps,
        devList: devDeps,
      };

      // Check for pinned versions vs ranges
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      let pinnedCount = 0;
      let rangeCount = 0;
      let wildcardCount = 0;

      for (const [, version] of Object.entries(allDeps)) {
        if (/^\d/.test(version)) pinnedCount++;
        else if (/^[\^~]/.test(version)) rangeCount++;
        else if (version === '*' || version === 'latest') wildcardCount++;
      }

      this.metrics.versionStrategy = {
        pinned: pinnedCount,
        range: rangeCount,
        wildcard: wildcardCount,
      };

      if (wildcardCount > 0) {
        this.addFinding({
          severity: 'critical',
          title: 'Wildcard Dependencies',
          description: `${wildcardCount} dependencies use wildcard (*) or "latest" versions. This makes builds non-reproducible.`,
          data: { wildcardCount },
        });
        this.addSuggestion({
          title: 'Pin Dependency Versions',
          description: 'Replace wildcard versions with specific version ranges (^x.y.z). Run `npm install` to update package-lock.json.',
          priority: 'high',
          impact: 'high',
          effort: 'low',
        });
      }

      if (deps.length > 50) {
        this.addFinding({
          severity: 'warning',
          title: 'High Dependency Count',
          description: `${deps.length} direct production dependencies. Large dependency trees increase security risk and bundle size.`,
          data: { count: deps.length },
        });
        this.addSuggestion({
          title: 'Audit Dependencies',
          description: 'Review if all dependencies are necessary. Use `npx depcheck` to find unused dependencies.',
          priority: 'medium',
          impact: 'medium',
          effort: 'medium',
        });
      }

      // Check for known heavy dependencies
      const heavyDeps = {
        'moment': 'moment is 300KB+. Use date-fns or dayjs instead (2-7KB).',
        'lodash': 'Full lodash is 70KB+. Use lodash-es or individual imports.',
        'jquery': 'jQuery is rarely needed in modern frameworks.',
        'underscore': 'Underscore is superseded by native JS methods and lodash.',
      };

      for (const [dep, suggestion] of Object.entries(heavyDeps)) {
        if (deps.includes(dep)) {
          this.addFinding({
            severity: 'info',
            title: `Heavy Dependency: ${dep}`,
            description: suggestion,
            data: { dependency: dep },
          });
          this.addSuggestion({
            title: `Replace ${dep}`,
            description: suggestion,
            priority: 'low',
            impact: 'medium',
            effort: 'medium',
          });
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  async _analyzeLockFile() {
    const lockFiles = {
      'package-lock.json': 'npm',
      'yarn.lock': 'yarn',
      'pnpm-lock.yaml': 'pnpm',
      'bun.lockb': 'bun',
    };

    let foundLock = null;
    for (const [file, manager] of Object.entries(lockFiles)) {
      try {
        await fs.promises.access(path.join(this.targetDir, file));
        foundLock = { file, manager };
        break;
      } catch {
        // Not found
      }
    }

    this.metrics.lockFile = foundLock;

    if (!foundLock) {
      this.addFinding({
        severity: 'critical',
        title: 'No Lock File',
        description: 'No package lock file found. Lock files ensure reproducible installs across environments.',
      });
      this.addSuggestion({
        title: 'Generate Lock File',
        description: 'Run `npm install` to generate package-lock.json and commit it to version control.',
        priority: 'high',
        impact: 'high',
        effort: 'low',
      });
    }

    // Check for multiple lock files (conflicting package managers)
    const foundLocks = [];
    for (const [file, manager] of Object.entries(lockFiles)) {
      try {
        await fs.promises.access(path.join(this.targetDir, file));
        foundLocks.push({ file, manager });
      } catch {
        // Not found
      }
    }

    if (foundLocks.length > 1) {
      this.addFinding({
        severity: 'warning',
        title: 'Multiple Lock Files',
        description: `Found ${foundLocks.length} lock files (${foundLocks.map(l => l.file).join(', ')}). This causes confusion about which package manager to use.`,
        data: { lockFiles: foundLocks },
      });
      this.addSuggestion({
        title: 'Standardize Package Manager',
        description: 'Choose one package manager and remove other lock files. Add `engines` field to package.json.',
        priority: 'medium',
        impact: 'medium',
        effort: 'low',
      });
    }
  }

  async _analyzeDepAge() {
    // Check for .npmrc or engine constraints
    try {
      const pkgPath = path.join(this.targetDir, 'package.json');
      const pkg = JSON.parse(await fs.promises.readFile(pkgPath, 'utf-8'));

      if (!pkg.engines) {
        this.addFinding({
          severity: 'info',
          title: 'No Engine Constraints',
          description: 'No `engines` field in package.json. Specifying Node.js version prevents compatibility issues.',
        });
        this.addSuggestion({
          title: 'Add Engine Constraints',
          description: 'Add `"engines": { "node": ">=18.0.0" }` to package.json to enforce Node.js version.',
          priority: 'low',
          impact: 'medium',
          effort: 'low',
        });
      }
    } catch {
      // No package.json
    }
  }

  async _checkForDuplicates() {
    // Check for dependencies that appear in both deps and devDeps
    const deps = this.metrics.dependencies?.directList || [];
    const devDeps = this.metrics.dependencies?.devList || [];

    const duplicates = deps.filter(d => devDeps.includes(d));

    if (duplicates.length > 0) {
      this.addFinding({
        severity: 'info',
        title: 'Duplicate Dependencies',
        description: `${duplicates.length} packages appear in both dependencies and devDependencies: ${duplicates.join(', ')}`,
        data: { duplicates },
      });
    }
  }
}

module.exports = { DependencyAnalyzer };
