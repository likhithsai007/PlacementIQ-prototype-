'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Loader2, FileText, Printer, Download, User, Briefcase, GraduationCap, Github, Code2, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const router = useRouter();
  
  // 1. Fetch Analysis List to get the latest ID
  const { data: analysesResponse, isLoading: isLoadingAnalyses } = useQuery({
    queryKey: ['analyses'],
    queryFn: async () => {
      const res = await api.getAnalyses();
      return res.data;
    },
  });

  const analyses = analysesResponse?.data || [];
  const latestAnalysis = analyses[0];
  const isCompleted = latestAnalysis?.status === 'COMPLETED';

  // 2. Fetch Comprehensive Report
  const { data: reportResponse, isLoading: isLoadingReport } = useQuery({
    queryKey: ['report', latestAnalysis?.id],
    queryFn: async () => {
      if (!latestAnalysis?.id) return null;
      const res = await api.getReport(latestAnalysis.id);
      return res.data;
    },
    enabled: !!latestAnalysis?.id && isCompleted,
  });

  const report = reportResponse?.data;

  if (isLoadingAnalyses || (latestAnalysis && isCompleted && isLoadingReport)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!latestAnalysis || !isCompleted || !report) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-text mb-2">Executive Report</h1>
          <p className="text-text-secondary">Comprehensive summary of your placement readiness.</p>
        </div>
        <Card glass>
          <CardContent className="pt-16 pb-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-text mb-2">No Report Available</h2>
            <p className="text-text-secondary max-w-md mb-8">
              Run a placement analysis first to generate your executive report.
            </p>
            <Button onClick={() => router.push('/dashboard/analysis')} className="px-8 py-6 text-lg">
              <Zap className="w-5 h-5 mr-2" />
              Run Placement Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { analysis, profile, resume, github, codingProfiles } = report;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 print:hidden">
        <div>
          <h1 className="text-3xl font-display font-bold text-text mb-2">Executive Report</h1>
          <p className="text-text-secondary">Generated on {new Date(analysis.completedAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block mb-8 pb-4 border-b border-border">
        <h1 className="text-4xl font-bold text-text mb-2">PlacementIQ Executive Report</h1>
        <p className="text-text-secondary">Prepared for: {profile?.targetRole} Candidate • Date: {new Date(analysis.completedAt).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Core Identity */}
        <div className="md:col-span-1 space-y-6">
          <Card glass className="print:shadow-none print:border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-text">Candidate Profile</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-text-muted block mb-1">Target Role</span>
                  <span className="font-medium text-text flex items-center">
                    <Briefcase className="w-4 h-4 mr-1.5 text-text-secondary" />
                    {profile?.targetRole}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block mb-1">Education</span>
                  <span className="font-medium text-text flex items-center">
                    <GraduationCap className="w-4 h-4 mr-1.5 text-text-secondary" />
                    {profile?.college || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block mb-1">Graduation Year</span>
                  <span className="font-medium text-text">{profile?.graduationYear || 'Not provided'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glass className="print:shadow-none print:border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-text">Resume Vitals</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-text-muted block mb-1">ATS Parsability</span>
                  <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${resume?.parsedData?.skills?.length ? 95 : 40}%` }} 
                    />
                  </div>
                </div>
                {resume?.parsedData?.skills && (
                  <div>
                    <span className="text-xs text-text-muted block mb-2">Top Extracted Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {resume.parsedData.skills.slice(0, 5).map((skill: any, i: number) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text border border-border">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Metrics & Analysis */}
        <div className="md:col-span-2 space-y-6">
          <Card glass gradientBorder className="print:shadow-none print:border-border">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-text mb-1">Readiness Score</h3>
                  <p className="text-sm text-text-secondary">Aggregated from all data points</p>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-display font-bold text-primary">{Math.round(analysis.overallScore || 0)}</span>
                  <span className="text-lg text-text-secondary mb-1">/100</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(analysis.scoreBreakdown || {}).slice(0, 3).map(([key, comp]: [string, any]) => (
                  <div key={key} className="p-3 bg-surface-3/50 rounded-lg border border-border">
                    <span className="text-xs text-text-secondary block mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-lg font-bold text-text">{Math.round(comp.score)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card glass className="print:shadow-none print:border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Github className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-text">GitHub Identity</h3>
                </div>
                {github && github.status === 'COMPLETED' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span className="text-sm text-text-secondary">Public Repos</span>
                      <span className="font-semibold text-text">{github.stats?.publicRepos || 0}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span className="text-sm text-text-secondary">Total Stars</span>
                      <span className="font-semibold text-text">{github.stats?.totalStars || 0}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">No GitHub data synced.</p>
                )}
              </CardContent>
            </Card>

            <Card glass className="print:shadow-none print:border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-text">Coding Profiles</h3>
                </div>
                {codingProfiles && codingProfiles.length > 0 ? (
                  <div className="space-y-3">
                    {codingProfiles.map((cp: any) => (
                      <div key={cp.id} className="flex justify-between items-center bg-surface-3/30 p-2 rounded border border-border">
                        <span className="text-sm font-medium text-text">{cp.platform}</span>
                        <span className="text-sm font-bold text-primary">{cp.stats?.totalSolved || cp.stats?.rating || 0}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">No coding profiles synced.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card glass className="print:shadow-none print:border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold text-text">Priority Skill Gaps</h3>
              </div>
              {analysis.skillGaps && analysis.skillGaps.length > 0 ? (
                <div className="space-y-3">
                  {analysis.skillGaps.slice(0, 3).map((gap: any) => (
                    <div key={gap.id} className="flex justify-between items-center p-3 bg-surface-3/30 rounded-lg border border-border">
                      <div>
                        <h4 className="font-semibold text-text text-sm mb-0.5">{gap.skill}</h4>
                        <p className="text-xs text-text-secondary">Target: {gap.requiredLevel}</p>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-1 rounded bg-danger/10 text-danger border border-danger/20">
                        {gap.estimatedTimeToLearn}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">No critical skill gaps identified.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
