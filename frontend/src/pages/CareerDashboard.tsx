import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ReadinessMetric, ActivityItem, Suggestion, ProjectPreview } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ReadinessMetricCard } from '@/components/dashboard/ReadinessMetricCard';
import { ActivityFeedItem } from '@/components/dashboard/ActivityFeedItem';
import { SuggestionCard } from '@/components/dashboard/SuggestionCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { dashboardService } from '@/services/dashboardService';
import { profileService } from '@/services/profileService';

export function CareerDashboard() {
  const [metrics, setMetrics] = useState<ReadinessMetric[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [projects, setProjects] = useState<ProjectPreview[]>([]);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    dashboardService.getReadinessMetrics().then(setMetrics);
    dashboardService.getRecentActivity().then(setActivity);
    dashboardService.getSuggestions().then(setSuggestions);
    dashboardService.getProjectPreviews().then(setProjects);
    profileService.getProfile().then(u => {
      if (u && u.name) {
        setUserName(u.name.split(' ')[0]);
      }
    });
  }, []);

  return (
    <AppLayout header={{ showSearch: true, searchPlaceholder: 'Search jobs, skills...' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-section-margin">
        <SectionHeading
          title={`Welcome back, ${userName}`}
          description="Here's your career readiness snapshot for today."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-card-gap">
          {metrics.map((metric) => (
            <ReadinessMetricCard key={metric.id} metric={metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-primary">AI Suggestions</h2>
              <Link
                to="/chat"
                className="font-label-caps text-label-caps text-primary hover:underline uppercase"
              >
                Ask AI
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {suggestions.map((s) => (
                <SuggestionCard key={s.id} suggestion={s} />
              ))}
            </div>

            <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 mt-4">
              <h3 className="font-headline-md text-headline-md text-primary mb-2">Active project</h3>
              {projects.map((project) => (
                <div key={project.id} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-on-surface">{project.name}</span>
                    <span className="font-metadata text-metadata text-on-surface-variant">
                      {project.status}
                    </span>
                  </div>
                  <Progress value={project.progress} />
                  <div className="flex items-center justify-between">
                    <span className="font-metadata text-metadata text-on-surface-variant">
                      {project.tasksLeft} tasks left
                    </span>
                    <Button size="sm" variant="soft" asChild>
                      <Link to="/projects">Open project</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low rounded-card p-6 flex flex-col">
            <h2 className="font-headline-md text-headline-md text-primary mb-2">Recent activity</h2>
            <div className="flex flex-col">
              {activity.map((item) => (
                <ActivityFeedItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
