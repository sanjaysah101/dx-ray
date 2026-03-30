const { BaseAnalyzer } = require('./base-analyzer');
const simpleGit = require('simple-git');
const path = require('path');

/**
 * Git History Analyzer
 * 
 * Scans git history to reveal patterns:
 * - Commit frequency & patterns (time-of-day, day-of-week)
 * - Hotspot files (most changed files = likely bug magnets)
 * - Large commits (risk of review fatigue)
 * - Commit message quality
 * - Bus factor (knowledge concentration)
 * - Merge conflict frequency
 */
class GitAnalyzer extends BaseAnalyzer {
  constructor(targetDir, options = {}) {
    super(targetDir, options);
    this.trackName = 'git';
    this.git = simpleGit(targetDir);
  }

  async analyze() {
    try {
      // Check if it's a git repo
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        return {
          track: this.trackName,
          status: 'skipped',
          score: 0,
          severity: 'info',
          message: 'Not a git repository',
          findings: [],
          suggestions: [{ title: 'Initialize Git', description: 'This directory is not a git repository. Run `git init` to start tracking changes.' }],
        };
      }

      const maxCommits = this.options.maxCommits || 500;

      // Gather git data
      const [log, branchSummary] = await Promise.all([
        this.git.log({ maxCount: maxCommits }),
        this.git.branch(),
      ]);

      const commits = log.all || [];
      if (commits.length === 0) {
        return this.buildResult();
      }

      // Run all analyses
      this._analyzeCommitPatterns(commits);
      this._analyzeCommitMessages(commits);
      this._analyzeHotspotFiles(commits);
      this._analyzeBusFactor(commits);
      this._analyzeBranches(branchSummary);
      this._analyzeCommitSizes(commits);

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
   * Analyze commit frequency patterns — when do devs commit?
   */
  _analyzeCommitPatterns(commits) {
    const hourBuckets = new Array(24).fill(0);
    const dayBuckets = new Array(7).fill(0);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const commit of commits) {
      const date = new Date(commit.date);
      hourBuckets[date.getHours()]++;
      dayBuckets[date.getDay()]++;
    }

    // Find peak hours
    const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
    const lateNightCommits = hourBuckets.slice(22, 24).reduce((a, b) => a + b, 0) +
                              hourBuckets.slice(0, 5).reduce((a, b) => a + b, 0);
    const lateNightPct = Math.round((lateNightCommits / commits.length) * 100);

    // Weekend commits
    const weekendCommits = dayBuckets[0] + dayBuckets[6];
    const weekendPct = Math.round((weekendCommits / commits.length) * 100);

    this.metrics.commitPatterns = {
      totalCommits: commits.length,
      hourDistribution: hourBuckets,
      dayDistribution: dayBuckets,
      peakHour,
      lateNightPercentage: lateNightPct,
      weekendPercentage: weekendPct,
    };

    if (lateNightPct > 20) {
      this.addFinding({
        severity: 'warning',
        title: 'High Late-Night Commit Rate',
        description: `${lateNightPct}% of commits happen between 10 PM and 5 AM. This may indicate unsustainable work patterns or deadline pressure.`,
        data: { lateNightPct },
      });
      this.addSuggestion({
        title: 'Address Late-Night Work Patterns',
        description: 'High late-night commit rates often signal burnout risk. Consider reviewing sprint planning and workload distribution.',
        priority: 'high',
        impact: 'high',
        effort: 'low',
      });
    }

    if (weekendPct > 15) {
      this.addFinding({
        severity: 'warning',
        title: 'Significant Weekend Work',
        description: `${weekendPct}% of commits happen on weekends, suggesting work-life balance issues.`,
        data: { weekendPct },
      });
    }
  }

  /**
   * Analyze commit message quality
   */
  _analyzeCommitMessages(commits) {
    let shortMessages = 0;
    let noPrefix = 0;
    let wip = 0;
    let fixTypos = 0;

    const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?:/;

    for (const commit of commits) {
      const msg = commit.message || '';
      if (msg.length < 10) shortMessages++;
      if (!conventionalPattern.test(msg) && !msg.includes(':')) noPrefix++;
      if (/^wip/i.test(msg)) wip++;
      if (/fix(ed)?\s*(typo|lint|format)/i.test(msg)) fixTypos++;
    }

    const shortPct = Math.round((shortMessages / commits.length) * 100);
    const noPrefixPct = Math.round((noPrefix / commits.length) * 100);

    this.metrics.commitMessages = {
      shortMessages,
      shortMessagePercentage: shortPct,
      noConventionalPrefix: noPrefix,
      noPrefixPercentage: noPrefixPct,
      wipCommits: wip,
      fixTypoCommits: fixTypos,
    };

    if (shortPct > 30) {
      this.addFinding({
        severity: 'warning',
        title: 'Poor Commit Message Quality',
        description: `${shortPct}% of commits have messages shorter than 10 characters. This makes git history hard to navigate.`,
        data: { shortPct, shortMessages },
      });
      this.addSuggestion({
        title: 'Enforce Commit Message Standards',
        description: 'Use commitlint with Conventional Commits to enforce meaningful commit messages. Add a commit-msg hook via Husky.',
        priority: 'medium',
        impact: 'medium',
        effort: 'low',
      });
    }

    if (noPrefixPct > 60) {
      this.addFinding({
        severity: 'info',
        title: 'No Conventional Commit Format',
        description: `${noPrefixPct}% of commits don't follow conventional commit format (feat:, fix:, etc.)`,
        data: { noPrefixPct },
      });
    }

    if (wip > 5) {
      this.addFinding({
        severity: 'info',
        title: 'WIP Commits in History',
        description: `Found ${wip} "WIP" commits. Consider squashing these before merging.`,
        data: { wipCommits: wip },
      });
    }
  }

  /**
   * Find hotspot files — most frequently changed files are often bug magnets
   */
  _analyzeHotspotFiles(commits) {
    const fileChanges = {};

    for (const commit of commits) {
      const diff = commit.diff;
      if (diff && diff.files) {
        for (const file of diff.files) {
          const filePath = file.file;
          if (!fileChanges[filePath]) {
            fileChanges[filePath] = { changes: 0, authors: new Set() };
          }
          fileChanges[filePath].changes++;
          fileChanges[filePath].authors.add(commit.author_email);
        }
      }
    }

    // Sort by change frequency
    const hotspots = Object.entries(fileChanges)
      .map(([file, data]) => ({
        file,
        changes: data.changes,
        authors: data.authors.size,
      }))
      .sort((a, b) => b.changes - a.changes)
      .slice(0, 20);

    this.metrics.hotspotFiles = hotspots;

    if (hotspots.length > 0 && hotspots[0].changes > 20) {
      this.addFinding({
        severity: 'warning',
        title: 'Code Hotspots Detected',
        description: `File "${hotspots[0].file}" has been changed ${hotspots[0].changes} times. Frequently changed files are often bug magnets and may need refactoring.`,
        data: { topHotspots: hotspots.slice(0, 5) },
      });
      this.addSuggestion({
        title: 'Refactor Hotspot Files',
        description: `Consider breaking down frequently changed files into smaller, more focused modules. Top hotspot: ${hotspots[0].file}`,
        priority: 'medium',
        impact: 'high',
        effort: 'high',
      });
    }
  }

  /**
   * Analyze bus factor — knowledge concentration risk
   */
  _analyzeBusFactor(commits) {
    const authorCommits = {};
    for (const commit of commits) {
      const author = commit.author_email || commit.author_name || 'unknown';
      authorCommits[author] = (authorCommits[author] || 0) + 1;
    }

    const authors = Object.entries(authorCommits)
      .map(([author, count]) => ({ author, commits: count, percentage: Math.round((count / commits.length) * 100) }))
      .sort((a, b) => b.commits - a.commits);

    const topContributor = authors[0];
    const busFactor = authors.filter(a => a.percentage >= 10).length;

    this.metrics.busFactor = {
      value: busFactor,
      totalAuthors: authors.length,
      topContributors: authors.slice(0, 10),
    };

    if (busFactor <= 1 && authors.length > 1) {
      this.addFinding({
        severity: 'critical',
        title: 'Critical Bus Factor',
        description: `Bus factor is ${busFactor}. ${topContributor.author} has made ${topContributor.percentage}% of all commits. If they leave, the project is at serious risk.`,
        data: { busFactor, topContributor },
      });
      this.addSuggestion({
        title: 'Improve Knowledge Distribution',
        description: 'Implement pair programming, code reviews across team members, and documentation of key systems to reduce bus factor risk.',
        priority: 'high',
        impact: 'high',
        effort: 'medium',
      });
    } else if (busFactor <= 2) {
      this.addFinding({
        severity: 'warning',
        title: 'Low Bus Factor',
        description: `Only ${busFactor} developers have significant knowledge of this codebase.`,
        data: { busFactor },
      });
    }
  }

  /**
   * Analyze branch hygiene
   */
  _analyzeBranches(branchSummary) {
    const branches = branchSummary.all || [];
    const staleBranchThreshold = 30; // days

    this.metrics.branches = {
      total: branches.length,
      current: branchSummary.current,
    };

    if (branches.length > 20) {
      this.addFinding({
        severity: 'info',
        title: 'Many Branches',
        description: `Repository has ${branches.length} branches. Consider cleaning up stale branches.`,
        data: { branchCount: branches.length },
      });
      this.addSuggestion({
        title: 'Clean Up Stale Branches',
        description: `You have ${branches.length} branches. Run \`git branch --merged | grep -v main | xargs git branch -d\` to remove merged branches.`,
        priority: 'low',
        impact: 'low',
        effort: 'low',
      });
    }
  }

  /**
   * Analyze commit sizes — large commits are harder to review
   */
  _analyzeCommitSizes(commits) {
    const sizes = commits.map(c => {
      if (c.diff && c.diff.files) {
        return c.diff.files.reduce((sum, f) => sum + (f.insertions || 0) + (f.deletions || 0), 0);
      }
      return 0;
    }).filter(s => s > 0);

    if (sizes.length === 0) return;

    const avgSize = Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length);
    const largeCommits = sizes.filter(s => s > 500).length;
    const largePct = Math.round((largeCommits / sizes.length) * 100);

    this.metrics.commitSizes = {
      averageSize: avgSize,
      largeCommits,
      largeCommitPercentage: largePct,
    };

    if (largePct > 20) {
      this.addFinding({
        severity: 'warning',
        title: 'Too Many Large Commits',
        description: `${largePct}% of commits change more than 500 lines. Large commits are harder to review and more likely to introduce bugs.`,
        data: { largePct, largeCommits },
      });
      this.addSuggestion({
        title: 'Encourage Smaller Commits',
        description: 'Break work into smaller, focused commits. Consider adding a pre-commit hook that warns when a commit is too large.',
        priority: 'medium',
        impact: 'high',
        effort: 'low',
      });
    }
  }
}

module.exports = { GitAnalyzer };
