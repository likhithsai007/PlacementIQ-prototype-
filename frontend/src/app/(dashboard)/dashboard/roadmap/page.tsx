'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Loader2, Route, BookOpen, Target, Code, CalendarDays, ExternalLink, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RoadmapPage() {
  const router = useRouter();
  
  // 1. Fetch Analysis List
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

  // 2. Fetch Detailed Analysis if latest is completed
  const { data: detailResponse, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['analysisDetail', latestAnalysis?.id],
    queryFn: async () => {
      if (!latestAnalysis?.id) return null;
      const res = await api.getAnalysis(latestAnalysis.id);
      return res.data;
    },
    enabled: !!latestAnalysis?.id && isCompleted,
  });

  const analysisDetail = detailResponse?.data;

  if (isLoadingAnalyses || (latestAnalysis && isCompleted && isLoadingDetail)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!latestAnalysis || !isCompleted || !analysisDetail?.roadmap) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-text mb-2">Learning Roadmap</h1>
          <p className="text-text-secondary">Your personalized AI-generated curriculum.</p>
        </div>
        <Card glass>
          <CardContent className="pt-16 pb-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Route className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-text mb-2">Generate Your Curriculum</h2>
            <p className="text-text-secondary max-w-md mb-8">
              Run a placement analysis to let our AI build a step-by-step roadmap tailored to your specific skill gaps and target role.
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

  const { roadmap, recommendations } = analysisDetail;
  const highImpactRecs = recommendations?.filter((r: any) => r.impact === 'HIGH') || [];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text mb-2">Learning Roadmap</h1>
          <p className="text-text-secondary">Your {roadmap.totalWeeks}-week intensive curriculum to land your target role.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-3/50 px-4 py-2 rounded-lg border border-border">
          <CalendarDays className="w-5 h-5 text-primary" />
          <div className="flex flex-col">
            <span className="text-xs text-text-secondary">Target Duration</span>
            <span className="font-semibold text-text">{roadmap.totalWeeks} Weeks</span>
          </div>
        </div>
      </div>

      {/* High Impact Recommendations */}
      {highImpactRecs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Quick Wins
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highImpactRecs.slice(0, 3).map((rec: any) => (
              <Card key={rec.id} glass className="border-primary/20 bg-primary/5">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-text">{rec.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/20 text-primary">
                      {rec.effort} EFFORT
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{rec.description}</p>
                  <ul className="space-y-1 mt-auto">
                    {rec.actionItems.slice(0, 2).map((item: string, i: number) => (
                      <li key={i} className="text-xs text-text flex items-start">
                        <ArrowRight className="w-3 h-3 text-primary mr-1.5 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap Timeline */}
      <div className="space-y-6 pt-4">
        <h2 className="text-xl font-semibold text-text flex items-center gap-2">
          <Route className="w-5 h-5 text-primary" /> Phase-by-Phase Curriculum
        </h2>
        
        <div className="relative border-l border-border ml-3 md:ml-4 space-y-8 pb-4">
          {roadmap.phases.map((phase: any, phaseIndex: number) => (
            <div key={phaseIndex} className="relative pl-6 md:pl-8">
              {/* Timeline Node */}
              <div className="absolute w-6 h-6 rounded-full bg-surface border-2 border-primary -left-[13px] top-1 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{phase.phaseNumber}</span>
              </div>

              <div className="bg-surface-3/30 border border-border rounded-xl p-5 md:p-6 mb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 border-b border-border pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text mb-1">{phase.title}</h3>
                    <p className="text-sm text-text-secondary">{phase.description}</p>
                  </div>
                  <div className="flex-shrink-0 bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-semibold border border-primary/20">
                    Weeks {phase.weekStart}-{phase.weekEnd}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-text uppercase tracking-wider mb-3 text-text-muted">Core Focus</h4>
                  <div className="flex flex-wrap gap-2">
                    {phase.focus.map((f: string, i: number) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-surface-2 text-text border border-border">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tasks */}
                  {phase.tasks && phase.tasks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-text flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-primary" /> Learning Tasks
                      </h4>
                      <div className="space-y-3">
                        {phase.tasks.map((task: any, i: number) => (
                          <div key={i} className="p-3 bg-surface rounded-lg border border-border">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-medium text-sm text-text">{task.title}</h5>
                              <span className="text-[10px] text-text-muted whitespace-nowrap ml-2">{task.estimatedHours} hrs</span>
                            </div>
                            <p className="text-xs text-text-secondary mb-2">{task.description}</p>
                            {task.resources && task.resources.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {task.resources.map((res: any, j: number) => (
                                  <a 
                                    key={j} 
                                    href={res.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[10px] flex items-center text-primary hover:underline bg-primary/5 px-2 py-0.5 rounded border border-primary/10"
                                  >
                                    {res.title} <ExternalLink className="w-2.5 h-2.5 ml-1" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {phase.projects && phase.projects.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-text flex items-center gap-2 mb-3">
                        <Code className="w-4 h-4 text-primary" /> Capstone Projects
                      </h4>
                      <div className="space-y-3">
                        {phase.projects.map((project: any, i: number) => (
                          <div key={i} className="p-4 bg-surface rounded-lg border border-primary/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary text-surface px-2 py-0.5 text-[10px] font-bold rounded-bl-lg">
                              +{project.impactOnScore} PTS
                            </div>
                            <h5 className="font-semibold text-text mb-1">{project.title}</h5>
                            <p className="text-xs text-text-secondary mb-3">{project.description}</p>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {project.technologies.slice(0, 4).map((tech: string, j: number) => (
                                <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-text-muted">
                                  {tech}
                                </span>
                              ))}
                            </div>

                            <div className="bg-surface-2 p-2 rounded text-xs border border-border">
                              <span className="font-semibold text-text mr-1">Why Build This:</span>
                              <span className="text-text-secondary">{project.whyBuild}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Final Goal Node */}
          <div className="relative pl-6 md:pl-8 mt-8">
            <div className="absolute w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-500 -left-[13px] -top-1 flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-text ml-2">Ready for Interviews</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
