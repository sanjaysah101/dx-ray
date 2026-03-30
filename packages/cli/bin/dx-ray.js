#!/usr/bin/env node

/**
 * DX-Ray CLI
 *
 * Usage:
 *   npx dx-ray scan          — Run a full DX scan
 *   npx dx-ray scan --track git  — Scan a specific track
 *   npx dx-ray dashboard     — Open the web dashboard
 *   npx dx-ray report        — Generate a JSON report
 */

const { program } = require("commander");
const chalk = require("chalk");
const ora = require("ora");
const boxen = require("boxen");
const open = require("open");
const path = require("path");
const fs = require("fs");
const { DXRay } = require("@dx-ray/core");
const { renderDashboard } = require("../src/render");
const { startServer } = require("../src/server");

const VERSION = "1.0.0";

// ASCII art banner
const banner = chalk.cyan(`
  ██████╗ ██╗  ██╗      ██████╗  █████╗ ██╗   ██╗
  ██╔══██╗╚██╗██╔╝      ██╔══██╗██╔══██╗╚██╗ ██╔╝
  ██║  ██║ ╚███╔╝ █████╗██████╔╝███████║ ╚████╔╝
  ██║  ██║ ██╔██╗ ╚════╝██╔══██╗██╔══██║  ╚██╔╝
  ██████╔╝██╔╝ ██╗      ██║  ██║██║  ██║   ██║
  ╚═════╝ ╚═╝  ╚═╝      ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝
`);

program
  .name("dx-ray")
  .description("DX-Ray — Diagnose developer experience friction")
  .version(VERSION);

// ─── SCAN COMMAND ───────────────────────────────────────────────
program
  .command("scan")
  .description("Run a DX health scan on the current directory")
  .option("-d, --dir <path>", "Target directory to scan", process.cwd())
  .option(
    "-t, --track <track>",
    "Scan a specific track (git, code-quality, cicd, tests, docs, dependencies, pr-review)",
  )
  .option("-o, --output <file>", "Save results to a JSON file")
  .option("--json", "Output raw JSON instead of formatted output")
  .option("--open", "Open the web dashboard after scanning")
  .action(async (options) => {
    console.log(banner);
    console.log(
      chalk.gray("  Scanning for developer experience friction...\n"),
    );

    const targetDir = path.resolve(options.dir);
    const isTTY = process.stdout.isTTY;
    const spinner = isTTY ? ora({
      text: "Initializing scan...",
      color: "cyan",
    }).start() : null;

    try {
      const dxray = new DXRay({ targetDir });

      const tracks = options.track ? [options.track] : undefined;
      const trackNames = tracks || [
        "git",
        "code-quality",
        "cicd",
        "tests",
        "docs",
        "dependencies",
        "pr-review",
      ];

      // Scan each track with progress
      for (let i = 0; i < trackNames.length; i++) {
        const msg = `Scanning ${trackNames[i]} (${i + 1}/${trackNames.length})...`;
        if (spinner) {
          spinner.text = msg;
        } else {
          console.log(chalk.cyan(`  ▶ ${msg}`));
        }
        await dxray.scanTrack(trackNames[i]);
      }

      if (spinner) {
        spinner.succeed("Scan complete!\n");
      } else {
        console.log(chalk.green("  ✓ Scan complete!\n"));
      }

      const results = dxray.results;

      // Save results for the web dashboard
      const outputDir = path.join(targetDir, ".dx-ray");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(outputDir, "latest-scan.json"),
        JSON.stringify(results, null, 2),
      );

      // Save historical scan
      const historyDir = path.join(outputDir, "history");
      if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true });
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      fs.writeFileSync(
        path.join(historyDir, `scan-${timestamp}.json`),
        JSON.stringify(results, null, 2),
      );

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        renderDashboard(results);
      }

      // Save to file if requested
      if (options.output) {
        fs.writeFileSync(options.output, JSON.stringify(results, null, 2));
        console.log(chalk.green(`\n  📄 Results saved to ${options.output}`));
      }

      // Open web dashboard if requested
      if (options.open) {
        console.log(chalk.cyan("\n  🌐 Starting web dashboard..."));
        const port = await startServer(targetDir);
        await open(`http://localhost:${port}`);
      }
    } catch (err) {
      if (spinner) {
        spinner.fail(`Scan failed: ${err.message}`);
      } else {
        console.log(chalk.red(`  ✗ Scan failed: ${err.message}`));
      }
      process.exit(1);
    }
  });

// ─── DASHBOARD COMMAND ──────────────────────────────────────────
program
  .command("dashboard")
  .alias("studio")
  .description("Open the DX-Ray web dashboard (like Prisma Studio)")
  .option("-d, --dir <path>", "Target directory", process.cwd())
  .option("-p, --port <port>", "Port for the dashboard server", "4200")
  .action(async (options) => {
    console.log(banner);

    const targetDir = path.resolve(options.dir);
    const scanFile = path.join(targetDir, ".dx-ray", "latest-scan.json");

    if (!fs.existsSync(scanFile)) {
      console.log(
        chalk.yellow("  ⚠️  No scan results found. Running a scan first...\n"),
      );

      const spinner = ora({
        text: "Running DX scan...",
        color: "cyan",
      }).start();
      const dxray = new DXRay({ targetDir });
      await dxray.scan();

      const outputDir = path.join(targetDir, ".dx-ray");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(scanFile, JSON.stringify(dxray.results, null, 2));
      spinner.succeed("Scan complete!");
    }

    console.log(chalk.cyan("\n  🌐 Starting DX-Ray Dashboard...\n"));

    const port = await startServer(targetDir, parseInt(options.port));
    const url = `http://localhost:${port}`;

    console.log(
      boxen(
        chalk.white(`DX-Ray Dashboard is running!\n\n`) +
          chalk.cyan(`  → ${url}\n\n`) +
          chalk.gray(`  Press Ctrl+C to stop`),
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "cyan",
        },
      ),
    );

    await open(url);
  });

// ─── REPORT COMMAND ─────────────────────────────────────────────
program
  .command("report")
  .description("Generate a DX health report")
  .option("-d, --dir <path>", "Target directory", process.cwd())
  .option("-f, --format <format>", "Report format (json, summary)", "summary")
  .option("-o, --output <file>", "Save report to file")
  .action(async (options) => {
    const targetDir = path.resolve(options.dir);
    const spinner = ora({
      text: "Generating report...",
      color: "cyan",
    }).start();

    const dxray = new DXRay({ targetDir });
    await dxray.scan();

    spinner.succeed("Report generated!\n");

    const report = dxray.generateReport(options.format);
    console.log(report);

    if (options.output) {
      fs.writeFileSync(options.output, report);
      console.log(chalk.green(`\n  📄 Report saved to ${options.output}`));
    }
  });

// ─── COMPARE COMMAND ────────────────────────────────────────────
program
  .command("compare")
  .description("Compare two scan results to show improvement")
  .argument("<before>", 'Path to the "before" scan JSON')
  .argument("<after>", 'Path to the "after" scan JSON')
  .action((beforePath, afterPath) => {
    try {
      const before = JSON.parse(fs.readFileSync(beforePath, "utf-8"));
      const after = JSON.parse(fs.readFileSync(afterPath, "utf-8"));

      const {
        ReportGenerator,
      } = require("@dx-ray/core/src/report/report-generator");
      const comparison = ReportGenerator.compareScans(before, after);

      console.log(banner);
      console.log(chalk.white.bold("  Before & After Comparison\n"));

      const arrow = comparison.improved ? chalk.green("↑") : chalk.red("↓");
      const delta =
        comparison.scoreDelta > 0
          ? `+${comparison.scoreDelta}`
          : comparison.scoreDelta;

      console.log(
        `  Overall Score: ${before.score} → ${after.score} (${arrow} ${delta})`,
      );
      console.log(
        `  Grade: ${comparison.gradeBefore} → ${comparison.gradeAfter}\n`,
      );

      for (const [track, comp] of Object.entries(comparison.trackComparisons)) {
        const tArrow =
          comp.delta > 0
            ? chalk.green("↑")
            : comp.delta < 0
              ? chalk.red("↓")
              : chalk.gray("=");
        const tDelta = comp.delta > 0 ? `+${comp.delta}` : comp.delta;
        console.log(
          `  ${track}: ${comp.scoreBefore} → ${comp.scoreAfter} (${tArrow} ${tDelta}) | Findings: ${comp.findingsBefore} → ${comp.findingsAfter}`,
        );
      }
      console.log("");
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program.parse();
