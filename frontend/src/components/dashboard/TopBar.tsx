'use client';

import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your placement intelligence overview' },
  '/dashboard/profile': { title: 'Profile', subtitle: 'Manage your personal information' },
  '/dashboard/resume': { title: 'Resume', subtitle: 'Upload and analyze your resume' },
  '/dashboard/github': { title: 'GitHub', subtitle: 'Connect your GitHub profile' },
  '/dashboard/coding': { title: 'Coding Profiles', subtitle: 'Link your competitive programming profiles' },
  '/dashboard/analysis': { title: 'Analysis', subtitle: 'View your placement readiness reports' },
  '/dashboard/roadmap': { title: 'Roadmap', subtitle: 'Your personalized learning path' },
  '/dashboard/jobs': { title: 'Jobs Explorer', subtitle: 'Browse curated job descriptions' },
};

export function DashboardTopBar() {
  const { appUser } = useAuth();
  const pathname = usePathname();

  const pageInfo = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname === path || (path !== '/dashboard' && pathname.startsWith(path)),
  )?.[1] || { title: 'PlacementIQ', subtitle: '' };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-8 flex-shrink-0"
      style={{ background: 'rgba(252,251,248,0.8)', backdropFilter: 'blur(20px)' }}>
      <div>
        <h2 className="text-base font-display font-semibold text-text">{pageInfo.title}</h2>
        {pageInfo.subtitle && (
          <p className="text-xs text-text-secondary">{pageInfo.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-text-secondary cursor-text"
          style={{ background: 'var(--surface-2)' }}>
          <Search className="w-3.5 h-3.5" />
          <span className="text-xs">Search...</span>
          <kbd className="ml-4 text-[10px] px-1.5 py-0.5 rounded text-text-secondary" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text hover:bg-black/[0.03] transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        {/* Avatar */}
        {appUser?.photoURL ? (
          <img src={appUser.photoURL} alt={appUser.displayName} className="w-8 h-8 rounded-full border border-border" />
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border border-border"
            style={{ background: 'var(--gradient-primary)', color: '#FFFFFF' }}>
            {appUser?.displayName?.[0] || 'U'}
          </div>
        )}
      </div>
    </header>
  );
}
