import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { mobileNavItems } from '@/routes/navigation';
import { cn } from '@/utils/cn';

/**
 * Bottom-fixed navigation shown on small viewports, replacing the docked
 * sidebar per the "Mobile" guidance in the design system.
 */
export function MobileBottomNav() {
  const [first, second, third, fourth] = mobileNavItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-surface-variant flex justify-around items-center h-16 z-50 px-2">
      <MobileNavLink item={first} />
      <MobileNavLink item={second} />
      <NavLink
        to="/resume-upload"
        className="flex flex-col items-center justify-center w-full h-full relative -top-4"
      >
        <div className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
          <Plus size={22} />
        </div>
      </NavLink>
      <MobileNavLink item={fourth} />
      <MobileNavLink item={third} />
    </nav>
  );
}

function MobileNavLink({ item }: { item: (typeof mobileNavItems)[number] }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center w-full h-full transition-colors',
          isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
        )
      }
    >
      <item.icon size={22} />
      <span className="font-label-caps text-[10px] mt-1">{item.label}</span>
    </NavLink>
  );
}
