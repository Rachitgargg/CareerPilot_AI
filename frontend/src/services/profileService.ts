import { fetchProfile, saveProfile } from './api/profile';
import type { BackendCareerProfile } from './api/profile';
import type { User, ExperienceEntry, EducationEntry } from '@/types';
import { NOTIFICATION_PREFERENCES } from './mockData';
import { withLatency } from './apiClient';

let cachedProfile: BackendCareerProfile | null = null;

const getOrFetchProfile = async (): Promise<BackendCareerProfile> => {
  if (cachedProfile) return cachedProfile;
  try {
    const res = await fetchProfile();
    cachedProfile = res;
    return res;
  } catch (e) {
    // Return a default blank profile structure if fetch fails or session isn't loaded
    const defaultProfile: BackendCareerProfile = {
      personal: { name: 'User Profile', location: 'Not Specified' },
      education: [],
      experience: [],
      projects: [],
      skills: { programming_languages: [], frameworks: [], tools: [], databases: [], ai_ml_skills: [] },
      summary: 'Add a bio to get started...',
    };
    cachedProfile = defaultProfile;
    return defaultProfile;
  }
};

export const profileService = {
  getProfile: async (): Promise<User> => {
    const prof = await getOrFetchProfile();
    return {
      id: 'user-profile',
      name: prof.personal.name || 'User Profile',
      email: prof.personal.email || '',
      avatarUrl: '',
      title: prof.experience[0]?.role || prof.career_interests?.[0] || 'Career Seeker',
      location: prof.personal.location || 'Not Specified',
      bio: prof.summary || 'Add a bio to get started...',
      yearsExperience: prof.experience.length * 2 || 0,
    };
  },

  getExperience: async (): Promise<ExperienceEntry[]> => {
    const prof = await getOrFetchProfile();
    return prof.experience.map((exp, idx) => ({
      id: `exp-${idx}`,
      role: exp.role || '',
      company: exp.company || '',
      period: exp.duration || '',
      description: exp.description || '',
    }));
  },

  getEducation: async (): Promise<EducationEntry[]> => {
    const prof = await getOrFetchProfile();
    return prof.education.map((edu, idx) => ({
      id: `edu-${idx}`,
      school: edu.institution || '',
      degree: edu.degree || edu.field || '',
      period: edu.start_year && edu.end_year ? `${edu.start_year} - ${edu.end_year}` : edu.start_year || edu.end_year || '',
    }));
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const prof = await getOrFetchProfile();
    if (updates.name !== undefined) prof.personal.name = updates.name;
    if (updates.location !== undefined) prof.personal.location = updates.location;
    if (updates.bio !== undefined) prof.summary = updates.bio;
    if (updates.email !== undefined) prof.personal.email = updates.email;
    
    const saved = await saveProfile(prof);
    cachedProfile = saved;
    
    return {
      id: 'user-profile',
      name: saved.personal.name || '',
      email: saved.personal.email || '',
      avatarUrl: '',
      title: saved.experience[0]?.role || saved.career_interests?.[0] || 'Career Seeker',
      location: saved.personal.location || '',
      bio: saved.summary || '',
      yearsExperience: saved.experience.length * 2 || 0,
    };
  },

  updateFullProfile: async (
    userUpdates: Partial<User>,
    expUpdates: ExperienceEntry[],
    eduUpdates: EducationEntry[]
  ): Promise<void> => {
    const prof = await getOrFetchProfile();
    
    // 1. Update personal info
    if (userUpdates.name !== undefined) prof.personal.name = userUpdates.name;
    if (userUpdates.location !== undefined) prof.personal.location = userUpdates.location;
    if (userUpdates.bio !== undefined) prof.summary = userUpdates.bio;
    
    // 2. Map experience back
    prof.experience = expUpdates.map(e => ({
      company: e.company,
      role: e.role,
      duration: e.period,
      description: e.description,
      technologies: [],
    }));
    
    // 3. Map education back
    prof.education = eduUpdates.map(e => {
      const parts = e.period.split('-');
      const start_year = parts[0]?.trim() || '';
      const end_year = parts[1]?.trim() || '';
      return {
        institution: e.school,
        degree: e.degree,
        start_year,
        end_year,
      };
    });
    
    const saved = await saveProfile(prof);
    cachedProfile = saved;
  }
};

export const settingsService = {
  getPrivacyPreferences: () => withLatency(NOTIFICATION_PREFERENCES),
  updatePreference: (_id: string, _enabled: boolean) => withLatency({ success: true }),
  exportData: () => withLatency({ success: true }),
  deleteAccount: () => withLatency({ success: true }),
};
