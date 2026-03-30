'use client';

import { useState, useEffect } from 'react';
import { ScoreCard } from '../components/ScoreCard';
import { StatsGrid } from '../components/StatsGrid';
import { TrackCard } from '../components/TrackCard';
import { SuggestionsList } from '../components/SuggestionsList';
import { Header } from '../components/Header';
import { LoadingScreen } from '../components/LoadingScreen';
import { EmptyState } from '../components/EmptyState';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTrack, setActiveTrack] = useState(null);

  useEffect(() => {
    loadScanData();
  }, []);

  async function loadScanData() {
    try {
      // Try to load from the API (when running via `dx-ray dashboard`)
      const res = await fetch('/api/scan/latest');
      if (res.ok) {
        const scanData = await res.json();
        setData(scanData);
      } else {
        // Try loading demo data
        const demoRes = await fetch('/api/demo');
        if (demoRes.ok) {
          setData(await demoRes.json());
        } else {
          setError('No scan data available');
        }
      }
    } catch {
      // Load demo data as fallback
      try {
        const demoRes = await fetch('/api/demo');
        if (demoRes.ok) {
          setData(await demoRes.json());
        } else {
          setError('No scan data available. Run `dx-ray scan` first.');
        }
      } catch {
        setError('No scan data available. Run `dx-ray scan` first.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingScreen />;
  if (error) return <EmptyState message={error} />;
  if (!data) return <EmptyState />;

  const allSuggestions = [];
  for (const track of Object.values(data.tracks || {})) {
    if (track.suggestions) allSuggestions.push(...track.suggestions);
  }
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  allSuggestions.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));

  return (
    <div className="min-h-screen bg-bg">
      <Header timestamp={data.timestamp} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Score Card */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <ScoreCard score={data.score} grade={data.grade} />
        </div>

        {/* Stats Grid */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <StatsGrid summary={data.summary} />
        </div>

        {/* Track Results */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📋</span> Track Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(data.tracks || {}).map(([name, track], i) => (
              <div
                key={name}
                className="animate-slide-in"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <TrackCard
                  name={name}
                  track={track}
                  isActive={activeTrack === name}
                  onClick={() => setActiveTrack(activeTrack === name ? null : name)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Top Suggestions */}
        {allSuggestions.length > 0 && (
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <SuggestionsList suggestions={allSuggestions.slice(0, 10)} />
          </div>
        )}
      </main>
    </div>
  );
}
