import * as React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center relative overflow-hidden p-4">
      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-primary shadow-sm transition-transform group-hover:scale-105">
            <span className="text-white font-display font-bold text-sm">P</span>
          </div>
          <span className="font-display font-semibold text-text text-xl">PlacementIQ</span>
        </Link>

        {children}
      </div>
    </div>
  );
}
