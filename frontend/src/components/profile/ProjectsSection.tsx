'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Edit2, X, Github, ExternalLink, Save } from 'lucide-react';

export default function ProjectsSection({ user }: { user: any }) {
  const queryClient = useQueryClient();
  const projects = user?.projects || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    link: '',
    githubUrl: '',
    startDate: '',
    endDate: '',
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', technologies: '', link: '', githubUrl: '', startDate: '', endDate: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (project: any) => {
    setFormData({
      title: project.title,
      description: project.description,
      technologies: (project.technologies || []).join(', '),
      link: project.link || '',
      githubUrl: project.githubUrl || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    });
    setEditingId(project.id);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        technologies: formData.technologies.split(',').map((t: string) => t.trim()).filter(Boolean),
      };
      if (editingId) {
        return await api.updateProject(editingId, payload);
      } else {
        return await api.addProject(payload);
      }
    },
    onSuccess: () => {
      toast.success(editingId ? 'Project updated!' : 'Project added!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save project');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.deleteProject(id);
    },
    onSuccess: () => {
      toast.success('Project deleted!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  return (
    <Card glass>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects</CardTitle>
        {!isAdding && !editingId && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        
        {(isAdding || editingId) && (
          <div className="bg-surface-2 p-5 rounded-lg space-y-4 border border-border">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">{editingId ? 'Edit Project' : 'Add New Project'}</h4>
              <Button variant="ghost" size="sm" onClick={resetForm}><X className="w-4 h-4" /></Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-text-secondary">Project Title</label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. E-Commerce Platform"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-text-secondary">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-md bg-surface border border-border text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Describe your project..."
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-text-secondary">Technologies (comma separated)</label>
                <Input 
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Live Link</label>
                <Input 
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">GitHub Repository</label>
                <Input 
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Start Date</label>
                <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">End Date</label>
                <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={() => saveMutation.mutate()} disabled={!formData.title || !formData.description || saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Project
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {projects.length === 0 && !isAdding && (
            <p className="text-sm text-text-muted text-center py-4">No projects added yet.</p>
          )}
          {projects.map((project: any) => (
            <div key={project.id} className="p-4 rounded-lg border border-border bg-surface-3/30 hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-text text-lg">{project.title}</h4>
                  <p className="text-sm text-text-secondary mt-1">{project.description}</p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(project)}>
                    <Edit2 className="w-4 h-4 text-text-secondary" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      if (confirm('Delete this project?')) deleteMutation.mutate(project.id);
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-danger" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {project.technologies.map((tech: string, i: number) => (
                  <span key={i} className="text-xs bg-surface-2 text-text-secondary px-2 py-1 rounded">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex gap-4 mt-4 text-sm">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-text hover:text-primary transition-colors">
                    <Github className="w-4 h-4 mr-1.5" /> Repository
                  </a>
                )}
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center text-text hover:text-primary transition-colors">
                    <ExternalLink className="w-4 h-4 mr-1.5" /> Live Project
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
