import { useEffect, useState } from 'react';
import type { TailoringSuggestion, ResumeVersion } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { TailoringSuggestionCard } from '@/components/resume/TailoringSuggestionCard';
import { ResumeVersionCard } from '@/components/resume/ResumeVersionCard';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { resumeService } from '@/services/resumeService';

export function ResumeTailoring() {
  const [suggestions, setSuggestions] = useState<TailoringSuggestion[]>([]);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [jobDescription, setJobDescription] = useState('');

  useEffect(() => {
    resumeService.getTailoringSuggestions().then(setSuggestions);
    resumeService.getVersions().then(setVersions);
  }, []);

  return (
    <AppLayout header={{ title: 'Resume Tailoring' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-section-margin">
        <SectionHeading
          title="Tailor your resume"
          description="Paste a job description and let AI rewrite key bullet points to match it."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="min-h-32"
            />
            <Button className="self-start">Generate suggestions</Button>

            <div className="flex flex-col gap-4">
              {suggestions.map((s) => (
                <TailoringSuggestionCard key={s.id} suggestion={s} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-headline-md text-headline-md text-primary">Your versions</h3>
            {versions.map((v) => (
              <ResumeVersionCard key={v.id} version={v} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
