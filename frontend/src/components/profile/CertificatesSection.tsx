'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Edit2, X, FileText, Upload, Save } from 'lucide-react';

export default function CertificatesSection({ user }: { user: any }) {
  const queryClient = useQueryClient();
  const certificates = user?.certificates || [];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    url: '',
    issueDate: '',
  });

  const resetForm = () => {
    setFormData({ title: '', issuer: '', url: '', issueDate: '' });
    setSelectedFile(null);
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (cert: any) => {
    setFormData({
      title: cert.title,
      issuer: cert.issuer,
      url: cert.url || '',
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
    });
    setEditingId(cert.id);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let certId = editingId;
      if (editingId) {
        await api.updateCertificate(editingId, formData);
      } else {
        const res = await api.addCertificate(formData);
        certId = res.data.id;
      }

      if (selectedFile && certId) {
        await api.uploadCertificate(certId, selectedFile);
      }
      return true;
    },
    onSuccess: () => {
      toast.success(editingId ? 'Certificate updated!' : 'Certificate added!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save certificate');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.deleteCertificate(id);
    },
    onSuccess: () => {
      toast.success('Certificate deleted!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  return (
    <Card glass>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Certificates & Achievements</CardTitle>
        {!isAdding && !editingId && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Certificate
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        
        {(isAdding || editingId) && (
          <div className="bg-surface-2 p-5 rounded-lg space-y-4 border border-border">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">{editingId ? 'Edit Certificate' : 'Add New Certificate'}</h4>
              <Button variant="ghost" size="sm" onClick={resetForm}><X className="w-4 h-4" /></Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-text-secondary">Certificate Title</label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. AWS Solutions Architect"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Issuing Organization</label>
                <Input 
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  placeholder="e.g. Amazon Web Services"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">Issue Date</label>
                <Input type="date" value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-text-secondary">Credential URL (Optional)</label>
                <Input 
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              
              <div className="space-y-2 md:col-span-2 pt-2">
                <label className="text-xs font-medium text-text-secondary">Upload Certificate File (PDF or Image)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" /> 
                    {selectedFile ? selectedFile.name : 'Choose File'}
                  </Button>
                  {selectedFile && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={() => saveMutation.mutate()} disabled={!formData.title || !formData.issuer || saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Certificate
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {certificates.length === 0 && !isAdding && (
            <p className="text-sm text-text-muted text-center py-4">No certificates added yet.</p>
          )}
          {certificates.map((cert: any) => (
            <div key={cert.id} className="p-4 rounded-lg border border-border bg-surface-3/30 hover:border-primary/30 transition-colors flex justify-between items-start">
              <div>
                <h4 className="font-bold text-text text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {cert.title}
                </h4>
                <p className="text-sm text-text-secondary mt-1">{cert.issuer} • {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'No date'}</p>
                
                <div className="flex gap-4 mt-3 text-sm">
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      View Credential
                    </a>
                  )}
                  {cert.fileUrl && (
                    <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      View Uploaded File
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <Button variant="ghost" size="sm" onClick={() => startEdit(cert)}>
                  <Edit2 className="w-4 h-4 text-text-secondary" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (confirm('Delete this certificate?')) deleteMutation.mutate(cert.id);
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
