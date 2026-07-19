import { cn } from '@/utils/cn';

export interface MatchScoreBadgeProps {
  score: number;
  className?: string;
}

/** Color-graded match percentage pill (job matches, company matches). */
export function MatchScoreBadge({ score, className }: MatchScoreBadgeProps) {
  const tone =
    score >= 80 ? 'bg-sage text-primary' : score >= 60 ? 'bg-butter text-primary' : 'bg-blush text-primary';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 font-metadata text-metadata font-semibold',
        tone,
        className
      )}
    >
      {score}% Match
    </span>
  );
}
