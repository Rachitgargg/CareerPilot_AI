import { fetchInterviewPrep } from './api/interview';
import type { InterviewQuestion } from '@/types';
import { INTERVIEW_QUESTIONS } from './mockData';
import { getSessionId } from './api/api';

export const interviewService = {
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
          tip: `Rationale: ${q.rationale}\n\nSuggested STAR Answer:\n${q.suggested_answer}`
        });
      });
      
      report.behavioral_questions.forEach((q, idx) => {
        list.push({
          id: `beh-${idx}`,
          category: 'Behavioral',
          question: q.question,
          tip: `Rationale: ${q.rationale}\n\nSuggested STAR Answer:\n${q.suggested_answer}`
        });
      });
      
      report.hr_questions.forEach((q, idx) => {
        list.push({
          id: `hr-${idx}`,
          category: 'Culture Fit',
          question: q.question,
          tip: `Rationale: ${q.rationale}\n\nSuggested STAR Answer:\n${q.suggested_answer}`
        });
      });
      
      return list;
    } catch (e) {
      console.error("Interview API prep call failed:", e);
      return INTERVIEW_QUESTIONS;
    }
  },
  
  startMockSession: async (_role: string) => {
    return { sessionId: `session-${Date.now()}` };
  }
};
