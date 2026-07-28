'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, KeyRound, ShieldAlert } from 'lucide-react';

export default function SecuritySection({ user }: { user: any }) {
  const queryClient = useQueryClient();

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.changePassword();
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset link sent to your email!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate reset link');
    }
  });

  const revokeSessionsMutation = useMutation({
    mutationFn: async () => {
      const res = await api.revokeSessions();
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'All other sessions have been revoked.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke sessions');
    }
  });

  return (
    <div className="space-y-6">
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>
            We&apos;ll send a secure link to {user?.email} to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => changePasswordMutation.mutate()} 
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Send Reset Link
          </Button>
        </CardContent>
      </Card>

      <Card glass className="border-danger/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger">
            <ShieldAlert className="w-5 h-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            If you notice suspicious activity, you can sign out of all other devices. This will revoke all active refresh tokens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="danger"
            onClick={() => {
              if (confirm('Are you sure you want to sign out of all other devices?')) {
                revokeSessionsMutation.mutate();
              }
            }} 
            disabled={revokeSessionsMutation.isPending}
          >
            {revokeSessionsMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Sign out of all other devices
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
