import { apiFetch } from './api';

export interface BulletPointImprovement {
  original: string;
  suggested: string;
  reason: string;
}

export interface ResumeTailoringReport {
  overall_match_score: number;
  breakdown: string;
  matching_strengths: string[];
  missing_keywords: string[];
  bullet_point_improvements: BulletPointImprovement[];
  final_recommendations: string;
}

export async function tailorResume(jobDescription: string): Promise<ResumeTailoringReport> {
  return await apiFetch<ResumeTailoringReport>('/api/v1/tailor/{session_id}', {
    method: 'POST',
    body: JSON.stringify({ job_description: jobDescription }),
  });
}
