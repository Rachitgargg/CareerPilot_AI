import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Map,
  Presentation,
  FileText,
  MessageSquare,
  BarChart3,
  UserCircle,
  Settings,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const primaryNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', path: '/jobs', icon: Briefcase },
  { label: 'Projects', path: '/projects', icon: FolderKanban },
  { label: 'Roadmap', path: '/roadmap', icon: Map },
  { label: 'Interview Prep', path: '/interview-prep', icon: Presentation },
  { label: 'Resume Tailoring', path: '/resume-tailoring', icon: FileText },
  { label: 'Chat', path: '/chat', icon: MessageSquare },
  { label: 'Tracker', path: '/tracker', icon: BarChart3 },
];

export const secondaryNavItems: NavItem[] = [
  { label: 'Profile', path: '/profile', icon: UserCircle },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const mobileNavItems: NavItem[] = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', path: '/jobs', icon: Briefcase },
  { label: 'Chat', path: '/chat', icon: MessageSquare },
  { label: 'Profile', path: '/profile', icon: UserCircle },
];
