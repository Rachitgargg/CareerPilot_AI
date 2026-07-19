import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { resumeService } from '@/services/resumeService';

const tips = [
  'Use a standard, single-column layout for best ATS parsing.',
  'Quantify achievements with metrics where possible.',
  'Keep it to 1-2 pages for most experience levels.',
];

export function ResumeUpload() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done'>('idle');
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setStatus('uploading');
    await resumeService.uploadResume(file);
    setStatus('done');
  };

  return (
    <AppLayout header={{ title: 'Upload Resume' }}>
      <div className="flex-1 flex justify-center px-4 md:px-container-padding py-12">
        <div className="w-full max-w-2xl flex flex-col gap-8">
          <div className="text-center">
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
              Let's start with your resume
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">
              Upload your current resume and we'll analyze it for ATS compatibility and tailoring
              opportunities.
            </p>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            onClick={() => inputRef.current?.click()}
            className={`rounded-card border-2 border-dashed p-12 flex flex-col items-center gap-4 cursor-pointer transition-colors ${
              isDragging ? 'border-primary bg-surface-container-low' : 'border-outline-variant'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            {status === 'idle' && (
              <>
                <UploadCloud size={40} className="text-primary" />
                <p className="font-body-md text-body-md text-on-surface-variant text-center">
                  Drag and drop your resume here, or <span className="text-primary underline">browse</span>
                </p>
                <span className="font-metadata text-metadata text-on-surface-variant">PDF, DOC up to 10MB</span>
              </>
            )}
            {status === 'uploading' && (
              <>
                <Loader2 size={32} className="text-primary animate-spin" />
                <p className="font-body-md text-body-md text-on-surface-variant">Analyzing {fileName}...</p>
              </>
            )}
            {status === 'done' && (
              <>
                <CheckCircle2 size={40} className="text-primary" />
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-on-surface-variant" />
                  <p className="font-body-md text-body-md text-on-surface">{fileName}</p>
                </div>
                <span className="font-metadata text-metadata text-on-surface-variant">
                  Uploaded successfully · ATS score 91%
                </span>
              </>
            )}
          </div>

          <div className="bg-surface-container-low rounded-panel p-6">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-3">
              Tips for a strong resume
            </h3>
            <ul className="flex flex-col gap-2">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 font-body-md text-body-md text-on-surface">
                  <CheckCircle2 size={16} className="text-primary shrink-0 mt-1" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Skip for now
            </Button>
            <Button disabled={status !== 'done'} onClick={() => navigate('/dashboard')}>
              Continue to dashboard
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
