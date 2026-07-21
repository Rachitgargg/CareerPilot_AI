import { useEffect, useState } from 'react';
import type { DreamCompany } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { DreamCompanyCard } from '@/components/jobs/DreamCompanyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { jobsService } from '@/services/jobsService';

export function DreamCompanyTracker() {
  const [companies, setCompanies] = useState<DreamCompany[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');

  useEffect(() => {
    jobsService.getDreamCompanies().then(setCompanies);
  }, []);

  const toggleFollow = (company: DreamCompany) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === company.id ? { ...c, isFollowing: !c.isFollowing } : c))
    );
    jobsService.followCompany(company);
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    const newCompany: DreamCompany = {
      id: `comp-${Date.now()}`,
      name,
      industry: industry.trim() || 'Technology',
      initial: name[0].toUpperCase(),
      matchScore: Math.floor(Math.random() * 15) + 80, // 80-95 match score
      isFollowing: true,
      openRoles: 0
    };
    const updated = (jobsService as any).addDreamCompany(newCompany);
    setCompanies(updated);
    setIsOpen(false);
    // Reset form
    setName('');
    setIndustry('');
  };

  return (
    <AppLayout header={{ title: 'Dream Companies' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-8 max-w-5xl mx-auto w-full">
        <SectionHeading
          title="Dream Company Tracker"
          description="Follow companies you'd love to work for and get notified about new openings."
          actions={
            <Button onClick={() => setIsOpen(true)}>
              <Plus size={18} /> Add company
            </Button>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-card-gap">
          {companies.map((company) => (
            <DreamCompanyCard key={company.id} company={company} onToggleFollow={toggleFollow} />
          ))}
        </div>
      </div>

      {/* Add Company Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div 
            className="bg-surface rounded-panel border border-surface-container-high max-w-md w-full flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-surface-container-high">
              <h3 className="font-headline-md text-headline-md text-primary">Track Dream Company</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
                aria-label="Close form"
              >
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-metadata text-metadata text-on-surface-variant font-bold uppercase tracking-wider">Company Name</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Google, Vercel" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-metadata text-metadata text-on-surface-variant font-bold uppercase tracking-wider">Industry</label>
                <Input 
                  value={industry} 
                  onChange={(e) => setIndustry(e.target.value)} 
                  placeholder="e.g. Artificial Intelligence, Cloud Services" 
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-surface-container-high bg-surface-container-lowest">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!name.trim()}>
                Save Company
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
