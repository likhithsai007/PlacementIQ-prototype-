import * as React from 'react';
import Link from 'next/link';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col relative overflow-hidden">
      {/* Background glow mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div
          className="w-[800px] h-[600px] opacity-[0.1] rounded-full"
          style={{ background: 'radial-gradient(ellipse at center, #18BADD 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-[500px] h-[400px] opacity-[0.1] rounded-full"
          style={{ background: 'radial-gradient(ellipse at center, #3039A1 0%, transparent 70%)' }}
        />
      </div>

      {/* Top Header */}
      <header className="relative z-20 border-b border-border bg-bg/80 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-primary">
            <span className="text-bg font-display font-bold text-sm">P</span>
          </div>
          <span className="font-display font-semibold text-text text-lg">PlacementIQ</span>
        </Link>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 relative z-10 flex flex-col items-center py-12 px-4 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
