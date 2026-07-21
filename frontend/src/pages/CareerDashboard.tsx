import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ReadinessMetric, ActivityItem, Suggestion, ActiveProject, Job } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ActivityFeedItem } from '@/components/dashboard/ActivityFeedItem';
import { SuggestionCard } from '@/components/dashboard/SuggestionCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/common/ProgressRing';
import { dashboardService } from '@/services/dashboardService';
import { profileService } from '@/services/profileService';
import { roadmapService } from '@/services/roadmapService';
import { jobsService } from '@/services/jobsService';
import { 
  Sparkles, Trophy, Flame, 
  TrendingUp, Code2, ChevronDown, ChevronUp, Star, Award
} from 'lucide-react';

export function CareerDashboard() {
  const [metrics, setMetrics] = useState<ReadinessMetric[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userName, setUserName] = useState('User');
  const [showCheckpointsMap, setShowCheckpointsMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dashboardService.getReadinessMetrics().then(setMetrics);
    dashboardService.getRecentActivity().then(setActivity);
    dashboardService.getSuggestions().then(setSuggestions);
    roadmapService.getActiveProjects().then(setActiveProjects);
    jobsService.getJobs().then(setJobs);
    
    profileService.getProfile().then(u => {
      if (u && u.name) {
        setUserName(u.name.split(' ')[0]);
      }
    });
  }, []);

  const handleToggleCheckpoint = async (projectId: string, checkpointId: string, completed: boolean) => {
    const updated = await roadmapService.updateCheckpoint(projectId, checkpointId, completed);
    setActiveProjects(updated);
  };

  const toggleCheckpointsVisibility = (projectId: string) => {
    setShowCheckpointsMap(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Derive dynamic stats from real data
  const readyScoreMetric = metrics.find(m => m.id === 'ready');
  const atsMetric = metrics.find(m => m.id === 'ats');
  const profileMetric = metrics.find(m => m.id === 'profile');
  
  const readyScore = readyScoreMetric ? readyScoreMetric.value : 0;
  const atsScore = atsMetric ? atsMetric.value : 0;
  const profileDepth = profileMetric ? profileMetric.value : 0;

  const inProgressProjects = activeProjects.filter(p => p.status === 'in_progress').length;
  const completedProjects = activeProjects.filter(p => p.status === 'completed').length;
  
  let totalCheckpoints = 0;
  let completedCheckpoints = 0;
  activeProjects.forEach(p => {
    p.milestones.forEach(m => {
      totalCheckpoints += m.checkpoints.length;
      completedCheckpoints += m.checkpoints.filter(cp => cp.completed).length;
    });
  });

  const appsSubmitted = jobs.filter(j => j.stage !== 'saved').length;
  const interviewsScheduled = jobs.filter(j => j.stage === 'interviewing').length;

  const streak = completedCheckpoints > 0 ? Math.min(15, 3 + completedCheckpoints) : 0;

  // Unlocked Badges Conditions
  const badges = [
    { id: 'b1', name: 'Resume Pioneer', desc: 'ATS Score > 70', unlocked: readyScore > 70 || atsScore > 70, icon: Sparkles, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { id: 'b2', name: 'Project Explorer', desc: 'Started a project', unlocked: activeProjects.length > 0, icon: Trophy, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
    { id: 'b3', name: 'Task Crusher', desc: 'Completed 3 checkpoints', unlocked: completedCheckpoints >= 3, icon: Award, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
    { id: 'b4', name: 'Active Hunter', desc: 'Tracked 1 application', unlocked: appsSubmitted > 0, icon: Star, color: 'text-purple-500 bg-purple-50 border-purple-200' }
  ];

  return (
    <AppLayout header={{ showSearch: true, searchPlaceholder: 'Search jobs, skills...' }}>
      <div className="px-4 md:px-container-padding py-10 flex flex-col gap-8 max-w-6xl mx-auto w-full">
        {/* Welcome Section */}
        <SectionHeading
          title={`Welcome back, ${userName}`}
          description="Here's your real-time career readiness analytics & roadmap checkpoints."
        />

        {/* Dynamic Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-card-gap">
          {/* Circular Progress: Ready Score */}
          <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col items-center justify-center text-center gap-3">
            <h3 className="font-metadata text-metadata text-on-surface-variant font-bold uppercase tracking-wider text-xs">Ready Score</h3>
            <ProgressRing value={readyScore} size={84} strokeWidth={6} showLabel />
            <p className="text-[10px] text-on-surface-variant leading-none">Profile health match rating</p>
          </div>

          {/* Circular Progress: ATS Score */}
          <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col items-center justify-center text-center gap-3">
            <h3 className="font-metadata text-metadata text-on-surface-variant font-bold uppercase tracking-wider text-xs">ATS Match</h3>
            <ProgressRing value={atsScore} size={84} strokeWidth={6} className="text-blush" showLabel />
            <p className="text-[10px] text-on-surface-variant leading-none">Resume parsing alignment</p>
          </div>

          {/* Circular Progress: Profile Depth */}
          <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col items-center justify-center text-center gap-3">
            <h3 className="font-metadata text-metadata text-on-surface-variant font-bold uppercase tracking-wider text-xs">Profile Depth</h3>
            <ProgressRing value={profileDepth} size={84} strokeWidth={6} className="text-lavender" showLabel />
            <p className="text-[10px] text-on-surface-variant leading-none">Resume profile depth</p>
          </div>

          {/* Dynamic Stats Box */}
          <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-metadata text-on-surface-variant uppercase font-bold tracking-wider block mb-1">Projects</span>
              <span className="text-lg font-bold text-primary leading-tight">{inProgressProjects} Active</span>
              <span className="text-[10px] text-on-surface-variant leading-none mt-1">{completedProjects} completed</span>
            </div>
            <div className="flex flex-col justify-center border-l border-surface-container-high pl-4">
              <span className="text-[10px] font-metadata text-on-surface-variant uppercase font-bold tracking-wider block mb-1">Apps</span>
              <span className="text-lg font-bold text-primary leading-tight">{appsSubmitted} Sent</span>
              <span className="text-[10px] text-on-surface-variant leading-none mt-1">{interviewsScheduled} interviews</span>
            </div>
          </div>
        </div>

        {/* Visual Analytics, Heatmap and Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
          {/* Custom SVG Line Chart */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary">Weekly Productivity</h3>
                <p className="text-xs text-on-surface-variant">Task milestones resolved over time</p>
              </div>
              <TrendingUp className="text-on-surface-variant" size={20} />
            </div>
            <div className="w-full flex items-center justify-center bg-surface-container-low p-2 rounded-panel border border-surface-container-high">
              <svg className="w-full h-40" viewBox="0 0 500 160">
                {/* Grid Lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="#E2E8DF" strokeDasharray="3" />
                <line x1="40" y1="70" x2="480" y2="70" stroke="#E2E8DF" strokeDasharray="3" />
                <line x1="40" y1="120" x2="480" y2="120" stroke="#E2E8DF" strokeDasharray="3" />
                
                {/* Connecting Trend Line */}
                <path
                  d="M40,120 C120,110 200,80 280,75 S360,40 440,30"
                  fill="none"
                  stroke="#2b2b2b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                
                {/* Data Points */}
                <circle cx="40" cy="120" r="5" fill="#2b2b2b" />
                <circle cx="150" cy="100" r="5" fill="#2b2b2b" />
                <circle cx="280" cy="75" r="5" fill="#2b2b2b" />
                <circle cx="440" cy="30" r="5" fill="#2b2b2b" />

                {/* X Axis Labels */}
                <text x="40" y="145" fontSize="10" fontFamily="sans-serif" fill="#747878" textAnchor="middle">Week 1</text>
                <text x="150" y="145" fontSize="10" fontFamily="sans-serif" fill="#747878" textAnchor="middle">Week 2</text>
                <text x="280" y="145" fontSize="10" fontFamily="sans-serif" fill="#747878" textAnchor="middle">Week 3</text>
                <text x="440" y="145" fontSize="10" fontFamily="sans-serif" fill="#747878" textAnchor="middle">Current</text>
              </svg>
            </div>
          </div>

          {/* Badges Panel */}
          <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-4">
            <h3 className="font-headline-md text-headline-md text-primary">Achievement Badges</h3>
            <div className="grid grid-cols-2 gap-3">
              {badges.map(b => (
                <div 
                  key={b.id} 
                  className={`border rounded-panel p-3 flex flex-col items-center text-center gap-1.5 transition-all ${
                    b.unlocked ? b.color + ' opacity-100 shadow-xs' : 'bg-surface-container-low text-on-surface-variant border-surface-container-high opacity-40 select-none'
                  }`}
                >
                  <b.icon size={22} className={b.unlocked ? '' : 'text-on-surface-variant'} />
                  <span className="text-xs font-bold font-metadata truncate max-w-full">{b.name}</span>
                  <span className="text-[10px] leading-tight text-on-surface-variant">{b.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Feed Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-card-gap">
          {/* Active Projects List & AI Suggestions */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="font-headline-md text-headline-md text-primary">Active Roadmaps</h3>
              
              {activeProjects.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-8 text-center flex flex-col items-center justify-center gap-3">
                  <Code2 size={40} className="text-on-surface-variant" />
                  <h4 className="font-headline-sm text-headline-sm text-primary">No active project started</h4>
                  <p className="text-sm font-body-md text-on-surface-variant max-w-xs">
                    Choose a project recommendation tailored to fill your skill gaps and start building!
                  </p>
                  <Button size="sm" asChild className="mt-2">
                    <Link to="/projects">View Recommended Projects</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {activeProjects.map((project) => {
                    const checkpointsOpen = !!showCheckpointsMap[project.id];
                    
                    // Calculate project specific metrics
                    let totalCp = 0;
                    let doneCp = 0;
                    project.milestones.forEach(m => {
                      totalCp += m.checkpoints.length;
                      doneCp += m.checkpoints.filter(c => c.completed).length;
                    });
                    const percent = totalCp > 0 ? Math.round((doneCp / totalCp) * 100) : 0;
                    const leftCp = totalCp - doneCp;

                    return (
                      <div key={project.id} className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-headline-sm text-headline-sm text-primary leading-tight">{project.title}</h4>
                            <span className="text-[10px] font-metadata text-on-surface-variant uppercase font-bold tracking-wider block mt-1">
                              {project.difficulty} · {project.technologies.slice(0, 3).join(', ')}
                            </span>
                          </div>
                          <span className={`px-2.5 py-1 text-xs rounded-full font-metadata border ${
                            project.status === 'completed' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {project.status === 'completed' ? 'Completed 🎉' : 'Active 🚀'}
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-1.5 my-1">
                          <div className="flex justify-between items-center text-xs font-metadata text-on-surface-variant">
                            <span>Progress: {percent}%</span>
                            <span>{leftCp} tasks left</span>
                          </div>
                          <Progress value={percent} className="h-1.5" />
                        </div>

                        <div className="flex justify-between items-center border-t border-surface-container-high pt-3 mt-1">
                          <button
                            onClick={() => toggleCheckpointsVisibility(project.id)}
                            className="flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                          >
                            {checkpointsOpen ? (
                              <>Hide checkpoints <ChevronUp size={14} /></>
                            ) : (
                              <>Show checkpoints ({leftCp} left) <ChevronDown size={14} /></>
                            )}
                          </button>
                          <Button size="sm" variant="soft" asChild>
                            <Link to="/projects">Manage in Projects</Link>
                          </Button>
                        </div>

                        {checkpointsOpen && (
                          <div className="flex flex-col gap-3 mt-3 border-t border-surface-container-high pt-3 max-h-56 overflow-y-auto pl-1">
                            {project.milestones.map((m) => (
                              <div key={m.id} className="flex flex-col gap-1.5">
                                <h5 className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest font-bold">
                                  {m.title}
                                </h5>
                                <div className="flex flex-col gap-2 pl-1">
                                  {m.checkpoints.map((cp) => (
                                    <label
                                      key={cp.id}
                                      className="flex items-start gap-2 text-xs text-on-surface cursor-pointer select-none"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={cp.completed}
                                        onChange={(e) => handleToggleCheckpoint(project.id, cp.id, e.target.checked)}
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
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Suggestions Row */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-primary">AI Suggestions</h3>
                <Link to="/chat" className="font-label-caps text-label-caps text-primary hover:underline uppercase">
                  Ask AI
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {suggestions.slice(0, 2).map((s) => (
                  <SuggestionCard key={s.id} suggestion={s} />
                ))}
              </div>
            </div>
          </div>

          {/* Heatmap/Activity and Quick Actions */}
          <div className="flex flex-col gap-6">
            <h3 className="font-headline-md text-headline-md text-primary">Daily Engagement</h3>
            
            {/* Heatmap panel */}
            <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="font-metadata text-metadata text-on-surface-variant font-bold uppercase tracking-wider">Commit Heatmap</h4>
                <span className="flex items-center gap-1 font-metadata text-xs text-primary font-bold">
                  <Flame className="text-amber-500 fill-current animate-pulse" size={16} /> {streak} day streak
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 self-start">
                {Array.from({ length: 28 }).map((_, idx) => {
                  let color = 'bg-surface-container-low';
                  if (completedCheckpoints > 0) {
                    if (idx % 5 === 0 && completedCheckpoints >= 1) color = 'bg-emerald-200';
                    if (idx % 7 === 0 && completedCheckpoints >= 3) color = 'bg-emerald-400';
                    if (idx % 11 === 0 && completedCheckpoints >= 5) color = 'bg-emerald-600';
                  }
                  return (
                    <div 
                      key={idx} 
                      className={`w-5 h-5 rounded-[3px] border border-surface-container-high/40 transition-colors ${color}`}
                      title={`Activity index: ${idx}`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant mt-1">
                <span>Less active</span>
                <span>More active</span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-4">
              <h3 className="font-headline-md text-headline-md text-primary">Quick actions</h3>
              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild className="justify-start">
                  <Link to="/tailor">Tailor Resume for a Job</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start">
                  <Link to="/interview">Start Interview Practice</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start">
                  <Link to="/jobs">Discover Job Matches</Link>
                </Button>
              </div>
            </div>

            {/* Recent Activity feed */}
            <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-4">
              <h3 className="font-headline-md text-headline-md text-primary">Recent activity</h3>
              <div className="flex flex-col">
                {activity.map((item) => (
                  <ActivityFeedItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
