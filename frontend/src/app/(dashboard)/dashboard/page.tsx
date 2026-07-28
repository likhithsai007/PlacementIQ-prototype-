'use client';

import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';

const ProfileCompletionWidget = dynamic(() => import('@/components/dashboard/ProfileCompletionWidget').then(mod => mod.ProfileCompletionWidget));
const PlacementScoreWidget = dynamic(() => import('@/components/dashboard/DashboardWidgets').then(mod => mod.PlacementScoreWidget));
const MissingSkillsWidget = dynamic(() => import('@/components/dashboard/DashboardWidgets').then(mod => mod.MissingSkillsWidget));
const AiSuggestionsWidget = dynamic(() => import('@/components/dashboard/DashboardWidgets').then(mod => mod.AiSuggestionsWidget));
const UpcomingGoalsWidget = dynamic(() => import('@/components/dashboard/DashboardWidgets').then(mod => mod.UpcomingGoalsWidget));
const ResumeWidget = dynamic(() => import('@/components/dashboard/DashboardWidgets').then(mod => mod.ResumeWidget));
const GitHubWidget = dynamic(() => import('@/components/dashboard/DashboardWidgets').then(mod => mod.GitHubWidget));
const CodingWidget = dynamic(() => import('@/components/dashboard/DashboardWidgets').then(mod => mod.CodingWidget));
const JobMatchWidget = dynamic(() => import('@/components/dashboard/DashboardWidgets').then(mod => mod.JobMatchWidget));
const ActivityWidget = dynamic(() => import('@/components/dashboard/DashboardWidgets').then(mod => mod.ActivityWidget));

export default function DashboardPage() {
  const { appUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-text">Dashboard</h1>
          <p className="text-text-secondary mt-1">Welcome back, {appUser?.displayName}!</p>
        </div>
      </div>

      <ProfileCompletionWidget />

      {/* Main Command Center Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Core Scores */}
        <div className="flex flex-col gap-6 h-full">
          <PlacementScoreWidget />
          <ResumeWidget />
        </div>

        {/* Technical Scores */}
        <div className="flex flex-col gap-6 h-full">
          <GitHubWidget />
          <CodingWidget />
        </div>

        {/* Job Matching & Analytics */}
        <div className="flex flex-col gap-6 h-full xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <JobMatchWidget />
            <MissingSkillsWidget />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <UpcomingGoalsWidget />
            <AiSuggestionsWidget />
          </div>
        </div>
      </div>

      {/* Footer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityWidget />
      </div>
    </div>
  );
}
