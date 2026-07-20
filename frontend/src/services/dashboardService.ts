import { fetchMasterAnalysis } from './api/analysis';
import type { MasterAnalysisResponse } from './api/analysis';
import { getSessionId } from './api/api';
import { READINESS_METRICS, ACTIVITY_ITEMS, DASHBOARD_SUGGESTIONS, PROJECT_PREVIEWS, CURRENT_USER } from './mockData';
import type { ReadinessMetric, ActivityItem, Suggestion, ProjectPreview } from '@/types';

// Simple in-memory cache to prevent duplicate requests on component re-renders
let cachedAnalysis: MasterAnalysisResponse | null = null;

export const dashboardService = {
  getReadinessMetrics: async (): Promise<ReadinessMetric[]> => {
    const sessionId = getSessionId();
    if (!sessionId) return READINESS_METRICS;
    try {
      if (!cachedAnalysis) {
        cachedAnalysis = await fetchMasterAnalysis();
      }
      return [
        { id: 'ready', label: 'Ready Score', value: cachedAnalysis.ats_analysis.score, accent: 'sage' as const },
        { id: 'ats', label: 'ATS Match', value: cachedAnalysis.ats_analysis.score, accent: 'blush' as const },
        { id: 'health', label: 'Net Health', value: 90, accent: 'lavender' as const },
        { id: 'profile', label: 'Profile Depth', value: 85, accent: 'butter' as const },
      ];
    } catch (e) {
      console.error("Dashboard metrics API failed, using fallback:", e);
      return READINESS_METRICS;
    }
  },
  
  getRecentActivity: async (): Promise<ActivityItem[]> => {
    return ACTIVITY_ITEMS;
  },
  
  getSuggestions: async (): Promise<Suggestion[]> => {
    const sessionId = getSessionId();
    if (!sessionId) return DASHBOARD_SUGGESTIONS;
    try {
      if (!cachedAnalysis) {
        cachedAnalysis = await fetchMasterAnalysis();
      }
      return cachedAnalysis.ats_analysis.improvements.slice(0, 4).map((imp, idx) => ({
        id: `sug-${idx}`,
        message: imp,
        actionLabel: 'Details',
      }));
    } catch (e) {
      return DASHBOARD_SUGGESTIONS;
    }
  },
  
  getProjectPreviews: async (): Promise<ProjectPreview[]> => {
    const sessionId = getSessionId();
    if (!sessionId) return PROJECT_PREVIEWS;
    try {
      if (!cachedAnalysis) {
        cachedAnalysis = await fetchMasterAnalysis();
      }
      return cachedAnalysis.project_recommendations.slice(0, 1).map((proj, idx) => ({
        id: `proj-${idx}`,
        name: proj.title,
        status: 'Recommended',
        tasksLeft: proj.estimated_hours ? Math.ceil(proj.estimated_hours / 5) : 3,
        progress: 25,
      }));
    } catch (e) {
      return PROJECT_PREVIEWS;
    }
  },
  
  getCurrentUser: async () => {
    return CURRENT_USER;
  },
  
  clearCache: () => {
    cachedAnalysis = null;
  }
};
