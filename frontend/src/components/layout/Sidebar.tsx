import { NavLink } from 'react-router-dom';
import { Plane, Plus } from 'lucide-react';
import { primaryNavItems, secondaryNavItems } from '@/routes/navigation';
import { cn } from '@/utils/cn';

/**
 * Persistent 80px black docked navigation rail shown on desktop viewports.
 * Mirrors the "SideNavBar" shared component from the approved design.
 */
export function Sidebar() {
  return (
    <nav
      className="hidden md:flex fixed left-0 top-0 h-full w-sidebar-width bg-primary flex-col items-center py-8 space-y-6 z-50"
      aria-label="Primary"
    >
      <div className="mb-4 text-on-primary" title="CareerPilot AI">
        <Plane size={32} strokeWidth={2.25} />
      </div>

      <div className="flex-1 flex flex-col items-center space-y-6 overflow-y-auto scrollbar-none w-full">
        {primaryNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            className={({ isActive }) =>
              cn(
                'p-3 rounded-full flex flex-col items-center transition-transform hover:scale-110 active:scale-95',
                isActive
                  ? 'bg-surface-container-highest text-primary'
                  : 'text-on-primary opacity-60 hover:opacity-100'
              )
            }
          >
            <item.icon size={22} />
          </NavLink>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center space-y-6 w-full">
        {secondaryNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            className={({ isActive }) =>
              cn(
                'p-3 rounded-full flex flex-col items-center transition-transform hover:scale-110 active:scale-95',
                isActive
                  ? 'bg-surface-container-highest text-primary'
                  : 'text-on-primary opacity-60 hover:opacity-100'
              )
            }
          >
            <item.icon size={22} />
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

/** Small reusable "add" affordance used inline with the rail on some screens. */
export function SidebarAddButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-on-primary opacity-60 hover:opacity-100 p-3 rounded-full transition-transform hover:scale-110"
      title="Add"
    >
      <Plus size={20} />
    </button>
  );
}
