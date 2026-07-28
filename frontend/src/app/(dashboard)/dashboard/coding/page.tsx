'use client';

import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Loader2, Code2, Trophy, Target, Activity, CheckCircle2, Trash2, AlertCircle, Sparkles, BrainCircuit, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const PLATFORMS = ['LEETCODE', 'CODEFORCES', 'CODECHEF', 'GFG', 'HACKERRANK'] as const;

const codingSchema = z.object({
  platform: z.enum(PLATFORMS, { required_error: 'Please select a platform' }),
  username: z.string().min(1, 'Username is required').max(100, 'Username is too long'),
});

type CodingFormValues = z.infer<typeof codingSchema>;

export default function CodingPage() {
  const { data: codingResponse, isLoading: isLoadingProfiles, refetch } = useQuery({
    queryKey: ['codingProfiles'],
    queryFn: async () => {
      const res = await api.getCodingProfiles();
      return res.data;
    },
  });

  const profiles = codingResponse?.data || [];
  const hasPending = profiles.some((p: any) => p.status === 'PENDING');

  const { data: analysisResponse, isLoading: isLoadingAnalysis, refetch: refetchAnalysis } = useQuery({
    queryKey: ['codingAnalysis'],
    queryFn: async () => {
      try {
        const res = await api.getCodingAnalysis();
        return res.data;
      } catch (e) {
        return null;
      }
    },
  });
  const analysis = analysisResponse?.data;

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.analyzeCodingProfiles();
      return res.data;
    },
    onSuccess: () => {
      toast.success('AI Analysis complete!');
      refetchAnalysis();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to analyze profiles');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CodingFormValues>({
    resolver: zodResolver(codingSchema),
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hasPending) {
      interval = setInterval(async () => {
        try {
          const res = await api.getCodingProfiles();
          const newProfiles = res.data.data || [];
          const stillPending = newProfiles.some((p: any) => p.status === 'PENDING');
          
          refetch();

          if (!stillPending) {
            clearInterval(interval);
            // Check for failures
            const newFailures = newProfiles.filter((p: any) => p.status === 'FAILED');
            if (newFailures.length > 0) {
              toast.error('Failed to sync some coding profiles.');
            } else {
              toast.success('Coding profiles synced successfully!');
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 4000); // Check every 4 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasPending, refetch]);

  const connectMutation = useMutation({
    mutationFn: async (data: CodingFormValues) => {
      const res = await api.connectCoding(data.platform, data.username);
      return res.data.data;
    },
    onSuccess: () => {
      reset();
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to connect profile');
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (platform: string) => {
      const res = await api.disconnectCoding(platform);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Profile disconnected');
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to disconnect profile');
    },
  });

  const onSubmit = (data: CodingFormValues) => {
    // Check if platform is already connected
    if (profiles.some((p: any) => p.platform === data.platform)) {
      toast.error(`${data.platform} is already connected. Remove it first.`);
      return;
    }
    connectMutation.mutate(data);
  };

  if (isLoadingProfiles) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'LEETCODE': return 'text-yellow-500';
      case 'CODEFORCES': return 'text-blue-500';
      case 'CODECHEF': return 'text-amber-700';
      case 'GFG': return 'text-green-500';
      case 'HACKERRANK': return 'text-green-600';
      default: return 'text-primary';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text mb-2">Coding Profiles</h1>
          <p className="text-text-secondary">Sync your competitive programming profiles to track your problem-solving skills.</p>
        </div>
        {profiles.length > 0 && (
          <Button 
            onClick={() => analyzeMutation.mutate()} 
            disabled={analyzeMutation.isPending || hasPending}
            className="flex items-center gap-2"
          >
            {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {analysis ? 'Refresh AI Insights' : 'Generate AI Insights'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Connected Profiles */}
        <div className="lg:col-span-2 space-y-6">
          {analysis && (
            <Card glass className="border-primary/20 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-6">
                  <BrainCircuit className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-text">AI Profile Analysis</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-surface-3/50 p-4 rounded-xl border border-border">
                    <div className="text-sm text-text-secondary mb-1">Coding Score</div>
                    <div className="text-3xl font-bold text-primary">{analysis.codingScore}<span className="text-lg text-text-secondary">/100</span></div>
                  </div>
                  <div className="bg-surface-3/50 p-4 rounded-xl border border-border">
                    <div className="text-sm text-text-secondary mb-1">DSA Readiness</div>
                    <div className="text-lg font-semibold text-text">{analysis.dsaReadiness}</div>
                  </div>
                  <div className="bg-surface-3/50 p-4 rounded-xl border border-border">
                    <div className="text-sm text-text-secondary mb-1">Interview Readiness</div>
                    <div className="text-lg font-semibold text-text">{analysis.interviewReadiness}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-3">Strong Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.strongTopics?.map((topic: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium border border-green-500/20">{topic}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-3">Needs Improvement</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.weakTopics?.map((topic: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-danger/10 text-danger rounded-full text-xs font-medium border border-danger/20">{topic}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {analysis.recommendedProblems?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-3">Recommended Practice</h4>
                    <div className="space-y-2">
                      {analysis.recommendedProblems.map((prob: any, i: number) => (
                        <a key={i} href={prob.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface hover:border-primary/50 transition-colors">
                          <div>
                            <div className="font-medium text-sm text-text flex items-center gap-2">
                              {prob.title}
                              <ExternalLink className="w-3 h-3 text-text-secondary" />
                            </div>
                            <div className="text-xs text-text-secondary mt-0.5">{prob.platform}</div>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            prob.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                            prob.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {prob.difficulty}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {profiles.length > 0 ? (
            <div className="grid gap-6">
              {profiles.map((profile: any) => (
                <Card key={profile.id} glass className={profile.status === 'FAILED' ? 'border-danger/20' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-surface-3 flex items-center justify-center border border-border">
                          <Code2 className={`w-6 h-6 ${getPlatformColor(profile.platform)}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text">{profile.platform}</h3>
                          <a href={profile.profileUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                            @{profile.username}
                          </a>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-danger hover:text-danger hover:bg-danger/10"
                        onClick={() => disconnectMutation.mutate(profile.platform)}
                        disabled={disconnectMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {profile.status === 'PENDING' && (
                      <div className="flex flex-col items-center justify-center py-6">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                        <p className="text-sm text-text-secondary">Syncing stats...</p>
                      </div>
                    )}

                    {profile.status === 'FAILED' && (
                      <div className="flex flex-col items-center justify-center py-6 text-danger">
                        <AlertCircle className="w-8 h-8 mb-3" />
                        <p className="text-sm">Failed to fetch profile. Please check the username.</p>
                      </div>
                    )}

                    {profile.status === 'COMPLETED' && profile.stats && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-surface-3/50 p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-1.5 text-text-secondary mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Solved</span>
                          </div>
                          <div className="text-xl font-bold text-text">{profile.stats.totalSolved || 0}</div>
                        </div>
                        
                        {(profile.stats.rating || profile.stats.maxRating) && (
                          <div className="bg-surface-3/50 p-3 rounded-lg border border-border">
                            <div className="flex items-center gap-1.5 text-text-secondary mb-1">
                              <Target className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">Rating</span>
                            </div>
                            <div className="text-xl font-bold text-text">{profile.stats.rating || profile.stats.maxRating}</div>
                          </div>
                        )}
                        
                        {profile.stats.rank && (
                          <div className="bg-surface-3/50 p-3 rounded-lg border border-border">
                            <div className="flex items-center gap-1.5 text-text-secondary mb-1">
                              <Trophy className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">Rank</span>
                            </div>
                            <div className="text-lg font-bold text-text truncate" title={profile.stats.rank}>
                              {profile.stats.rank}
                            </div>
                          </div>
                        )}
                        
                        {profile.stats.contestsParticipated !== undefined && (
                          <div className="bg-surface-3/50 p-3 rounded-lg border border-border">
                            <div className="flex items-center gap-1.5 text-text-secondary mb-1">
                              <Activity className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">Contests</span>
                            </div>
                            <div className="text-xl font-bold text-text">{profile.stats.contestsParticipated}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card glass>
              <CardContent className="pt-16 pb-16 flex flex-col items-center justify-center">
                <Code2 className="w-12 h-12 text-primary/40 mb-4" />
                <h3 className="text-lg font-semibold text-text mb-2">No Profiles Connected</h3>
                <p className="text-sm text-text-secondary text-center max-w-sm">
                  Add your coding platform usernames on the right to start tracking your problem-solving progress.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Add Connection Form */}
        <div className="space-y-6">
          <Card glass>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-text mb-4">Add Profile</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text">Platform</label>
                  <select
                    {...register('platform')}
                    className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Platform...</option>
                    <option value="LEETCODE">LeetCode</option>
                    <option value="CODEFORCES">Codeforces</option>
                    <option value="CODECHEF">CodeChef</option>
                    <option value="GFG">GeeksforGeeks</option>
                    <option value="HACKERRANK">HackerRank</option>
                  </select>
                  {errors.platform && <p className="text-xs text-danger">{errors.platform.message}</p>}
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text">Username</label>
                  <Input
                    {...register('username')}
                    placeholder="Username"
                    className="w-full"
                  />
                  {errors.username && <p className="text-xs text-danger">{errors.username.message}</p>}
                </div>
                
                <Button type="submit" className="w-full" disabled={connectMutation.isPending || hasPending}>
                  {connectMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Connect
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
