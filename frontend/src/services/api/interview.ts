import { apiFetch } from './api';

export interface InterviewQuestion {
  question: string;
  rationale: string;
  suggested_answer: string;
  focus_area: string;
}

export interface PreparationPlan {
  "30_minutes": string[];
  "1_day": string[];
  "1_week": string[];
}

export interface InterviewCoachReport {
  role: string;
  difficulty: string;
  readiness_score: number;
  strengths: string[];
  weaknesses: string[];
  focus_areas: string[];
  technical_questions: InterviewQuestion[];
  behavioral_questions: InterviewQuestion[];
  hr_questions: InterviewQuestion[];
  coding_topics: string[];
  preparation_plan: PreparationPlan;
  confidence_score: number;
}

export async function fetchInterviewPrep(targetRole: string, jobDescription?: string): Promise<InterviewCoachReport> {
  return await apiFetch<InterviewCoachReport>('/api/v1/interview/{session_id}', {
    method: 'POST',
    body: JSON.stringify({
      target_role: targetRole,
      job_description: jobDescription || null,
    }),
  });
}
