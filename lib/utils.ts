import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CHF: 'CHF ',
  AED: 'AED ',
  IDR: 'Rp ',
  THB: '฿',
  AUD: 'A$',
  CAD: 'C$',
};

export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${symbol}${formatted}`;
}

export function formatDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function daysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e)) return 0;
  return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1);
}

export function safetyScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-400';
  if (score >= 70) return 'text-sky-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

export function safetyLevelColor(level: string): string {
  switch (level) {
    case 'low':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'moderate':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'high':
      return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    case 'extreme':
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    default:
      return 'text-muted-foreground bg-muted/10 border-border';
  }
}

export function safetyLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    low: 'Low Risk',
    moderate: 'Moderate',
    high: 'High Risk',
    extreme: 'Extreme',
  };
  return labels[level] ?? level;
}

export function latLngToVector3(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}
