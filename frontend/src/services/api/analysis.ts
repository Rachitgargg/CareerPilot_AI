import { apiFetch } from './api';

export interface AtsAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

export interface SkillsGap {
  existing_skills: string[];
  missing_skills: string[];
  priority_skills: string[];
}

export interface ProjectRecommendation {
  title: string;
  description: string;
  difficulty: string; // "Beginner" | "Intermediate" | "Advanced"
  skills: string[];
  estimated_hours: number;
}

export interface RoadmapMilestone {
  title: string;
  description: string;
  duration: string;
  skills: string[];
}

export interface LearningRoadmap {
  next_30_days: RoadmapMilestone[];
  next_90_days: RoadmapMilestone[];
  long_term: RoadmapMilestone[];
}

export interface MasterAnalysisResponse {
  career_summary: string;
  ats_analysis: AtsAnalysis;
  skills_gap: SkillsGap;
  project_recommendations: ProjectRecommendation[];
  learning_roadmap: LearningRoadmap;
  career_recommendations: string[];
}

export async function fetchMasterAnalysis(): Promise<MasterAnalysisResponse> {
  return await apiFetch<MasterAnalysisResponse>('/api/v1/analysis/{session_id}', {
    method: 'POST',
  });
}
