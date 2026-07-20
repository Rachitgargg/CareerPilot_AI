import { useState } from 'react';
import { Clock, Code2, CheckCircle2 } from 'lucide-react';
import type { ProjectRecommendation } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const difficultyVariant: Record<ProjectRecommendation['difficulty'], 'sage' | 'butter' | 'blush'> = {
  Beginner: 'sage',
  Intermediate: 'butter',
  Advanced: 'blush',
};

export function ProjectRecommendationCard({ project }: { project: ProjectRecommendation }) {
  const [status, setStatus] = useState<'idle' | 'in_progress' | 'completed'>('idle');

  const handleAction = () => {
    if (status === 'idle') {
      setStatus('in_progress');
    } else if (status === 'in_progress') {
      setStatus('completed');
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-card border border-surface-container-high overflow-hidden flex flex-col">
      {project.imageUrl ? (
        <img src={project.imageUrl} alt={project.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-surface-container flex items-center justify-center text-on-surface-variant">
          <Code2 size={32} />
        </div>
      )}
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <Badge variant={difficultyVariant[project.difficulty]}>{project.difficulty}</Badge>
          <span className="inline-flex items-center gap-1 font-metadata text-metadata text-on-surface-variant">
            <Clock size={14} /> {project.estimatedHours}h
          </span>
        </div>
        <h3 className="font-headline-md text-headline-md text-primary">{project.title}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant flex-1">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.skills.map((skill) => (
            <Badge key={skill} variant="default">
              {skill}
            </Badge>
          ))}
        </div>
        <Button
          size="sm"
          variant={status === 'in_progress' ? 'primary' : status === 'completed' ? 'soft' : 'soft'}
          onClick={handleAction}
          className="self-start mt-2"
          disabled={status === 'completed'}
        >
          {status === 'idle' && 'Start project'}
          {status === 'in_progress' && 'Mark as Complete'}
          {status === 'completed' && (
            <span className="flex items-center gap-1">
              <CheckCircle2 size={14} className="text-sage" /> Completed
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
