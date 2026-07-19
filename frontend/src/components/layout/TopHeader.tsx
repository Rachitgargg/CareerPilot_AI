import { type ReactNode } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { CURRENT_USER } from '@/services/mockData';

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
        <button
          aria-label="Notifications"
          className="text-primary hover:opacity-80 transition-opacity p-2 relative"
        >
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-background" />
        </button>
        <Avatar src={CURRENT_USER.avatarUrl} alt={CURRENT_USER.name} fallback="A" />
      </div>
    </header>
  );
}
