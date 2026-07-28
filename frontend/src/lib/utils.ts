import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#5EBE7A';
  if (score >= 60) return '#6EC5FF';
  if (score >= 40) return '#FFD57C';
  return '#E05B5B';
}

export function getGradeColor(grade: string): string {
  switch (grade.toUpperCase()) {
    case 'A': return '#5EBE7A';
    case 'B': return '#6EC5FF';
    case 'C': return '#FFD57C';
    case 'D': return '#E05B5B';
    default: return '#9CA3AF';
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority.toUpperCase()) {
    case 'CRITICAL': return '#E05B5B';
    case 'HIGH': return '#FFD57C';
    case 'MEDIUM': return '#6EC5FF';
    case 'LOW': return '#9CA3AF';
    default: return '#9CA3AF';
  }
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = diff / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  if (days < 7) return `${Math.floor(days)}d ago`;
  return d.toLocaleDateString();
}
