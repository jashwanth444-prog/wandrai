'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  badge?: string;
  badgeColor?: 'blue' | 'amber' | 'purple' | 'emerald' | 'red';
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
};

const BADGE_COLORS: Record<string, string> = {
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  red: 'bg-red-500/10 border-red-500/20 text-red-300',
};

export default function SectionHeading({
  badge,
  badgeColor = 'blue',
  title,
  description,
  align = 'center',
  className = '',
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className={cn(align === 'center' ? 'text-center' : 'text-left', className)}
    >
      {badge && (
        <div
          className={cn(
            'mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5',
            BADGE_COLORS[badgeColor]
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-glow" />
          <span className="text-sm font-medium">{badge}</span>
        </div>
      )}
      <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h2>
      {description && (
        <p
          className={cn(
            'mt-4 max-w-2xl text-lg text-muted-foreground',
            align === 'center' && 'mx-auto'
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
