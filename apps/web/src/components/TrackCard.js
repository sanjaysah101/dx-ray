'use client';

import clsx from 'clsx';

const trackMeta = {
  'git': { icon: '📊', label: 'Git Analysis', description: 'Commit patterns, hotspots, bus factor' },
  'code-quality': { icon: '🔍', label: 'Code Quality', description: 'Tooling, type safety, complexity' },
  'cicd': { icon: '⚙️', label: 'CI/CD Scanner', description: 'Pipeline config, caching, security' },
  'tests': { icon: '🧪', label: 'Test Health', description: 'Coverage, frameworks, patterns' },
  'docs': { icon: '📝', label: 'Docs Freshness', description: 'README quality, staleness' },
  'dependencies': { icon: '📦', label: 'Dependencies', description: 'Count, versions, heavy deps' },
  'pr-review': { icon: '👀', label: 'PR Review', description: 'Merge patterns, bottlenecks' },
};

export function TrackCard({ name, track, isActive, onClick }) {
  const meta = trackMeta[name] || { icon: '📋', label: name, description: '' };
  const score = track.score || 0;
  const scoreColor = score >= 80 ? 'text-dx-green' : score >= 60 ? 'text-dx-yellow' : 'text-dx-red';
  const barColor = score >= 80 ? 'bg-dx-green' : score >= 60 ? 'bg-dx-yellow' : 'bg-dx-red';
  const statusColor = track.severity === 'healthy' ? 'text-dx-green' :
                      track.severity === 'warning' ? 'text-dx-yellow' :
                      track.severity === 'critical' ? 'text-dx-red' : 'text-text-muted';

  return (
    <div
      className={clsx(
        'bg-surface border rounded-xl p-5 cursor-pointer transition-all duration-200',
        isActive ? 'border-cyan shadow-lg shadow-cyan/5' : 'border-border hover:border-cyan/30'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.icon}</span>
          <div>
            <h3 className="font-semibold text-sm">{meta.label}</h3>
            <p className="text-xs text-text-muted">{meta.description}</p>
          </div>
        </div>
        <div className={clsx('text-2xl font-bold', scoreColor)}>{score}</div>
      </div>

      {/* Score Bar */}
      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-3">
        <div
          className={clsx('h-full rounded-full transition-all duration-700', barColor)}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Status */}
      <div className="flex items-center justify-between text-xs mb-3">
        <span className={statusColor}>
          {track.status === 'error' ? '❌ Error' :
           track.severity === 'healthy' ? '✅ Healthy' :
           track.severity === 'warning' ? '⚠️ Warning' :
           track.severity === 'critical' ? '🔴 Critical' : '❓ Unknown'}
        </span>
        <span className="text-text-muted">
          {track.findings?.length || 0} findings
        </span>
      </div>

      {/* Findings (expanded) */}
      {isActive && track.findings && track.findings.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {track.findings.map((finding, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className={clsx(
                'w-2 h-2 rounded-full mt-1 flex-shrink-0',
                finding.severity === 'critical' ? 'bg-dx-red' :
                finding.severity === 'warning' ? 'bg-dx-yellow' : 'bg-dx-blue'
              )} />
              <div>
                <div className="font-medium">{finding.title}</div>
                <div className="text-text-muted mt-0.5">{finding.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Click hint */}
      {!isActive && track.findings?.length > 0 && (
        <div className="text-xs text-text-muted text-center mt-1">
          Click to expand findings
        </div>
      )}
    </div>
  );
}
