import { withLatency } from './apiClient';
import { INTERVIEW_QUESTIONS } from './mockData';

export const interviewService = {
  getQuestions: () => withLatency(INTERVIEW_QUESTIONS),
  startMockSession: (_role: string) => withLatency({ sessionId: 'session-mock-1' }),
};
