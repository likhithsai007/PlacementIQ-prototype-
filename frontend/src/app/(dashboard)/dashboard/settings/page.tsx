'use client';

import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Loader2, User, Save } from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  college: z.string().min(2, 'College name is required'),
  branch: z.string().min(2, 'Branch is required'),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  graduationYear: z.coerce.number().min(2020).max(2030),
  targetRole: z.string().min(2, 'Target role is required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { data: profileResponse, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.getProfile();
      return res.data;
    },
  });

  const profileData = profileResponse?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      college: '',
      branch: '',
      cgpa: undefined,
      graduationYear: new Date().getFullYear(),
      targetRole: '',
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (profileData) {
      reset({
        fullName: profileData.user?.displayName || '',
        college: profileData.college || '',
        branch: profileData.branch || '',
        cgpa: profileData.cgpa || undefined,
        graduationYear: profileData.graduationYear || new Date().getFullYear(),
        targetRole: profileData.targetRole || '',
      });
    }
  }, [profileData, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await api.updateProfile(data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update profile');
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text mb-2">Settings</h1>
        <p className="text-text-secondary">Manage your profile information and career goals.</p>
      </div>

      <Card glass>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text">Edit Profile</h3>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text">Full Name</label>
                <Input {...register('fullName')} />
                {errors.fullName && <p className="text-xs text-danger">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text">Target Role</label>
                <Input {...register('targetRole')} />
                {errors.targetRole && <p className="text-xs text-danger">{errors.targetRole.message}</p>}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-text">College / University</label>
                <Input {...register('college')} />
                {errors.college && <p className="text-xs text-danger">{errors.college.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text">Branch / Major</label>
                <Input {...register('branch')} />
                {errors.branch && <p className="text-xs text-danger">{errors.branch.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text">Graduation Year</label>
                  <Input type="number" {...register('graduationYear')} />
                  {errors.graduationYear && <p className="text-xs text-danger">{errors.graduationYear.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text">CGPA</label>
                  <Input type="number" step="0.01" {...register('cgpa')} />
                  {errors.cgpa && <p className="text-xs text-danger">{errors.cgpa.message}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-border pt-6">
              <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
