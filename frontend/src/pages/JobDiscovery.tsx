import { useEffect, useMemo, useState } from 'react';
import type { Job } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { JobCard } from '@/components/jobs/JobCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { jobsService } from '@/services/jobsService';
import { Loader2, X, Globe, Sparkles } from 'lucide-react';
import { MatchScoreBadge } from '@/components/common/MatchScoreBadge';

const filters = ['All roles', 'Remote', 'Saved'] as const;

export function JobDiscovery() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>('All roles');
  const [preferredRole, setPreferredRole] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Initial load
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await jobsService.getJobs(preferredRole || undefined, location || undefined);
      setJobs(res);
    } catch (e: any) {
      setError(e.message || 'Failed to retrieve job recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

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
    <AppLayout header={{ showSearch: false }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-8">
        <SectionHeading
          title="Job Discovery"
          description="Roles ranked by compatibility with your skills, goals, and resume."
        />

        {/* Discovery Filter Controls */}
        <div className="bg-surface-container-low rounded-card p-6 flex flex-col gap-4 border border-surface-container-high">
          <h3 className="font-headline-md text-headline-md text-primary">Discover Tailored Opportunities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="font-metadata text-metadata text-on-surface-variant">Preferred Role</label>
              <Input
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                placeholder="e.g. AI Engineer, React Developer"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-metadata text-metadata text-on-surface-variant">Location Constraint</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, San Francisco"
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Finding Jobs...
                </>
              ) : (
                'Find Matches'
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error rounded-card p-4">
            {error}
          </div>
        )}

        <Tabs value={filter} onValueChange={(v) => setFilter(v as (typeof filters)[number])}>
          <TabsList>
            {filters.map((f) => (
              <TabsTrigger key={f} value={f}>
                {f}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="font-body-md text-body-md text-on-surface-variant">Matching your skills against target opportunities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-card-gap">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSave={handleSave}
                onViewDetails={(j) => setSelectedJob(j)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low rounded-card border border-surface-container-high w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-xl">
            <div className="p-6 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center font-headline-md text-headline-md text-on-surface-variant shrink-0">
                  {selectedJob.companyInitial}
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary leading-tight">{selectedJob.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{selectedJob.company}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container-high transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              <div className="flex items-center gap-3 flex-wrap">
                <MatchScoreBadge score={selectedJob.matchScore} />
                <span className="font-metadata text-metadata text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
                  {selectedJob.location}
                </span>
                <span className="font-metadata text-metadata text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {selectedJob.salaryRange}
                </span>
              </div>

              <div className="bg-surface-container-lowest border border-surface-container-high rounded-card p-4 flex flex-col gap-3">
                <h4 className="font-headline-sm text-headline-sm text-primary flex items-center gap-1.5">
                  <Sparkles size={16} /> AI Match Assessment
                </h4>
                {/* Parse the description details back out into sections if possible, else show raw text */}
                <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">
                  {selectedJob.description}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-surface-container-high flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
              {selectedJob.url && (
                <Button onClick={() => window.open(selectedJob.url, '_blank')}>
                  <Globe size={16} className="mr-1.5" /> Apply Direct
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
