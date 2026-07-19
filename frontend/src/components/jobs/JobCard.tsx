import { MapPin, Bookmark } from 'lucide-react';
import type { Job } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MatchScoreBadge } from '@/components/common/MatchScoreBadge';

export interface JobCardProps {
  job: Job;
  onSave?: (job: Job) => void;
  onViewDetails?: (job: Job) => void;
}

export function JobCard({ job, onSave, onViewDetails }: JobCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-4 hover:shadow-[0_20px_40px_-15px_rgba(26,26,26,0.08)] transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center font-headline-md text-headline-md text-on-surface-variant shrink-0">
            {job.companyInitial}
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-primary leading-tight">{job.title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{job.company}</p>
          </div>
        </div>
        <button
          onClick={() => onSave?.(job)}
          aria-label="Save job"
          className="text-on-surface-variant hover:text-primary transition-colors p-2"
        >
          <Bookmark size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <MatchScoreBadge score={job.matchScore} />
        <span className="inline-flex items-center gap-1 font-metadata text-metadata text-on-surface-variant">
          <MapPin size={14} /> {job.location}
        </span>
      </div>

      <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-2">
        {job.tags.map((tag) => (
          <Badge key={tag} variant="default">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="font-metadata text-metadata text-on-surface-variant">{job.salaryRange}</span>
        <Button size="sm" variant="primary" onClick={() => onViewDetails?.(job)}>
          View details
        </Button>
      </div>
    </div>
  );
}
