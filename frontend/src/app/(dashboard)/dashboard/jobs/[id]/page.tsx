'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { 
  Loader2, Building2, MapPin, Banknote, ArrowLeft, 
  CheckCircle2, XCircle, AlertTriangle, TrendingUp,
  Bookmark, BookmarkCheck, Briefcase, Award
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['jobDetails', jobId],
    queryFn: async () => {
      const res = await api.getJob(jobId);
      return res.data;
    },
  });

  const saveJobMutation = useMutation({
    mutationFn: async (status: 'SAVED' | 'APPLY_LATER') => {
      const res = await api.saveJob(jobId, status);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Job status updated!');
      queryClient.invalidateQueries({ queryKey: ['jobDetails', jobId] });
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update job status');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const data = response?.data;
  if (!data || !data.job) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-xl font-semibold text-text">Job not found</h2>
        <Button variant="outline" onClick={() => router.push('/dashboard/jobs')}>
          Back to Jobs
        </Button>
      </div>
    );
  }

  const { job, recommendation, savedStatus } = data;
  const isSaved = savedStatus === 'SAVED';
  const isApplyLater = savedStatus === 'APPLY_LATER';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/jobs" className="text-text-secondary hover:text-text transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-text">Job Details</h1>
        </div>
      </div>

      {/* Main Job Info */}
      <Card glass className="overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-text">{job.title}</h1>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-surface-3 text-text-secondary">
                  {job.jobType.replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary">
                <span className="flex items-center font-medium text-text text-base">
                  <Building2 className="w-5 h-5 mr-2 text-primary" />
                  {job.company}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {job.isRemote ? 'Remote' : (job.isHybrid ? 'Hybrid' : job.location)}
                </span>
                {job.salaryRange && (
                  <span className="flex items-center text-green-400 font-medium bg-green-500/10 px-2 py-1 rounded">
                    <Banknote className="w-4 h-4 mr-2" />
                    {job.salaryRange}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant={isSaved ? "secondary" : "outline"}
                onClick={() => saveJobMutation.mutate('SAVED')}
                disabled={saveJobMutation.isPending}
                className="w-32"
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button 
                onClick={() => saveJobMutation.mutate('APPLY_LATER')}
                disabled={saveJobMutation.isPending}
                variant={isApplyLater ? "secondary" : "default"}
              >
                {isApplyLater ? 'Added to Apply Later' : 'Apply Later'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card glass>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">Job Description</h3>
                <div className="text-text-secondary whitespace-pre-wrap leading-relaxed text-sm">
                  {job.description}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-text mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((req: any, i: number) => (
                    <span 
                      key={i} 
                      className={`text-xs px-3 py-1.5 rounded-md ${
                        req.importance === 'MUST_HAVE' ? 'bg-primary/10 text-primary border border-primary/20' :
                        'bg-surface-3 text-text-secondary'
                      }`}
                    >
                      {req.skill} {req.importance === 'MUST_HAVE' && '*'}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Insights */}
        <div className="space-y-6">
          {recommendation ? (
            <>
              {/* Scores Card */}
              <Card glass>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-text">AI Match Insights</h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">Overall Match</span>
                        <span className="font-semibold text-text">{Math.round(recommendation.matchScore)}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-3 rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${recommendation.matchScore}%` }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">Company Fit</span>
                        <span className="font-semibold text-text">{Math.round(recommendation.companyMatchScore)}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-3 rounded-full">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${recommendation.companyMatchScore}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">Role Alignment</span>
                        <span className="font-semibold text-text">{Math.round(recommendation.roleMatchScore)}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-3 rounded-full">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${recommendation.roleMatchScore}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">Interview Prob.</span>
                        <span className="font-semibold text-green-400">{Math.round(recommendation.interviewProbability)}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-3 rounded-full">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${recommendation.interviewProbability}%` }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Text Card */}
              <Card glass>
                <CardContent className="p-6 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Why you match
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{recommendation.reason}</p>
                  </div>

                  {recommendation.nonMatchReason && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 mb-2 text-yellow-500 font-medium">
                        <AlertTriangle className="w-4 h-4" /> Where you fall short
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">{recommendation.nonMatchReason}</p>
                    </div>
                  )}

                  {recommendation.experienceRequired && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 mb-2 text-text font-medium">
                        <Briefcase className="w-4 h-4 text-primary" /> Experience Req.
                      </div>
                      <p className="text-sm text-text-secondary">{recommendation.experienceRequired}</p>
                    </div>
                  )}
                  
                  {recommendation.requiredCertifications?.length > 0 && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 mb-2 text-text font-medium">
                        <Award className="w-4 h-4 text-purple-400" /> Certifications
                      </div>
                      <div className="flex flex-col gap-1 text-sm">
                        {recommendation.requiredCertifications.map((cert: string, i: number) => {
                          const isMissing = recommendation.missingCertifications?.includes(cert);
                          return (
                            <div key={i} className={`flex items-center gap-2 ${isMissing ? 'text-danger' : 'text-green-500'}`}>
                              {isMissing ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                              {cert}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* Action Plan */}
              {recommendation.improvementTips?.length > 0 && (
                <Card glass className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-3">Action Plan</h3>
                    <ul className="space-y-3">
                      {recommendation.improvementTips.map((tip: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card glass>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text mb-2">No Match Data</h3>
                <p className="text-sm text-text-secondary">
                  Run a placement analysis to get AI insights for this role.
                </p>
                <Button className="mt-4" onClick={() => router.push('/dashboard/analysis')}>
                  Analyze Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
