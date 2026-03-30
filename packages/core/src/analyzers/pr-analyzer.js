const { BaseAnalyzer } = require('./base-analyzer');
const simpleGit = require('simple-git');

/**
 * PR / Code Review Analyzer (Track G)
 * 
 * Analyzes code review patterns from git history:
 * - Merge frequency and patterns
 * - PR size estimation (from merge commits)
 * - Review bottleneck detection
 * - Time-to-merge patterns
 * - Reviewer distribution
 */
class PRAnalyzer extends BaseAnalyzer {
  constructor(targetDir, options = {}) {
    super(targetDir, options);
    this.trackName = 'pr-review';
    this.git = simpleGit(targetDir);
  }

  async analyze() {
    try {
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        return {
          track: this.trackName,
          status: 'skipped',
          score: 50,
          severity: 'info',
          message: 'Not a git repository',
          findings: [],
          suggestions: [],
        };
      }

      await this._analyzeMergePatterns();
      await this._analyzeReviewDistribution();

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

  async _analyzeMergePatterns() {
    try {
      const log = await this.git.log({ maxCount: 200 });
      const commits = log.all || [];

      // Identify merge commits
      const mergeCommits = commits.filter(c => 
        /^Merge (pull request|branch|remote)/.test(c.message) ||
        c.message.startsWith('Merge ')
      );

      const regularCommits = commits.filter(c => !mergeCommits.includes(c));

      // Analyze merge frequency
      const mergesByDay = {};
      for (const merge of mergeCommits) {
        const day = new Date(merge.date).toISOString().split('T')[0];
        mergesByDay[day] = (mergesByDay[day] || 0) + 1;
      }

      // Calculate average time between merges
      let avgTimeBetweenMerges = 0;
      if (mergeCommits.length > 1) {
        const times = mergeCommits.map(c => new Date(c.date).getTime()).sort((a, b) => b - a);
        const gaps = [];
        for (let i = 0; i < times.length - 1; i++) {
          gaps.push(times[i] - times[i + 1]);
        }
        avgTimeBetweenMerges = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length / (1000 * 60 * 60)); // hours
      }

      this.metrics.mergePatterns = {
        totalMerges: mergeCommits.length,
        totalCommits: commits.length,
        mergePercentage: Math.round((mergeCommits.length / commits.length) * 100),
        avgHoursBetweenMerges: avgTimeBetweenMerges,
        mergesByDay,
      };

      if (avgTimeBetweenMerges > 72 && mergeCommits.length > 5) {
        this.addFinding({
          severity: 'warning',
          title: 'Slow Merge Cadence',
          description: `Average time between merges is ${avgTimeBetweenMerges} hours (~${Math.round(avgTimeBetweenMerges / 24)} days). Faster merge cycles reduce integration risk.`,
          data: { avgHours: avgTimeBetweenMerges },
        });
        this.addSuggestion({
          title: 'Speed Up Code Reviews',
          description: 'Set a team SLA for code reviews (e.g., first review within 4 hours). Use automated checks to reduce review burden.',
          priority: 'high',
          impact: 'high',
          effort: 'medium',
        });
      }

      // Check for large merge commits (potential big PRs)
      if (mergeCommits.length === 0 && commits.length > 20) {
        this.addFinding({
          severity: 'info',
          title: 'No Merge Commits Found',
          description: 'No merge commits detected. This could mean PRs are squash-merged (good) or there\'s no PR process (concerning).',
        });
      }
    } catch {
      // Git log failed
    }
  }

  async _analyzeReviewDistribution() {
    try {
      const log = await this.git.log({ maxCount: 200 });
      const commits = log.all || [];

      // Analyze who merges (proxy for who reviews)
      const mergers = {};
      const authors = {};

      for (const commit of commits) {
        const author = commit.author_email || commit.author_name || 'unknown';
        authors[author] = (authors[author] || 0) + 1;

        if (/^Merge/.test(commit.message)) {
          mergers[author] = (mergers[author] || 0) + 1;
        }
      }

      const mergerList = Object.entries(mergers)
        .map(([author, count]) => ({ author, merges: count }))
        .sort((a, b) => b.merges - a.merges);

      this.metrics.reviewDistribution = {
        mergers: mergerList,
        totalAuthors: Object.keys(authors).length,
      };

      // Check if one person does most merges
      if (mergerList.length > 0) {
        const topMerger = mergerList[0];
        const totalMerges = mergerList.reduce((sum, m) => sum + m.merges, 0);
        const topPct = Math.round((topMerger.merges / totalMerges) * 100);

        if (topPct > 60 && totalMerges > 10) {
          this.addFinding({
            severity: 'warning',
            title: 'Review Bottleneck',
            description: `${topMerger.author} handles ${topPct}% of all merges. This creates a bottleneck and single point of failure.`,
            data: { topMerger, topPct },
          });
          this.addSuggestion({
            title: 'Distribute Review Responsibility',
            description: 'Use CODEOWNERS file and round-robin reviewer assignment to distribute review load across the team.',
            priority: 'high',
            impact: 'high',
            effort: 'low',
          });
        }
      }
    } catch {
      // Git log failed
    }
  }
}

module.exports = { PRAnalyzer };
