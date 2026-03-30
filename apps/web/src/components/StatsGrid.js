'use client';

import clsx from 'clsx';

const stats = [
  { key: 'totalFindings', label: 'Total Findings', icon: '📋', color: 'text-text-primary' },
  { key: 'criticalFindings', label: 'Critical', icon: '🔴', color: 'text-dx-red' },
  { key: 'warningFindings', label: 'Warnings', icon: '🟡', color: 'text-dx-yellow' },
  { key: 'infoFindings', label: 'Info', icon: '🔵', color: 'text-dx-blue' },
  { key: 'totalSuggestions', label: 'Suggestions', icon: '💡', color: 'text-dx-green' },
  { key: 'tracksScanned', label: 'Tracks', icon: '📊', color: 'text-dx-purple' },
];

export function StatsGrid({ summary }) {
  if (!summary) return null;

  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="bg-surface border border-border rounded-xl p-4 text-center hover:border-cyan/30 transition-colors"
        >
          <div className="text-lg mb-1">{stat.icon}</div>
          <div className={clsx('text-2xl font-bold', stat.color)}>
            {summary[stat.key] ?? 0}
          </div>
          <div className="text-xs text-text-muted mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
