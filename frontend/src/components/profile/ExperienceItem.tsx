import type { ExperienceEntry } from '@/types';

export function ExperienceItem({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="flex flex-col gap-1 py-5 border-b border-surface-variant last:border-0">
      <div className="flex items-center justify-between gap-4">
        <h4 className="font-body-lg text-body-lg font-semibold text-on-surface">{entry.role}</h4>
        <span className="font-metadata text-metadata text-on-surface-variant whitespace-nowrap">
          {entry.period}
        </span>
      </div>
      <span className="font-metadata text-metadata text-on-surface-variant">{entry.company}</span>
      <p className="font-body-md text-body-md text-on-surface-variant mt-1">{entry.description}</p>
    </div>
  );
}
