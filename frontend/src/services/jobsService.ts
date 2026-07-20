import { fetchRecommendedJobs } from './api/jobs';
import { getSessionId } from './api/api';
import { JOBS, DREAM_COMPANIES } from './mockData';
import type { Job, DreamCompany } from '@/types';

export const jobsService = {
  getJobs: async (preferredRole?: string, location?: string): Promise<Job[]> => {
    const sessionId = getSessionId();
    if (!sessionId) return JOBS;
    
    try {
      const response = await fetchRecommendedJobs(preferredRole, location);
      return response.recommended_jobs.map((job, idx) => ({
        id: `job-${idx}`,
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
    } catch (e) {
      console.error("Job recommendations API failed, using fallback:", e);
      return JOBS;
    }
  },
  
  getDreamCompanies: async (): Promise<DreamCompany[]> => {
    return DREAM_COMPANIES;
  },
  
  saveJob: async (_job: Job) => {
    return { success: true };
  },
  
  followCompany: async (_company: DreamCompany) => {
    return { success: true };
  }
};
