const http = require("http");
const fs = require("fs");
const path = require("path");

/**
 * Lightweight HTTP server that serves scan results as JSON API
 * and serves the Next.js dashboard (or a standalone HTML dashboard).
 *
 * This is the "Prisma Studio" style experience —
 * run `dx-ray dashboard` and it opens in your browser.
 */
async function startServer(targetDir, port = 4200) {
  const scanFile = path.join(targetDir, ".dx-ray", "latest-scan.json");
  const historyDir = path.join(targetDir, ".dx-ray", "history");

  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    // API Routes
    if (req.url === "/api/scan/latest") {
      try {
        const data = fs.readFileSync(scanFile, "utf-8");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(data);
      } catch {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "No scan results found. Run `dx-ray scan` first.",
          }),
        );
      }
      return;
    }

    if (req.url === "/api/scan/history") {
      try {
        const files = fs
          .readdirSync(historyDir)
          .filter((f) => f.endsWith(".json"))
          .sort()
          .reverse();

        const history = files.map((f) => {
          const data = JSON.parse(
            fs.readFileSync(path.join(historyDir, f), "utf-8"),
          );
          return {
            file: f,
            timestamp: data.timestamp,
            score: data.score,
            grade: data.grade,
            summary: data.summary,
          };
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(history));
      } catch {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify([]));
      }
      return;
    }

    if (req.url?.startsWith("/api/scan/history/")) {
      const fileName = req.url.split("/api/scan/history/")[1];
      try {
        const data = fs.readFileSync(path.join(historyDir, fileName), "utf-8");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(data);
      } catch {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Scan not found" }));
      }
      return;
    }

    // Serve the embedded dashboard HTML
    if (req.url === "/" || req.url === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(getDashboardHTML());
      return;
    }

    // 404
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      resolve(port);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        // Try next port
        server.listen(port + 1, () => {
          resolve(port + 1);
        });
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Embedded standalone dashboard HTML
 * This is served when running `dx-ray dashboard` without the Next.js app.
 * It fetches data from the local API and renders a beautiful dashboard.
 */
function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DX-Ray Dashboard</title>
  <style>
    :root {
      --bg: #0a0a0f;
      --surface: #12121a;
      --surface-2: #1a1a2e;
      --border: #2a2a3e;
      --text: #e4e4ef;
      --text-muted: #8888a0;
      --cyan: #00d4ff;
      --green: #00e676;
      --yellow: #ffd600;
      --red: #ff5252;
      --purple: #b388ff;
      --blue: #448aff;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
    }

    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .logo {
      font-size: 1.8rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--cyan), var(--purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .logo span { font-weight: 400; opacity: 0.7; }

    .scan-time { color: var(--text-muted); font-size: 0.85rem; }

    /* Score Card */
    .score-card {
      background: linear-gradient(135deg, var(--surface), var(--surface-2));
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      margin-bottom: 2rem;
    }

    .score-value {
      font-size: 4rem;
      font-weight: 800;
      line-height: 1;
    }

    .score-value.healthy { color: var(--green); }
    .score-value.warning { color: var(--yellow); }
    .score-value.critical { color: var(--red); }

    .grade-badge {
      display: inline-block;
      padding: 0.25rem 1rem;
      border-radius: 20px;
      font-weight: 700;
      font-size: 1.2rem;
      margin-top: 0.5rem;
    }

    .grade-A { background: rgba(0, 230, 118, 0.15); color: var(--green); }
    .grade-B { background: rgba(0, 230, 118, 0.1); color: var(--green); }
    .grade-C { background: rgba(255, 214, 0, 0.15); color: var(--yellow); }
    .grade-D { background: rgba(255, 214, 0, 0.1); color: var(--yellow); }
    .grade-F { background: rgba(255, 82, 82, 0.15); color: var(--red); }

    .score-bar {
      width: 100%;
      height: 8px;
      background: var(--border);
      border-radius: 4px;
      margin-top: 1rem;
      overflow: hidden;
    }

    .score-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 1s ease;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
    }

    .stat-value { font-size: 2rem; font-weight: 700; }
    .stat-label { color: var(--text-muted); font-size: 0.8rem; margin-top: 0.25rem; }

    /* Track Cards */
    .tracks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .track-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      transition: border-color 0.2s;
    }

    .track-card:hover { border-color: var(--cyan); }

    .track-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .track-name {
      font-size: 1.1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .track-score {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .track-bar {
      width: 100%;
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      margin-bottom: 1rem;
      overflow: hidden;
    }

    .track-bar-fill { height: 100%; border-radius: 2px; }

    .finding {
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.85rem;
    }

    .finding:last-child { border-bottom: none; }

    .finding-severity {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 0.5rem;
    }

    .severity-critical { background: var(--red); }
    .severity-warning { background: var(--yellow); }
    .severity-info { background: var(--blue); }

    /* Suggestions */
    .suggestions-section { margin-bottom: 2rem; }

    .section-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .suggestion-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 0.75rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .suggestion-number {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 8px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--cyan);
      flex-shrink: 0;
    }

    .suggestion-content { flex: 1; }
    .suggestion-title { font-weight: 600; margin-bottom: 0.25rem; }
    .suggestion-desc { color: var(--text-muted); font-size: 0.85rem; }

    .priority-badge {
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 10px;
      font-weight: 600;
      margin-left: 0.5rem;
    }

    .priority-high { background: rgba(255, 82, 82, 0.15); color: var(--red); }
    .priority-medium { background: rgba(255, 214, 0, 0.15); color: var(--yellow); }
    .priority-low { background: rgba(136, 136, 160, 0.15); color: var(--text-muted); }

    .loading {
      text-align: center;
      padding: 4rem;
      color: var(--text-muted);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--cyan);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .error-msg {
      text-align: center;
      padding: 4rem;
      color: var(--red);
    }
  </style>
</head>
<body>
  <div class="container" id="app">
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading DX-Ray scan results...</p>
    </div>
  </div>

  <script>
    const trackIcons = {
      'git': '📊',
      'code-quality': '🔍',
      'cicd': '⚙️',
      'tests': '🧪',
      'docs': '📝',
      'dependencies': '📦',
      'pr-review': '👀',
    };

    function getScoreClass(score) {
      if (score >= 80) return 'healthy';
      if (score >= 60) return 'warning';
      return 'critical';
    }

    function getScoreColor(score) {
      if (score >= 80) return 'var(--green)';
      if (score >= 60) return 'var(--yellow)';
      return 'var(--red)';
    }

    async function loadDashboard() {
      try {
        const res = await fetch('/api/scan/latest');
        if (!res.ok) throw new Error('No scan data');
        const data = await res.json();
        renderDashboard(data);
      } catch (err) {
        document.getElementById('app').innerHTML =
          '<div class="error-msg"><h2>No Scan Results</h2><p>Run <code>dx-ray scan</code> first to generate results.</p></div>';
      }
    }

    function renderDashboard(data) {
      const { score, grade, summary, tracks, timestamp } = data;
      const app = document.getElementById('app');

      let html = '';

      // Header
      html += '<header>';
      html += '<div class="logo">DX<span>-Ray</span></div>';
      html += '<div class="scan-time">Last scan: ' + new Date(timestamp).toLocaleString() + '</div>';
      html += '</header>';

      // Score Card
      html += '<div class="score-card">';
      html += '<div class="score-value ' + getScoreClass(score) + '">' + score + '</div>';
      html += '<div>out of 100</div>';
      html += '<div class="grade-badge grade-' + grade + '">Grade ' + grade + '</div>';
      html += '<div class="score-bar"><div class="score-bar-fill" style="width:' + score + '%;background:' + getScoreColor(score) + '"></div></div>';
      html += '</div>';

      // Stats Grid
      html += '<div class="stats-grid">';
      html += statCard(summary.totalFindings, 'Total Findings', 'var(--text)');
      html += statCard(summary.criticalFindings, 'Critical', 'var(--red)');
      html += statCard(summary.warningFindings, 'Warnings', 'var(--yellow)');
      html += statCard(summary.infoFindings, 'Info', 'var(--blue)');
      html += statCard(summary.totalSuggestions, 'Suggestions', 'var(--green)');
      html += statCard(summary.tracksScanned, 'Tracks', 'var(--purple)');
      html += '</div>';

      // Track Cards
      html += '<div class="section-title">📋 Track Results</div>';
      html += '<div class="tracks-grid">';
      for (const [name, track] of Object.entries(tracks)) {
        html += renderTrackCard(name, track);
      }
      html += '</div>';

      // Top Suggestions
      const allSuggestions = [];
      for (const track of Object.values(tracks)) {
        if (track.suggestions) allSuggestions.push(...track.suggestions);
      }
      allSuggestions.sort((a, b) => {
        const p = { high: 3, medium: 2, low: 1 };
        return (p[b.priority] || 0) - (p[a.priority] || 0);
      });

      if (allSuggestions.length > 0) {
        html += '<div class="suggestions-section">';
        html += '<div class="section-title">💡 Top Suggestions</div>';
        allSuggestions.slice(0, 8).forEach((sug, i) => {
          html += renderSuggestion(sug, i + 1);
        });
        html += '</div>';
      }

      app.innerHTML = html;
    }

    function statCard(value, label, color) {
      return '<div class="stat-card"><div class="stat-value" style="color:' + color + '">' + value + '</div><div class="stat-label">' + label + '</div></div>';
    }

    function renderTrackCard(name, track) {
      const icon = trackIcons[name] || '📋';
      const score = track.score || 0;
      let html = '<div class="track-card">';
      html += '<div class="track-header">';
      html += '<div class="track-name">' + icon + ' ' + name + '</div>';
      html += '<div class="track-score" style="color:' + getScoreColor(score) + '">' + score + '</div>';
      html += '</div>';
      html += '<div class="track-bar"><div class="track-bar-fill" style="width:' + score + '%;background:' + getScoreColor(score) + '"></div></div>';

      if (track.findings && track.findings.length > 0) {
        track.findings.slice(0, 4).forEach(f => {
          html += '<div class="finding"><span class="finding-severity severity-' + f.severity + '"></span>' + f.title + '</div>';
        });
        if (track.findings.length > 4) {
          html += '<div class="finding" style="color:var(--text-muted)">+ ' + (track.findings.length - 4) + ' more findings</div>';
        }
      } else {
        html += '<div class="finding" style="color:var(--green)">✓ No issues found</div>';
      }

      html += '</div>';
      return html;
    }

    function renderSuggestion(sug, num) {
      let html = '<div class="suggestion-card">';
      html += '<div class="suggestion-number">' + num + '</div>';
      html += '<div class="suggestion-content">';
      html += '<div class="suggestion-title">' + sug.title + '<span class="priority-badge priority-' + sug.priority + '">' + sug.priority.toUpperCase() + '</span></div>';
      html += '<div class="suggestion-desc">' + sug.description + '</div>';
      html += '</div></div>';
      return html;
    }

    loadDashboard();
  </script>
</body>
</html>`;
}

module.exports = { startServer };
