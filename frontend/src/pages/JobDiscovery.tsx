import { useEffect, useMemo, useState } from 'react';
import type { Job } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { JobCard } from '@/components/jobs/JobCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { jobsService } from '@/services/jobsService';

const filters = ['All roles', 'Remote', 'Saved'] as const;

export function JobDiscovery() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>('All roles');

  useEffect(() => {
    jobsService.getJobs().then(setJobs);
  }, []);

  const filteredJobs = useMemo(() => {
    if (filter === 'Remote') return jobs.filter((j) => j.remote);
    if (filter === 'Saved') return jobs.filter((j) => j.stage === 'saved');
    return jobs;
  }, [jobs, filter]);

  const handleSave = (job: Job) => {
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, stage: 'saved' } : j)));
    jobsService.saveJob(job);
  };

  return (
    <AppLayout header={{ showSearch: true, searchPlaceholder: 'Search job titles, companies...' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-8">
        <SectionHeading
          title="Job Discovery"
          description="Roles ranked by compatibility with your skills, goals, and resume."
        />

        <Tabs value={filter} onValueChange={(v) => setFilter(v as (typeof filters)[number])}>
          <TabsList>
            {filters.map((f) => (
              <TabsTrigger key={f} value={f}>
                {f}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-card-gap">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onSave={handleSave} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
