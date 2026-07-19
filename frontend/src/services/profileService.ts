import { withLatency } from './apiClient';
import { CURRENT_USER, EXPERIENCE_ENTRIES, EDUCATION_ENTRIES, NOTIFICATION_PREFERENCES } from './mockData';
import type { User } from '@/types';

export const profileService = {
  getProfile: () => withLatency(CURRENT_USER),
  getExperience: () => withLatency(EXPERIENCE_ENTRIES),
  getEducation: () => withLatency(EDUCATION_ENTRIES),
  updateProfile: (_updates: Partial<User>) => withLatency({ success: true }),
};

export const settingsService = {
  getPrivacyPreferences: () => withLatency(NOTIFICATION_PREFERENCES),
  updatePreference: (_id: string, _enabled: boolean) => withLatency({ success: true }),
  exportData: () => withLatency({ success: true }),
  deleteAccount: () => withLatency({ success: true }),
};
