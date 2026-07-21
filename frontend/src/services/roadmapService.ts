import { fetchMasterAnalysis } from './api/analysis';
import type { MasterAnalysisResponse } from './api/analysis';
import { getSessionId } from './api/api';
import { fetchActiveProjects, saveActiveProjects } from './api/projects';
import type { RoadmapMilestone, ProjectRecommendation, ActiveProject, ProjectMilestone, ProjectCheckpoint } from '@/types';
import { ROADMAP_MILESTONES, PROJECT_RECOMMENDATIONS } from './mockData';

let cachedAnalysis: MasterAnalysisResponse | null = null;
let cachedActiveProjects: ActiveProject[] | null = null;

// Initial load local cache if any
try {
  const saved = localStorage.getItem('careerpilot_active_projects');
  if (saved) {
    cachedActiveProjects = JSON.parse(saved);
  }
} catch (e) {
  console.error('Failed to parse active projects from localStorage:', e);
}

const getOrFetchAnalysis = async (): Promise<MasterAnalysisResponse> => {
  if (cachedAnalysis) return cachedAnalysis;
  const sessionId = getSessionId();
  if (!sessionId) {
    throw new Error('No session ID found');
  }
  const res = await fetchMasterAnalysis();
  cachedAnalysis = res;
  return res;
};

export const roadmapService = {
  getMilestones: async (): Promise<RoadmapMilestone[]> => {
    try {
      const analysis = await getOrFetchAnalysis();
      const roadmap = analysis.learning_roadmap;
      const priority = analysis.skills_gap.priority_skills || [];
      const missing = analysis.skills_gap.missing_skills || [];
      
      return [
        {
          id: 'm1',
          title: 'First 30 Days',
          duration: 'Month 1',
          status: 'in-progress' as const,
          skills: priority.slice(0, 3),
          description: roadmap.next_30_days.map(item => `• ${item}`).join('\n\n'),
        },
        {
          id: 'm2',
          title: 'Next 90 Days',
          duration: 'Months 2-3',
          status: 'locked' as const,
          skills: missing.slice(0, 3),
          description: roadmap.next_90_days.map(item => `• ${item}`).join('\n\n'),
        },
        {
          id: 'm3',
          title: 'Long Term Plan',
          duration: 'Month 4+',
          status: 'locked' as const,
          skills: missing.slice(3, 6),
          description: roadmap.long_term.map(item => `• ${item}`).join('\n\n'),
        }
      ];
    } catch (e) {
      console.error('Roadmap milestones API failed, using fallback:', e);
      return ROADMAP_MILESTONES;
    }
  },

  getProjectRecommendations: async (): Promise<ProjectRecommendation[]> => {
    try {
      const analysis = await getOrFetchAnalysis();
      return analysis.project_recommendations.map((proj, idx) => {
        let diff: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
        if (proj.difficulty === 'Beginner' || proj.difficulty === 'Advanced') {
          diff = proj.difficulty;
        }
        return {
          id: `proj-rec-${idx}`,
          title: proj.title,
          description: `${proj.description}\n\n💡 Curriculum Guide: ${proj.reason}`,
          difficulty: diff,
          skills: proj.technologies,
          imageUrl: '',
          estimatedHours: proj.difficulty === 'Beginner' ? 20 : proj.difficulty === 'Intermediate' ? 40 : 80,
        };
      });
    } catch (e) {
      console.error('Project recommendations API failed, using fallback:', e);
      return PROJECT_RECOMMENDATIONS.map(p => ({
        ...p,
        difficulty: p.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
      }));
    }
  },

  getActiveProjects: async (): Promise<ActiveProject[]> => {
    const sessionId = getSessionId();
    if (!sessionId) {
      return cachedActiveProjects || [];
    }
    try {
      const projects = await fetchActiveProjects();
      cachedActiveProjects = projects;
      localStorage.setItem('careerpilot_active_projects', JSON.stringify(projects));
      return projects;
    } catch (e) {
      console.error('Failed to fetch active projects from backend, using local cache:', e);
      return cachedActiveProjects || [];
    }
  },

  startProject: async (rec: ProjectRecommendation): Promise<ActiveProject[]> => {
    const active = await roadmapService.getActiveProjects();
    
    // Check if project is already started
    if (active.some(p => p.id === rec.id)) {
      return active;
    }

    const checkpoints_m1: ProjectCheckpoint[] = [
      { id: `${rec.id}_cp1_arch`, label: 'Design system architecture, DB schema & state management guidelines.', completed: false },
      { id: `${rec.id}_cp1_boilerplate`, label: 'Initialize workspace repository, install dependencies and set up environment.', completed: false }
    ];

    const checkpoints_m2: ProjectCheckpoint[] = [
      { id: `${rec.id}_cp2_backend`, label: 'Build backend APIs, database controllers and integrate core algorithms.', completed: false },
      { id: `${rec.id}_cp2_frontend`, label: 'Implement client layout interfaces, views and direct server requests.', completed: false }
    ];

    const checkpoints_m3: ProjectCheckpoint[] = [
      { id: `${rec.id}_cp3_testing`, label: 'Conduct integration tests, profile API payloads and fix bugs.', completed: false },
      { id: `${rec.id}_cp3_deploy`, label: 'Construct docker/deploy configurations and launch live demonstration.', completed: false }
    ];

    const milestones: ProjectMilestone[] = [
      { id: `${rec.id}_m1`, title: 'Milestone 1: Planning & Setup', checkpoints: checkpoints_m1 },
      { id: `${rec.id}_m2`, title: 'Milestone 2: Core Development', checkpoints: checkpoints_m2 },
      { id: `${rec.id}_m3`, title: 'Milestone 3: Deployment & Refinement', checkpoints: checkpoints_m3 }
    ];

    const newProject: ActiveProject = {
      id: rec.id,
      title: rec.title,
      description: rec.description,
      difficulty: rec.difficulty,
      technologies: rec.skills,
      status: 'in_progress',
      milestones,
    };

    const updated = [...active, newProject];
    cachedActiveProjects = updated;
    localStorage.setItem('careerpilot_active_projects', JSON.stringify(updated));

    const sessionId = getSessionId();
    if (sessionId) {
      try {
        await saveActiveProjects(updated);
      } catch (e) {
        console.error('Failed to save started project on backend:', e);
      }
    }
    return updated;
  },

  updateCheckpoint: async (projectId: string, checkpointId: string, completed: boolean): Promise<ActiveProject[]> => {
    const active = await roadmapService.getActiveProjects();
    const updated = active.map(p => {
      if (p.id !== projectId) return p;

      const updatedMilestones = p.milestones.map(m => {
        const updatedCheckpoints = m.checkpoints.map(cp => {
          if (cp.id === checkpointId) {
            return { 
              ...cp, 
              completed, 
              completedAt: completed ? new Date().toISOString() : undefined 
            };
          }
          return cp;
        });
        return { ...m, checkpoints: updatedCheckpoints };
      });

      // Recalculate status
      const total = updatedMilestones.reduce((acc, curr) => acc + curr.checkpoints.length, 0);
      const done = updatedMilestones.reduce((acc, curr) => acc + curr.checkpoints.filter(c => c.completed).length, 0);
      const status = done === total ? ('completed' as const) : ('in_progress' as const);

      return {
        ...p,
        status,
        milestones: updatedMilestones,
      };
    });

    cachedActiveProjects = updated;
    localStorage.setItem('careerpilot_active_projects', JSON.stringify(updated));

    const sessionId = getSessionId();
    if (sessionId) {
      try {
        await saveActiveProjects(updated);
      } catch (e) {
        console.error('Failed to sync updated checkpoint on backend:', e);
      }
    }
    return updated;
  },

  clearCache: () => {
    cachedAnalysis = null;
    cachedActiveProjects = null;
    localStorage.removeItem('careerpilot_active_projects');
  }
};
