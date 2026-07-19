import { withLatency } from './apiClient';
import { RESUME_VERSIONS, TAILORING_SUGGESTIONS } from './mockData';

export const resumeService = {
  getVersions: () => withLatency(RESUME_VERSIONS),
  getTailoringSuggestions: () => withLatency(TAILORING_SUGGESTIONS),
  uploadResume: (_file: File) => withLatency({ success: true, atsScore: 91 }, 900),
};
