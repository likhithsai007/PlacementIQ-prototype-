'use client';

import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Loader2, BrainCircuit, Target, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AnalysisPage() {
  // 1. Fetch Analysis List
  const { data: analysesResponse, isLoading: isLoadingAnalyses, refetch: refetchAnalyses } = useQuery({
    queryKey: ['analyses'],
    queryFn: async () => {
      const res = await api.getAnalyses();
      return res.data;
    },
  });

  const analyses = analysesResponse?.data || [];
  const latestAnalysis = analyses[0];
  const isPending = latestAnalysis?.status === 'PENDING';

  // 2. Fetch Detailed Analysis if latest is completed
  const { data: detailResponse, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['analysisDetail', latestAnalysis?.id],
    queryFn: async () => {
      if (!latestAnalysis?.id) return null;
      const res = await api.getAnalysis(latestAnalysis.id);
      return res.data;
    },
    enabled: !!latestAnalysis?.id && !isPending,
  });

  const analysisDetail = detailResponse?.data;

  // 3. Polling logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPending) {
      interval = setInterval(async () => {
        try {
          const res = await api.getAnalyses();
          const newAnalyses = res.data.data || [];
          const newLatest = newAnalyses[0];
          
          if (newLatest?.status !== 'PENDING') {
            refetchAnalyses();
            if (newLatest?.status === 'COMPLETED') {
              toast.success('Analysis completed successfully!');
            } else if (newLatest?.status === 'FAILED') {
              toast.error('Analysis failed. Please try again.');
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPending, refetchAnalyses]);

  // 4. Start Analysis Mutation
  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await api.startAnalysis();
      return res.data;
    },
    onSuccess: () => {
      toast.success('Analysis started! This may take a minute.');
      refetchAnalyses();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to start analysis');
    },
  });

  if (isLoadingAnalyses || (latestAnalysis && !isPending && isLoadingDetail)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }



  const getGradeColor = (grade?: string) => {
    if (grade === 'A') return 'text-green-500';
    if (grade === 'B') return 'text-blue-500';
    if (grade === 'C') return 'text-yellow-500';
    if (grade === 'D') return 'text-orange-500';
    return 'text-danger';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text mb-2">Placement Analysis</h1>
          <p className="text-text-secondary">Comprehensive evaluation of your skills, resume, and coding profiles.</p>
        </div>
        <Button 
          onClick={() => startMutation.mutate()} 
          disabled={startMutation.isPending || isPending}
        >
          {startMutation.isPending || isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <BrainCircuit className="w-4 h-4 mr-2" />
          )}
          Run New Analysis
        </Button>
      </div>

      {!latestAnalysis && !startMutation.isPending && (
        <Card glass>
          <CardContent className="pt-16 pb-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <BrainCircuit className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-text mb-2">No Analysis Found</h2>
            <p className="text-text-secondary max-w-md mb-8">
              You haven&apos;t run a placement analysis yet. Make sure your profile is complete and your resume is uploaded, then click the button below.
            </p>
            <Button onClick={() => startMutation.mutate()} className="px-8 py-6 text-lg">
              <Zap className="w-5 h-5 mr-2" />
              Analyze My Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {(isPending || startMutation.isPending) && (
        <Card glass gradientBorder>
          <CardContent className="pt-16 pb-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
            <h2 className="text-2xl font-semibold text-text mb-2">Running AI Analysis...</h2>
            <p className="text-text-secondary max-w-md">
              We are evaluating your resume, GitHub projects, and coding stats against current job descriptions. This typically takes a minute.
            </p>
          </CardContent>
        </Card>
      )}

      {latestAnalysis?.status === 'FAILED' && (
        <Card glass className="border-danger/20">
          <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-12 h-12 text-danger mb-4" />
            <h2 className="text-xl font-semibold text-text mb-2">Analysis Failed</h2>
            <p className="text-text-secondary mb-6">An error occurred while evaluating your profile. Please ensure your data sources are connected.</p>
            <Button variant="outline" onClick={() => startMutation.mutate()}>Retry Analysis</Button>
          </CardContent>
        </Card>
      )}

      {analysisDetail && !isPending && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <Card glass gradientBorder>
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-text mb-1">Overall Placement Readiness</h2>
                  <p className="text-text-secondary text-sm">Target Role: <span className="font-medium text-text">{analysisDetail.targetRole}</span></p>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-text-secondary mb-1">Score</span>
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-display font-bold text-text">{Math.round(analysisDetail.overallScore || 0)}</span>
                      <span className="text-xl text-text-secondary mb-1">/100</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-text-secondary mb-1">Grade</span>
                    <span className={`text-5xl font-display font-bold ${getGradeColor(
                      (analysisDetail.overallScore || 0) >= 85 ? 'A' : (analysisDetail.overallScore || 0) >= 70 ? 'B' : (analysisDetail.overallScore || 0) >= 55 ? 'C' : (analysisDetail.overallScore || 0) >= 40 ? 'D' : 'F'
                    )}`}>
                      {(analysisDetail.overallScore || 0) >= 85 ? 'A' : (analysisDetail.overallScore || 0) >= 70 ? 'B' : (analysisDetail.overallScore || 0) >= 55 ? 'C' : (analysisDetail.overallScore || 0) >= 40 ? 'D' : 'F'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Breakdown */}
            <Card glass>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-text">Score Breakdown</h3>
                </div>
                
                <div className="space-y-5">
                  {Object.entries(analysisDetail.scoreBreakdown || {}).map(([key, comp]: [string, any]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-text capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-bold text-text">{Math.round(comp.score || 0)}</span>
                      </div>
                      <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${(comp.score || 0) >= 80 ? 'bg-green-500' : (comp.score || 0) >= 50 ? 'bg-yellow-500' : 'bg-danger'}`} 
                          style={{ width: `${Math.min(100, Math.max(0, comp.score || 0))}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Skill Gaps */}
            <Card glass>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <h3 className="text-lg font-semibold text-text">Critical Skill Gaps</h3>
                </div>
                
                {analysisDetail.skillGaps && analysisDetail.skillGaps.length > 0 ? (
                  <div className="space-y-4">
                    {analysisDetail.skillGaps.slice(0, 5).map((gap: any) => (
                      <div key={gap.id} className="p-4 rounded-xl bg-surface-3/50 border border-border">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-text">{gap.skill}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            gap.priority === 'HIGH' ? 'bg-danger/10 text-danger border border-danger/20' : 
                            gap.priority === 'MEDIUM' ? 'bg-warning/10 text-warning border border-warning/20' : 
                            'bg-primary/10 text-primary border border-primary/20'
                          }`}>
                            {gap.priority}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-text-secondary mb-2">
                          <span>Current: {gap.currentLevel || 'None'}</span>
                          <span>Required: {gap.requiredLevel}</span>
                        </div>
                        <p className="text-xs text-text-muted">Estimated time: {gap.estimatedTimeToLearn}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mb-3" />
                    <p className="text-text-secondary text-sm text-center">No critical skill gaps found for this role!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
