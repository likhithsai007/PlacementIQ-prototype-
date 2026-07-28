'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

export default function AcademicForm({ user, onDirtyChange }: { user: any, onDirtyChange: (isDirty: boolean) => void }) {
  const queryClient = useQueryClient();
  const profile = user?.profile || {};

  const [formData, setFormData] = useState({
    college: profile.college || '',
    university: profile.university || '',
    degree: profile.degree || '',
    branch: profile.branch || '',
    graduationYear: profile.graduationYear || new Date().getFullYear(),
    cgpa: profile.cgpa || 0,
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const isChanged = 
      formData.college !== (profile.college || '') ||
      formData.university !== (profile.university || '') ||
      formData.degree !== (profile.degree || '') ||
      formData.branch !== (profile.branch || '') ||
      formData.graduationYear !== (profile.graduationYear || new Date().getFullYear()) ||
      formData.cgpa !== (profile.cgpa || 0);
    
    setIsDirty(isChanged);
    onDirtyChange(isChanged);
  }, [formData, profile, onDirtyChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'number' ? Number(value) : value 
    });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.updateAcademic(formData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Academic information updated!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsDirty(false);
      onDirtyChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update academic information');
    }
  });

  return (
    <Card glass>
      <CardHeader>
        <CardTitle>Academic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">College/Institution</label>
            <Input name="college" value={formData.college} onChange={handleChange} placeholder="Institute of Technology" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">University (Optional)</label>
            <Input name="university" value={formData.university} onChange={handleChange} placeholder="State University" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Degree</label>
            <Input name="degree" value={formData.degree} onChange={handleChange} placeholder="B.Tech, B.Sc, etc." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Branch/Major</label>
            <Input name="branch" value={formData.branch} onChange={handleChange} placeholder="Computer Science" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Graduation Year</label>
            <Input name="graduationYear" type="number" value={formData.graduationYear} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">CGPA</label>
            <Input name="cgpa" type="number" step="0.01" min="0" max="10" value={formData.cgpa} onChange={handleChange} />
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
