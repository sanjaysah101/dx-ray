"use client";

export function EmptyState({ message }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl mb-4">🔬</div>
        <h2 className="text-xl font-bold mb-2">No Scan Results</h2>
        <p className="text-text-muted mb-6">
          {message ||
            "Run a DX-Ray scan to see your developer experience health report."}
        </p>
        <div className="bg-surface border border-border rounded-xl p-4 text-left">
          <p className="text-sm text-text-muted mb-2">Get started:</p>
          <code className="block bg-bg rounded-lg p-3 text-sm font-mono text-cyan">
            npx dx-ray scan --open
          </code>
          <p className="text-xs text-text-muted mt-3">
            This will scan your codebase and open the dashboard automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
