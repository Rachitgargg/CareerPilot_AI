import { type ReactNode, useState, useEffect } from 'react';
import { Bell, Search, Menu, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { profileService } from '@/services/profileService';
import { dashboardService } from '@/services/dashboardService';
import { roadmapService } from '@/services/roadmapService';
import { interviewService } from '@/services/interviewService';
import { jobsService } from '@/services/jobsService';
import { chatService } from '@/services/chatService';
import { getSessionId } from '@/services/api/api';

export interface TopHeaderProps {
  title?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  actions?: ReactNode;
  onMenuClick?: () => void;
}

/**
 * Sticky top navigation bar. Title defaults to the product name to match
 * the majority of screens; pages like Jobs/Settings pass a page-specific title.
 */
export function TopHeader({
  title = 'CareerPilot AI',
  showSearch = false,
  searchPlaceholder = 'Search...',
  onSearchChange,
  actions,
  onMenuClick,
}: TopHeaderProps) {
  const [initial, setInitial] = useState('U');
  const navigate = useNavigate();
  const hasSession = !!getSessionId();

  useEffect(() => {
    profileService.getProfile().then(u => {
      if (u && u.name) {
        setInitial(u.name[0].toUpperCase());
      }
    }).catch(() => {});
  }, []);

  const handleReupload = () => {
    localStorage.removeItem('careerpilot_session_id');
    dashboardService.clearCache?.();
    roadmapService.clearCache?.();
    interviewService.clearCache?.();
    jobsService.clearCache?.();
    chatService.clearChat?.();
    navigate('/resume-upload');
  };

  return (
    <header className="bg-background flex justify-between items-center w-full h-20 px-4 md:px-container-padding sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-primary p-2 -ml-2"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="font-headline-md text-headline-md text-primary tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="hidden sm:flex relative items-center">
            <Search size={18} className="absolute left-4 text-on-surface-variant pointer-events-none" />
            <input
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="bg-surface-container-highest border-none rounded-full py-2 pl-11 pr-4 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none w-56 lg:w-64 placeholder:text-on-surface-variant transition-all"
            />
          </div>
        )}
        {actions}
        {hasSession && (
          <Button variant="outline" size="sm" onClick={handleReupload} className="mr-2">
            <UploadCloud size={14} className="mr-1" /> Re-upload Resume
          </Button>
        )}
        <button
          aria-label="Notifications"
          className="text-primary hover:opacity-80 transition-opacity p-2 relative"
        >
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-background" />
        </button>
        <Avatar src={undefined} alt="User Profile" fallback={initial} />
      </div>
    </header>
  );
}
