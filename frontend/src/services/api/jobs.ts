import { apiFetch } from './api';

export interface RecommendedJob {
  title: string;
  company: string;
  location: string;
  match_score: number;
  why_this_matches: string;
  matching_strengths: string[];
  matching_skills: string[];
  missing_skills: string[];
  learning_recommendations: string[];
  application_priority: string;
  url: string;
}

export interface JobDiscoveryResponse {
  recommended_jobs: RecommendedJob[];
  career_summary: string;
  overall_recommendation: string;
}

export async function fetchRecommendedJobs(preferredRole?: string, location?: string): Promise<JobDiscoveryResponse> {
  return await apiFetch<JobDiscoveryResponse>('/api/v1/jobs/{session_id}', {
    method: 'POST',
    body: JSON.stringify({
      preferred_role: preferredRole || null,
      location: location || null,
    }),
  });
}
