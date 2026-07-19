import { withLatency } from './apiClient';
import { TIMELINE_EVENTS } from './mockData';

export const timelineService = {
  getEvents: () => withLatency(TIMELINE_EVENTS),
};
