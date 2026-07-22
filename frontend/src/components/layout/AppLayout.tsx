import { type ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Footer } from './Footer';
import { FloatingChatButton } from './FloatingChatButton';
import { TopHeader, type TopHeaderProps } from './TopHeader';
import { getSessionId } from '@/services/api/api';

export interface AppLayoutProps {
  children: ReactNode;
  header?: TopHeaderProps;
  hideFooter?: boolean;
  hideChatButton?: boolean;
  /** Disable outer scroll + footer for full-bleed screens like Chat */
  fullBleed?: boolean;
  contentClassName?: string;
}

/**
 * Shared shell for every authenticated screen: docked sidebar (desktop),
 * sticky top header, main content region, footer, and mobile bottom nav.
 */
export function AppLayout({
  children,
  header,
  hideFooter = false,
  hideChatButton = false,
  fullBleed = false,
  contentClassName = '',
}: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const sessionId = getSessionId();
    const publicPaths = ['/', '/onboarding', '/resume-upload'];
    if (!sessionId && !publicPaths.includes(location.pathname)) {
      navigate('/resume-upload');
    }
  }, [location.pathname, navigate]);
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col md:ml-sidebar-width min-h-screen ${
          fullBleed ? 'h-screen overflow-hidden' : ''
        }`}
      >
        <TopHeader {...header} />
        <main className={`flex-1 flex flex-col ${contentClassName}`}>{children}</main>
        {!hideFooter && !fullBleed && <Footer />}
      </div>
      <MobileBottomNav />
      {!hideChatButton && <FloatingChatButton />}
    </div>
  );
}
