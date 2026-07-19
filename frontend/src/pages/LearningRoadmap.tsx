import { useEffect, useState } from 'react';
import type { RoadmapMilestone } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { MilestoneCard } from '@/components/roadmap/MilestoneCard';
import { roadmapService } from '@/services/roadmapService';

export function LearningRoadmap() {
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([]);

  useEffect(() => {
    roadmapService.getMilestones().then(setMilestones);
  }, []);

  const completedCount = milestones.filter((m) => m.status === 'completed').length;

  return (
    <AppLayout header={{ title: 'Learning Roadmap' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-8">
        <SectionHeading
          title="Your Learning Roadmap"
          description={`${completedCount} of ${milestones.length} stages completed. Keep building toward Senior UX Research Lead.`}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-card-gap">
          {milestones.map((milestone) => (
            <MilestoneCard key={milestone.id} milestone={milestone} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
