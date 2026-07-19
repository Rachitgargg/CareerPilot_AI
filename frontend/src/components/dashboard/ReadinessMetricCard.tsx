import type { ReadinessMetric } from '@/types';
import { cn } from '@/utils/cn';

const accentMap: Record<ReadinessMetric['accent'], string> = {
  sage: 'bg-sage',
  blush: 'bg-blush',
  lavender: 'bg-lavender',
  butter: 'bg-butter',
};

export function ReadinessMetricCard({ metric }: { metric: ReadinessMetric }) {
  return (
    <div className={cn('rounded-card p-6 flex flex-col justify-between h-36', accentMap[metric.accent])}>
      <span className="font-label-caps text-label-caps text-primary/70 uppercase tracking-widest">
        {metric.label}
      </span>
      <span className="font-headline-lg text-headline-lg text-primary">{metric.value}%</span>
    </div>
  );
}
