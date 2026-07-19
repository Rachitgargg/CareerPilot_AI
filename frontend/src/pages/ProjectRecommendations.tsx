import { useEffect, useState } from 'react';
import type { ProjectRecommendation } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProjectRecommendationCard } from '@/components/roadmap/ProjectRecommendationCard';
import { roadmapService } from '@/services/roadmapService';

export function ProjectRecommendations() {
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);

  useEffect(() => {
    roadmapService.getProjectRecommendations().then(setProjects);
  }, []);

  return (
    <AppLayout header={{ title: 'Projects' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-8">
        <SectionHeading
          title="Recommended Projects"
          description="Hands-on projects curated to close the specific skill gaps in your roadmap."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-card-gap">
          {projects.map((project) => (
            <ProjectRecommendationCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
