'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Link2, Unlink, RefreshCw, Github } from 'lucide-react';

const PLATFORMS = [
  { id: 'LEETCODE', name: 'LeetCode' },
  { id: 'CODEFORCES', name: 'Codeforces' },
  { id: 'CODECHEF', name: 'CodeChef' },
  { id: 'GFG', name: 'GeeksforGeeks' },
  { id: 'HACKERRANK', name: 'HackerRank' },
];

export default function ConnectedAccountsSection({ user }: { user: any }) {
  const queryClient = useQueryClient();
  const github = user?.githubProfile;
  const codingProfiles = user?.codingProfiles || [];

  const [connecting, setConnecting] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');

  const githubMutation = useMutation({
    mutationFn: async (username: string) => {
      await api.connectGitHub(username);
      await api.analyzeGitHub(true);
    },
    onSuccess: () => {
      toast.success('GitHub connected and analyzing!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setConnecting(null);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to connect GitHub')
  });

  const refreshGithubMutation = useMutation({
    mutationFn: async () => await api.analyzeGitHub(true),
    onSuccess: () => {
      toast.success('GitHub refreshed!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  const codingMutation = useMutation({
    mutationFn: async ({ platform, username }: { platform: string, username: string }) => {
      await api.connectCoding(platform, username);
    },
    onSuccess: () => {
      toast.success('Coding profile connected!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setConnecting(null);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to connect')
  });

  const disconnectCodingMutation = useMutation({
    mutationFn: async (platform: string) => {
      await api.disconnectCoding(platform);
    },
    onSuccess: () => {
      toast.success('Profile disconnected!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  const refreshCodingMutation = useMutation({
    mutationFn: async () => await api.analyzeCodingProfiles(),
    onSuccess: () => {
      toast.success('Coding profiles refreshed!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  return (
    <Card glass>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>Link your coding profiles and GitHub to automatically analyze your skills.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* GitHub */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-border rounded-lg bg-surface-2">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <Github className="w-8 h-8 text-text" />
            <div>
              <h4 className="font-bold text-text">GitHub</h4>
              {github ? (
                <p className="text-sm text-text-secondary">Connected as @{github.username}</p>
              ) : (
                <p className="text-sm text-text-muted">Not connected</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {github ? (
              <>
                <Button variant="outline" size="sm" onClick={() => refreshGithubMutation.mutate()} disabled={refreshGithubMutation.isPending}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshGithubMutation.isPending ? 'animate-spin' : ''}`} /> Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConnecting('GITHUB')} className="text-primary hover:text-primary border-primary/50">
                  <Link2 className="w-4 h-4 mr-2" /> Edit
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setConnecting('GITHUB')}>
                <Link2 className="w-4 h-4 mr-2" /> Connect
              </Button>
            )}
          </div>
        </div>

        {connecting === 'GITHUB' && (
          <div className="flex gap-2 p-3 bg-surface-3 rounded-lg animate-in fade-in slide-in-from-top-2">
            <Input 
              placeholder="Enter GitHub username" 
              value={usernameInput} 
              onChange={e => setUsernameInput(e.target.value)} 
            />
            <Button onClick={() => githubMutation.mutate(usernameInput)} disabled={!usernameInput || githubMutation.isPending}>
              {githubMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Connect'}
            </Button>
            <Button variant="ghost" onClick={() => { setConnecting(null); setUsernameInput(''); }}>Cancel</Button>
          </div>
        )}

        {/* Coding Profiles */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-text">Competitive Programming</h4>
            <Button variant="outline" size="sm" onClick={() => refreshCodingMutation.mutate()} disabled={refreshCodingMutation.isPending || codingProfiles.length === 0}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshCodingMutation.isPending ? 'animate-spin' : ''}`} /> Refresh All
            </Button>
          </div>

          {PLATFORMS.map(platform => {
            const profile = codingProfiles.find((p: any) => p.platform === platform.id);
            const isConnecting = connecting === platform.id;

            return (
              <div key={platform.id} className="flex flex-col border border-border rounded-lg bg-surface-2 overflow-hidden">
                <div className="flex justify-between items-center p-3 sm:p-4">
                  <div>
                    <h5 className="font-bold text-text text-sm sm:text-base">{platform.name}</h5>
                    {profile ? (
                      <p className="text-xs sm:text-sm text-text-secondary">@{profile.username}</p>
                    ) : (
                      <p className="text-xs sm:text-sm text-text-muted">Not connected</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {profile ? (
                      <>
                        <Button variant="outline" size="sm" className="h-8" onClick={() => setConnecting(platform.id)}>
                          <Link2 className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-danger hover:text-danger hover:bg-danger/10"
                          onClick={() => {
                            if (confirm(`Disconnect ${platform.name}?`)) disconnectCodingMutation.mutate(platform.id);
                          }}
                          disabled={disconnectCodingMutation.isPending}
                        >
                          <Unlink className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="h-8 border-primary/50 text-primary hover:bg-primary/10" onClick={() => setConnecting(platform.id)}>
                        <Link2 className="w-4 h-4 mr-1 sm:mr-2" /> Connect
                      </Button>
                    )}
                  </div>
                </div>

                {isConnecting && (
                  <div className="flex gap-2 p-3 bg-surface-3 border-t border-border animate-in fade-in slide-in-from-top-2">
                    <Input 
                      placeholder={`Enter ${platform.name} username`} 
                      value={usernameInput} 
                      onChange={e => setUsernameInput(e.target.value)} 
                    />
                    <Button onClick={() => codingMutation.mutate({ platform: platform.id, username: usernameInput })} disabled={!usernameInput || codingMutation.isPending}>
                      {codingMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save'}
                    </Button>
                    <Button variant="ghost" onClick={() => { setConnecting(null); setUsernameInput(''); }}>Cancel</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
}
