'use client';

export function Header({ timestamp }) {
  return (
    <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-dx-purple flex items-center justify-center">
            <span className="text-lg">🔬</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold">
              <span className="bg-gradient-to-r from-cyan to-dx-purple bg-clip-text text-transparent">
                DX-Ray
              </span>
            </h1>
            <p className="text-xs text-text-muted">Developer Experience Diagnostics</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {timestamp && (
            <span className="text-xs text-text-muted">
              Last scan: {new Date(timestamp).toLocaleString()}
            </span>
          )}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-cyan transition-colors text-sm"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
