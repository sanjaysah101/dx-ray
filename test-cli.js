const fs = require('fs');
const path = require('path');
const { DXRay } = require('./packages/core/src/index.js');
const { renderDashboard } = require('./packages/cli/src/render.js');

const outFile = path.join(__dirname, 'cli-test-output.txt');

async function test() {
  try {
    fs.writeFileSync(outFile, 'Starting CLI test\n');
    
    const dxray = new DXRay({ targetDir: __dirname });
    fs.appendFileSync(outFile, 'DXRay created\n');
    
    const trackNames = [
      'git',
      'code-quality',
      'cicd',
      'tests',
      'docs',
      'dependencies',
      'pr-review',
    ];
    
    for (let i = 0; i < trackNames.length; i++) {
      fs.appendFileSync(outFile, `Scanning ${trackNames[i]}...\n`);
      await dxray.scanTrack(trackNames[i]);
      fs.appendFileSync(outFile, `  Done: ${dxray.results.tracks[trackNames[i]]?.score}\n`);
    }
    
    fs.appendFileSync(outFile, `\nFinal Score: ${dxray.results.score}/${dxray.results.grade}\n`);
    fs.appendFileSync(outFile, `Total Findings: ${dxray.results.summary.totalFindings}\n`);
    fs.appendFileSync(outFile, 'CLI test completed successfully\n');
  } catch (err) {
    fs.appendFileSync(outFile, `ERROR: ${err.message}\n`);
    fs.appendFileSync(outFile, err.stack + '\n');
  }
}

test();
