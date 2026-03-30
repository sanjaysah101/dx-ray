'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

export function ScoreCard({ score, grade }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [score]);

  const scoreColor = score >= 80 ? 'text-dx-green' : score >= 60 ? 'text-dx-yellow' : 'text-dx-red';
  const barColor = score >= 80 ? 'bg-dx-green' : score >= 60 ? 'bg-dx-yellow' : 'bg-dx-red';
  const gradeColor = grade === 'A' || grade === 'B' ? 'bg-dx-green/15 text-dx-green' :
                     grade === 'C' || grade === 'D' ? 'bg-dx-yellow/15 text-dx-yellow' :
                     'bg-dx-red/15 text-dx-red';

  return (
    <div className="mt-6 bg-gradient-to-br from-surface to-surface-2 border border-border rounded-2xl p-8 text-center glow-card">
      <div className="flex items-center justify-center gap-6">
        {/* Circular Score */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="var(--border)"
              strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--yellow)' : 'var(--red)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(animatedScore / 100) * 327} 327`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={clsx('text-4xl font-extrabold', scoreColor)}>
              {animatedScore}
            </span>
            <span className="text-xs text-text-muted mt-1">out of 100</span>
          </div>
        </div>

        {/* Grade & Info */}
        <div className="text-left">
          <div className="text-sm text-text-muted mb-2">DX Health Grade</div>
          <span className={clsx('inline-block px-4 py-1.5 rounded-full text-2xl font-extrabold', gradeColor)}>
            {grade}
          </span>
          <p className="text-sm text-text-muted mt-3 max-w-xs">
            {score >= 80 ? 'Great developer experience! Keep it up.' :
             score >= 60 ? 'Room for improvement. Check the suggestions below.' :
             'Significant DX friction detected. Prioritize the critical findings.'}
          </p>
        </div>
      </div>

      {/* Score Bar */}
      <div className="mt-6 w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-1000', barColor)}
          style={{ width: `${animatedScore}%` }}
        />
      </div>
    </div>
  );
}
