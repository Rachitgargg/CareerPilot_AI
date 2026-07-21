import { fetchMasterAnalysis } from './api/analysis';
import type { MasterAnalysisResponse } from './api/analysis';
import { getSessionId } from './api/api';
import type { RoadmapMilestone, ProjectRecommendation } from '@/types';
import { ROADMAP_MILESTONES, PROJECT_RECOMMENDATIONS } from './mockData';

let cachedAnalysis: MasterAnalysisResponse | null = null;

const getOrFetchAnalysis = async (): Promise<MasterAnalysisResponse> => {
  if (cachedAnalysis) return cachedAnalysis;
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error('No session ID found');
  }
  const res = await fetchMasterAnalysis();
  cachedAnalysis = res;
  return res;
};

export const roadmapService = {
  getMilestones: async (): Promise<RoadmapMilestone[]> => {
    try {
      const analysis = await getOrFetchAnalysis();
      const roadmap = analysis.learning_roadmap;
      const priority = analysis.skills_gap.priority_skills || [];
      const missing = analysis.skills_gap.missing_skills || [];
      
      return [
        {
          id: 'm1',
          title: 'First 30 Days',
          duration: 'Month 1',
          status: 'in-progress' as const,
          skills: priority.slice(0, 3),
          description: roadmap.next_30_days.map(item => `• ${item}`).join('\n\n'),
        },
        {
          id: 'm2',
          title: 'Next 90 Days',
          duration: 'Months 2-3',
          status: 'locked' as const,
          skills: missing.slice(0, 3),
          description: roadmap.next_90_days.map(item => `• ${item}`).join('\n\n'),
        },
        {
          id: 'm3',
          title: 'Long Term Plan',
          duration: 'Month 4+',
          status: 'locked' as const,
          skills: missing.slice(3, 6),
          description: roadmap.long_term.map(item => `• ${item}`).join('\n\n'),
        }
      ];
    } catch (e) {
      console.error('Roadmap milestones API failed, using fallback:', e);
      return ROADMAP_MILESTONES;
    }
  },

  getProjectRecommendations: async (): Promise<ProjectRecommendation[]> => {
    try {
      const analysis = await getOrFetchAnalysis();
      return analysis.project_recommendations.map((proj, idx) => {
        let diff: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
        if (proj.difficulty === 'Beginner' || proj.difficulty === 'Advanced') {
          diff = proj.difficulty;
        }
        return {
          id: `proj-rec-${idx}`,
          title: proj.title,
          description: `${proj.description}\n\n💡 Curriculum Guide: ${proj.reason}`,
          difficulty: diff,
          skills: proj.technologies,
          imageUrl: '',
          estimatedHours: proj.difficulty === 'Beginner' ? 20 : proj.difficulty === 'Intermediate' ? 40 : 80,
        };
      });
    } catch (e) {
      console.error('Project recommendations API failed, using fallback:', e);
      // Map mock data type correctly
      return PROJECT_RECOMMENDATIONS.map(p => ({
        ...p,
        difficulty: p.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
      }));
    }
  },

  clearCache: () => {
    cachedAnalysis = null;
  }
};
