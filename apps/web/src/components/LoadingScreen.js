'use client';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-border border-t-cyan rounded-full animate-spin mx-auto mb-4" 
             style={{ borderWidth: '3px' }} />
        <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan to-dx-purple bg-clip-text text-transparent">
          DX-Ray
        </h2>
        <p className="text-sm text-text-muted mt-1">Loading scan results...</p>
      </div>
    </div>
  );
}
