import { apiFetch } from './api';

export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface EducationEntry {
  institution?: string;
  degree?: string;
  field?: string;
  start_year?: string;
  end_year?: string;
  grade?: string;
}

export interface ExperienceEntry {
  company?: string;
  role?: string;
  duration?: string;
  description?: string;
  technologies?: string[];
}

export interface ProjectEntry {
  name?: string;
  description?: string;
  technologies?: string[];
  links?: string[];
}

export interface SkillsInfo {
  programming_languages?: string[];
  frameworks?: string[];
  tools?: string[];
  databases?: string[];
  ai_ml_skills?: string[];
}

export interface CertificationEntry {
  name?: string;
  issuer?: string;
  year?: string;
}

export interface BackendCareerProfile {
  personal: PersonalInfo;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: SkillsInfo;
  certifications?: CertificationEntry[];
  achievements?: string[];
  career_interests?: string[];
  summary?: string;
}

export async function fetchProfile(): Promise<BackendCareerProfile> {
  return await apiFetch<BackendCareerProfile>('/api/v1/profile/{session_id}', {
    method: 'GET',
  });
}

export async function saveProfile(profile: BackendCareerProfile): Promise<BackendCareerProfile> {
  return await apiFetch<BackendCareerProfile>('/api/v1/profile/{session_id}', {
    method: 'PUT',
    body: JSON.stringify(profile),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
