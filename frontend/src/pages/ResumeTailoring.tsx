import { useEffect, useState } from 'react';
import type { TailoringSuggestion, ResumeVersion } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { TailoringSuggestionCard } from '@/components/resume/TailoringSuggestionCard';
import { ResumeVersionCard } from '@/components/resume/ResumeVersionCard';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MatchScoreBadge } from '@/components/common/MatchScoreBadge';
import { resumeService } from '@/services/resumeService';
import { tailorResume } from '@/services/api/tailoring';
import type { ResumeTailoringReport } from '@/services/api/tailoring';
import { Loader2 } from 'lucide-react';

export function ResumeTailoring() {
  const [suggestions, setSuggestions] = useState<TailoringSuggestion[]>([]);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [jobDescription, setJobDescription] = useState('');
  const [report, setReport] = useState<ResumeTailoringReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    resumeService.getVersions().then(setVersions);
  }, []);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await tailorResume(jobDescription);
      setReport(res);
      setSuggestions(
        res.bullet_point_improvements.map((b, idx) => ({
          id: `tail-${idx}`,
          original: b.original,
          suggested: b.suggested,
          reason: b.reason,
        }))
      );
    } catch (e: any) {
      setError(e.message || 'Failed to tailor resume. Please check connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
              disabled={isLoading}
            />
            <Button className="self-start" onClick={handleGenerate} disabled={isLoading || !jobDescription.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Generating...
                </>
              ) : (
                'Generate suggestions'
              )}
            </Button>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error rounded-card p-4">
                {error}
              </div>
            )}

            {report && (
              <div className="flex flex-col gap-6">
                {/* Score & Breakdown Row */}
                <div className="bg-surface-container-low rounded-card p-6 flex flex-col gap-4 border border-surface-container-high">
                  <div className="flex items-center gap-3">
                    <span className="font-headline-md text-headline-md text-primary">ATS Score:</span>
                    <MatchScoreBadge score={report.overall_match_score} />
                  </div>
                  <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">{report.breakdown}</p>
                </div>

                {/* Missing Keywords Row */}
                {report.missing_keywords && report.missing_keywords.length > 0 && (
                  <div className="bg-surface-container-low rounded-card p-6 flex flex-col gap-3 border border-surface-container-high">
                    <h4 className="font-headline-md text-headline-md text-primary">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.missing_keywords.map((kw) => (
                        <Badge key={kw} variant="default">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Suggestions Title */}
                <h4 className="font-headline-md text-headline-md text-primary mt-2">Suggested Bullet Rewrites</h4>
                <div className="flex flex-col gap-4">
                  {suggestions.map((s) => (
                    <TailoringSuggestionCard key={s.id} suggestion={s} />
                  ))}
                </div>

                {/* Final Recommendations Row */}
                {report.final_recommendations && (
                  <div className="bg-surface-container-low rounded-card p-6 flex flex-col gap-3 border border-surface-container-high">
                    <h4 className="font-headline-md text-headline-md text-primary">Resume Optimization Advice</h4>
                    <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">
                      {report.final_recommendations}
                    </p>
                  </div>
                )}
              </div>
            )}
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
