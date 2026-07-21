// ---------------------------------------------------------------------------
// User & Profile
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  title: string;
  location: string;
  bio: string;
  yearsExperience: number;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: 'link' | 'linkedin' | 'github' | 'twitter';
}

export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  period: string;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface ReadinessMetric {
  id: string;
  label: string;
  value: number; // percent 0-100
  accent: 'sage' | 'blush' | 'lavender' | 'butter';
}

export interface ActivityItem {
  id: string;
  label: string;
  timestamp: string;
  icon: 'description' | 'bookmark' | 'check' | 'flag';
  isPrimary?: boolean;
}

export interface Suggestion {
  id: string;
  message: string;
  actionLabel: string;
}

export interface ProjectPreview {
  id: string;
  name: string;
  status: string;
  tasksLeft: number;
  progress: number;
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export type ApplicationStage = 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyInitial: string;
  location: string;
  remote: boolean;
  salaryRange: string;
  matchScore: number;
  tags: string[];
  postedAt: string;
  description: string;
  stage?: ApplicationStage;
  url?: string;
}

export interface DreamCompany {
  id: string;
  name: string;
  initial: string;
  industry: string;
  openRoles: number;
  matchScore: number;
  isFollowing: boolean;
}

// ---------------------------------------------------------------------------
// Resume
// ---------------------------------------------------------------------------

export interface ResumeVersion {
  id: string;
  name: string;
  updatedAt: string;
  atsScore: number;
  isActive: boolean;
}

export interface ResumeIssue {
  id: string;
  severity: 'warning' | 'error';
  message: string;
}

export interface TailoringSuggestion {
  id: string;
  original: string;
  suggested: string;
  reason: string;
  accepted?: boolean;
}

// ---------------------------------------------------------------------------
// Learning roadmap
// ---------------------------------------------------------------------------

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'locked';
  duration: string;
  skills: string[];
}

export interface ProjectRecommendation {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  imageUrl: string;
  estimatedHours: number;
}

export interface ProjectCheckpoint {
  id: string;
  label: string;
  completed: boolean;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  checkpoints: ProjectCheckpoint[];
}

export interface ActiveProject {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  technologies: string[];
  status: 'idle' | 'in_progress' | 'completed';
  milestones: ProjectMilestone[];
}

// ---------------------------------------------------------------------------
// Interview preparation
// ---------------------------------------------------------------------------

export interface InterviewQuestion {
  id: string;
  category: 'Behavioral' | 'Technical' | 'System Design' | 'Culture Fit';
  question: string;
  tip: string;
}

export interface MockInterviewSession {
  id: string;
  role: string;
  company: string;
  date: string;
  score: number;
  duration: string;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSuggestionChip {
  id: string;
  label: string;
}

// ---------------------------------------------------------------------------
// Career timeline
// ---------------------------------------------------------------------------

export interface TimelineEvent {
  id: string;
  title: string;
  organization: string;
  period: string;
  type: 'role' | 'education' | 'certification' | 'achievement';
  description: string;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'job' | 'ai' | 'system' | 'reminder';
  read: boolean;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface ConnectedAccount {
  id: string;
  name: string;
  connected: boolean;
  icon: 'link' | 'database';
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}
