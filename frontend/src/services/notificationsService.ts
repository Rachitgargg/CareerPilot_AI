import { withLatency } from './apiClient';
import { NOTIFICATIONS } from './mockData';

export const notificationsService = {
  getNotifications: () => withLatency(NOTIFICATIONS),
  markAllRead: () => withLatency({ success: true }),
};
