import { withLatency } from './apiClient';
import { JOBS, DREAM_COMPANIES } from './mockData';
import type { Job, ApplicationStage, DreamCompany } from '@/types';

export const jobsService = {
  getJobs: () => withLatency(JOBS),
  getJobById: (id: string) => withLatency(JOBS.find((j) => j.id === id) ?? null),
  getJobsByStage: (stage: ApplicationStage) => withLatency(JOBS.filter((j) => j.stage === stage)),
  getDreamCompanies: () => withLatency(DREAM_COMPANIES),
  saveJob: (_job: Job) => withLatency({ success: true }),
  followCompany: (_company: DreamCompany) => withLatency({ success: true }),
};
