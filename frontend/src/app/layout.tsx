import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'PlacementIQ — Know Exactly What Stands Between You and Your Dream Job',
    template: '%s | PlacementIQ',
  },
  description:
    'AI-powered placement readiness platform that objectively measures your skills, identifies gaps, and provides a personalized roadmap to your dream job.',
  keywords: ['placement', 'job readiness', 'AI', 'resume analysis', 'skill gap', 'career'],
  authors: [{ name: 'PlacementIQ' }],
  openGraph: {
    type: 'website',
    title: 'PlacementIQ — Placement Intelligence Platform',
    description: 'Know exactly what stands between you and your dream job.',
    siteName: 'PlacementIQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlacementIQ',
    description: 'AI-powered placement readiness platform',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-bg text-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
