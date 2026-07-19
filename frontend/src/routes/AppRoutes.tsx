import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { OnboardingWizard } from '@/pages/OnboardingWizard';
import { ResumeUpload } from '@/pages/ResumeUpload';
import { CareerDashboard } from '@/pages/CareerDashboard';
import { JobDiscovery } from '@/pages/JobDiscovery';
import { ProjectRecommendations } from '@/pages/ProjectRecommendations';
import { LearningRoadmap } from '@/pages/LearningRoadmap';
import { InterviewPreparation } from '@/pages/InterviewPreparation';
import { ResumeTailoring } from '@/pages/ResumeTailoring';
import { AIChat } from '@/pages/AIChat';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import { ApplicationTracker } from '@/pages/ApplicationTracker';
import { DreamCompanyTracker } from '@/pages/DreamCompanyTracker';
import { CareerTimeline } from '@/pages/CareerTimeline';
import { NotificationsCenter } from '@/pages/NotificationsCenter';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingWizard />} />
      <Route path="/resume-upload" element={<ResumeUpload />} />
      <Route path="/dashboard" element={<CareerDashboard />} />
      <Route path="/jobs" element={<JobDiscovery />} />
      <Route path="/projects" element={<ProjectRecommendations />} />
      <Route path="/roadmap" element={<LearningRoadmap />} />
      <Route path="/interview-prep" element={<InterviewPreparation />} />
      <Route path="/resume-tailoring" element={<ResumeTailoring />} />
      <Route path="/chat" element={<AIChat />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/tracker" element={<ApplicationTracker />} />
      <Route path="/dream-companies" element={<DreamCompanyTracker />} />
      <Route path="/timeline" element={<CareerTimeline />} />
      <Route path="/notifications" element={<NotificationsCenter />} />
    </Routes>
  );
}
