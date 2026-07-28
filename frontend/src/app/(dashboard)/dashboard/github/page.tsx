'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import {
  Loader2,
  Github,
  AlertCircle,
  GitBranch,
  Star,
  BookOpen,
  Code,
  Award,
  Search,
  MessageSquare,
  Send,
  X,
  ChevronRight,
  Download,
  TrendingUp,
  History,
  Sparkles,
  BookOpen as BookOpenIcon,
  Users,
  Check,
  ExternalLink,
  Info,
  Layers,
  Percent,
  CheckCircle,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  Shield,
  FileCode,
  Settings,
  Terminal,
  Activity,
  UserCheck,
  Copy,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line
} from 'recharts';

const githubSchema = z.object({
  username: z.string().min(1, 'Username is required').max(39, 'Username is too long'),
});

type GithubFormValues = z.infer<typeof githubSchema>;

export default function GitHubPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [forceAnalyze, setForceAnalyze] = useState(false);
  
  // Collapse States for Better Usability
  const [collapseState, setCollapseState] = useState({
    summary: false,
    repos: false,
    skills: false,
    practices: false,
    diversity: false,
    recruiter: false,
    openSource: false,
    roadmap: false,
  });

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Hello! I am your AI GitHub Intelligence Coach. Ask me how to improve your codebase architecture, write professional READMEs, containerize your repositories, or align your profile for recruiter screening!' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: githubResponse, isLoading: isLoadingGithub, refetch: refetchProfile } = useQuery({
    queryKey: ['github'],
    queryFn: async () => {
      const res = await api.getGitHub();
      return res.data;
    },
  });

  const profile = githubResponse?.data;

  // Consolidated GitHub Analysis Query
  const { data: analysisResponse, isLoading: isLoadingAnalysis, refetch: refetchAnalysis } = useQuery({
    queryKey: ['githubAnalysis', forceAnalyze],
    queryFn: async () => {
      const res = await api.analyzeGitHub(forceAnalyze);
      return res.data;
    },
    enabled: !!profile && profile.status === 'COMPLETED' && !isEditing,
  });

  const analysis = analysisResponse?.data;

  // Poll for connection sync completion
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (jobId || profile?.status === 'PENDING') {
      interval = setInterval(async () => {
        try {
          if (jobId) {
            const res = await api.getGitHubStatus(jobId);
            if (res.data.data.state === 'completed') {
              setJobId(null);
              refetchProfile();
              toast.success('GitHub profile connected successfully!');
            } else if (res.data.data.state === 'failed') {
              setJobId(null);
              refetchProfile();
              toast.error('Failed to parse GitHub profile.');
            }
          } else {
            const res = await api.getGitHub();
            if (res.data.data?.status !== 'PENDING') {
              refetchProfile();
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jobId, profile?.status, refetchProfile]);

  // Sync recheck flag
  useEffect(() => {
    if (forceAnalyze) {
      setForceAnalyze(false);
    }
  }, [analysis]);

  // Autoscroll chatbot
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs, isChatOpen]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GithubFormValues>({
    resolver: zodResolver(githubSchema),
  });

  const connectMutation = useMutation({
    mutationFn: async (data: GithubFormValues) => {
      const res = await api.connectGitHub(data.username);
      return res.data.data;
    },
    onSuccess: (data) => {
      setJobId(data.jobId);
      setIsEditing(false);
      refetchProfile();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to connect GitHub');
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await api.chatWithGitHub(message);
      return res.data.data;
    },
    onSuccess: (data) => {
      setIsTyping(false);
      setChatLogs((prev) => [...prev, { sender: 'bot', text: data.reply }]);
    },
    onError: (err: any) => {
      setIsTyping(false);
      setChatLogs((prev) => [...prev, { sender: 'bot', text: 'Error getting coach recommendations. Please try again.' }]);
    }
  });

  const onSubmitConnect = (data: GithubFormValues) => {
    connectMutation.mutate(data);
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    const msg = chatMessage;
    setChatMessage('');
    setChatLogs((prev) => [...prev, { sender: 'user', text: msg }]);
    setIsTyping(true);
    chatMutation.mutate(msg);
  };

  const handleRunNewAnalysis = () => {
    setForceAnalyze(true);
    toast.success('Analyzing repositories on GitHub...');
  };

  const toggleCollapse = (section: keyof typeof collapseState) => {
    setCollapseState(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Description copied to clipboard!');
  };

  if (isLoadingGithub || (profile && profile.status === 'COMPLETED' && isLoadingAnalysis)) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-text-secondary">Generating portfolio insights...</p>
        </div>
      </div>
    );
  }

  const toggleIsEditing = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text mb-2">GitHub Intelligence</h1>
          <p className="text-text-secondary">AI-driven analysis of repository structure, code readability, diversity metrics, and career matching.</p>
        </div>
        
        {profile && profile.status === 'COMPLETED' && !isEditing && (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRunNewAnalysis} className="btn-ghost">
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Run New Analysis
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="btn-ghost">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        )}
      </div>

      {/* Connect Account view */}
      {(!profile || isEditing) && !connectMutation.isPending && (
        <Card glass className="p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
            <Github className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">{isEditing ? 'Reconnect GitHub Username' : 'Connect GitHub Portfolio'}</h2>
          <p className="text-text-secondary max-w-md mb-8">
            Provide your GitHub username. We will retrieve repository details, commit rates, and evaluate code readabilities.
          </p>
          <form onSubmit={handleSubmit(onSubmitConnect)} className="w-full max-w-sm space-y-4">
            <div>
              <Input
                {...register('username')}
                placeholder="GitHub Username"
                className="w-full h-12 bg-bg/50 border-border text-text rounded-xl"
                defaultValue={profile?.username || ''}
              />
              {errors.username && <p className="text-xs text-danger mt-1 text-left">{errors.username.message}</p>}
            </div>
            <div className="flex gap-2">
              {isEditing && (
                <Button type="button" variant="outline" className="btn-ghost flex-1 h-12 rounded-xl" onClick={toggleIsEditing}>
                  Cancel
                </Button>
              )}
              <Button type="submit" className="btn-primary flex-1 h-12 rounded-xl">
                {isEditing ? 'Sync Profile' : 'Start Analytics'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Analyzer Syncing state */}
      {(connectMutation.isPending || profile?.status === 'PENDING' || jobId) && (
        <Card glass gradientBorder className="p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-semibold text-text mb-2">Cloning & Scanning Portfolios...</h2>
          <p className="text-text-secondary max-w-md animate-pulse">
            Syncing commit activity, languages, readmes, and triggering neural diagnostics. This takes 20-40 seconds.
          </p>
        </Card>
      )}

      {/* Sync Failed state */}
      {profile?.status === 'FAILED' && !jobId && !isEditing && (
        <Card glass className="border-danger/20 p-8 text-center flex flex-col items-center justify-center">
          <AlertCircle className="w-16 h-16 text-danger mb-4" />
          <h2 className="text-xl font-bold text-text mb-2">Portfolio Integration Failed</h2>
          <p className="text-text-secondary mb-6">Could not pull repository data for the username. Double check name and try again.</p>
          <div className="flex gap-4">
            <Button variant="outline" className="btn-ghost" onClick={toggleIsEditing}>Change Username</Button>
            <Button onClick={() => refetchProfile()} className="btn-primary">Try Again</Button>
          </div>
        </Card>
      )}

      {/* Completed Dashboard */}
      {profile?.status === 'COMPLETED' && analysis && !isEditing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. GitHub Intelligence Summary */}
            <Card glass className="p-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-6">
                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  GitHub Intelligence Summary
                </h3>
                <button onClick={() => toggleCollapse('summary')} className="text-text-secondary hover:text-text">
                  {collapseState.summary ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </button>
              </div>

              {!collapseState.summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Gauge */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-36 h-36 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="75%"
                          outerRadius="100%"
                          barSize={10}
                          data={analysis.charts?.githubScoreGauge || []}
                          startAngle={180}
                          endAngle={-180}
                        >
                          <RadialBar background dataKey="value" />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold font-display text-text">{analysis.githubScore || 60}%</span>
                        <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-surface-2/20 p-3 rounded-lg border border-border/40">
                      <div className="text-xs text-text-secondary">Overall Rating</div>
                      <div className="font-semibold text-text text-base mt-0.5">{analysis.profileStrength?.overallRating || 'Good'}</div>
                    </div>
                    <div className="bg-surface-2/20 p-3 rounded-lg border border-border/40">
                      <div className="text-xs text-text-secondary">Profile Strength</div>
                      <div className="font-semibold text-text text-base mt-0.5">{analysis.profileStrength?.strength || 'Medium'}</div>
                    </div>
                    <div className="bg-surface-2/20 p-3 rounded-lg border border-border/40">
                      <div className="text-xs text-text-secondary">AI Confidence</div>
                      <div className="font-semibold text-warning text-base mt-0.5">{analysis.profileStrength?.aiConfidence || 85}%</div>
                    </div>
                    <div className="bg-surface-2/20 p-3 rounded-lg border border-border/40">
                      <div className="text-xs text-text-secondary">Placement Readiness</div>
                      <div className="font-semibold text-success text-base mt-0.5">{analysis.profileStrength?.placementReadiness || 50}%</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* 3. AI Repository Analysis */}
            <Card glass>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-6">
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-text">Repository Quality Diagnostics</h3>
                  </div>
                  <button onClick={() => toggleCollapse('repos')} className="text-text-secondary hover:text-text">
                    {collapseState.repos ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                </div>

                {!collapseState.repos && (
                  <div className="space-y-6">
                    {analysis.repositoryAnalysis?.map((repo: any, i: number) => (
                      <div key={i} className="p-5 rounded-2xl bg-surface-3/30 border border-border/50 space-y-4">
                        
                        {/* Title and stats */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                          <h4 className="text-base font-bold text-text flex items-center gap-1.5">
                            {repo.repoName}
                            {i === 0 && (
                              <span className="text-[9px] px-2 py-0.5 rounded bg-success/20 text-success border border-success/35 font-bold animate-pulse">
                                Best Resume Project
                              </span>
                            )}
                          </h4>
                          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                            <span className="bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 rounded">Project Score: {repo.projectScore}%</span>
                            <span className="bg-success/10 text-success border border-success/25 px-2 py-0.5 rounded">Recruiter Interest: {repo.recruiterInterest}%</span>
                            <span className="bg-warning/10 text-warning border border-warning/25 px-2 py-0.5 rounded">Complexity: {repo.complexity}</span>
                          </div>
                        </div>

                        {/* Resume improved description */}
                        {repo.aiImprovedDescription && (
                          <div className="p-3 bg-bg/50 rounded-xl border border-border/40 space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                              <span>AI Improved Description (Resume-Ready)</span>
                              <button
                                onClick={() => handleCopyText(repo.aiImprovedDescription)}
                                className="text-primary hover:text-primary-focus flex items-center gap-1 normal-case"
                              >
                                <Copy className="w-3.5 h-3.5" /> Copy Description
                              </button>
                            </div>
                            <p className="text-xs text-text leading-relaxed italic">
                              &quot;{repo.aiImprovedDescription}&quot;
                            </p>
                          </div>
                        )}

                        {/* Core quality columns */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div className="flex justify-between bg-surface-2/20 p-2 rounded">
                            <span className="text-text-secondary font-medium">Architecture</span>
                            <span className="font-semibold text-text">{repo.architecture}</span>
                          </div>
                          <div className="flex justify-between bg-surface-2/20 p-2 rounded">
                            <span className="text-text-secondary font-medium">Documentation</span>
                            <span className="font-semibold text-text">{repo.documentation}</span>
                          </div>
                          <div className="flex justify-between bg-surface-2/20 p-2 rounded">
                            <span className="text-text-secondary font-medium">Innovation</span>
                            <span className="font-semibold text-text">{repo.innovation}</span>
                          </div>
                          <div className="flex justify-between bg-surface-2/20 p-2 rounded">
                            <span className="text-text-secondary font-medium">Deployment</span>
                            <span className="font-semibold text-text">{repo.deployment}</span>
                          </div>
                        </div>

                        {/* Strengths & missing checks */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <div className="text-[10px] text-success font-semibold uppercase">Strengths</div>
                            <div className="flex flex-wrap gap-1">
                              {repo.strengths?.map((str: string, idx: number) => (
                                <span key={idx} className="bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded flex items-center gap-0.5">
                                  ✔ {str}
                                </span>
                              )) || <span className="text-text-secondary">None mapped</span>}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-[10px] text-danger font-semibold uppercase">Missing</div>
                            <div className="flex flex-wrap gap-1">
                              {repo.missing?.map((mis: string, idx: number) => (
                                <span key={idx} className="bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded flex items-center gap-0.5">
                                  ❌ {mis}
                                </span>
                              )) || <span className="text-text-secondary">None mapped</span>}
                            </div>
                          </div>
                        </div>

                        {/* Boost badge */}
                        <div className="flex justify-between items-center text-[10px] border-t border-border/30 pt-2.5">
                          <span className="text-text-secondary font-medium">Estimated Resume Boost</span>
                          <span className="text-success font-bold flex items-center gap-0.5">
                            <TrendingUp className="w-3.5 h-3.5" /> +{repo.estimatedResumeBoost}% Score
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 6. Skill & Technology Coverage */}
            <Card glass className="p-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-6">
                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  Technology Coverage
                </h3>
                <button onClick={() => toggleCollapse('skills')} className="text-text-secondary hover:text-text">
                  {collapseState.skills ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </button>
              </div>

              {!collapseState.skills && (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="text-[10px] text-success font-semibold uppercase mb-2">Detected Technologies</div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.technologyCoverage?.detected?.map((t: string, idx: number) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded bg-success/15 border border-success/35 text-success font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-danger font-semibold uppercase mb-2">Missing Technologies (Highly Demanded)</div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.technologyCoverage?.missing?.map((t: string, idx: number) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded bg-danger/15 border border-danger/35 text-danger font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* 8. Coding Practices Analysis */}
            <Card glass className="p-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-6">
                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Coding Practices evaluation
                </h3>
                <button onClick={() => toggleCollapse('practices')} className="text-text-secondary hover:text-text">
                  {collapseState.practices ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </button>
              </div>

              {!collapseState.practices && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  {[
                    { label: 'Folder Structure', value: analysis.codingPractices?.folderStructure },
                    { label: 'Naming Conventions', value: analysis.codingPractices?.namingConvention },
                    { label: 'Component Reusability', value: analysis.codingPractices?.componentReusability },
                    { label: 'Error Handling', value: analysis.codingPractices?.errorHandling },
                    { label: 'Auth & Encryption', value: analysis.codingPractices?.authentication },
                    { label: 'Validation Layers', value: analysis.codingPractices?.validation },
                    { label: 'API Conventions', value: analysis.codingPractices?.apiDesign },
                    { label: 'Performance Tweaks', value: analysis.codingPractices?.performance },
                    { label: 'Security Protocols', value: analysis.codingPractices?.security }
                  ].map((p, idx) => (
                    <div key={idx} className="flex justify-between bg-surface-2/20 p-2.5 rounded border border-border/30">
                      <span className="text-text-secondary font-medium">{p.label}</span>
                      <span className={`font-semibold ${
                        p.value === 'Excellent' ? 'text-success' : p.value === 'Good' ? 'text-primary' : 'text-warning'
                      }`}>{p.value || 'Good'}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 9. Project Diversity */}
            <Card glass className="p-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-6">
                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" />
                  Portfolio Diversity
                </h3>
                <button onClick={() => toggleCollapse('diversity')} className="text-text-secondary hover:text-text">
                  {collapseState.diversity ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </button>
              </div>

              {!collapseState.diversity && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-text-secondary">Overall Diversity Score</span>
                    <span className="text-primary">{analysis.projectDiversity?.diversityScore || 70}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${analysis.projectDiversity?.diversityScore || 70}%` }} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-4">
                    {[
                      { name: 'Web Apps', val: analysis.projectDiversity?.webApps },
                      { name: 'AI & ML Tools', val: analysis.projectDiversity?.aiProjects },
                      { name: 'Backend APIs', val: analysis.projectDiversity?.backendApis },
                      { name: 'Full Stack Portals', val: analysis.projectDiversity?.fullStack }
                    ].map((divStat, idx) => (
                      <div key={idx} className="bg-surface-2/15 p-2 rounded flex justify-between">
                        <span className="text-text-secondary">{divStat.name}</span>
                        <span className="font-semibold text-text">{divStat.val || 20}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* 11. Recruiter Perspective */}
            <Card glass className="p-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-6">
                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  Recruiter Screening Predictions
                </h3>
                <button onClick={() => toggleCollapse('recruiter')} className="text-text-secondary hover:text-text">
                  {collapseState.recruiter ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </button>
              </div>

              {!collapseState.recruiter && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-surface-2/20 p-3 rounded-lg border border-border/40">
                    <div className="text-2xl font-bold text-success font-display">94%</div>
                    <div className="text-[10px] text-text-secondary uppercase font-semibold mt-1">Recruiter Interest</div>
                  </div>
                  <div className="bg-surface-2/20 p-3 rounded-lg border border-border/40">
                    <div className="text-2xl font-bold text-primary font-display">88%</div>
                    <div className="text-[10px] text-text-secondary uppercase font-semibold mt-1">Interview Chance</div>
                  </div>
                  <div className="bg-surface-2/20 p-3 rounded-lg border border-border/40">
                    <div className="text-2xl font-bold text-warning font-display">92%</div>
                    <div className="text-[10px] text-text-secondary uppercase font-semibold mt-1">Portfolio Quality</div>
                  </div>
                </div>
              )}
            </Card>

            {/* 13. Recommended Projects */}
            <Card glass className="p-6">
              <CardTitle className="mb-2">Recommended GitHub Projects</CardTitle>
              <CardDescription className="mb-6">6-8 personalized project templates to patch your tech coverage gaps.</CardDescription>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {analysis.recommendations?.map((proj: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-border/80 bg-surface-3/30 hover:border-primary/50 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-text text-sm">{proj.title}</h5>
                        <span className="text-[9px] bg-primary/20 border border-primary/35 text-primary px-1.5 py-0.5 rounded font-bold">
                          {proj.difficulty}
                        </span>
                      </div>
                      <p className="text-text-secondary mb-3">{proj.resumeBoost}</p>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-2 text-[10px]">
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies?.map((t: string, k: number) => (
                          <span key={k} className="px-1.5 py-0.5 rounded bg-bg/50 border border-border text-text-secondary">
                            {t}
                          </span>
                        ))}
                      </div>
                      {proj.githubReady && (
                        <span className="text-success font-bold flex items-center gap-0.5">
                          <Globe className="w-3.5 h-3.5" /> Template
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            
            {/* Existing GitHub profile card */}
            <Card glass>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt={profile.username} className="w-20 h-20 rounded-full mb-4 border-2 border-primary/20" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-surface-3 flex items-center justify-center mb-4 border-2 border-primary/20">
                      <Github className="w-8 h-8 text-text-secondary" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-text">@{profile.username}</h3>
                  <a href={profile.profileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mb-4 flex items-center gap-0.5 justify-center">
                    View on GitHub <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Button variant="outline" size="sm" className="w-full mb-4 btn-ghost" onClick={toggleIsEditing}>Change Username</Button>
                  
                  <div className="grid grid-cols-2 gap-4 w-full border-t border-border pt-4">
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-bold text-text">{profile.publicRepos}</span>
                      <span className="text-xs text-text-secondary">Repos</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-bold text-text">{profile.followers}</span>
                      <span className="text-xs text-text-secondary">Followers</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Career Readiness Predictions */}
            <Card glass className="p-6">
              <CardTitle className="mb-4">Career Readiness Prediction</CardTitle>
              <div className="space-y-3.5">
                {[
                  { label: 'Backend Developer', score: analysis.careerPrediction?.backendDeveloper || 50 },
                  { label: 'Full Stack Developer', score: analysis.careerPrediction?.fullStack || 50 },
                  { label: 'Software Engineer', score: analysis.careerPrediction?.softwareEngineer || 50 },
                  { label: 'AI Engineer', score: analysis.careerPrediction?.aiEngineer || 50 },
                  { label: 'Cloud Engineer', score: analysis.careerPrediction?.cloudEngineer || 50 }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="text-primary font-bold">{item.score}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Existing languages breakdown card */}
            <Card glass>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-text">Top Languages</h3>
                </div>
                {profile.topLanguages && profile.topLanguages.length > 0 ? (
                  <div className="space-y-4">
                    {profile.topLanguages.map((lang: any, i: number) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-text font-medium">{lang.language}</span>
                          <span className="text-text-secondary">{lang.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-surface-3 h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: `${Math.min(100, Math.max(0, lang.percentage))}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm">No language data found.</p>
                )}
              </CardContent>
            </Card>

            {/* 17. Improvement Roadmap */}
            <Card glass className="p-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-6">
                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  GitHub Improvement Roadmap
                </h3>
                <button onClick={() => toggleCollapse('roadmap')} className="text-text-secondary hover:text-text">
                  {collapseState.roadmap ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </button>
              </div>

              {!collapseState.roadmap && (
                <div className="space-y-3 text-xs">
                  {analysis.roadmap?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-2.5 items-start bg-surface-2/20 p-2.5 rounded border border-border/30">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold shrink-0 mt-0.5 ${
                        item.priority === 'CRITICAL' 
                          ? 'bg-danger/25 text-danger' 
                          : item.priority === 'HIGH' 
                            ? 'bg-warning/25 text-warning' 
                            : 'bg-primary/25 text-primary'
                      }`}>
                        {item.priority}
                      </span>
                      <div>
                        <p className="text-text leading-tight">{item.actionItem}</p>
                        <span className="text-[9px] text-success font-semibold flex items-center mt-1">
                          +{item.estimatedScoreIncrease} Portfolio Points
                        </span>
                      </div>
                    </div>
                  )) || <p className="text-text-secondary text-xs">Analyze account to calculate portfolio checklist.</p>}
                </div>
              )}
            </Card>

          </div>
        </div>
      )}

      {/* 18. Floating AI GitHub Assistant Chat */}
      {profile?.status === 'COMPLETED' && !isEditing && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          
          {/* Chat Window */}
          {isChatOpen && (
            <Card className="w-80 md:w-96 h-[450px] shadow-2xl flex flex-col bg-surface border border-primary/20 backdrop-blur-xl relative overflow-hidden rounded-2xl">
              
              {/* Header */}
              <div className="p-4 bg-accent/20 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
                  <span className="font-semibold text-text font-display text-sm flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-primary" /> AI Portfolio Coach
                  </span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-text-secondary hover:text-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Logs */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar text-xs">
                {chatLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                        log.sender === 'user'
                          ? 'bg-primary text-text font-medium'
                          : 'bg-surface-3/60 text-text-secondary border border-border/50'
                      }`}
                    >
                      {log.text}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-surface-3/60 text-text-secondary rounded-xl p-3 flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" /> Coach is analyzing...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border bg-surface-2/30 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Coach: 'Generate a Dockerfile for PlacementIQ'"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  className="input-field py-2 rounded-lg bg-bg/50 flex-1 text-xs border border-border"
                />
                <Button onClick={handleSendChat} size="sm" className="btn-primary p-2 h-9 w-9 flex items-center justify-center rounded-lg">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Float toggle button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-14 h-14 bg-gradient-to-r from-primary to-accent hover:glow-primary rounded-full flex items-center justify-center text-text shadow-2xl transition-all hover:scale-105"
          >
            {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </button>
        </div>
      )}
    </div>
  );
}
