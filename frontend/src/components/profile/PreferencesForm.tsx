'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

export default function PreferencesForm({ user, onDirtyChange }: { user: any, onDirtyChange: (isDirty: boolean) => void }) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    theme: user?.theme || 'system',
    emailNotifications: user?.emailNotifications ?? true,
    profileVisibility: user?.profileVisibility || 'public',
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const isChanged = 
      formData.theme !== (user?.theme || 'system') ||
      formData.emailNotifications !== (user?.emailNotifications ?? true) ||
      formData.profileVisibility !== (user?.profileVisibility || 'public');
    
    setIsDirty(isChanged);
    onDirtyChange(isChanged);
  }, [formData, user, onDirtyChange]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.updatePreferences(formData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Preferences updated!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsDirty(false);
      onDirtyChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update preferences');
    }
  });

  return (
    <Card glass>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Theme</label>
            <select 
              name="theme" 
              value={formData.theme} 
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-md bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="system">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Profile Visibility</label>
            <select 
              name="profileVisibility" 
              value={formData.profileVisibility} 
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-md bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="public">Public (Visible to recruiters)</option>
              <option value="private">Private (Only visible to you)</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <input 
              type="checkbox"
              id="emailNotifications"
              name="emailNotifications"
              checked={formData.emailNotifications}
              onChange={handleChange}
              className="w-4 h-4 rounded border-surface-3 text-primary focus:ring-primary"
            />
            <label htmlFor="emailNotifications" className="text-sm font-medium text-text">
              Receive email notifications for job matches and insights
            </label>
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
