/**
 * @dx-ray/core — The analysis engine
 * 
 * Scans codebases, git history, CI/CD configs, tests, docs, and dependencies
 * to diagnose developer experience friction and suggest actionable fixes.
 */

const { GitAnalyzer } = require('./analyzers/git-analyzer');
const { CodeQualityAnalyzer } = require('./analyzers/code-quality-analyzer');
const { CICDAnalyzer } = require('./analyzers/cicd-analyzer');
const { TestHealthAnalyzer } = require('./analyzers/test-health-analyzer');
const { DocsAnalyzer } = require('./analyzers/docs-analyzer');
const { DependencyAnalyzer } = require('./analyzers/dependency-analyzer');
const { PRAnalyzer } = require('./analyzers/pr-analyzer');
const { ReportGenerator } = require('./report/report-generator');

class DXRay {
  constructor(options = {}) {
    this.targetDir = options.targetDir || process.cwd();
    this.options = options;
    this.results = {
      timestamp: new Date().toISOString(),
      targetDir: this.targetDir,
      score: 0,
      grade: '',
      summary: {},
      tracks: {},
    };
  }

  /**
   * Run a full DX scan across all tracks
   */
  async scan(tracks = ['git', 'code-quality', 'cicd', 'tests', 'docs', 'dependencies', 'pr-review']) {
    const analyzers = {
      'git': new GitAnalyzer(this.targetDir, this.options),
      'code-quality': new CodeQualityAnalyzer(this.targetDir, this.options),
      'cicd': new CICDAnalyzer(this.targetDir, this.options),
      'tests': new TestHealthAnalyzer(this.targetDir, this.options),
      'docs': new DocsAnalyzer(this.targetDir, this.options),
      'dependencies': new DependencyAnalyzer(this.targetDir, this.options),
      'pr-review': new PRAnalyzer(this.targetDir, this.options),
    };

    for (const track of tracks) {
      const analyzer = analyzers[track];
      if (!analyzer) continue;

      try {
        const result = await analyzer.analyze();
        this.results.tracks[track] = result;
      } catch (err) {
        this.results.tracks[track] = {
          status: 'error',
          error: err.message,
          score: 0,
          severity: 'unknown',
          findings: [],
          suggestions: [],
        };
      }
    }

    this._calculateOverallScore();
    return this.results;
  }

  /**
   * Run a single track analysis
   */
  async scanTrack(trackName) {
    return this.scan([trackName]);
  }

  /**
   * Calculate overall DX health score (0-100)
   */
  _calculateOverallScore() {
    const trackResults = Object.values(this.results.tracks);
    if (trackResults.length === 0) {
      this.results.score = 0;
      this.results.grade = 'N/A';
      return;
    }

    const validResults = trackResults.filter(r => r.status !== 'error');
    if (validResults.length === 0) {
      this.results.score = 0;
      this.results.grade = 'F';
      return;
    }

    // Weighted scoring — some tracks matter more
    const weights = {
      'git': 15,
      'code-quality': 25,
      'cicd': 15,
      'tests': 20,
      'docs': 5,
      'dependencies': 10,
      'pr-review': 10,
    };

    let totalWeight = 0;
    let weightedScore = 0;

    for (const [track, result] of Object.entries(this.results.tracks)) {
      if (result.status === 'error') continue;
      const weight = weights[track] || 10;
      totalWeight += weight;
      weightedScore += (result.score || 0) * weight;
    }

    this.results.score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
    this.results.grade = this._scoreToGrade(this.results.score);

    // Build summary
    this.results.summary = {
      totalFindings: trackResults.reduce((sum, r) => sum + (r.findings?.length || 0), 0),
      criticalFindings: trackResults.reduce((sum, r) => 
        sum + (r.findings?.filter(f => f.severity === 'critical')?.length || 0), 0),
      warningFindings: trackResults.reduce((sum, r) => 
        sum + (r.findings?.filter(f => f.severity === 'warning')?.length || 0), 0),
      infoFindings: trackResults.reduce((sum, r) => 
        sum + (r.findings?.filter(f => f.severity === 'info')?.length || 0), 0),
      totalSuggestions: trackResults.reduce((sum, r) => sum + (r.suggestions?.length || 0), 0),
      tracksScanned: trackResults.length,
      tracksWithErrors: trackResults.filter(r => r.status === 'error').length,
    };
  }

  _scoreToGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate a report from scan results
   */
  generateReport(format = 'json') {
    const generator = new ReportGenerator(this.results);
    return generator.generate(format);
  }
}

module.exports = { DXRay };
