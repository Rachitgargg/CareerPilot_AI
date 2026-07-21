import { useState } from 'react';
import { Clock, Code2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProjectRecommendation, ActiveProject } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const difficultyVariant: Record<ProjectRecommendation['difficulty'], 'sage' | 'butter' | 'blush'> = {
  Beginner: 'sage',
  Intermediate: 'butter',
  Advanced: 'blush',
};

export interface ProjectRecommendationCardProps {
  project: ProjectRecommendation;
  activeProject?: ActiveProject;
  onStart?: () => void;
  onToggleCheckpoint?: (checkpointId: string, completed: boolean) => void;
}

export function ProjectRecommendationCard({
  project,
  activeProject,
  onStart,
  onToggleCheckpoint,
}: ProjectRecommendationCardProps) {
  const [showCheckpoints, setShowCheckpoints] = useState(false);

  const status = activeProject ? activeProject.status : 'idle';
  
  // Calculate checkpoints progress
  let totalCheckpoints = 0;
  let completedCheckpoints = 0;
  if (activeProject) {
    activeProject.milestones.forEach(m => {
      totalCheckpoints += m.checkpoints.length;
      completedCheckpoints += m.checkpoints.filter(c => c.completed).length;
    });
  }
  const progressPercent = totalCheckpoints > 0 ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0;
  const remainingTasks = totalCheckpoints - completedCheckpoints;

  return (
    <div className="bg-surface-container-lowest rounded-card border border-surface-container-high overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {project.imageUrl ? (
        <img src={project.imageUrl} alt={project.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-surface-container flex items-center justify-center text-on-surface-variant">
          <Code2 size={32} />
        </div>
      )}
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between">
          <Badge variant={difficultyVariant[project.difficulty]}>{project.difficulty}</Badge>
          <span className="inline-flex items-center gap-1 font-metadata text-metadata text-on-surface-variant">
            <Clock size={14} /> {project.estimatedHours}h
          </span>
        </div>
        
        <div>
          <h3 className="font-headline-md text-headline-md text-primary leading-tight">{project.title}</h3>
          {status !== 'idle' && (
            <span className="inline-block mt-1 font-metadata text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Status: {status === 'completed' ? 'Completed 🎉' : 'In Progress 🚀'}
            </span>
          )}
        </div>
        
        <p className="font-body-md text-body-md text-on-surface-variant flex-1">{project.description}</p>
        
        {/* Dynamic Project Progress Indicators */}
        {status !== 'idle' && (
          <div className="flex flex-col gap-2 bg-surface-container-low p-4 rounded-panel border border-surface-container-high my-1">
            <div className="flex items-center justify-between text-xs font-metadata text-on-surface-variant">
              <span>{progressPercent}% Complete</span>
              <span>{remainingTasks} tasks left</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
            
            <button
              onClick={() => setShowCheckpoints(!showCheckpoints)}
              className="flex items-center justify-center gap-1 text-xs text-primary font-bold hover:underline mt-2 self-start"
            >
              {showCheckpoints ? (
                <>
                  Hide checklist <ChevronUp size={14} />
                </>
              ) : (
                <>
                  View project checklist <ChevronDown size={14} />
                </>
              )}
            </button>
            
            {showCheckpoints && (
              <div className="flex flex-col gap-3 mt-3 border-t border-surface-container-high pt-3 max-h-60 overflow-y-auto">
                {activeProject?.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex flex-col gap-1.5">
                    <h4 className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest font-bold">
                      {milestone.title}
                    </h4>
                    <div className="flex flex-col gap-2 pl-1">
                      {milestone.checkpoints.map((cp) => (
                        <label
                          key={cp.id}
                          className="flex items-start gap-2 text-xs text-on-surface cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={cp.completed}
                            onChange={(e) => onToggleCheckpoint?.(cp.id, e.target.checked)}
                            className="mt-0.5 rounded border-outline-variant focus:ring-primary h-3.5 w-3.5 text-primary"
                          />
                          <span className={cp.completed ? 'line-through text-on-surface-variant opacity-60' : ''}>
                            {cp.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {project.skills.map((skill) => (
            <Badge key={skill} variant="default">
              {skill}
            </Badge>
          ))}
        </div>
        
        {status === 'idle' && (
          <Button
            size="sm"
            variant="soft"
            onClick={onStart}
            className="self-start mt-2"
          >
            Start project
          </Button>
        )}
        
        {status === 'completed' && (
          <div className="flex items-center gap-1 text-xs text-sage font-bold font-metadata mt-2 select-none">
            <CheckCircle2 size={16} className="text-sage" /> Project Completed!
          </div>
        )}
      </div>
    </div>
  );
}
