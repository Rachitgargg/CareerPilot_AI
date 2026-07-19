import { useEffect, useState } from 'react';
import { Check, MapPin, Lock } from 'lucide-react';
import type { TimelineEvent } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { timelineService } from '@/services/timelineService';
import { cn } from '@/utils/cn';

const nodeStyle: Record<TimelineEvent['type'], string> = {
  education: 'bg-primary text-on-primary',
  role: 'bg-primary text-on-primary ring-8 ring-background',
  certification: 'bg-background border-4 border-primary',
  achievement: 'bg-background border-2 border-outline',
};

const cardStyle: Record<TimelineEvent['type'], string> = {
  education: 'bg-surface-container-low',
  role: 'bg-error-container',
  certification: 'bg-secondary-container',
  achievement: 'bg-surface-container',
};

export function CareerTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    timelineService.getEvents().then(setEvents);
  }, []);

  return (
    <AppLayout header={{ title: 'Career Timeline' }}>
      <div className="px-4 md:px-container-padding py-12 flex justify-center">
        <div className="w-full max-w-3xl">
          <div className="mb-section-margin">
            <h2 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl text-primary">
              Career Timeline
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-2xl">
              Your AI-generated roadmap to becoming a Senior AI Engineer. Track your progress and prepare
              for upcoming milestones.
            </p>
          </div>

          <div className="relative w-full">
            <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-surface-variant rounded-full" />

            <div className="flex flex-col gap-16">
              {events.map((event) => {
                const isToday = event.period === 'Today';
                return (
                  <div key={event.id} className="relative flex gap-6">
                    <div
                      className={cn(
                        'relative z-10 shrink-0 rounded-full flex items-center justify-center',
                        isToday ? 'w-10 h-10' : 'w-6 h-6',
                        nodeStyle[event.type]
                      )}
                    >
                      {event.type === 'education' && <Check size={14} />}
                      {isToday && <MapPin size={18} className="text-white" />}
                      {event.type === 'achievement' && <Lock size={12} className="text-outline" />}
                    </div>

                    <div className={cn('rounded-card p-6 flex-1', cardStyle[event.type])}>
                      {isToday && (
                        <span className="inline-block bg-primary text-on-primary px-3 py-1 rounded-full font-label-caps text-label-caps mb-3 uppercase tracking-widest">
                          Today
                        </span>
                      )}
                      <span className="font-metadata text-metadata text-on-surface-variant block mb-1">
                        {event.organization} · {event.period}
                      </span>
                      <h3
                        className={cn(
                          'font-headline-md text-headline-md',
                          event.type === 'role' ? 'text-on-error-container' : 'text-primary'
                        )}
                      >
                        {event.title}
                      </h3>
                      <p
                        className={cn(
                          'font-body-md text-body-md mt-2',
                          event.type === 'role' ? 'text-on-error-container/90' : 'text-on-surface-variant'
                        )}
                      >
                        {event.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
