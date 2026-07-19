import { useEffect, useState } from 'react';
import type { DreamCompany } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { DreamCompanyCard } from '@/components/jobs/DreamCompanyCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { jobsService } from '@/services/jobsService';

export function DreamCompanyTracker() {
  const [companies, setCompanies] = useState<DreamCompany[]>([]);

  useEffect(() => {
    jobsService.getDreamCompanies().then(setCompanies);
  }, []);

  const toggleFollow = (company: DreamCompany) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === company.id ? { ...c, isFollowing: !c.isFollowing } : c))
    );
    jobsService.followCompany(company);
  };

  return (
    <AppLayout header={{ title: 'Dream Companies' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-8">
        <SectionHeading
          title="Dream Company Tracker"
          description="Follow companies you'd love to work for and get notified about new openings."
          actions={
            <Button>
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
    </AppLayout>
  );
}
