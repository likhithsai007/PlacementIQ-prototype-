'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, TrendingUp, AlertTriangle, Lightbulb, Map, FileText, Github, Code, Briefcase, Activity, RefreshCw } from 'lucide-react';
import Link from 'next/link';

// ─── Shared UI for Loading/Error ───────────────────────────────────────────
const WidgetSkeleton = () => (
  <Card glass className="animate-pulse h-full min-h-[140px]">
    <CardContent className="p-6 flex items-center justify-center h-full">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
    </CardContent>
  </Card>
);

const WidgetError = ({ onRetry }: { onRetry: () => void }) => (
  <Card glass className="h-full border-danger/20 min-h-[140px]">
    <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
      <AlertTriangle className="w-5 h-5 text-danger mb-2" />
      <span className="text-xs text-text-secondary mb-2">Failed to load</span>
      <button onClick={onRetry} className="text-xs text-primary hover:underline flex items-center gap-1">
        <RefreshCw className="w-3 h-3" /> Retry
      </button>
    </CardContent>
  </Card>
);

// ─── Placement Analysis Widgets (Shared Query) ──────────────────────────────
function useDashboardAnalysis() {
  return useQuery({
    queryKey: ['dashboardAnalysis'],
    queryFn: async () => {
      const res = await api.getDashboardAnalysis();
      return res.data.data;
    },
    staleTime: 60000,
  });
}

export function PlacementScoreWidget() {
  const { data, isLoading, error, refetch } = useDashboardAnalysis();

  if (isLoading) return <WidgetSkeleton />;
  if (error) return <WidgetError onRetry={refetch} />;

  const score = data?.overallScore ? Math.round(data.overallScore) : null;
  const grade = score ? (score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F') : null;

  return (
    <Card glass gradientBorder className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Placement Score</CardTitle>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>Your overall readiness</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-text">{score ? `${score}%` : 'N/A'}</div>
        {grade && <p className="text-sm text-text-secondary mt-1">Grade: {grade}</p>}
      </CardContent>
    </Card>
  );
}

export function MissingSkillsWidget() {
  const { data, isLoading, error, refetch } = useDashboardAnalysis();

  if (isLoading) return <WidgetSkeleton />;
  if (error) return <WidgetError onRetry={refetch} />;

  const gaps = data?.skillGaps || [];

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Top Missing Skills</CardTitle>
          <AlertTriangle className="h-5 w-5 text-warning" />
        </div>
        <CardDescription>What you need to learn</CardDescription>
      </CardHeader>
      <CardContent>
        {gaps.length > 0 ? (
          <ul className="space-y-3">
            {gaps.slice(0, 3).map((gap: any, i: number) => (
              <li key={i}>
                <div className="font-semibold text-sm text-text">{gap.skill}</div>
                <div className="text-xs text-text-secondary line-clamp-1">{gap.reason}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-text-secondary">No critical skill gaps found.</div>
        )}
      </CardContent>
    </Card>
  );
}

export function AiSuggestionsWidget() {
  const { data, isLoading, error, refetch } = useDashboardAnalysis();

  if (isLoading) return <WidgetSkeleton />;
  if (error) return <WidgetError onRetry={refetch} />;

  const recs = data?.recommendations || [];

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Suggestions</CardTitle>
          <Lightbulb className="h-5 w-5 text-accent-1" />
        </div>
        <CardDescription>How to improve</CardDescription>
      </CardHeader>
      <CardContent>
        {recs.length > 0 ? (
          <ul className="space-y-2">
            {recs.slice(0, 2).map((rec: any, i: number) => (
              <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                <span className="text-accent-1 mt-0.5">•</span>
                <span className="line-clamp-2">{rec.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-text-secondary">Run an analysis to get suggestions.</div>
        )}
      </CardContent>
    </Card>
  );
}

export function UpcomingGoalsWidget() {
  const { data, isLoading, error, refetch } = useDashboardAnalysis();

  if (isLoading) return <WidgetSkeleton />;
  if (error) return <WidgetError onRetry={refetch} />;

  const milestones = data?.roadmap?.milestones || [];
  const nextMilestone = milestones.find((m: any) => !m.isAchieved);

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Upcoming Goal</CardTitle>
          <Map className="h-5 w-5 text-accent-2" />
        </div>
        <CardDescription>Your roadmap focus</CardDescription>
      </CardHeader>
      <CardContent>
        {nextMilestone ? (
          <div>
            <div className="font-semibold text-sm text-text">{nextMilestone.title}</div>
            <p className="text-xs text-text-secondary mt-1 line-clamp-2">{nextMilestone.description}</p>
          </div>
        ) : (
          <div className="text-sm text-text-secondary">No upcoming goals.</div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Resume Widget ────────────────────────────────────────────────────────
export function ResumeWidget() {
  const { data: res, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardResume'],
    queryFn: async () => {
      const result = await api.getResume();
      return result.data;
    },
    staleTime: 60000,
  });

  if (isLoading) return <WidgetSkeleton />;
  if (error) return <WidgetError onRetry={refetch} />;

  const resume = res?.data;
  const score = resume?.parsedData?.analysis?.resumeScore || resume?.parsedData?.overallScore || null;
  const ats = resume?.parsedData?.analysis?.atsScore || resume?.parsedData?.analysis?.atsScoreDashboard?.atsCompatibility || resume?.parsedData?.atsCompatibility || null;
  const date = resume?.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : null;

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Resume & ATS</CardTitle>
          <FileText className="h-5 w-5 text-accent-3" />
        </div>
        <CardDescription>{date ? `Analyzed on ${date}` : 'No resume uploaded'}</CardDescription>
      </CardHeader>
      <CardContent>
        {resume?.status === 'COMPLETED' ? (
          <div className="flex gap-6">
            <div>
              <div className="text-2xl font-bold text-text">{score ? `${score}%` : 'N/A'}</div>
              <div className="text-xs text-text-secondary">Quality</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-text">{ats ? `${ats}%` : 'N/A'}</div>
              <div className="text-xs text-text-secondary">ATS Match</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-text-secondary">Upload a resume to see scores.</div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── GitHub Widget ────────────────────────────────────────────────────────
export function GitHubWidget() {
  const { data: res, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardGithub'],
    queryFn: async () => {
      const result = await api.getGitHub();
      return result.data;
    },
    staleTime: 60000,
  });

  if (isLoading) return <WidgetSkeleton />;
  if (error) return <WidgetError onRetry={refetch} />;

  const github = res?.data;
  const score = github?.githubAnalysis?.githubScore || null;
  const projects = github?.githubAnalysis?.recommendations || [];

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">GitHub Stats</CardTitle>
          <Github className="h-5 w-5 text-text" />
        </div>
        <CardDescription>Code quality & projects</CardDescription>
      </CardHeader>
      <CardContent>
        {github?.status === 'COMPLETED' ? (
          <div>
            <div className="text-2xl font-bold text-text mb-2">{score ? `${score}%` : 'N/A'}</div>
            {projects.length > 0 && (
              <div className="text-xs text-text-secondary">
                Recommended project: <span className="font-semibold text-text">{projects[0].title}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-text-secondary">Connect GitHub to see stats.</div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Coding Widget ────────────────────────────────────────────────────────
export function CodingWidget() {
  const { data: res, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardCoding'],
    queryFn: async () => {
      const result = await api.getCodingAnalysis();
      return result.data;
    },
    staleTime: 60000,
  });

  if (isLoading) return <WidgetSkeleton />;
  if (error) return <WidgetError onRetry={refetch} />;

  const analysis = res?.data;
  const score = analysis?.codingScore || null;

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Coding Profile</CardTitle>
          <Code className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>Problem solving skills</CardDescription>
      </CardHeader>
      <CardContent>
        {analysis ? (
          <div>
            <div className="text-2xl font-bold text-text mb-2">{score ? `${score}%` : 'N/A'}</div>
            <div className="text-xs text-text-secondary truncate">DSA Readiness: {analysis.dsaReadiness || 'N/A'}</div>
          </div>
        ) : (
          <div className="text-sm text-text-secondary">Connect coding profiles to see stats.</div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Job Match Widget ─────────────────────────────────────────────────────
export function JobMatchWidget() {
  const { data: res, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardJobs'],
    queryFn: async () => {
      const result = await api.getJobRecommendations();
      return result.data;
    },
    staleTime: 60000,
  });

  if (isLoading) return <WidgetSkeleton />;
  if (error) return <WidgetError onRetry={refetch} />;

  const jobs = res?.data || [];
  const topJob = jobs[0];

  return (
    <Card glass className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Top Job Match</CardTitle>
          <Briefcase className="h-5 w-5 text-accent-1" />
        </div>
        <CardDescription>Based on your profile</CardDescription>
      </CardHeader>
      <CardContent>
        {topJob ? (
          <div>
            <div className="text-2xl font-bold text-text mb-1">{Math.round(topJob.matchScore)}%</div>
            <div className="text-sm font-semibold text-text truncate">{topJob.job.title}</div>
            <div className="text-xs text-text-secondary truncate">{topJob.job.company}</div>
          </div>
        ) : (
          <div className="text-sm text-text-secondary">No job matches found.</div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Activity Widget ──────────────────────────────────────────────────────
export function ActivityWidget() {
  const { data: res, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardActivity'],
    queryFn: async () => {
      const result = await api.getActivity();
      return result.data;
    },
    staleTime: 60000,
  });

  if (isLoading) return <WidgetSkeleton />;
  if (error) return <WidgetError onRetry={refetch} />;

  const activities = res?.data || [];

  return (
    <Card glass className="h-full md:col-span-2 lg:col-span-1">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <Activity className="h-5 w-5 text-accent-2" />
        </div>
        <CardDescription>Your latest actions</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <ul className="space-y-3">
            {activities.slice(0, 3).map((act: any, i: number) => (
              <li key={i} className="flex justify-between items-start gap-4">
                <div className="text-sm text-text truncate">{act.title}</div>
                <div className="text-xs text-text-secondary shrink-0 whitespace-nowrap">
                  {new Date(act.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-text-secondary">No recent activity.</div>
        )}
      </CardContent>
    </Card>
  );
}
