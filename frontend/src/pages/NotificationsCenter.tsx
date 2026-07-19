import { useEffect, useState } from 'react';
import { Briefcase, Map, MessageSquare, Bell } from 'lucide-react';
import type { NotificationItem } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { notificationsService } from '@/services/notificationsService';
import { cn } from '@/utils/cn';

const categoryIcon = {
  job: Briefcase,
  system: Map,
  ai: MessageSquare,
  reminder: Bell,
};

function groupByDay(items: NotificationItem[]) {
  // Mock data is pre-sorted into "Today" / "Yesterday" for simplicity.
  return {
    Today: items.slice(0, 2),
    Yesterday: items.slice(2),
  };
}

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    notificationsService.getNotifications().then(setNotifications);
  }, []);

  const grouped = groupByDay(notifications);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationsService.markAllRead();
  };

  return (
    <AppLayout header={{ title: 'Notifications' }}>
      <div className="px-4 md:px-container-padding py-12 flex justify-center">
        <div className="w-full max-w-3xl flex flex-col gap-8">
          <div className="flex justify-between items-end border-b border-surface-variant pb-4">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Notifications</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Stay updated on your career journey.
              </p>
            </div>
            <button
              onClick={markAllRead}
              className="font-metadata text-metadata text-primary hover:underline transition-all"
            >
              Mark all as read
            </button>
          </div>

          <div className="flex flex-col gap-section-margin">
            {Object.entries(grouped).map(
              ([label, items]) =>
                items.length > 0 && (
                  <section key={label} className="flex flex-col gap-4">
                    <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest border-l-4 border-primary pl-4 py-1">
                      {label}
                    </h2>
                    <div className="flex flex-col gap-2">
                      {items.map((item) => {
                        const Icon = categoryIcon[item.category];
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              'rounded-3xl p-6 flex gap-6 items-start relative overflow-hidden group cursor-pointer border transition-shadow hover:shadow-[0_20px_40px_-15px_rgba(26,26,26,0.05)]',
                              item.read
                                ? 'bg-surface-container-lowest border-surface-variant/50'
                                : 'bg-secondary-container/30 border-transparent'
                            )}
                          >
                            {!item.read && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-3xl" />
                            )}
                            <div
                              className={cn(
                                'w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10',
                                item.read ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary text-on-primary'
                              )}
                            >
                              <Icon size={20} />
                            </div>
                            <div
                              className={cn(
                                'flex-1 flex flex-col gap-1 z-10',
                                item.read && 'opacity-70 group-hover:opacity-100 transition-opacity'
                              )}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <h3
                                  className={cn(
                                    'leading-tight',
                                    item.read
                                      ? 'font-body-lg text-body-lg font-medium text-on-surface'
                                      : 'font-headline-md text-[20px] font-semibold text-on-surface'
                                  )}
                                >
                                  {item.title}
                                </h3>
                                <span className="font-metadata text-metadata text-on-surface-variant whitespace-nowrap">
                                  {item.timestamp}
                                </span>
                              </div>
                              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
