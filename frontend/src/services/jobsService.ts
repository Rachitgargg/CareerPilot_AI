import { fetchRecommendedJobs } from './api/jobs';
import { getSessionId } from './api/api';
import { JOBS, DREAM_COMPANIES } from './mockData';
import type { Job, DreamCompany, ApplicationStage } from '@/types';

let cachedJobs: Job[] = [];

// Load initial cache from localStorage if available
try {
  const saved = localStorage.getItem('careerpilot_tracked_jobs');
  if (saved) {
    cachedJobs = JSON.parse(saved);
  }
} catch (e) {
  console.error('Failed to parse saved jobs:', e);
}

export const jobsService = {
  getJobs: async (preferredRole?: string, location?: string): Promise<Job[]> => {
    // Return local/cached jobs if we have them to avoid resetting state and to enable full tracking persistence
    if (cachedJobs.length > 0 && !preferredRole && !location) {
      return cachedJobs;
    }
    
    const sessionId = getSessionId();
    if (!sessionId) {
      if (cachedJobs.length === 0) {
        cachedJobs = JOBS.map(j => ({ ...j, stage: j.stage as ApplicationStage || 'saved' }));
      }
      return cachedJobs;
    }
    
    try {
      const response = await fetchRecommendedJobs(preferredRole, location);
      const list = response.recommended_jobs.map((job, idx) => ({
        id: `job-${idx}-${Date.now()}`,
        title: job.title,
        company: job.company,
        companyInitial: job.company ? job.company[0].toUpperCase() : 'J',
        location: job.location,
        remote: job.location.toLowerCase() === 'remote',
        salaryRange: `Priority: ${job.application_priority}`,
        matchScore: job.match_score,
        tags: job.matching_skills.slice(0, 3),
        postedAt: 'Just now',
        description: `${job.why_this_matches}\n\nMatching Strengths: ${job.matching_strengths.join(', ')}\n\nMissing Skills: ${job.missing_skills.join(', ')}\n\nLearning Recommendations: ${job.learning_recommendations.join(', ')}`,
        stage: 'saved' as const,
        url: job.url,
      }));
      cachedJobs = list;
      localStorage.setItem('careerpilot_tracked_jobs', JSON.stringify(cachedJobs));
      return list;
    } catch (e) {
      console.error("Job recommendations API failed, using fallback:", e);
      if (cachedJobs.length === 0) {
        cachedJobs = JOBS.map(j => ({ ...j, stage: j.stage as ApplicationStage || 'saved' }));
      }
      return cachedJobs;
    }
  },

  updateJobStage: (jobId: string, stage: ApplicationStage): Job[] => {
    cachedJobs = cachedJobs.map(j => j.id === jobId ? { ...j, stage } : j);
    localStorage.setItem('careerpilot_tracked_jobs', JSON.stringify(cachedJobs));
    return cachedJobs;
  },

  deleteJob: (jobId: string): Job[] => {
    cachedJobs = cachedJobs.filter(j => j.id !== jobId);
    localStorage.setItem('careerpilot_tracked_jobs', JSON.stringify(cachedJobs));
    return cachedJobs;
  },

  addJob: (job: Job): Job[] => {
    cachedJobs = [job, ...cachedJobs];
    localStorage.setItem('careerpilot_tracked_jobs', JSON.stringify(cachedJobs));
    return cachedJobs;
  },
  
  getDreamCompanies: async (): Promise<DreamCompany[]> => {
    return DREAM_COMPANIES;
  },
  
  saveJob: async (job: Job) => {
    jobsService.addJob(job);
    return { success: true };
  },
  
  followCompany: async (_company: DreamCompany) => {
    return { success: true };
  },

  clearCache: () => {
    cachedJobs = [];
    localStorage.removeItem('careerpilot_tracked_jobs');
  }
};
