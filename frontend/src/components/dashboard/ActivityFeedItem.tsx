import { FileText, Bookmark, CheckCircle2, Flag } from 'lucide-react';
import type { ActivityItem } from '@/types';
import { cn } from '@/utils/cn';

const iconMap = {
  description: FileText,
  bookmark: Bookmark,
  check: CheckCircle2,
  flag: Flag,
};

export function ActivityFeedItem({ item }: { item: ActivityItem }) {
  const Icon = iconMap[item.icon];
  return (
    <div className="flex items-center gap-4 py-4 border-b border-surface-variant last:border-0">
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
          item.isPrimary ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'
        )}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body-md text-body-md text-on-surface truncate">{item.label}</p>
        <span className="font-metadata text-metadata text-on-surface-variant">{item.timestamp}</span>
      </div>
    </div>
  );
}
