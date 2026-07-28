'use client';

import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const setupSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  college: z.string().min(2, 'College is required'),
  branch: z.string().min(2, 'Branch is required'),
  cgpa: z.coerce.number().min(0).max(10, 'CGPA must be between 0 and 10'),
  graduationYear: z.coerce.number().min(2020).max(2030),
  targetRole: z.string().min(2, 'Target role is required'),
});

type SetupFormValues = z.infer<typeof setupSchema>;

const TARGET_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Product Manager',
];

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { firebaseUser, appUser } = useAuth(); // Wait for user state to refresh after submit

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      fullName: appUser?.displayName || firebaseUser?.displayName || '',
      college: '',
      branch: '',
      cgpa: undefined,
      graduationYear: new Date().getFullYear() + 1,
      targetRole: '',
    },
  });

  const selectedRole = watch('targetRole');

  const onSubmit = async (data: SetupFormValues) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      const roleMap: Record<string, string> = {
        'Software Engineer': 'SOFTWARE_ENGINEER',
        'Frontend Developer': 'FRONTEND_DEVELOPER',
        'Backend Developer': 'BACKEND_DEVELOPER',
        'Full Stack Developer': 'FULLSTACK_DEVELOPER',
        'Data Scientist': 'DATA_ANALYST',
        'Product Manager': 'PRODUCT_ENGINEER',
      };

      // The backend expects specific fields. 
      // The api `/profile` takes updates.
      await api.updateProfile({
        fullName: data.fullName,
        college: data.college,
        branch: data.branch,
        cgpa: data.cgpa,
        graduationYear: data.graduationYear,
        targetRole: roleMap[data.targetRole] || 'SOFTWARE_ENGINEER',
      });

      // Navigate to the next step of onboarding
      window.location.href = '/connect';
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    if (step === 1) {
      const valid = await trigger(['fullName', 'college', 'branch']);
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await trigger(['cgpa', 'graduationYear']);
      if (valid) setStep(3);
    }
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-text mb-2">Build Your Profile</h1>
          <p className="text-text-secondary">We need a few details to tailor your roadmap.</p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-primary shadow-glow'
                  : s < step
                  ? 'bg-success'
                  : 'bg-surface-3'
              }`}
            />
          ))}
        </div>
      </div>

      <Card glass gradientBorder={step === 3}>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text">Full Name</label>
                  <Input {...register('fullName')} placeholder="John Doe" />
                  {errors.fullName && <p className="text-xs text-danger">{errors.fullName.message}</p>}
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text">College / University</label>
                  <Input {...register('college')} placeholder="National Institute of Technology..." />
                  {errors.college && <p className="text-xs text-danger">{errors.college.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text">Branch / Major</label>
                  <Input {...register('branch')} placeholder="Computer Science & Engineering" />
                  {errors.branch && <p className="text-xs text-danger">{errors.branch.message}</p>}
                </div>
              </motion.div>
            )}

            {/* Step 2: Academics */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text">CGPA</label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('cgpa')}
                      placeholder="8.5"
                    />
                    {errors.cgpa && <p className="text-xs text-danger">{errors.cgpa.message}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text">Graduation Year</label>
                    <Input
                      type="number"
                      {...register('graduationYear')}
                      placeholder="2025"
                    />
                    {errors.graduationYear && <p className="text-xs text-danger">{errors.graduationYear.message}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Goals */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <label className="text-sm font-medium text-text">Target Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {TARGET_ROLES.map((role) => (
                      <div
                        key={role}
                        onClick={() => setValue('targetRole', role, { shouldValidate: true })}
                        className={`p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all flex items-center justify-between ${
                          selectedRole === role
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-surface-3 border-border hover:border-text-secondary text-text-secondary'
                        }`}
                      >
                        {role}
                        {selectedRole === role && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                    ))}
                  </div>
                  {errors.targetRole && <p className="text-xs text-danger">{errors.targetRole.message}</p>}
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={prevStep}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {step < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting || !selectedRole}>
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
