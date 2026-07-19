import { Lightbulb } from 'lucide-react';
import type { InterviewQuestion } from '@/types';
import { Badge } from '@/components/ui/badge';

export function InterviewQuestionCard({ question }: { question: InterviewQuestion }) {
  return (
    <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-3">
      <Badge variant="default" className="self-start">
        {question.category}
      </Badge>
      <h3 className="font-headline-md text-headline-md text-primary">{question.question}</h3>
      <div className="flex items-start gap-2 bg-butter/40 rounded-xl p-4">
        <Lightbulb size={18} className="text-primary shrink-0 mt-0.5" />
        <p className="font-body-md text-body-md text-on-surface-variant">{question.tip}</p>
      </div>
    </div>
  );
}
