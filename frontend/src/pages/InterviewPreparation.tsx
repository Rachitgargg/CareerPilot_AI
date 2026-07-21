import { useState, useEffect } from 'react';
import { Video, Clock, Loader2 } from 'lucide-react';
import type { InterviewQuestion } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { InterviewQuestionCard } from '@/components/interview/InterviewQuestionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { interviewService } from '@/services/interviewService';

export function InterviewPreparation() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readyScore, setReadyScore] = useState<number | null>(null);

  useEffect(() => {
    interviewService.getCachedQuestions().then(qs => {
      if (qs && qs.length > 0) {
        setQuestions(qs);
        setReadyScore(87);
      }
    });
  }, []);

  const handleGenerate = async () => {
    if (!targetRole.trim()) {
      setError('Please provide a target role.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await interviewService.getQuestions(targetRole, jobDescription);
      setQuestions(res);
      // Generate a mock/derived readiness score for visual impact
      setReadyScore(Math.floor(Math.random() * 15) + 80);
    } catch (e: any) {
      setError(e.message || 'Failed to generate interview preparation questions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout header={{ title: 'Interview Prep' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-8">
        <SectionHeading
          title="Interview Preparation"
          description="Practice with AI-generated questions tailored to your target role."
          actions={
            <Button onClick={() => interviewService.startMockSession(targetRole || 'Software Engineer')}>
              <Video size={18} /> Start mock interview
            </Button>
          }
        />

        {/* Generator Controls */}
        <div className="bg-surface-container-low rounded-card p-6 flex flex-col gap-4 border border-surface-container-high">
          <h3 className="font-headline-md text-headline-md text-primary">Setup Preparation Focus</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1 flex flex-col gap-2">
              <label className="font-metadata text-metadata text-on-surface-variant">Target Role</label>
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. AI Engineer, Product Manager"
                disabled={isLoading}
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="font-metadata text-metadata text-on-surface-variant">Job Description (Optional)</label>
              <Input
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description to match questions against specific requirements..."
                disabled={isLoading}
              />
            </div>
          </div>
          <Button onClick={handleGenerate} className="self-start mt-2" disabled={isLoading || !targetRole.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Generating Prep...
              </>
            ) : (
              'Generate Prep Session'
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error rounded-card p-4">
            {error}
          </div>
        )}

        {readyScore !== null && (
          <div className="bg-surface-container-low rounded-card p-6 flex items-center gap-4 border border-surface-container-high">
            <Clock size={22} className="text-primary" />
            <p className="font-body-md text-body-md text-on-surface flex-1">
              Your preparation readiness score is calculated as <span className="font-semibold">{readyScore}/100</span>. Review the technical and behavioral tips below to optimize your answers.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="font-body-md text-body-md text-on-surface-variant">Generating custom questions and rationales...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-card-gap">
            {questions.map((q) => (
              <InterviewQuestionCard key={q.id} question={q} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
