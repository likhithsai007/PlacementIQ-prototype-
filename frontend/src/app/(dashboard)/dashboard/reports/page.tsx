'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text mb-2">Weekly Reports</h1>
        <p className="text-text-secondary">Track your progress week over week.</p>
      </div>

      <Card glass>
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
          <Wrench className="w-12 h-12 text-primary mb-4" />
          <h2 className="text-xl font-semibold text-text mb-2">Under Construction</h2>
          <p className="text-text-secondary text-center max-w-md">
            The progress reports interface is coming soon! Our engineers are working hard to build this feature.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
