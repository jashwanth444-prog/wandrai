import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';

type Props = {
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({ className, style }: Props) {
  return <div className={cn('shimmer-bg rounded-lg', className)} style={style} />;
}

export function CardSkeleton({ className }: Props) {
  return (
    <div className={cn('glass rounded-2xl p-5', className)}>
      <Skeleton className="mb-4 h-10 w-10 rounded-xl" />
      <Skeleton className="mb-2 h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="mt-1 h-3 w-4/5" />
    </div>
  );
}

export function DestinationCardSkeleton({ className }: Props) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-white/10 bg-card', className)}>
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="p-5">
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="mb-3 h-6 w-32" />
        <Skeleton className="mb-4 h-3 w-full" />
        <Skeleton className="mb-4 h-3 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function WidgetSkeleton({ className }: Props) {
  return (
    <div className={cn('glass-strong rounded-2xl p-5', className)}>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ className }: Props) {
  return (
    <div className={cn('glass-strong rounded-2xl p-5', className)}>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <div className="flex h-48 items-end gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-lg"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}
