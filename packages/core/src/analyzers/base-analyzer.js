/**
 * Base class for all DX-Ray analyzers.
 * Each analyzer scans a specific aspect of the development workflow
 * and returns findings with severity levels and actionable suggestions.
 */
class BaseAnalyzer {
  constructor(targetDir, options = {}) {
    this.targetDir = targetDir;
    this.options = options;
    this.findings = [];
    this.suggestions = [];
    this.metrics = {};
  }

  /**
   * Override in subclasses to perform the actual analysis
   * @returns {Promise<AnalysisResult>}
   */
  async analyze() {
    throw new Error('analyze() must be implemented by subclass');
  }

  /**
   * Add a finding to the results
   */
  addFinding(finding) {
    this.findings.push({
      id: `${this.trackName}-${this.findings.length + 1}`,
      track: this.trackName,
      timestamp: new Date().toISOString(),
      severity: 'info', // 'critical' | 'warning' | 'info'
      ...finding,
    });
  }

  /**
   * Add an actionable suggestion
   */
  addSuggestion(suggestion) {
    this.suggestions.push({
      id: `${this.trackName}-sug-${this.suggestions.length + 1}`,
      track: this.trackName,
      priority: 'medium', // 'high' | 'medium' | 'low'
      effort: 'medium',   // 'low' | 'medium' | 'high'
      impact: 'medium',   // 'low' | 'medium' | 'high'
      ...suggestion,
    });
  }

  /**
   * Calculate a score (0-100) based on findings
   */
  calculateScore() {
    if (this.findings.length === 0) return 100;

    let deductions = 0;
    for (const finding of this.findings) {
      switch (finding.severity) {
        case 'critical': deductions += 15; break;
        case 'warning': deductions += 7; break;
        case 'info': deductions += 2; break;
      }
    }

    return Math.max(0, Math.min(100, 100 - deductions));
  }

  /**
   * Build the standard result object
   */
  buildResult() {
    const score = this.calculateScore();
    return {
      track: this.trackName,
      status: 'complete',
      score,
      severity: score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical',
      metrics: this.metrics,
      findings: this.findings,
      suggestions: this.suggestions,
      scannedAt: new Date().toISOString(),
    };
  }
}

module.exports = { BaseAnalyzer };
