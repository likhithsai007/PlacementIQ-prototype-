'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Loader2, Briefcase, Building2, MapPin, Banknote, RefreshCw, ChevronRight, Zap, Search, Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function JobsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Filters state
  const [filters, setFilters] = useState({
    location: '',
    company: '',
    isRemote: false,
    isHybrid: false,
    jobType: '',
  });
  
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Apply filters with a proper cleared debounce delay
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setDebouncedFilters(newFilters);
    }, 500);
  };

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['jobRecommendations', debouncedFilters],
    queryFn: async () => {
      const res = await api.getJobRecommendations(debouncedFilters);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const cards = response?.data || [];
  const meta = response?.meta || {};

  const { data: savedResponse } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: async () => {
      const res = await api.getSavedJobs();
      return res.data;
    },
  });
  const savedJobs = savedResponse?.data || [];
  const savedJobIds = new Set(savedJobs.map((sj: any) => sj.jobId));

  const refreshMutation = useMutation({
    mutationFn: async (analysisId?: string) => {
      const res = await api.refreshJobRecommendations(analysisId);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.data.message || 'Job recommendations refreshed!');
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to refresh recommendations');
    },
  });
  
  const saveJobMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string, status: 'SAVED' | 'APPLY_LATER' }) => {
      const res = await api.saveJob(jobId, status);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Job saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save job');
    },
  });

  if (isLoading && !response) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // No analysis has been completed yet
  if (!meta.analysisId && cards.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-text mb-2">Job Matches</h1>
          <p className="text-text-secondary">AI-powered job recommendations tailored to your profile.</p>
        </div>
        <Card glass>
          <CardContent className="pt-16 pb-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-text mb-2">Unlock Job Matches</h2>
            <p className="text-text-secondary max-w-md mb-8">
              We need to analyze your complete profile first to find the best job matches for your skill set.
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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text mb-2">AI Job Matches</h1>
          <p className="text-text-secondary">Based on your {Math.round(meta.analysisScore || 0)}/100 placement score for {meta.targetRole}.</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => refreshMutation.mutate(meta.analysisId)} 
          disabled={refreshMutation.isPending}
          className="whitespace-nowrap"
        >
          {refreshMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh Matches
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <Card glass className="sticky top-24">
            <CardContent className="p-5 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text uppercase tracking-wider mb-4">Filters</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-text-secondary">Location</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-muted" />
                      <Input 
                        placeholder="City or Country" 
                        className="pl-9 h-9"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-text-secondary">Company</label>
                    <Input 
                      placeholder="e.g. Google, Startup" 
                      className="h-9"
                      value={filters.company}
                      onChange={(e) => handleFilterChange('company', e.target.value)}
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-xs text-text-secondary">Workspace</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        id="remote" 
                        checked={filters.isRemote}
                        onChange={(e) => handleFilterChange('isRemote', e.target.checked)}
                        className="w-4 h-4 rounded border-surface-3 text-primary focus:ring-primary"
                      />
                      <label htmlFor="remote" className="text-sm font-medium leading-none text-text">Remote</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        id="hybrid" 
                        checked={filters.isHybrid}
                        onChange={(e) => handleFilterChange('isHybrid', e.target.checked)}
                        className="w-4 h-4 rounded border-surface-3 text-primary focus:ring-primary"
                      />
                      <label htmlFor="hybrid" className="text-sm font-medium leading-none text-text">Hybrid</label>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-xs text-text-secondary">Job Type</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        id="fulltime" 
                        checked={filters.jobType === 'FULL_TIME'}
                        onChange={(e) => handleFilterChange('jobType', e.target.checked ? 'FULL_TIME' : '')}
                        className="w-4 h-4 rounded border-surface-3 text-primary focus:ring-primary"
                      />
                      <label htmlFor="fulltime" className="text-sm font-medium leading-none text-text">Full-Time</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        id="internship" 
                        checked={filters.jobType === 'INTERNSHIP'}
                        onChange={(e) => handleFilterChange('jobType', e.target.checked ? 'INTERNSHIP' : '')}
                        className="w-4 h-4 rounded border-surface-3 text-primary focus:ring-primary"
                      />
                      <label htmlFor="internship" className="text-sm font-medium leading-none text-text">Internship</label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Cards */}
        <div className="flex-1 space-y-6">
          {cards.length === 0 ? (
            <Card glass>
              <CardContent className="pt-16 pb-16 flex flex-col items-center justify-center text-center">
                <Briefcase className="w-12 h-12 text-text-muted mb-4" />
                <h2 className="text-xl font-semibold text-text mb-2">No Matches Found</h2>
                <p className="text-text-secondary max-w-md mb-6">
                  We couldn&apos;t find any active job postings matching your filters. Try adjusting them or refreshing your recommendations.
                </p>
                <Button onClick={() => refreshMutation.mutate(meta.analysisId)}>
                  Refresh Recommendations
                </Button>
              </CardContent>
            </Card>
          ) : (
            cards.map((card: any) => {
              const isSaved = savedJobIds.has(card.job.id);
              
              return (
                <Card key={card.id} glass className="overflow-hidden hover:border-primary/50 transition-colors">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row border-b border-border">
                      
                      {/* Left Column: Overall Match Score */}
                      <div className="md:w-48 bg-surface-3/30 p-6 flex flex-col items-center justify-center border-r border-border border-b md:border-b-0">
                        <div className="text-xs text-text-secondary uppercase tracking-wider mb-2 font-semibold">Match</div>
                        <div className="relative mb-3">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="44" className="stroke-surface-3" strokeWidth="8" fill="none" />
                            <circle 
                              cx="48" 
                              cy="48" 
                              r="44" 
                              className="stroke-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                              strokeWidth="8" 
                              fill="none" 
                              strokeDasharray="276.4"
                              strokeDashoffset={276.4 - (276.4 * card.matchScore) / 100}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                            <span className="text-2xl font-display font-bold text-text">{Math.round(card.matchScore)}<span className="text-xs text-text-secondary">%</span></span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                          card.estimatedReadiness === 'READY' ? 'bg-green-500/10 text-green-500' :
                          card.estimatedReadiness === 'ALMOST_READY' ? 'bg-blue-500/10 text-blue-400' :
                          card.estimatedReadiness === 'DEVELOPING' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-danger/10 text-danger'
                        }`}>
                          {card.estimatedReadiness}
                        </span>
                      </div>

                      {/* Right Column: Job Details & Deep Scores */}
                      <div className="flex-1 p-6 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-2xl font-semibold text-text mb-1">{card.job.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                              <span className="flex items-center font-medium text-text">
                                <Building2 className="w-4 h-4 mr-1.5 text-primary" />
                                {card.job.company}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1.5" />
                                {card.job.isRemote ? 'Remote' : (card.job.location || 'Not specified')}
                              </span>
                              {card.job.salaryRange && (
                                <span className="flex items-center text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded">
                                  <Banknote className="w-4 h-4 mr-1.5" />
                                  {card.job.salaryRange}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-xs font-medium text-text-secondary px-2 py-1 bg-surface-2 rounded-md">
                              {card.job.jobType.replace('_', ' ')}
                            </div>
                          </div>
                        </div>

                        {/* Sub Scores */}
                        <div className="flex gap-4 mt-4 mb-5">
                          <div className="bg-surface-2/50 rounded-lg px-3 py-2 flex flex-col flex-1">
                            <span className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Company Fit</span>
                            <div className="flex items-end gap-2">
                              <span className="text-lg font-semibold text-text">{Math.round(card.companyMatchScore)}%</span>
                              <div className="w-full h-1.5 bg-surface-3 rounded-full mb-1.5">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${card.companyMatchScore}%` }} />
                              </div>
                            </div>
                          </div>
                          <div className="bg-surface-2/50 rounded-lg px-3 py-2 flex flex-col flex-1">
                            <span className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Role Match</span>
                            <div className="flex items-end gap-2">
                              <span className="text-lg font-semibold text-text">{Math.round(card.roleMatchScore)}%</span>
                              <div className="w-full h-1.5 bg-surface-3 rounded-full mb-1.5">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${card.roleMatchScore}%` }} />
                              </div>
                            </div>
                          </div>
                          <div className="bg-surface-2/50 rounded-lg px-3 py-2 flex flex-col flex-1">
                            <span className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Interview Prob.</span>
                            <div className="flex items-end gap-2">
                              <span className="text-lg font-semibold text-text">{Math.round(card.interviewProbability)}%</span>
                              <div className="w-full h-1.5 bg-surface-3 rounded-full mb-1.5">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${card.interviewProbability}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-text-secondary mb-4">
                          <strong className="text-primary block mb-1">Why you match:</strong>
                          {card.reason}
                        </div>

                        <div className="mt-auto flex gap-3 pt-4 border-t border-border/50 justify-end">
                          <Button 
                            variant="outline" 
                            onClick={() => saveJobMutation.mutate({ jobId: card.job.id, status: 'SAVED' })}
                            disabled={saveJobMutation.isPending || isSaved}
                          >
                            {isSaved ? <BookmarkCheck className="w-4 h-4 mr-2 text-primary" /> : <Bookmark className="w-4 h-4 mr-2" />}
                            {isSaved ? 'Saved' : 'Save Job'}
                          </Button>
                          <Button onClick={() => router.push(`/dashboard/jobs/${card.job.id}`)}>
                            View Deep Insights <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>

                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
