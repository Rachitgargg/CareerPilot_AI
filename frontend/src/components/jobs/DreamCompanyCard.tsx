import { Heart } from 'lucide-react';
import type { DreamCompany } from '@/types';
import { Button } from '@/components/ui/button';
import { MatchScoreBadge } from '@/components/common/MatchScoreBadge';
import { cn } from '@/utils/cn';

export interface DreamCompanyCardProps {
  company: DreamCompany;
  onToggleFollow?: (company: DreamCompany) => void;
}

export function DreamCompanyCard({ company, onToggleFollow }: DreamCompanyCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex items-center gap-5">
      <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center font-headline-md text-headline-md text-on-secondary-container shrink-0">
        {company.initial}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-headline-md text-headline-md text-primary truncate">{company.name}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant truncate">{company.industry}</p>
        <div className="flex items-center gap-3 mt-2">
          <MatchScoreBadge score={company.matchScore} />
          <span className="font-metadata text-metadata text-on-surface-variant">
            {company.openRoles} open roles
          </span>
        </div>
      </div>
      <Button
        variant={company.isFollowing ? 'soft' : 'outline'}
        size="sm"
        onClick={() => onToggleFollow?.(company)}
        className="shrink-0"
      >
        <Heart size={16} className={cn(company.isFollowing && 'fill-current')} />
        {company.isFollowing ? 'Following' : 'Follow'}
      </Button>
    </div>
  );
}
