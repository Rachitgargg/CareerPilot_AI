import { useEffect, useState } from 'react';
import { Video, Clock } from 'lucide-react';
import type { InterviewQuestion } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { InterviewQuestionCard } from '@/components/interview/InterviewQuestionCard';
import { Button } from '@/components/ui/button';
import { interviewService } from '@/services/interviewService';

export function InterviewPreparation() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

  useEffect(() => {
    interviewService.getQuestions().then(setQuestions);
  }, []);

  return (
    <AppLayout header={{ title: 'Interview Prep' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-8">
        <SectionHeading
          title="Interview Preparation"
          description="Practice with AI-generated questions tailored to your target role."
          actions={
            <Button onClick={() => interviewService.startMockSession('Senior PM')}>
              <Video size={18} /> Start mock interview
            </Button>
          }
        />

        <div className="bg-surface-container-low rounded-card p-6 flex items-center gap-4">
          <Clock size={22} className="text-primary" />
          <p className="font-body-md text-body-md text-on-surface">
            Your last session scored <span className="font-semibold">82/100</span>. Focus on conciseness in
            behavioral answers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-card-gap">
          {questions.map((q) => (
            <InterviewQuestionCard key={q.id} question={q} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
