import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-10 bg-secondary/50 rounded-lg animate-pulse',
            className
          )}
        />
      ))}
    </>
  );
}

interface SkeletonCardProps {
  count?: number;
}

export function SkeletonCard({ count = 1 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl border border-border bg-card space-y-4 animate-pulse"
        >
          <div className="h-6 bg-secondary/50 rounded w-1/3" />
          <div className="h-4 bg-secondary/50 rounded w-2/3" />
          <div className="h-4 bg-secondary/50 rounded w-1/2" />
        </div>
      ))}
    </>
  );
}
