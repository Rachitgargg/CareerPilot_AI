import { uploadResumeFile } from './api/upload';
import { RESUME_VERSIONS, TAILORING_SUGGESTIONS } from './mockData';
import { withLatency } from './apiClient';

export const resumeService = {
  getVersions: () => withLatency(RESUME_VERSIONS),
  getTailoringSuggestions: () => withLatency(TAILORING_SUGGESTIONS),
  uploadResume: async (file: File) => {
    return await uploadResumeFile(file);
  },
};
