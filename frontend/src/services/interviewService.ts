import { fetchInterviewPrep } from './api/interview';
import type { InterviewQuestion } from '@/types';
import { INTERVIEW_QUESTIONS } from './mockData';
import { getSessionId } from './api/api';

let cachedQuestions: InterviewQuestion[] = [];

export const interviewService = {
  getCachedQuestions: async (): Promise<InterviewQuestion[]> => {
    return cachedQuestions;
  },

  getQuestions: async (targetRole?: string, jobDescription?: string): Promise<InterviewQuestion[]> => {
    const sessionId = getSessionId();
    if (!sessionId) return INTERVIEW_QUESTIONS;
    
    try {
      const role = targetRole || "Software Engineer";
      const report = await fetchInterviewPrep(role, jobDescription);
      
      const list: InterviewQuestion[] = [];
      
      report.technical_questions.forEach((q, idx) => {
        list.push({
          id: `tech-${idx}`,
          category: 'Technical',
          question: q.question,
          tip: `Why it matters: ${(q as any).why_it_matters}\n\nWhat to cover:\n${(q as any).what_to_cover}`
        });
      });
      
      report.behavioral_questions.forEach((q, idx) => {
        list.push({
          id: `beh-${idx}`,
          category: 'Behavioral',
          question: q.question,
          tip: `What the interviewer is looking for:\n${(q as any).what_interviewer_is_looking_for}`
        });
      });
      
      report.hr_questions.forEach((q, idx) => {
        list.push({
          id: `hr-${idx}`,
          category: 'Culture Fit',
          question: q.question,
          tip: `Strategic guidance:\n${(q as any).suggested_answer_direction}`
        });
      });
      
      cachedQuestions = list;
      return list;
    } catch (e) {
      console.error("Interview API prep call failed:", e);
      return INTERVIEW_QUESTIONS;
    }
  },
  
  startMockSession: async (_role: string) => {
    return { sessionId: `session-${Date.now()}` };
  },

  clearCache: () => {
    cachedQuestions = [];
  }
};
