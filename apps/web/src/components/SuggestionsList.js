'use client';

import clsx from 'clsx';

export function SuggestionsList({ suggestions }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>💡</span> Top Suggestions
      </h2>
      <div className="space-y-3">
        {suggestions.map((sug, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl p-4 flex gap-4 items-start hover:border-cyan/30 transition-colors"
          >
            {/* Number */}
            <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-cyan font-bold text-sm flex-shrink-0">
              {i + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm">{sug.title}</h3>
                <span className={clsx(
                  'text-[10px] px-2 py-0.5 rounded-full font-semibold',
                  sug.priority === 'high' ? 'bg-dx-red/15 text-dx-red' :
                  sug.priority === 'medium' ? 'bg-dx-yellow/15 text-dx-yellow' :
                  'bg-text-muted/15 text-text-muted'
                )}>
                  {sug.priority?.toUpperCase()}
                </span>
                {sug.impact && (
                  <span className="text-[10px] text-text-muted">
                    Impact: {sug.impact} · Effort: {sug.effort}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-1">{sug.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
