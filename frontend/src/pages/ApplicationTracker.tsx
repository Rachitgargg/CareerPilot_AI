import { useEffect, useState } from 'react';
import type { Job, ApplicationStage } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { MatchScoreBadge } from '@/components/common/MatchScoreBadge';
import { Button } from '@/components/ui/button';
import { jobsService } from '@/services/jobsService';
import { X, Briefcase, MapPin, DollarSign, ExternalLink, Trash2, CheckCircle2 } from 'lucide-react';

const stages: { id: ApplicationStage; label: string }[] = [
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
];

export function ApplicationTracker() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    jobsService.getJobs().then(setJobs);
  }, []);

  const handleStageChange = (newStage: ApplicationStage) => {
    if (!selectedJob) return;
    const updated = jobsService.updateJobStage(selectedJob.id, newStage);
    setJobs(updated);
    setSelectedJob({ ...selectedJob, stage: newStage });
  };

  const handleDeleteJob = () => {
    if (!selectedJob) return;
    const updated = jobsService.deleteJob(selectedJob.id);
    setJobs(updated);
    setSelectedJob(null);
  };

  return (
    <AppLayout header={{ title: 'Application Tracker' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-8">
        <SectionHeading
          title="Application Tracker"
          description="Track every opportunity from saved to offer, all in one board. Click any card to edit details."
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
                      onClick={() => setSelectedJob(job)}
                      className="bg-surface-container-lowest rounded-panel border border-surface-container-high p-4 flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center font-metadata text-metadata text-on-surface-variant select-none">
                          {job.companyInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="font-body-md text-body-md text-on-surface truncate">{job.title}</p>
                          <p className="font-metadata text-metadata text-on-surface-variant truncate">
                            {job.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <MatchScoreBadge score={job.matchScore} />
                        {job.location && (
                          <span className="text-xs text-on-surface-variant truncate max-w-[120px]">
                            {job.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {stageJobs.length === 0 && (
                    <div className="border border-dashed border-surface-variant rounded-panel p-6 text-center select-none">
                      <span className="font-metadata text-metadata text-on-surface-variant">Empty</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Opportunity Details & Stage Switcher Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div 
            className="bg-surface rounded-panel border border-surface-container-high max-w-lg w-full max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-surface-container-high sticky top-0 bg-surface z-10">
              <div className="min-w-0 pr-4">
                <h3 className="font-headline-md text-headline-md text-primary truncate">{selectedJob.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant truncate">{selectedJob.company}</p>
              </div>
              <button 
                onClick={() => setSelectedJob(null)} 
                className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
                aria-label="Close details"
              >
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-6 overflow-y-auto">
              {/* Job Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-panel border border-surface-container-high">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-on-surface-variant shrink-0" />
                  <span className="text-sm font-metadata text-on-surface truncate">{selectedJob.location || 'Not Specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-on-surface-variant shrink-0" />
                  <span className="text-sm font-metadata text-on-surface truncate">{selectedJob.salaryRange || 'Not Specified'}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Briefcase size={16} className="text-on-surface-variant shrink-0" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-metadata text-on-surface-variant">Match Score:</span>
                    <MatchScoreBadge score={selectedJob.matchScore} />
                  </div>
                </div>
              </div>

              {/* Stage Switcher Controls */}
              <div className="flex flex-col gap-2">
                <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                  Application Stage
                </h4>
                <div className="flex flex-wrap gap-2">
                  {stages.map((stage) => {
                    const isSelected = selectedJob.stage === stage.id;
                    return (
                      <button
                        key={stage.id}
                        onClick={() => handleStageChange(stage.id)}
                        className={`px-3 py-2 text-xs rounded-full border transition-all flex items-center gap-1 font-metadata ${
                          isSelected
                            ? 'bg-[#2b2b2b] text-white border-[#2b2b2b] font-semibold'
                            : 'bg-surface-container-low text-on-surface border-surface-container-high hover:bg-surface-container-high'
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={12} />}
                        {stage.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Details & AI Recommendations */}
              <div className="flex flex-col gap-2">
                <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                  AI Fit Analysis & Prep
                </h4>
                <div className="bg-surface-container-low p-4 rounded-panel border border-surface-container-high">
                  <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed font-body-md">
                    {selectedJob.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t border-surface-container-high bg-surface-container-lowest sticky bottom-0">
              <Button
                variant="outline"
                className="text-error border-error-container hover:bg-error-container/10 flex items-center gap-1 hover:text-error hover:border-error"
                onClick={handleDeleteJob}
              >
                <Trash2 size={16} /> Remove
              </Button>
              <div className="flex gap-2">
                {selectedJob.url && (
                  <a
                    href={selectedJob.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-[#2b2b2b] hover:bg-[#404040] text-white px-4 py-2 text-sm font-semibold transition-transform hover:scale-[1.02]"
                  >
                    Apply Now <ExternalLink size={14} className="ml-1" />
                  </a>
                )}
                <Button onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
