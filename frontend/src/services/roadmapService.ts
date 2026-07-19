import { withLatency } from './apiClient';
import { ROADMAP_MILESTONES, PROJECT_RECOMMENDATIONS } from './mockData';

export const roadmapService = {
  getMilestones: () => withLatency(ROADMAP_MILESTONES),
  getProjectRecommendations: () => withLatency(PROJECT_RECOMMENDATIONS),
};
