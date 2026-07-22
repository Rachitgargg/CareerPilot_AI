import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const footerLinks = [
  { label: 'Privacy Policy' },
  { label: 'Terms of Service' },
  { label: 'Help Center' },
  { label: 'Career Blog' },
];

const modalContent: Record<string, { title: string; body: string }> = {
  'Privacy Policy': {
    title: 'Privacy Policy',
    body: 'Your trust is our priority. CareerPilot AI processes your uploaded resumes and profiles in-memory. Resumes are parsed exactly once, and temporary PDF uploads are deleted immediately after data extraction. We leverage Groq for LLM analysis and Google Gemini for embeddings. No personal data is persisted beyond your session ID folder, and we never share or sell user information.',
  },
  'Terms of Service': {
    title: 'Terms of Service',
    body: 'By using CareerPilot AI, you agree to upload only files and resumes that you own or have the explicit rights to use. The ATS career scores, recommended projects, and roadmap milestones are generated dynamically by artificial intelligence to assist you in preparing for applications. They do not guarantee job placement or career outcomes.',
  },
  'Help Center': {
    title: 'Help Center & FAQ',
    body: 'Welcome to the Help Center! Here are quick guides to help you use CareerPilot AI:\n\n• Starting a Project: Head to the "Projects" tab, choose a tailored project recommendation, and click "Start Project" to initialize milestones.\n• Updating Your Resume: Click the "Re-upload Resume" button in the navigation header to clear current session details and upload a new file.\n• Application Tracker: Move jobs dynamically across stages (Saved, Applied, Interviewing, Offer) by clicking the cards to edit status.',
  },
  'Career Blog': {
    title: 'Career Development Blog',
    body: 'Latest Insights for Software & AI Engineers:\n\n1. "Mastering the AI Engineering Interview Stack" — study core FastAPI, ChromaDB, and prompt design strategies.\n2. "How to Close Skills Gaps Fast" — using structured roadmap checkmarks to guide weekend learning targets.\n3. "The Power of Resume Tailoring" — why matching bullet points to corporate portals boosts ATS rankings.',
  },
};

export function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const content = activeModal ? modalContent[activeModal] : null;

  return (
    <>
      <footer className="bg-surface-container-low w-full py-12 px-4 md:px-container-padding flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
        <div className="text-center md:text-left">
          <span className="font-headline-md text-headline-md text-primary">CareerPilot AI</span>
          <p className="font-metadata text-metadata text-on-surface-variant mt-2">
            © 2026 CareerPilot AI. All rights reserved.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6">
          {footerLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => setActiveModal(link.label)}
              className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>
      </footer>

      {/* Info Dialog Modal */}
      {content && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-surface rounded-panel border border-surface-container-high max-w-md w-full flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-surface-container-high">
              <h3 className="font-headline-md text-headline-md text-primary">{content.title}</h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                {content.body}
              </p>
            </div>

            <div className="flex justify-end p-6 border-t border-surface-container-high bg-surface-container-lowest">
              <Button onClick={() => setActiveModal(null)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
