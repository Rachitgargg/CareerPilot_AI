import { useEffect, useState } from 'react';
import type { Job, ApplicationStage } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { MatchScoreBadge } from '@/components/common/MatchScoreBadge';
import { jobsService } from '@/services/jobsService';

const stages: { id: ApplicationStage; label: string }[] = [
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
];

export function ApplicationTracker() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    jobsService.getJobs().then(setJobs);
  }, []);

  return (
    <AppLayout header={{ title: 'Application Tracker' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-8">
        <SectionHeading
          title="Application Tracker"
          description="Track every opportunity from saved to offer, all in one board."
        />

        <div className="flex gap-6 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageJobs = jobs.filter((j) => j.stage === stage.id);
            return (
              <div key={stage.id} className="min-w-[280px] w-[280px] flex flex-col gap-4 shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                    {stage.label}
                  </h3>
                  <span className="font-metadata text-metadata text-on-surface-variant bg-surface-container-highest rounded-full w-6 h-6 flex items-center justify-center">
                    {stageJobs.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {stageJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-surface-container-lowest rounded-panel border border-surface-container-high p-4 flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center font-metadata text-metadata text-on-surface-variant">
                          {job.companyInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="font-body-md text-body-md text-on-surface truncate">{job.title}</p>
                          <p className="font-metadata text-metadata text-on-surface-variant truncate">
                            {job.company}
                          </p>
                        </div>
                      </div>
                      <MatchScoreBadge score={job.matchScore} className="self-start" />
                    </div>
                  ))}
                  {stageJobs.length === 0 && (
                    <div className="border border-dashed border-surface-variant rounded-panel p-6 text-center">
                      <span className="font-metadata text-metadata text-on-surface-variant">Empty</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
