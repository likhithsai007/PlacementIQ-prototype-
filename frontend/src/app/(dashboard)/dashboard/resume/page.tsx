'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import {
  Loader2,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
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
  BookOpen,
  Users,
  Check,
  ExternalLink,
  User,
  Info,
  Layers,
  Percent,
  CheckCircle,
  CornerDownRight,
  Flame,
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
  LineChart,
  Line,
  Cell,
  Legend
} from 'recharts';

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'quality' | 'grammar' | 'keywords' | 'skills' | 'projects' | 'insights' | 'history'>('overview');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Hi! I am your AI Career Coach. Ask me anything about your resume analysis, missing skills, or how to tailor your profile for your target roles!' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [forceAnalyze, setForceAnalyze] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if resume exists first
  const { data: resumeResponse, isLoading: isLoadingResume, refetch: refetchResume } = useQuery({
    queryKey: ['resume'],
    queryFn: async () => {
      const res = await api.getResume();
      return res.data;
    },
  });

  const resume = resumeResponse?.data;

  // Single Consolidated API Call for all Sections
  const { data: analysisResponse, isLoading: isLoadingAnalysis, isError: isErrorAnalysis, error: errorAnalysis, refetch: refetchAnalysis } = useQuery({
    queryKey: ['resumeAnalysis', forceAnalyze],
    queryFn: async () => {
      const res = await api.analyzeResume(forceAnalyze);
      return res.data;
    },
    enabled: !!resume && resume.status === 'COMPLETED',
  });

  const analysis = analysisResponse?.data;

  // Sync state for recheck
  useEffect(() => {
    if (forceAnalyze) {
      setForceAnalyze(false);
    }
  }, [analysis]);

  // Poll for background uploads
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resume?.status === 'PENDING' || resume?.status === 'PROCESSING') {
      interval = setInterval(() => {
        refetchResume();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resume?.status, refetchResume]);

  // Autoscroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs, isChatOpen]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const res = await api.uploadResume(file);
      return res.data.data;
    },
    onSuccess: () => {
      refetchResume();
      toast.success('Resume uploaded! Processing in background...');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to upload resume');
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await api.chatWithResume(message);
      return res.data.data;
    },
    onSuccess: (data) => {
      setIsTyping(false);
      setChatLogs((prev) => [...prev, { sender: 'bot', text: data.reply }]);
    },
    onError: (err: any) => {
      setIsTyping(false);
      setChatLogs((prev) => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error processing your query. Please try again.' }]);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      uploadMutation.mutate(file);
    }
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
    toast.success('Running a fresh AI analysis...');
  };

  if (isLoadingResume || (resume && resume.status !== 'PENDING' && isLoadingAnalysis)) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-text-secondary">Retrieving consolidated analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text mb-2">AI Resume Analyzer</h1>
          <p className="text-text-secondary">Get real-time ATS compatibility, readability scores, and tailored feedback in one single diagnostics run.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {resume && resume.status === 'COMPLETED' && analysis && (
            <>
              <Button variant="outline" onClick={handleRunNewAnalysis} className="btn-ghost">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                Run New Analysis
              </Button>
              <Button variant="outline" onClick={() => window.print()} className="btn-ghost">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </>
          )}
          
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending || resume?.status === 'PENDING'}
            className="btn-primary"
          >
            {uploadMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
            {resume ? 'Update Resume' : 'Select Resume'}
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {!resume && !uploadMutation.isPending && (
        <Card glass className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">Upload your Resume to Begin</h2>
          <p className="text-text-secondary max-w-md mb-8">
            Upload your PDF or Word resume once. We will run the entire suite of ATS and role analysis synchronously and cache the results.
          </p>
          <Button onClick={() => fileInputRef.current?.click()} className="btn-primary px-8 py-6 text-lg rounded-2xl">
            <UploadCloud className="w-5 h-5 mr-2" />
            Upload PDF/Word
          </Button>
        </Card>
      )}

      {/* Upload Pending State */}
      {(uploadMutation.isPending || resume?.status === 'PENDING') && (
        <Card glass gradientBorder className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-semibold text-text mb-2">Processing Resume Upload...</h2>
          <p className="text-text-secondary max-w-md animate-pulse">
            Securely uploading document and starting AI parsing workflow.
          </p>
        </Card>
      )}

      {/* Processing State */}
      {resume?.status === 'PROCESSING' && (
        <Card glass gradientBorder className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative mb-8 text-primary">
            <Loader2 className="w-16 h-16 animate-spin" />
            <Sparkles className="w-6 h-6 absolute -bottom-1 -right-1 animate-pulse text-accent" />
          </div>
          <h2 className="text-2xl font-semibold text-text mb-2">Analyzing Resume Content...</h2>
          <p className="text-text-secondary max-w-md animate-pulse">
            Our AI engine is scanning your resume against ATS criteria, readability metrics, and role requirements. This usually takes 10-20 seconds.
          </p>
        </Card>
      )}

      {/* Failed State */}
      {resume?.status === 'FAILED' && (
        <Card glass className="border-danger/20 p-8 text-center flex flex-col items-center justify-center">
          <AlertCircle className="w-16 h-16 text-danger mb-4" />
          <h2 className="text-xl font-bold text-text mb-2">Resume Processing Failed</h2>
          <p className="text-text-secondary mb-6">{resume.errorMessage || 'We experienced an issue parsing this file.'}</p>
          <Button variant="outline" className="btn-ghost" onClick={() => fileInputRef.current?.click()}>Try Again</Button>
        </Card>
      )}

      {/* Analysis Error State */}
      {resume?.status === 'COMPLETED' && isErrorAnalysis && (
        <Card glass className="border-danger/20 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="w-16 h-16 text-danger mb-4" />
          <h2 className="text-xl font-bold text-text mb-2">Failed to load Analysis Dashboard</h2>
          <p className="text-text-secondary mb-6">{(errorAnalysis as Error)?.message || 'We could not fetch your processed results.'}</p>
          <Button variant="outline" className="btn-ghost" onClick={() => refetchAnalysis()}>Retry Loading</Button>
        </Card>
      )}

      {/* Main Consolidated Dashboard */}
      {resume?.status === 'COMPLETED' && analysis && (
        <div className="space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card glass className="p-4 flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-text-secondary">ATS Match Score</div>
                <div className="text-2xl font-bold font-display text-text">{analysis.resumeScore?.ats || 60}%</div>
              </div>
            </Card>

            <Card glass className="p-4 flex items-center gap-4">
              <div className="p-3 bg-success/10 text-success rounded-xl border border-success/20">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-text-secondary">Experience Level</div>
                <div className="text-lg font-bold text-text truncate max-w-[140px]">{analysis.resumeSummary?.experienceLevel || 'Entry-level'}</div>
              </div>
            </Card>

            <Card glass className="p-4 flex items-center gap-4">
              <div className="p-3 bg-warning/10 text-warning rounded-xl border border-warning/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-text-secondary">AI Confidence</div>
                <div className="text-2xl font-bold font-display text-text">{analysis.resumeSummary?.aiConfidence || 85}%</div>
              </div>
            </Card>

            <Card glass className="p-4 flex items-center gap-4">
              <div className="p-3 bg-accent/10 text-accent rounded-xl border border-accent/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-text-secondary">Education Score</div>
                <div className="text-2xl font-bold font-display text-text">{analysis.educationAnalysis?.educationScore || 70}/100</div>
              </div>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto gap-2 p-1 border-b border-border no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: Layers },
              { id: 'quality', label: 'Formatting & Quality', icon: Award },
              { id: 'grammar', label: 'Grammar Corrections', icon: CheckCircle2 },
              { id: 'keywords', label: 'Keywords Analysis', icon: Search },
              { id: 'skills', label: 'Skills & Gaps', icon: Code },
              { id: 'projects', label: 'Projects & Experience', icon: Briefcase },
              { id: 'insights', label: 'Career Insights', icon: TrendingUp },
              { id: 'history', label: 'Score Timeline', icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-text-secondary hover:bg-surface/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left/Middle Content Panels */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Overall ATS Score Radial Chart */}
                    <Card glass gradientBorder className="p-6 flex flex-col items-center justify-center">
                      <CardTitle className="text-center mb-4">Overall ATS Compatibility</CardTitle>
                      <div className="w-48 h-48 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="80%"
                            outerRadius="100%"
                            barSize={12}
                            data={analysis.charts?.atsGauge || []}
                            startAngle={180}
                            endAngle={-180}
                          >
                            <RadialBar background dataKey="value" />
                          </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold font-display text-text">{analysis.resumeScore?.ats || 60}%</span>
                          <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">ATS Score</span>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary text-center mt-4 max-w-xs">
                        Consolidated diagnostics from formatting layout, keywords match, and standard parsing parameters.
                      </p>
                    </Card>

                    {/* Role Matches Horizontal Bar Chart */}
                    <Card glass className="p-6">
                      <CardTitle className="mb-4">Role Compatibility Match</CardTitle>
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analysis.charts?.roleMatch || []} layout="vertical">
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="name" type="category" width={110} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Match']} />
                            <Bar dataKey="match" fill="var(--primary)" radius={[0, 4, 4, 0]}>
                              {(analysis.charts?.roleMatch || []).map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'var(--accent)'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>

                  {/* Summary Details */}
                  <Card glass className="p-6">
                    <CardTitle className="mb-4">Resume Summary</CardTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-text-secondary">Name</span>
                        <span className="font-medium text-text">{analysis.resumeSummary?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-text-secondary">Email</span>
                        <span className="font-medium text-text">{analysis.resumeSummary?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-text-secondary">Phone</span>
                        <span className="font-medium text-text">{analysis.resumeSummary?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-text-secondary">Target Role</span>
                        <span className="font-medium text-primary uppercase font-display">{analysis.resumeSummary?.targetRole || 'Not Set'}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Strengths & Quick Improvement roadmap */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card glass className="p-6">
                      <CardTitle className="flex items-center gap-2 mb-4 text-success">
                        <CheckCircle className="w-5 h-5" />
                        Resume Strengths
                      </CardTitle>
                      <ul className="space-y-3">
                        {(analysis.strengths || []).map((item: string, idx: number) => (
                          <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                            <span className="text-success mt-0.5 font-bold">✔</span>
                            {item}
                          </li>
                        ))}
                        {(!analysis.strengths || analysis.strengths.length === 0) && (
                          <span className="text-text-secondary text-xs">No primary strengths mapped.</span>
                        )}
                      </ul>
                    </Card>

                    <Card glass className="p-6">
                      <CardTitle className="flex items-center gap-2 mb-4 text-warning">
                        <AlertCircle className="w-5 h-5" />
                        Quick Improvements
                      </CardTitle>
                      <ul className="space-y-3">
                        {(analysis.roadmap?.slice(0, 4) || []).map((item: any, idx: number) => (
                          <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                            <span className="text-warning mt-0.5">▪</span>
                            {item.actionItem}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </div>
              )}

              {/* Tab 2: Formatting & Quality */}
              {activeTab === 'quality' && (
                <div className="space-y-6">
                  <Card glass className="p-6">
                    <CardTitle className="mb-2">ATS Score Dashboard</CardTitle>
                    <CardDescription className="mb-6">Extracted scores representing layout compatibility standards.</CardDescription>
                    
                    <div className="space-y-4">
                      {[
                        { label: 'Overall ATS compatibility', value: analysis.atsAnalysis?.overallAtsScore || 60 },
                        { label: 'Formatting layout structure', value: analysis.atsAnalysis?.formatting || 70 },
                        { label: 'Keyword occurrences matching JDs', value: analysis.atsAnalysis?.keywords || 60 },
                        { label: 'Verified skills coverage', value: analysis.atsAnalysis?.skills || 75 },
                        { label: 'Experience sections description depth', value: analysis.atsAnalysis?.experience || 50 },
                        { label: 'Education credentials alignment', value: analysis.atsAnalysis?.education || 70 },
                        { label: 'Content readability score', value: analysis.atsAnalysis?.readability || 80 },
                        { label: 'ATS Parser Compatibility', value: analysis.atsAnalysis?.atsCompatibility || 75 }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary font-medium">{item.label}</span>
                            <span className="text-primary font-bold">{item.value}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card glass className="p-6">
                    <CardTitle className="mb-4">Resume Quality Diagnostics</CardTitle>
                    <div className="space-y-4">
                      {[
                        { label: 'Grammar Accuracy score', value: analysis.grammarAnalysis?.grammarScore || 85 },
                        { label: 'Content description depth', value: analysis.atsAnalysis?.experience || 60 },
                        { label: 'Overall formatting points', value: analysis.atsAnalysis?.formatting || 70 },
                        { label: 'Action verb occurrences density', value: analysis.atsAnalysis?.keywords || 50 }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-text-secondary">{item.label}</span>
                            <span className="text-text font-semibold">{item.value}/100</span>
                          </div>
                          <div className="progress-bar h-1.5 bg-surface">
                            <div className="progress-fill bg-success" style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 3: Grammar */}
              {activeTab === 'grammar' && (
                <Card glass className="p-6">
                  <CardTitle className="mb-2">Grammar Analysis</CardTitle>
                  <CardDescription className="mb-6">Line-by-line grammar revisions suggested by AI to enhance readability.</CardDescription>
                  
                  {analysis.grammarAnalysis?.corrections && analysis.grammarAnalysis.corrections.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse text-left">
                        <thead>
                          <tr className="border-b border-border/80">
                            <th className="pb-3 text-text-secondary font-semibold pr-4">Original Line</th>
                            <th className="pb-3 text-success font-semibold pr-4">Proposed Revision</th>
                            <th className="pb-3 text-text-secondary font-semibold">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.grammarAnalysis.corrections.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-border/40 hover:bg-surface/20 transition-all">
                              <td className="py-3 text-danger/80 line-through pr-4 font-mono text-xs">{item.original}</td>
                              <td className="py-3 text-success pr-4 font-medium">{item.improved}</td>
                              <td className="py-3 text-text-secondary text-xs">{item.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-text-secondary flex flex-col items-center">
                      <Check className="w-10 h-10 text-success mb-2" />
                      <p className="font-semibold text-text">No Grammar Errors Found!</p>
                      <p className="text-xs">Your resume&apos;s syntax, spelling, and grammar metrics are top-tier.</p>
                    </div>
                  )}
                </Card>
              )}

              {/* Tab 4: Keywords */}
              {activeTab === 'keywords' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card glass className="p-6">
                      <CardTitle className="mb-4">Keyword Categories</CardTitle>
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs text-success font-semibold mb-2 uppercase">Found Keywords</div>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.keywordAnalysis?.found?.map((k: string, idx: number) => (
                              <span key={idx} className="text-xs px-2.5 py-1 rounded bg-success/15 border border-success/35 text-success font-medium">
                                {k}
                              </span>
                            )) || <span className="text-xs text-text-secondary">None</span>}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-danger font-semibold mb-2 uppercase">Missing Keywords</div>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.keywordAnalysis?.missing?.map((k: string, idx: number) => (
                              <span key={idx} className="text-xs px-2.5 py-1 rounded bg-danger/15 border border-danger/35 text-danger font-medium animate-pulse">
                                {k}
                              </span>
                            )) || <span className="text-xs text-text-secondary">None</span>}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-warning font-semibold mb-2 uppercase">Repeated Keywords</div>
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.keywordAnalysis?.repeated?.map((k: string, idx: number) => (
                              <span key={idx} className="text-xs px-2.5 py-1 rounded bg-warning/15 border border-warning/35 text-warning font-medium">
                                {k}
                              </span>
                            )) || <span className="text-xs text-text-secondary">None</span>}
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card glass className="p-6">
                      <CardTitle className="mb-4">Keyword Density Analysis</CardTitle>
                      {analysis.charts?.keywordChart && analysis.charts.keywordChart.length > 0 ? (
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analysis.charts.keywordChart}>
                              <XAxis dataKey="keyword" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                              <Tooltip />
                              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <span className="text-text-secondary text-xs">No keywords density to plot.</span>
                      )}
                    </Card>
                  </div>
                </div>
              )}

              {/* Tab 5: Skills & Gaps */}
              {activeTab === 'skills' && (
                <Card glass className="p-6">
                  <CardTitle className="mb-2">Missing Skills</CardTitle>
                  <CardDescription className="mb-6">Critical technical skill gaps matching your target role.</CardDescription>
                  
                  {analysis.missingSkills && analysis.missingSkills.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse text-left">
                        <thead>
                          <tr className="border-b border-border/80">
                            <th className="pb-3 text-text-secondary font-semibold pr-4">Skill</th>
                            <th className="pb-3 text-text-secondary font-semibold pr-4">Importance</th>
                            <th className="pb-3 text-text-secondary font-semibold pr-4">Impact on Resume</th>
                            <th className="pb-3 text-text-secondary font-semibold">Recommended Course</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.missingSkills.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-border/40 hover:bg-surface/20">
                              <td className="py-3 font-semibold text-text pr-4">{item.skill}</td>
                              <td className="py-3 pr-4">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                  item.importance === 'HIGH' 
                                    ? 'bg-danger/10 text-danger border border-danger/20' 
                                    : 'bg-warning/10 text-warning border border-warning/20'
                                }`}>
                                  {item.importance}
                                </span>
                              </td>
                              <td className="py-3 text-text-secondary text-xs pr-4">{item.resumeImpact}</td>
                              <td className="py-3">
                                <a href={item.learningResource} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                                  Go to Course <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm text-center py-6">No major technical gaps detected. Your skill matches are aligned.</p>
                  )}
                </Card>
              )}

              {/* Tab 6: Projects & Experience */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  {/* Experience score card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card glass className="p-6">
                      <CardTitle className="mb-4">Experience Analysis</CardTitle>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">Overall Experience Score</span>
                          <span className="font-bold text-text">{analysis.experienceAnalysis?.experienceScore || 40}/100</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">Internship Readiness</span>
                          <span className="font-bold text-success">{analysis.experienceAnalysis?.internshipReadiness || 60}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">Industry Readiness</span>
                          <span className="font-bold text-primary">{analysis.experienceAnalysis?.industryReadiness || 45}%</span>
                        </div>
                      </div>
                    </Card>

                    <Card glass className="p-6">
                      <CardTitle className="mb-4">Experience Suggestions</CardTitle>
                      <div className="space-y-3">
                        <div>
                          <div className="text-[10px] text-primary font-semibold uppercase tracking-wider">Volunteer Suggestions</div>
                          <ul className="list-disc pl-5 text-xs text-text-secondary space-y-1">
                            {analysis.experienceAnalysis?.volunteerSuggestions?.map((v: string, idx: number) => (
                              <li key={idx}>{v}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="text-[10px] text-success font-semibold uppercase tracking-wider">Hackathon Suggestions</div>
                          <ul className="list-disc pl-5 text-xs text-text-secondary space-y-1">
                            {analysis.experienceAnalysis?.hackathonSuggestions?.map((h: string, idx: number) => (
                              <li key={idx}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Project evaluations list */}
                  <Card glass className="p-6">
                    <CardTitle className="mb-4">Project Analysis</CardTitle>
                    {analysis.projectAnalysis && analysis.projectAnalysis.length > 0 ? (
                      <div className="space-y-6">
                        {analysis.projectAnalysis.map((proj: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl border border-border bg-surface-2/30 space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold text-text">{proj.projectName}</h4>
                              <div className="flex gap-2 text-[10px] font-bold">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">Score: {proj.projectScore}</span>
                                <span className="bg-accent/10 text-accent px-2 py-0.5 rounded">Complexity: {proj.complexity}</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-text-secondary font-semibold uppercase">AI Improved Description</div>
                              <p className="text-xs text-text bg-bg/50 p-2.5 rounded-lg border border-border/40 mt-1 italic">
                                &quot;{proj.aiImprovedDescription}&quot;
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 items-center">
                              <span className="text-[10px] text-danger font-semibold uppercase pr-2">Missing Techs:</span>
                              {proj.missingTechnologies?.map((t: string, k: number) => (
                                <span key={k} className="text-[9px] px-2 py-0.5 rounded bg-danger/10 border border-danger/25 text-danger font-bold">
                                  {t}
                                </span>
                              )) || <span className="text-xs text-text-secondary">None</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-secondary text-sm">No projects analyzed on this resume.</p>
                    )}
                  </Card>

                  {/* Recommended projects list */}
                  <Card glass className="p-6">
                    <CardTitle className="mb-2">Recommended Projects</CardTitle>
                    <CardDescription className="mb-6">6-10 personalized projects to address technical gaps and maximize recruiter interest.</CardDescription>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.recommendedProjects?.map((proj: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-border/80 bg-surface-3/30 hover:border-primary/50 transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-text text-sm">{proj.title}</h5>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                proj.difficulty === 'ADVANCED' 
                                  ? 'bg-danger/15 text-danger' 
                                  : proj.difficulty === 'INTERMEDIATE' 
                                    ? 'bg-warning/15 text-warning' 
                                    : 'bg-success/15 text-success'
                              }`}>
                                {proj.difficulty}
                              </span>
                            </div>
                            <p className="text-xs text-text-secondary mb-3">{proj.resumeBoost}</p>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-2 text-[10px]">
                            <div className="flex flex-wrap gap-1.5">
                              {proj.technologies?.map((t: string, k: number) => (
                                <span key={k} className="px-1.5 py-0.5 rounded bg-bg/50 border border-border text-text-secondary">
                                  {t}
                                </span>
                              ))}
                            </div>
                            {proj.githubReady && (
                              <span className="flex items-center text-success gap-0.5 font-bold">
                                <Globe className="w-3 h-3" /> Template
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 7: Insights */}
              {activeTab === 'insights' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card glass className="p-6">
                      <CardTitle className="mb-4">Career Insights</CardTitle>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-text-secondary">Interview Probability</span>
                            <span className="font-bold text-text">{analysis.careerInsights?.interviewProbability || 40}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${analysis.careerInsights?.interviewProbability || 40}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-text-secondary">Resume Shortlisting Rate</span>
                            <span className="font-bold text-success">{analysis.careerInsights?.resumeShortlistingRate || 35}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${analysis.careerInsights?.resumeShortlistingRate || 35}%` }} />
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card glass className="p-6 flex flex-col justify-between">
                      <div>
                        <CardTitle className="mb-2">Compensation & Readiness</CardTitle>
                        <div className="space-y-3 mt-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Salary Estimate (CTC)</span>
                            <span className="font-bold text-primary">{analysis.careerInsights?.salaryEstimate || '$50,000 - $65,000'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Hiring Readiness</span>
                            <span className="font-semibold text-text">{analysis.careerInsights?.hiringReadiness || 'Needs cloud foundation'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/50 pt-4 mt-4">
                        <div className="text-[10px] text-text-secondary font-semibold uppercase">Top Hiring Sectors</div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {analysis.careerInsights?.topIndustries?.map((ind: string, idx: number) => (
                            <span key={idx} className="text-xs px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-text font-medium">
                              {ind}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Certifications analysis */}
                  <Card glass className="p-6">
                    <CardTitle className="mb-4">Certification Analysis</CardTitle>
                    <div className="space-y-6">
                      <div>
                        <div className="text-xs text-text-secondary font-semibold uppercase mb-2">Existing Certifications</div>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.certificationAnalysis?.existing?.map((cert: string, idx: number) => (
                            <span key={idx} className="text-xs px-2.5 py-1 rounded bg-success/15 border border-success/35 text-success font-medium">
                              {cert}
                            </span>
                          )) || <span className="text-xs text-text-secondary">None listed</span>}
                          {(!analysis.certificationAnalysis?.existing || analysis.certificationAnalysis.existing.length === 0) && (
                            <span className="text-xs text-text-secondary italic">No existing credentials verified.</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-text-secondary font-semibold uppercase mb-3">Recommended Certifications</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.certificationAnalysis?.recommended?.map((cert: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-lg border border-border bg-surface-2/20 flex flex-col justify-between">
                              <div className="font-semibold text-text text-xs mb-1">{cert.name}</div>
                              <div className="flex justify-between items-center text-[10px] text-text-secondary mt-2 border-t border-border/30 pt-2">
                                <span>Duration: {cert.duration}</span>
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">{cert.industryDemand} Demand</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab 8: Score Timeline */}
              {activeTab === 'history' && (
                <Card glass className="p-6">
                  <CardTitle className="mb-2">Resume History & Progression</CardTitle>
                  <CardDescription className="mb-6">Compare past resume scores across versions.</CardDescription>
                  
                  {analysis.charts?.historyChart && analysis.charts.historyChart.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse text-left">
                        <thead>
                          <tr className="border-b border-border/80">
                            <th className="pb-3 text-text-secondary font-semibold pr-4">Version</th>
                            <th className="pb-3 text-text-secondary font-semibold pr-4">Overall Score</th>
                            <th className="pb-3 text-text-secondary font-semibold">Analyzed Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.charts.historyChart.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-border/40 hover:bg-surface/20 transition-all">
                              <td className="py-3 font-semibold text-text pr-4">{item.version}</td>
                              <td className="py-3 text-primary font-bold pr-4">{item.score}%</td>
                              <td className="py-3 text-text-secondary text-xs">{item.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-text-secondary">
                      <History className="w-10 h-10 mx-auto text-primary/40 mb-2" />
                      <p className="font-semibold text-text">No Historical Data Available</p>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Right/Sidebar Content Panel */}
            <div className="space-y-6">
              
              {/* Detailed Checklist / Roadmap */}
              <Card glass className="p-6">
                <CardTitle className="mb-4">Resume Improvement Roadmap</CardTitle>
                <div className="space-y-4">
                  {analysis.roadmap?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start bg-surface-2/20 p-3 rounded-lg border border-border/40">
                      <div className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 mt-0.5 ${
                        item.priority === 'CRITICAL' 
                          ? 'bg-danger/20 text-danger' 
                          : item.priority === 'HIGH' 
                            ? 'bg-warning/20 text-warning' 
                            : 'bg-primary/20 text-primary'
                      }`}>
                        {item.priority}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-text leading-relaxed">{item.actionItem}</p>
                        <div className="text-[9px] text-success font-semibold flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> +{item.estimatedScoreIncrease} Resume Points
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-text-secondary text-xs">Run a complete analysis to generate a priority roadmap.</p>}
                </div>
              </Card>

              {/* Skills breakdown */}
              <Card glass className="p-6">
                <CardTitle className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Skills Distribution
                </CardTitle>
                <div className="space-y-3">
                  {analysis.charts?.skillsChart?.map((skill: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-text font-medium">{skill.name}</span>
                        <span className="text-text-secondary font-bold">{skill.score}%</span>
                      </div>
                      <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${skill.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Contact info list */}
              <Card glass className="p-6">
                <CardTitle className="mb-4">Contact Details</CardTitle>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-text-secondary">Name</span>
                    <span className="text-text font-semibold">{analysis.resumeSummary?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-text-secondary">Email</span>
                    <span className="text-text font-semibold truncate max-w-[150px]">{analysis.resumeSummary?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-text-secondary">Phone</span>
                    <span className="text-text font-semibold">{analysis.resumeSummary?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-text-secondary">Location</span>
                    <span className="text-text font-semibold">{analysis.resumeSummary?.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-text-secondary">Last Analyzed</span>
                    <span className="text-text font-semibold">{analysis.resumeSummary?.lastUpdated || 'N/A'}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Resume Chat Button */}
      {resume?.status === 'COMPLETED' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          
          {/* Chat Window */}
          {isChatOpen && (
            <Card className="w-80 md:w-96 h-[450px] shadow-2xl flex flex-col bg-surface border border-primary/20 backdrop-blur-xl relative overflow-hidden rounded-2xl">
              
              {/* Chat Header */}
              <div className="p-4 bg-accent/20 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
                  <span className="font-semibold text-text font-display text-sm flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-primary" /> AI Resume Coach
                  </span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-text-secondary hover:text-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Logs */}
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
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" /> Thinking...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border bg-surface-2/30 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Coach: 'How can I fix my project score?'"
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

          {/* Floating Toggle Button */}
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
