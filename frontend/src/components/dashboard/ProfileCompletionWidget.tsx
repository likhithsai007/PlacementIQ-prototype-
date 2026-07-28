'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function ProfileCompletionWidget() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['profileCompleteness'],
    queryFn: async () => {
      const res = await api.getCompleteness();
      return res.data.data;
    },
    refetchInterval: 30000
  });

  if (isLoading) {
    return (
      <Card glass className="mb-6 animate-pulse">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const { score = 0, incompleteSections = [], suggestedActions = [] } = response || {};

  return (
    <Card glass className="mb-6 overflow-hidden relative">
      {/* Background Gradient Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* Left: Progress Circle */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG Circle for Progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="rgba(0,0,0,0.03)"
                strokeWidth="8"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray="351.8"
                strokeDashoffset={351.8 - (351.8 * score) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--primary-hover)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-display text-text">{score}%</span>
            </div>
          </div>
          <span className="text-sm font-medium text-text-secondary mt-3">Profile Completion</span>
        </div>

        {/* Right: Insights & Actions */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <h3 className="text-xl font-bold text-text mb-2">
            {score === 100 ? 'Awesome! Your profile is fully complete 🎉' : 'Complete your profile to get better matches'}
          </h3>
          
          {score < 100 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Suggested Next Actions</h4>
                <div className="space-y-2">
                  {suggestedActions.slice(0, 3).map((action: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/profile" className="inline-block mt-2 text-sm font-medium text-primary hover:underline">
                  Update Profile Now →
                </Link>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Incomplete Sections</h4>
                <div className="flex flex-wrap gap-2">
                  {incompleteSections.slice(0, 5).map((section: string, i: number) => (
                    <span key={i} className="bg-surface-2 border border-border px-2 py-1 rounded text-xs text-text-secondary">
                      {section}
                    </span>
                  ))}
                  {incompleteSections.length > 5 && (
                    <span className="bg-surface-2 border border-border px-2 py-1 rounded text-xs text-text-secondary">
                      +{incompleteSections.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {score === 100 && (
            <div className="flex items-center gap-2 text-sm text-text-secondary mt-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              You&apos;ve unlocked the full potential of AI-powered job recommendations!
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
