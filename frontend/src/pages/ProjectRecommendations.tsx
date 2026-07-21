import { useEffect, useState } from 'react';
import type { ProjectRecommendation, ActiveProject } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProjectRecommendationCard } from '@/components/roadmap/ProjectRecommendationCard';
import { roadmapService } from '@/services/roadmapService';

export function ProjectRecommendations() {
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);

  useEffect(() => {
    roadmapService.getProjectRecommendations().then(setProjects);
    roadmapService.getActiveProjects().then(setActiveProjects);
  }, []);

  const handleStart = async (rec: ProjectRecommendation) => {
    const updated = await roadmapService.startProject(rec);
    setActiveProjects(updated);
  };

  const handleToggleCheckpoint = async (projectId: string, checkpointId: string, completed: boolean) => {
    const updated = await roadmapService.updateCheckpoint(projectId, checkpointId, completed);
    setActiveProjects(updated);
  };

  return (
    <AppLayout header={{ title: 'Projects' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-8">
        <SectionHeading
          title="Recommended Projects"
          description="Hands-on projects curated to close the specific skill gaps in your roadmap."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-card-gap">
          {projects.map((project) => {
            const active = activeProjects.find((ap) => ap.id === project.id);
            return (
              <ProjectRecommendationCard
                key={project.id}
                project={project}
                activeProject={active}
                onStart={() => handleStart(project)}
                onToggleCheckpoint={(cpId, checked) => handleToggleCheckpoint(project.id, cpId, checked)}
              />
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
