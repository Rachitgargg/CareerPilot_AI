import { CheckCircle2, Lock, CircleDot } from 'lucide-react';
import type { RoadmapMilestone } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

const statusConfig = {
  completed: { icon: CheckCircle2, style: 'bg-primary text-on-primary' },
  'in-progress': { icon: CircleDot, style: 'bg-background border-2 border-primary text-primary' },
  locked: { icon: Lock, style: 'bg-background border-2 border-outline text-outline' },
};

export function MilestoneCard({ milestone }: { milestone: RoadmapMilestone }) {
  const { icon: Icon, style } = statusConfig[milestone.status];

  return (
    <div
      className={cn(
        'rounded-card p-6 border flex flex-col gap-3',
        milestone.status === 'locked'
          ? 'bg-surface-container opacity-70 border-surface-variant'
          : 'bg-surface-container-lowest border-surface-container-high'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', style)}>
          <Icon size={16} />
        </div>
        <span className="font-metadata text-metadata text-on-surface-variant">{milestone.duration}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-primary">{milestone.title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant">{milestone.description}</p>
      <div className="flex flex-wrap gap-2 mt-1">
        {milestone.skills.map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>
    </div>
  );
}
