const fs = require("fs");
const path = require("path");
const outFile = path.join(__dirname, "test-output.txt");

function log(msg) {
  fs.appendFileSync(outFile, msg + "\n");
}

fs.writeFileSync(outFile, "");
log("Node: " + process.version + " | " + process.platform);

async function run() {
  try {
    const { DXRay } = require("./packages/core/src/index.js");
    log("DXRay loaded");
    const dx = new DXRay({ targetDir: __dirname });
    log("Scanning code-quality...");
    await dx.scanTrack("code-quality");
    log("code-quality done: " + dx.results.tracks["code-quality"]?.score);
    log("Scanning cicd...");
    await dx.scanTrack("cicd");
    log("cicd done: " + dx.results.tracks["cicd"]?.score);
    log("Scanning tests...");
    await dx.scanTrack("tests");
    log("tests done: " + dx.results.tracks["tests"]?.score);
    log("Scanning docs...");
    await dx.scanTrack("docs");
    log("docs done: " + dx.results.tracks["docs"]?.score);
    log("Scanning dependencies...");
    await dx.scanTrack("dependencies");
    log("dependencies done: " + dx.results.tracks["dependencies"]?.score);
    log("Scanning git...");
    await dx.scanTrack("git");
    log("git done: " + dx.results.tracks["git"]?.score);
    log("Scanning pr-review...");
    await dx.scanTrack("pr-review");
    log("pr-review done: " + dx.results.tracks["pr-review"]?.score);
    const r = dx.results;
    log("Score: " + r.score + " Grade: " + r.grade);
    log(
      "Findings: " +
        r.summary.totalFindings +
        " Suggestions: " +
        r.summary.totalSuggestions,
    );
    for (const [k, v] of Object.entries(r.tracks)) {
      log(
        "  " +
          k +
          ": score=" +
          v.score +
          " status=" +
          v.status +
          " findings=" +
          (v.findings ? v.findings.length : 0),
      );
    }
    fs.writeFileSync(
      path.join(__dirname, "test-results.json"),
      JSON.stringify(r, null, 2),
    );
    log("DONE");
  } catch (e) {
    log("ERROR: " + e.message);
    log(e.stack);
  }
}

run();
