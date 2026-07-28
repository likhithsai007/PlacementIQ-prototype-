'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Edit2, X, Save } from 'lucide-react';

const CATEGORIES = ['LANGUAGE', 'FRAMEWORK', 'DATABASE', 'CLOUD', 'DEVOPS', 'AI_ML', 'TOOL', 'SOFT_SKILL', 'OTHER'];
const PROFICIENCIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

export default function SkillsSection({ user }: { user: any }) {
  const queryClient = useQueryClient();
  const skills = user?.skills || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'LANGUAGE',
    proficiencyLevel: 'INTERMEDIATE',
  });

  const resetForm = () => {
    setFormData({ name: '', category: 'LANGUAGE', proficiencyLevel: 'INTERMEDIATE' });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (skill: any) => {
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiencyLevel: skill.proficiencyLevel,
    });
    setEditingId(skill.id);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        return await api.updateSkill(editingId, formData);
      } else {
        return await api.addSkill(formData);
      }
    },
    onSuccess: () => {
      toast.success(editingId ? 'Skill updated!' : 'Skill added!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save skill');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.deleteSkill(id);
    },
    onSuccess: () => {
      toast.success('Skill deleted!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  return (
    <Card glass>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Skills</CardTitle>
        {!isAdding && !editingId && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Skill
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        
        {(isAdding || editingId) && (
          <div className="bg-surface-2 p-4 rounded-lg space-y-4 border border-border">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">{editingId ? 'Edit Skill' : 'Add New Skill'}</h4>
              <Button variant="ghost" size="sm" onClick={resetForm}><X className="w-4 h-4" /></Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Skill Name</label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. React, Python"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-9 px-3 rounded-md bg-surface border border-border text-sm focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Proficiency</label>
                <select 
                  value={formData.proficiencyLevel}
                  onChange={(e) => setFormData({ ...formData, proficiencyLevel: e.target.value })}
                  className="w-full h-9 px-3 rounded-md bg-surface border border-border text-sm focus:ring-2 focus:ring-primary"
                >
                  {PROFICIENCIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button onClick={() => saveMutation.mutate()} disabled={!formData.name || saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Skill
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {skills.length === 0 && !isAdding && (
            <p className="text-sm text-text-muted text-center py-4">No skills added yet.</p>
          )}
          {skills.map((skill: any) => (
            <div key={skill.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-3/30 hover:border-primary/30 transition-colors">
              <div>
                <div className="font-semibold text-text">{skill.name}</div>
                <div className="text-xs text-text-secondary flex gap-2 mt-1">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{skill.category}</span>
                  <span className="bg-surface-2 px-2 py-0.5 rounded">{skill.proficiencyLevel}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => startEdit(skill)}>
                  <Edit2 className="w-4 h-4 text-text-secondary" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (confirm('Delete this skill?')) deleteMutation.mutate(skill.id);
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 text-danger" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
