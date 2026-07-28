'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

export default function PersonalForm({ user, onDirtyChange }: { user: any, onDirtyChange: (isDirty: boolean) => void }) {
  const queryClient = useQueryClient();
  const profile = user?.profile || {};

  const [formData, setFormData] = useState({
    fullName: profile.fullName || '',
    phoneNumber: profile.phoneNumber || '',
    dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
    gender: profile.gender || '',
    location: profile.location || '',
    bio: profile.bio || '',
    linkedinUrl: profile.linkedinUrl || '',
    portfolioUrl: profile.portfolioUrl || '',
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const isChanged = 
      formData.fullName !== (profile.fullName || '') ||
      formData.phoneNumber !== (profile.phoneNumber || '') ||
      formData.dateOfBirth !== (profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '') ||
      formData.gender !== (profile.gender || '') ||
      formData.location !== (profile.location || '') ||
      formData.bio !== (profile.bio || '') ||
      formData.linkedinUrl !== (profile.linkedinUrl || '') ||
      formData.portfolioUrl !== (profile.portfolioUrl || '');
    
    setIsDirty(isChanged);
    onDirtyChange(isChanged);
  }, [formData, profile, onDirtyChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.updatePersonal(formData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Personal information updated!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsDirty(false);
      onDirtyChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update personal information');
    }
  });

  return (
    <Card glass>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Full Name</label>
            <Input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Email Address (Read-Only)</label>
            <Input value={user?.email || ''} readOnly className="bg-surface-2 text-text-muted" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Phone Number</label>
            <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+1 234 567 890" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Location</label>
            <Input name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Date of Birth</label>
            <Input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Gender</label>
            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-md bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Prefer not to say</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-text">About Me / Bio</label>
            <textarea 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              rows={4}
              className="w-full p-3 rounded-md bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Tell us a little about yourself..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">LinkedIn URL</label>
            <Input name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Portfolio URL</label>
            <Input name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://yourwebsite.com" />
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={() => mutation.mutate()} disabled={!isDirty || mutation.isPending}>
            {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
