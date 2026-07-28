'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Github, Code2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ConnectPage() {
  const router = useRouter();
  const [githubUsername, setGithubUsername] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Skip step
  const handleSkip = () => {
    router.push('/dashboard');
  };

  const handleConnectGithub = async () => {
    if (!githubUsername) {
      setError('Please enter a GitHub username');
      return;
    }

    try {
      setConnecting(true);
      setError('');
      await api.connectGitHub(githubUsername);
      setStatus('success');
      
      // Navigate to dashboard after short delay to show success state
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect GitHub profile');
      setConnecting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text mb-2">Connect Your Profiles</h1>
        <p className="text-text-secondary">Link your coding accounts for a more accurate placement readiness analysis.</p>
      </div>

      <div className="space-y-6">
        {/* GitHub (Recommended) */}
        <Card glass gradientBorder>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center border border-border">
                  <Github className="w-5 h-5 text-text" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    GitHub
                    <span className="text-[10px] uppercase font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </CardTitle>
                  <CardDescription>We analyze your projects, tech stack, and commit history.</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {status === 'success' ? (
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 flex items-center gap-3 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Successfully connected! Redirecting...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                <div className="flex gap-3">
                  <Input
                    placeholder="GitHub Username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleConnectGithub} disabled={connecting || !githubUsername}>
                    {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* LeetCode (Optional) */}
        <Card glass>
          <CardHeader>
            <div className="flex items-center justify-between opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center border border-border">
                  <Code2 className="w-5 h-5 text-text" />
                </div>
                <div>
                  <CardTitle className="text-lg">LeetCode</CardTitle>
                  <CardDescription>Available from the dashboard after setup.</CardDescription>
                </div>
              </div>
              <Button variant="ghost" disabled>Coming Soon</Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button variant="ghost" onClick={handleSkip}>
          Skip for now
        </Button>
        <Button onClick={() => router.push('/dashboard')} variant="outline">
          Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
