'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

const TARGET_ROLES = [
  'SOFTWARE_ENGINEER', 'FRONTEND_DEVELOPER', 'BACKEND_DEVELOPER',
  'FULLSTACK_DEVELOPER', 'DATA_ANALYST', 'AI_ENGINEER', 'ML_ENGINEER',
  'DEVOPS_ENGINEER', 'QA_ENGINEER', 'CYBERSECURITY_ANALYST', 'CLOUD_ENGINEER', 'PRODUCT_ENGINEER',
];

export default function CareerForm({ user, onDirtyChange }: { user: any, onDirtyChange: (isDirty: boolean) => void }) {
  const queryClient = useQueryClient();
  const profile = user?.profile || {};

  const [formData, setFormData] = useState({
    targetRole: profile.targetRole || 'SOFTWARE_ENGINEER',
    preferredLocation: profile.preferredLocation || '',
    experienceMonths: profile.experienceMonths || 0,
    preferredCompanies: (profile.preferredCompanies || []).join(', '),
    preferredTechStack: (profile.preferredTechStack || []).join(', '),
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const isChanged = 
      formData.targetRole !== (profile.targetRole || 'SOFTWARE_ENGINEER') ||
      formData.preferredLocation !== (profile.preferredLocation || '') ||
      formData.experienceMonths !== (profile.experienceMonths || 0) ||
      formData.preferredCompanies !== (profile.preferredCompanies || []).join(', ') ||
      formData.preferredTechStack !== (profile.preferredTechStack || []).join(', ');
    
    setIsDirty(isChanged);
    onDirtyChange(isChanged);
  }, [formData, profile, onDirtyChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'number' ? Number(value) : value 
    });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        preferredCompanies: formData.preferredCompanies.split(',').map((c: string) => c.trim()).filter(Boolean),
        preferredTechStack: formData.preferredTechStack.split(',').map((c: string) => c.trim()).filter(Boolean),
      };
      const res = await api.updateCareer(payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Career information updated!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsDirty(false);
      onDirtyChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update career information');
    }
  });

  return (
    <Card glass>
      <CardHeader>
        <CardTitle>Career Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Target Role</label>
            <select 
              name="targetRole" 
              value={formData.targetRole} 
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-md bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {TARGET_ROLES.map(role => (
                <option key={role} value={role}>{role.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Preferred Location</label>
            <Input name="preferredLocation" value={formData.preferredLocation} onChange={handleChange} placeholder="e.g. Remote, Bangalore, New York" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Experience (in Months)</label>
            <Input name="experienceMonths" type="number" min="0" value={formData.experienceMonths} onChange={handleChange} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-text">Preferred Companies (comma separated)</label>
            <Input name="preferredCompanies" value={formData.preferredCompanies} onChange={handleChange} placeholder="Google, Microsoft, Amazon" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-text">Preferred Tech Stack (comma separated)</label>
            <Input name="preferredTechStack" value={formData.preferredTechStack} onChange={handleChange} placeholder="React, Node.js, Python, AWS" />
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
