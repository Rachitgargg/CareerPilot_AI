import { withLatency } from './apiClient';
import {
  READINESS_METRICS,
  ACTIVITY_ITEMS,
  DASHBOARD_SUGGESTIONS,
  PROJECT_PREVIEWS,
  CURRENT_USER,
} from './mockData';

/**
 * Mock service layer for the Career Dashboard screen.
 * Swap the bodies of these functions for real `fetch`/`axios` calls
 * against a FastAPI backend without touching consuming components.
 */
export const dashboardService = {
  getReadinessMetrics: () => withLatency(READINESS_METRICS),
  getRecentActivity: () => withLatency(ACTIVITY_ITEMS),
  getSuggestions: () => withLatency(DASHBOARD_SUGGESTIONS),
  getProjectPreviews: () => withLatency(PROJECT_PREVIEWS),
  getCurrentUser: () => withLatency(CURRENT_USER),
};
