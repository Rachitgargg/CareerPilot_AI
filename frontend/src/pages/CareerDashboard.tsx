import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ReadinessMetric, Suggestion, ActiveProject, Job } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProgressRing } from '@/components/common/ProgressRing';
import { SuggestionCard } from '@/components/dashboard/SuggestionCard';
import { dashboardService } from '@/services/dashboardService';
import { profileService } from '@/services/profileService';
import { roadmapService } from '@/services/roadmapService';
import { jobsService } from '@/services/jobsService';
import { 
  Sparkles, Trophy, Flame, TrendingUp, Code2, 
  ChevronDown, ChevronUp, Star, Award, Calendar, CheckSquare, 
  ChevronLeft, ChevronRight, GraduationCap, Laptop, BookOpen, Search
} from 'lucide-react';

export function CareerDashboard() {
  const [metrics, setMetrics] = useState<ReadinessMetric[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userName, setUserName] = useState('User');
  const [showCheckpointsMap, setShowCheckpointsMap] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dashboardService.getReadinessMetrics().then(setMetrics);
    dashboardService.getSuggestions().then(setSuggestions);
    roadmapService.getActiveProjects().then(setActiveProjects);
    jobsService.getJobs().then(setJobs);
    
    profileService.getProfile().then(u => {
      if (u && u.name) {
        setUserName(u.name);
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

  // Derive dynamic metrics from backend data
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

  // Calculate real Weekly Productivity metrics using completedAt and trackedAt timestamps
  const getWeekIndex = (isoString: string) => {
    const date = new Date(isoString);
    const diffMs = Date.now() - date.getTime();
    const diffDays = diffMs / (1000 * 3600 * 24);
    if (diffDays <= 7) return 3; // Week 4 (Current)
    if (diffDays <= 14) return 2; // Week 3
    if (diffDays <= 21) return 1; // Week 2
    if (diffDays <= 28) return 0; // Week 1
    return -1;
  };

  const activityCounts = [0, 0, 0, 0];
  activeProjects.forEach(p => {
    p.milestones.forEach(m => {
      m.checkpoints.forEach(cp => {
        if (cp.completed && cp.completedAt) {
          const wIdx = getWeekIndex(cp.completedAt);
          if (wIdx >= 0) activityCounts[wIdx]++;
        }
      });
    });
  });
  
  jobs.forEach(j => {
    if (j.trackedAt) {
      const wIdx = getWeekIndex(j.trackedAt);
      if (wIdx >= 0) activityCounts[wIdx]++;
    }
  });

  const totalActivities = activityCounts.reduce((a, b) => a + b, 0);

  // Unlocked Badges Conditions based on actual user metrics
  const badges = [
    { id: 'b1', name: 'Resume Pioneer', desc: 'ATS Match > 70', unlocked: readyScore > 70 || atsScore > 70, icon: Sparkles, color: 'text-amber-600 bg-butter/60 border-amber-200' },
    { id: 'b2', name: 'Project Explorer', desc: 'Started a project', unlocked: activeProjects.length > 0, icon: Trophy, color: 'text-indigo-600 bg-lavender/60 border-indigo-200' },
    { id: 'b3', name: 'Task Crusher', desc: 'Completed 3 checkpoints', unlocked: completedCheckpoints >= 3, icon: Award, color: 'text-emerald-600 bg-sage/60 border-emerald-200' },
    { id: 'b4', name: 'Active Hunter', desc: 'Tracked 1 application', unlocked: appsSubmitted > 0, icon: Star, color: 'text-purple-600 bg-blush/60 border-purple-200' }
  ];

  // Dynamic SVG Chart Coordinates
  const maxVal = Math.max(...activityCounts, 1);
  const chartPoints = activityCounts.map((val, idx) => {
    const x = 50 + idx * 130;
    const y = 130 - (val / maxVal) * 90;
    return { x, y };
  });
  const chartPath = chartPoints.reduce(
    (path, pt, idx) => (idx === 0 ? `M${pt.x},${pt.y}` : `${path} L${pt.x},${pt.y}`),
    ''
  );

  const initialLetter = userName ? userName[0].toUpperCase() : 'U';
  
  const filteredProjects = activeProjects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AppLayout header={{ title: 'Dashboard' }}>
      <div className="min-h-screen bg-surface-container-low px-4 md:px-container-padding py-8 flex justify-center">
        <div className="w-full max-w-6xl flex flex-col lg:grid lg:grid-cols-[1fr_360px] gap-8">
          
          {/* Main Content Area */}
          <div className="flex flex-col gap-8">
            
            {/* Custom Premium Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-headline-xl text-[36px] md:text-[44px] text-primary flex items-center gap-2 font-extrabold tracking-tight leading-none">
                  Welcome back <span className="animate-bounce">👋</span>
                </h1>
                <p className="font-body-md text-on-surface-variant mt-2 text-sm md:text-base">
                  Track your personalized analytics and complete checkpoints on your roadmaps.
                </p>
              </div>
              
              {/* Top search & profile avatar panel */}
              <div className="flex items-center gap-3 self-start md:self-auto">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-2.5 text-on-surface-variant" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search something"
                    className="pl-9 pr-4 py-2 text-sm rounded-full bg-surface-container-lowest border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary w-48 transition-all"
                  />
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-primary shadow-xs border border-surface-container-high select-none">
                  {initialLetter}
                </div>
              </div>
            </div>

            {/* Activities Today Section (Pastel Card Blocks mimicking reference) */}
            <div className="flex flex-col gap-4">
              <h2 className="font-headline-md text-xl md:text-2xl text-primary font-bold">Your activities today ({filteredProjects.length})</h2>
              
              {filteredProjects.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-8 text-center flex flex-col items-center justify-center gap-3 transition-transform hover:scale-[1.01] duration-300 shadow-sm">
                  <Code2 size={40} className="text-on-surface-variant" />
                  <h4 className="font-headline-sm text-lg font-bold text-primary">
                    {searchQuery ? 'No matching projects found' : 'No active project started'}
                  </h4>
                  <p className="text-sm font-body-md text-on-surface-variant max-w-xs">
                    {searchQuery ? 'Try checking your query or clear the filter.' : 'Choose a project recommendation tailored to fill your skill gaps and start building!'}
                  </p>
                  {!searchQuery && (
                    <Button size="sm" asChild className="mt-2 rounded-full bg-primary text-white hover:bg-on-surface">
                      <Link to="/projects">View Recommended Projects</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProjects.map((project, idx) => {
                    const cardBg = idx % 2 === 0 ? 'bg-sage/40 hover:bg-sage/55' : 'bg-blush/40 hover:bg-blush/55';
                    const iconColor = idx % 2 === 0 ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100';
                    return (
                      <div 
                        key={project.id} 
                        className={`rounded-card p-6 flex flex-col justify-between min-h-[160px] border border-surface-container-high transition-all hover:scale-[1.02] duration-300 hover:shadow-md cursor-pointer ${cardBg}`}
                        onClick={() => toggleCheckpointsVisibility(project.id)}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex flex-col gap-1 min-w-0">
                            <h3 className="font-headline-md text-lg font-bold text-primary truncate leading-tight">{project.title}</h3>
                            <span className="text-[10px] font-metadata text-on-surface-variant uppercase font-bold tracking-wider">
                              {project.difficulty} · {project.technologies.slice(0, 2).join(', ')}
                            </span>
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                            <Laptop size={16} />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-surface-container-high/40 pt-4 mt-2">
                          <span className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                            {showCheckpointsMap[project.id] ? 'Collapse checklist' : 'Check milestones'} 
                            {showCheckpointsMap[project.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                          <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                            {project.status === 'completed' ? 'Done 🎉' : 'Active 🚀'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Checkpoints Expandable Overlay Drawer */}
            {filteredProjects.map(project => {
              if (!showCheckpointsMap[project.id]) return null;
              
              let total = 0;
              let done = 0;
              project.milestones.forEach(m => {
                total += m.checkpoints.length;
                done += m.checkpoints.filter(c => c.completed).length;
              });
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <div key={`check-${project.id}`} className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-base text-primary font-bold">{project.title} Checkpoints</h3>
                    <span className="text-xs font-metadata text-on-surface-variant">{pct}% complete</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                  
                  <div className="flex flex-col gap-3 mt-1 max-h-60 overflow-y-auto pl-1">
                    {project.milestones.map((m) => (
                      <div key={m.id} className="flex flex-col gap-1.5">
                        <h4 className="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest font-bold">
                          {m.title}
                        </h4>
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
                                className="mt-0.5 rounded border-outline-variant focus:ring-primary h-3.5 w-3.5 text-primary cursor-pointer"
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
                </div>
              );
            })}

            {/* Learning Progress Section (Sleek Stats Rings Row mimicking reference) */}
            <div className="flex flex-col gap-4">
              <h2 className="font-headline-md text-xl md:text-2xl text-primary font-bold">Learning progress</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Score Circular Metric */}
                <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col items-center justify-center text-center gap-3 transition-all hover:shadow-md">
                  <h3 className="font-metadata text-metadata text-on-surface-variant font-bold uppercase tracking-wider text-xs">Ready Score</h3>
                  <ProgressRing value={readyScore} size={84} strokeWidth={6} showLabel />
                  <p className="text-[10px] text-on-surface-variant leading-none mt-1">Profile readiness rating</p>
                </div>

                {/* Match Circular Metric */}
                <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col items-center justify-center text-center gap-3 transition-all hover:shadow-md">
                  <h3 className="font-metadata text-metadata text-on-surface-variant font-bold uppercase tracking-wider text-xs">ATS Match</h3>
                  <ProgressRing value={atsScore} size={84} strokeWidth={6} className="text-blush" showLabel />
                  <p className="text-[10px] text-on-surface-variant leading-none mt-1">Resume alignment rating</p>
                </div>

                {/* Profile Depth Circular Metric */}
                <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col items-center justify-center text-center gap-3 transition-all hover:shadow-md">
                  <h3 className="font-metadata text-metadata text-on-surface-variant font-bold uppercase tracking-wider text-xs">Profile Depth</h3>
                  <ProgressRing value={profileDepth} size={84} strokeWidth={6} className="text-lavender" showLabel />
                  <p className="text-[10px] text-on-surface-variant leading-none mt-1">Resume profile details filled</p>
                </div>
              </div>
            </div>

            {/* Weekly Productivity SVG Line Chart or Empty State */}
            <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-4 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-md text-lg font-bold text-primary">Weekly Productivity</h3>
                  <p className="text-xs text-on-surface-variant">Task milestones resolved over the past month</p>
                </div>
                <TrendingUp className="text-on-surface-variant" size={20} />
              </div>
              
              {totalActivities === 0 ? (
                <div className="py-12 px-4 text-center border border-dashed border-surface-container-high rounded-panel flex flex-col items-center gap-2">
                  <GraduationCap className="text-on-surface-variant animate-pulse" size={32} />
                  <p className="text-sm text-primary font-bold">Not enough activity yet to display productivity trends</p>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                    Complete project milestones or track new job applications to automatically construct your weekly productivity statistics.
                  </p>
                </div>
              ) : (
                <div className="w-full flex items-center justify-center bg-surface-container-low p-2 rounded-panel border border-surface-container-high">
                  <svg className="w-full h-40" viewBox="0 0 500 160">
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#E2E8DF" strokeDasharray="3" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="#E2E8DF" strokeDasharray="3" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="#E2E8DF" strokeDasharray="3" />
                    
                    <path
                      d={chartPath}
                      fill="none"
                      stroke="#2b2b2b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    
                    {chartPoints.map((pt, idx) => (
                      <circle key={idx} cx={pt.x} cy={pt.y} r="5" fill="#2b2b2b" />
                    ))}

                    <text x="50" y="145" fontSize="10" fill="#747878" textAnchor="middle">Week 1</text>
                    <text x="180" y="145" fontSize="10" fill="#747878" textAnchor="middle">Week 2</text>
                    <text x="310" y="145" fontSize="10" fill="#747878" textAnchor="middle">Week 3</text>
                    <text x="440" y="145" fontSize="10" fill="#747878" textAnchor="middle">Current</text>
                  </svg>
                </div>
              )}
            </div>

            {/* AI Suggestions Row */}
            {suggestions.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-md text-xl md:text-2xl text-primary font-bold">AI Suggestions</h3>
                  <Link to="/chat" className="font-label-caps text-xs text-primary hover:underline uppercase font-bold">
                    Ask AI
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {suggestions.slice(0, 2).map((s) => (
                    <SuggestionCard key={s.id} suggestion={s} />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Sidebar Calendar / Achievements */}
          <div className="flex flex-col gap-6">
            
            {/* Interactive Lesson Schedule Calendar Card (mimicking reference) */}
            <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-md text-lg font-bold text-primary flex items-center gap-1.5">
                  <Calendar size={18} className="text-indigo-600" /> July 2024
                </h3>
                <div className="flex gap-1.5">
                  <button className="p-1 hover:bg-surface-container-low rounded-full transition-colors"><ChevronLeft size={16} /></button>
                  <button className="p-1 hover:bg-surface-container-low rounded-full transition-colors"><ChevronRight size={16} /></button>
                </div>
              </div>
              
              {/* Custom Calendar Month Grid mimicking reference style */}
              <div className="grid grid-cols-7 gap-y-2.5 gap-x-1.5 text-center text-xs mt-2 font-metadata">
                <div className="text-on-surface-variant font-bold">M</div>
                <div className="text-on-surface-variant font-bold">T</div>
                <div className="text-on-surface-variant font-bold">W</div>
                <div className="text-on-surface-variant font-bold">T</div>
                <div className="text-on-surface-variant font-bold">F</div>
                <div className="text-on-surface-variant font-bold">S</div>
                <div className="text-on-surface-variant font-bold">S</div>

                <div className="text-on-surface-variant/40 py-1">24</div>
                <div className="text-on-surface-variant/40 py-1">25</div>
                <div className="text-on-surface-variant/40 py-1">26</div>
                <div className="text-on-surface-variant/40 py-1">27</div>
                <div className="text-on-surface-variant/40 py-1">28</div>
                <div className="text-on-surface-variant/40 py-1">29</div>
                <div className="text-on-surface-variant/40 py-1">30</div>

                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">1</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">2</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">3</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">4</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">5</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">6</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">7</div>

                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">8</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">9</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">10</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">11</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">12</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">13</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">14</div>

                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">15</div>
                <div className="py-1 bg-black text-white rounded-full font-bold cursor-pointer">16</div>
                <div className="py-1 bg-black text-white rounded-full font-bold cursor-pointer">17</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">18</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">19</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer flex items-center justify-center relative"><span className="absolute bottom-0.5 w-1 h-1 bg-indigo-500 rounded-full"></span>20</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">21</div>

                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">22</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">23</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">24</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">25</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">26</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">27</div>
                <div className="py-1 hover:bg-surface-container-low rounded-full cursor-pointer">28</div>
              </div>
            </div>

            {/* Dynamic Stats split cards mimicking reference boxes */}
            <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-4 shadow-sm">
              <h3 className="font-headline-md text-lg font-bold text-primary">Overview Statistics</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between bg-sage/35 border border-surface-container-high p-4 rounded-panel hover:scale-[1.01] transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700"><CheckSquare size={16} /></div>
                    <span className="text-xs font-bold text-primary font-metadata">Tracked Applications</span>
                  </div>
                  <span className="text-base font-bold text-primary">{appsSubmitted}</span>
                </div>

                {interviewsScheduled > 0 && (
                  <div className="flex items-center justify-between bg-blush/35 border border-surface-container-high p-4 rounded-panel hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700"><Flame size={16} /></div>
                      <span className="text-xs font-bold text-primary font-metadata">Interviews Scheduled</span>
                    </div>
                    <span className="text-base font-bold text-primary">{interviewsScheduled}</span>
                  </div>
                )}

                <div className="flex items-center justify-between bg-butter/35 border border-surface-container-high p-4 rounded-panel hover:scale-[1.01] transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700"><BookOpen size={16} /></div>
                    <span className="text-xs font-bold text-primary font-metadata">Milestones Achieved</span>
                  </div>
                  <span className="text-base font-bold text-primary">{completedCheckpoints}</span>
                </div>

                {(inProgressProjects > 0 || completedProjects > 0) && (
                  <div className="flex items-center justify-between bg-lavender/35 border border-surface-container-high p-4 rounded-panel hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700"><Laptop size={16} /></div>
                      <span className="text-xs font-bold text-primary font-metadata">Active / Done Roadmaps</span>
                    </div>
                    <span className="text-base font-bold text-primary">{inProgressProjects} / {completedProjects}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Streak card */}
            <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex items-center justify-between gap-4 shadow-sm hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 animate-pulse">
                  <Flame size={20} className="fill-current" />
                </div>
                <div>
                  <h4 className="font-metadata text-xs font-bold text-on-surface-variant uppercase tracking-wider">Streak Counter</h4>
                  <p className="font-headline-sm text-sm text-primary font-bold">{streak} Days Commitment</p>
                </div>
              </div>
            </div>

            {/* Achievement Badges Panel */}
            <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-4 shadow-sm">
              <h3 className="font-headline-md text-lg font-bold text-primary">Achievement Badges</h3>
              <div className="grid grid-cols-2 gap-3">
                {badges.map(b => (
                  <div 
                    key={b.id} 
                    className={`border rounded-panel p-3 flex flex-col items-center text-center gap-1.5 transition-all duration-300 ${
                      b.unlocked ? b.color + ' opacity-100 shadow-xs' : 'bg-surface-container-low text-on-surface-variant/40 border-surface-container-high opacity-35 select-none grayscale'
                    }`}
                  >
                    <b.icon size={22} className={b.unlocked ? '' : 'text-on-surface-variant/30'} />
                    <span className="text-[10px] font-bold font-metadata truncate max-w-full leading-tight">{b.name}</span>
                    <span className="text-[8px] leading-tight text-on-surface-variant">{b.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Actions Panel */}
            <div className="bg-surface-container-lowest rounded-card border border-surface-container-high p-6 flex flex-col gap-3 shadow-sm">
              <h3 className="font-headline-md text-lg font-bold text-primary">Quick actions</h3>
              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild className="justify-start text-xs rounded-full">
                  <Link to="/tailor">Tailor Resume for a Job</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start text-xs rounded-full">
                  <Link to="/interview">Start Interview Practice</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start text-xs rounded-full">
                  <Link to="/jobs">Discover Job Matches</Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
