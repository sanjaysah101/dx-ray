const chalk = require("chalk");
const Table = require("cli-table3");
const figures = require("figures");

/**
 * Render scan results as a beautiful CLI dashboard
 */
function renderDashboard(results) {
  const { score, grade, summary, tracks } = results;

  // ─── Overall Score ────────────────────────────────────────
  const scoreColor =
    score >= 80 ? chalk.green : score >= 60 ? chalk.yellow : chalk.red;
  const gradeColor =
    grade === "A"
      ? chalk.green.bold
      : grade === "B"
        ? chalk.green
        : grade === "C"
          ? chalk.yellow
          : grade === "D"
            ? chalk.yellow.bold
            : chalk.red.bold;

  console.log(
    chalk.white.bold("  ╔══════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.white.bold("  ║") +
      `       DX Health Score: ${scoreColor.bold(score + "/100")}  ${gradeColor(`[${grade}]`)}       ` +
      chalk.white.bold("║"),
  );
  console.log(
    chalk.white.bold("  ╚══════════════════════════════════════════════╝\n"),
  );

  // ─── Score Bar ────────────────────────────────────────────
  const barLength = 40;
  const filled = Math.round((score / 100) * barLength);
  const empty = barLength - filled;
  const bar = scoreColor("█".repeat(filled)) + chalk.gray("░".repeat(empty));
  console.log(`  ${bar} ${scoreColor(score + "%")}\n`);

  // ─── Summary Stats ────────────────────────────────────────
  console.log(chalk.white.bold("  Findings Summary"));
  console.log(
    `  ${chalk.red(figures.cross)} Critical: ${chalk.red.bold(summary.criticalFindings)}`,
  );
  console.log(
    `  ${chalk.yellow("⚠")} Warning:  ${chalk.yellow.bold(summary.warningFindings)}`,
  );
  console.log(
    `  ${chalk.blue(figures.info)} Info:     ${chalk.blue.bold(summary.infoFindings)}`,
  );
  console.log(
    `  ${chalk.green(figures.tick)} Suggestions: ${chalk.green.bold(summary.totalSuggestions)}\n`,
  );

  // ─── Track Results Table ──────────────────────────────────
  const table = new Table({
    head: [
      chalk.cyan.bold("Track"),
      chalk.cyan.bold("Score"),
      chalk.cyan.bold("Status"),
      chalk.cyan.bold("Findings"),
      chalk.cyan.bold("Top Issue"),
    ],
    colWidths: [18, 10, 12, 12, 45],
    style: { head: [], border: ["gray"] },
  });

  const trackIcons = {
    git: "📊",
    "code-quality": "🔍",
    cicd: "⚙️",
    tests: "🧪",
    docs: "📝",
    dependencies: "📦",
    "pr-review": "👀",
  };

  for (const [trackName, trackResult] of Object.entries(tracks)) {
    const icon = trackIcons[trackName] || "📋";
    const trackScore = trackResult.score || 0;
    const scoreStr =
      trackScore >= 80
        ? chalk.green(trackScore)
        : trackScore >= 60
          ? chalk.yellow(trackScore)
          : chalk.red(trackScore);

    const statusStr =
      trackResult.status === "error"
        ? chalk.red("Error")
        : trackResult.severity === "healthy"
          ? chalk.green("Healthy")
          : trackResult.severity === "warning"
            ? chalk.yellow("Warning")
            : trackResult.severity === "critical"
              ? chalk.red("Critical")
              : chalk.gray("N/A");

    const findingCount = trackResult.findings?.length || 0;
    const topIssue =
      trackResult.findings?.[0]?.title || chalk.gray("No issues");

    table.push([
      `${icon} ${trackName}`,
      scoreStr,
      statusStr,
      findingCount.toString(),
      topIssue.substring(0, 43),
    ]);
  }

  console.log(table.toString());
  console.log("");

  // ─── Top Suggestions ─────────────────────────────────────
  const allSuggestions = [];
  for (const trackResult of Object.values(tracks)) {
    if (trackResult.suggestions) {
      allSuggestions.push(...trackResult.suggestions);
    }
  }

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const topSuggestions = allSuggestions
    .sort(
      (a, b) =>
        (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0),
    )
    .slice(0, 5);

  if (topSuggestions.length > 0) {
    console.log(chalk.white.bold("  💡 Top Suggestions\n"));

    for (let i = 0; i < topSuggestions.length; i++) {
      const sug = topSuggestions[i];
      const priorityIcon =
        sug.priority === "high"
          ? chalk.red("HIGH")
          : sug.priority === "medium"
            ? chalk.yellow("MED")
            : chalk.gray("LOW");

      console.log(
        `  ${chalk.cyan(`${i + 1}.`)} ${chalk.white.bold(sug.title)} [${priorityIcon}]`,
      );
      console.log(`     ${chalk.gray(sug.description)}`);
      console.log("");
    }
  }

  // ─── Footer ───────────────────────────────────────────────
  console.log(chalk.gray("  ─────────────────────────────────────────────"));
  console.log(chalk.gray(`  Scan completed at ${new Date().toLocaleString()}`));
  console.log(chalk.gray("  Results saved to .dx-ray/latest-scan.json"));
  console.log(
    chalk.cyan("  Run `dx-ray dashboard` to open the web dashboard\n"),
  );
}

module.exports = { renderDashboard };
