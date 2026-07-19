import { FileText, CheckCircle2 } from 'lucide-react';
import type { ResumeVersion } from '@/types';
import { cn } from '@/utils/cn';
import { ProgressRing } from '@/components/common/ProgressRing';

export function ResumeVersionCard({ version }: { version: ResumeVersion }) {
  return (
    <div
      className={cn(
        'rounded-card p-6 flex items-center gap-4 border transition-colors',
        version.isActive
          ? 'bg-primary text-on-primary border-primary'
          : 'bg-surface-container-lowest border-surface-container-high hover:border-outline-variant'
      )}
    >
      <div
        className={cn(
          'w-11 h-11 rounded-full flex items-center justify-center shrink-0',
          version.isActive ? 'bg-on-primary/10' : 'bg-surface-variant'
        )}
      >
        <FileText size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-body-lg text-body-lg font-medium truncate">{version.name}</h4>
        <span
          className={cn(
            'font-metadata text-metadata',
            version.isActive ? 'text-on-primary/70' : 'text-on-surface-variant'
          )}
        >
          Updated {version.updatedAt}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {version.isActive && <CheckCircle2 size={18} />}
        <ProgressRing value={version.atsScore} size={44} strokeWidth={4} />
      </div>
    </div>
  );
}
