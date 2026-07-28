'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, User, GraduationCap, Briefcase, Link2, Code, FolderGit2, FileBadge, Settings, Shield } from 'lucide-react';
import PersonalForm from '@/components/profile/PersonalForm';
import AcademicForm from '@/components/profile/AcademicForm';
import CareerForm from '@/components/profile/CareerForm';
import SkillsSection from '@/components/profile/SkillsSection';
import ProjectsSection from '@/components/profile/ProjectsSection';
import CertificatesSection from '@/components/profile/CertificatesSection';
import ConnectedAccountsSection from '@/components/profile/ConnectedAccountsSection';
import PreferencesForm from '@/components/profile/PreferencesForm';
import SecuritySection from '@/components/profile/SecuritySection';

const NAV_ITEMS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'academic', label: 'Academic Info', icon: GraduationCap },
  { id: 'career', label: 'Career Goals', icon: Briefcase },
  { id: 'accounts', label: 'Connected Accounts', icon: Link2 },
  { id: 'skills', label: 'Skills', icon: Code },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'certificates', label: 'Certificates', icon: FileBadge },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [isDirty, setIsDirty] = useState(false);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.getProfile();
      return res.data;
    }
  });

  const { data: completenessData } = useQuery({
    queryKey: ['profileCompleteness'],
    queryFn: async () => {
      const res = await api.getCompleteness();
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-text-secondary animate-pulse">Loading profile...</p>
      </div>
    );
  }

  const user = response?.data;
  
  const completeness = completenessData?.score || user?.profile?.profileCompleteness || 0;
  const incompleteSections = completenessData?.incompleteSections || [];
  const suggestedActions = completenessData?.suggestedActions || [];

  const handleNavClick = (id: string) => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        return;
      }
      setIsDirty(false);
    }
    setActiveTab(id);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'personal': return <PersonalForm user={user} onDirtyChange={setIsDirty} />;
      case 'academic': return <AcademicForm user={user} onDirtyChange={setIsDirty} />;
      case 'career': return <CareerForm user={user} onDirtyChange={setIsDirty} />;
      case 'accounts': return <ConnectedAccountsSection user={user} />;
      case 'skills': return <SkillsSection user={user} />;
      case 'projects': return <ProjectsSection user={user} />;
      case 'certificates': return <CertificatesSection user={user} />;
      case 'preferences': return <PreferencesForm user={user} onDirtyChange={setIsDirty} />;
      case 'security': return <SecuritySection user={user} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Profile Settings</h1>
          <p className="text-text-secondary mt-1">Manage your personal information, career goals, and connected accounts.</p>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="bg-surface-2 border border-border p-5 rounded-xl flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-text">Profile Completeness</span>
              <span className="text-sm font-bold text-primary">{completeness}%</span>
            </div>
            <div className="h-3 w-full bg-surface-3 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
          <div className="text-sm text-text-secondary shrink-0 font-medium">
            {completeness === 100 ? 'Looking good! Your profile is complete 🎉' : 'Complete your profile to unlock better matches'}
          </div>
        </div>

        {completeness < 100 && suggestedActions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-4 border-t border-border">
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">To-Do List</h4>
              <ul className="space-y-1">
                {suggestedActions.slice(0, 3).map((action: string, i: number) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span> {action}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Missing Sections</h4>
              <div className="flex flex-wrap gap-2">
                {incompleteSections.map((section: string, i: number) => (
                  <span key={i} className="bg-surface-3 border border-border px-2 py-1 rounded text-xs text-text-secondary">
                    {section}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 bg-surface border border-border rounded-xl p-2 sticky top-6">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mb-1 ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                {item.label}
                {isDirty && isActive && <span className="w-2 h-2 rounded-full bg-warning ml-auto" title="Unsaved changes" />}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full min-w-0">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
