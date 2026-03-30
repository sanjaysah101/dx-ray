/**
 * Report Generator
 * 
 * Transforms raw scan results into formatted reports
 * for CLI output, JSON export, and web dashboard consumption.
 */
class ReportGenerator {
  constructor(results) {
    this.results = results;
  }

  generate(format = 'json') {
    switch (format) {
      case 'json':
        return this.toJSON();
      case 'summary':
        return this.toSummary();
      default:
        return this.toJSON();
    }
  }

  toJSON() {
    return JSON.stringify(this.results, null, 2);
  }

  toSummary() {
    const { score, grade, summary, tracks } = this.results;

    const lines = [];
    lines.push(`\n  DX Health Score: ${score}/100 (Grade: ${grade})\n`);
    lines.push(`  Findings: ${summary.totalFindings} total`);
    lines.push(`    🔴 Critical: ${summary.criticalFindings}`);
    lines.push(`    🟡 Warning: ${summary.warningFindings}`);
    lines.push(`    🔵 Info: ${summary.infoFindings}`);
    lines.push(`  Suggestions: ${summary.totalSuggestions}`);
    lines.push(`  Tracks Scanned: ${summary.tracksScanned}\n`);

    // Per-track summary
    for (const [trackName, trackResult] of Object.entries(tracks)) {
      const icon = trackResult.severity === 'healthy' ? '✅' :
                   trackResult.severity === 'warning' ? '⚠️' :
                   trackResult.severity === 'critical' ? '🔴' : '❓';
      
      lines.push(`  ${icon} ${trackName.toUpperCase()}: ${trackResult.score}/100`);
      
      if (trackResult.findings?.length > 0) {
        for (const finding of trackResult.findings.slice(0, 3)) {
          const fIcon = finding.severity === 'critical' ? '🔴' :
                        finding.severity === 'warning' ? '🟡' : '🔵';
          lines.push(`     ${fIcon} ${finding.title}`);
        }
        if (trackResult.findings.length > 3) {
          lines.push(`     ... and ${trackResult.findings.length - 3} more`);
        }
      }
    }

    lines.push('');
    return lines.join('\n');
  }

  /**
   * Get top priority suggestions across all tracks
   */
  getTopSuggestions(limit = 10) {
    const allSuggestions = [];
    
    for (const trackResult of Object.values(this.results.tracks)) {
      if (trackResult.suggestions) {
        allSuggestions.push(...trackResult.suggestions);
      }
    }

    // Sort by priority and impact
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const impactOrder = { high: 3, medium: 2, low: 1 };

    return allSuggestions
      .sort((a, b) => {
        const aScore = (priorityOrder[a.priority] || 0) * 2 + (impactOrder[a.impact] || 0);
        const bScore = (priorityOrder[b.priority] || 0) * 2 + (impactOrder[b.impact] || 0);
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  /**
   * Get before/after comparison data
   * (Used when running scan multiple times to show improvement)
   */
  static compareScans(before, after) {
    const comparison = {
      scoreDelta: after.score - before.score,
      gradeBefore: before.grade,
      gradeAfter: after.grade,
      improved: after.score > before.score,
      trackComparisons: {},
    };

    for (const trackName of Object.keys(after.tracks)) {
      const beforeTrack = before.tracks[trackName];
      const afterTrack = after.tracks[trackName];

      if (beforeTrack && afterTrack) {
        comparison.trackComparisons[trackName] = {
          scoreBefore: beforeTrack.score,
          scoreAfter: afterTrack.score,
          delta: afterTrack.score - beforeTrack.score,
          findingsBefore: beforeTrack.findings?.length || 0,
          findingsAfter: afterTrack.findings?.length || 0,
        };
      }
    }

    return comparison;
  }
}

module.exports = { ReportGenerator };
