import type {
  User,
  ExperienceEntry,
  EducationEntry,
  ReadinessMetric,
  ActivityItem,
  Suggestion,
  ProjectPreview,
  Job,
  DreamCompany,
  ResumeVersion,
  TailoringSuggestion,
  RoadmapMilestone,
  ProjectRecommendation,
  InterviewQuestion,
  ChatMessage,
  ChatSuggestionChip,
  TimelineEvent,
  NotificationItem,
  NotificationPreference,
} from '@/types';

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export const CURRENT_USER: User = {
  id: 'user-1',
  name: 'Alex Morgan',
  email: 'alex.morgan@email.com',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBJifsJzakGvMzxEJWcDe7q_S0YMjSZJuMt94_bonBfb7ZLgl7WDVJg2B2GM-W3AzK7QzoQmQz57Fi4fkXQd69V---cTCqba60Oa-ifwG_Z-O7oMUYRSAwOes9FPtIMkbhtA9Ky130q6PuDMqBVJYpYQMicgr4fdGsF31J7M0LCTHyKXEnBQX7vPg5gHhBaxhhOsfBlXSs4K_xX25g8E4F7_IKJ7Cli2fc9ARQd_Kh-TsFNo8-O5yd-mg',
  title: 'Senior UX Researcher',
  location: 'San Francisco, CA (Hybrid)',
  bio: 'Senior UX Researcher transitioning to Product Management. Focused on user-centric AI solutions and data-driven strategy.',
  yearsExperience: 6,
};

export const EXPERIENCE_ENTRIES: ExperienceEntry[] = [
  {
    id: 'exp-1',
    role: 'Lead Product Designer',
    company: 'TechFlow Inc.',
    period: '2021 - Present',
    description:
      'Spearheaded the redesign of the core enterprise dashboard, resulting in a 25% increase in user retention.',
  },
  {
    id: 'exp-2',
    role: 'Senior UX Researcher',
    company: 'Nebula Systems',
    period: '2018 - 2021',
    description: 'Led mixed-methods research across three product lines, shaping the annual roadmap.',
  },
];

export const EDUCATION_ENTRIES: EducationEntry[] = [
  {
    id: 'edu-1',
    school: 'University of California, Berkeley',
    degree: 'B.S. Computer Science',
    period: '2014 - 2018',
  },
];

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const READINESS_METRICS: ReadinessMetric[] = [
  { id: 'ready', label: 'Ready Score', value: 75, accent: 'sage' },
  { id: 'ats', label: 'ATS Match', value: 60, accent: 'blush' },
  { id: 'health', label: 'Net Health', value: 90, accent: 'lavender' },
  { id: 'profile', label: 'Profile Depth', value: 50, accent: 'butter' },
];

export const ACTIVITY_ITEMS: ActivityItem[] = [
  { id: 'act-1', label: 'Updated Resume v3', timestamp: '2 hours ago', icon: 'description', isPrimary: true },
  { id: 'act-2', label: "Saved 'Frontend Eng' at Vercel", timestamp: 'Yesterday', icon: 'bookmark' },
];

export const DASHBOARD_SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug-1',
    message: "Rewrite your 'Senior Dev' bullet point to emphasize revenue impact.",
    actionLabel: 'Apply Fix',
  },
  {
    id: 'sug-2',
    message: '3 new roles matching your profile were posted at Stripe today.',
    actionLabel: 'View Roles',
  },
];

export const PROJECT_PREVIEWS: ProjectPreview[] = [
  { id: 'proj-1', name: 'Portfolio Revamp', status: 'In Progress', tasksLeft: 4, progress: 75 },
];

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export const JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    company: 'Vercel',
    companyInitial: 'V',
    location: 'Remote',
    remote: true,
    salaryRange: '$140k - $180k',
    matchScore: 85,
    tags: ['React', 'TypeScript', 'GraphQL'],
    postedAt: '2d ago',
    description:
      'Strong overlap with your React and TypeScript experience. Requires learning GraphQL, which aligns with your stated 3-month goals.',
    stage: 'saved',
    url: 'https://vercel.com/careers',
  },
  {
    id: 'job-2',
    title: 'UX Designer',
    company: 'Airbnb',
    companyInitial: 'A',
    location: 'Seattle, WA (Hybrid)',
    remote: false,
    salaryRange: '$120k - $140k',
    matchScore: 75,
    tags: ['Design', 'Travel'],
    postedAt: '5d ago',
    description: 'A strong design-systems focused role within the Travel org.',
    stage: 'applied',
    url: 'https://careers.airbnb.com',
  },
  {
    id: 'job-3',
    title: 'Frontend Developer',
    company: 'Stripe',
    companyInitial: 'S',
    location: 'New York, NY (Hybrid)',
    remote: false,
    salaryRange: '$130k - $160k',
    matchScore: 80,
    tags: ['React', 'Payments'],
    postedAt: '1w ago',
    description: 'Own core checkout surfaces used by millions of merchants.',
    stage: 'saved',
    url: 'https://stripe.com/jobs',
  },
];

export const DREAM_COMPANIES: DreamCompany[] = [
  {
    id: 'dream-1',
    name: 'Apex Dynamics',
    initial: 'A',
    industry: 'Enterprise AI Solutions',
    openRoles: 6,
    matchScore: 85,
    isFollowing: true,
  },
  {
    id: 'dream-2',
    name: 'Nebula Systems',
    initial: 'N',
    industry: 'Cloud Infrastructure',
    openRoles: 3,
    matchScore: 62,
    isFollowing: true,
  },
];

// ---------------------------------------------------------------------------
// Resume
// ---------------------------------------------------------------------------

export const RESUME_VERSIONS: ResumeVersion[] = [
  { id: 'res-1', name: 'PM Tailored - FinTech', updatedAt: '2d ago', atsScore: 94, isActive: true },
  { id: 'res-2', name: 'General PM Role', updatedAt: '1w ago', atsScore: 88, isActive: false },
];

export const TAILORING_SUGGESTIONS: TailoringSuggestion[] = [
  {
    id: 'tail-1',
    original: 'Collaborated with engineering teams to build new features.',
    suggested:
      'Partnered closely with cross-functional engineering teams to ensure pixel-perfect implementation, leveraging A/B testing data.',
    reason: 'Strengthens ownership and adds a measurable technique.',
  },
  {
    id: 'tail-2',
    original: 'Made wireframes and prototypes for the app.',
    suggested:
      'Drove end-to-end design process, delivering high-fidelity prototypes in Figma while adhering to accessibility standards.',
    reason: 'Signals process ownership and technical craft.',
  },
];

// ---------------------------------------------------------------------------
// Roadmap & projects
// ---------------------------------------------------------------------------

export const ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    id: 'ms-1',
    title: 'Foundations',
    description: 'Mastering Generative Interview Techniques',
    status: 'in-progress',
    duration: '30 days',
    skills: ['Empathy Mapping', 'Moderation'],
  },
  {
    id: 'ms-2',
    title: 'Methods',
    description: 'Mixed-method research design',
    status: 'locked',
    duration: '90 days',
    skills: ['Surveys', 'Diary Studies'],
  },
  {
    id: 'ms-3',
    title: 'Leadership',
    description: 'Leading research programs across teams',
    status: 'locked',
    duration: '6 months',
    skills: ['Stakeholder Management'],
  },
  {
    id: 'ms-4',
    title: 'Mastery',
    description: 'Org-wide research strategy',
    status: 'locked',
    duration: '1 year',
    skills: ['Strategy'],
  },
];

export const PROJECT_RECOMMENDATIONS: ProjectRecommendation[] = [
  {
    id: 'pr-1',
    title: 'React Analytics Dashboard',
    description: 'Build a mock dashboard using Recharts to visualize user engagement metrics.',
    difficulty: 'Beginner',
    skills: ['React', 'Tailwind', 'Data Viz'],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBtNcc9jlONvSq8Q6amVQ6RzTdzUBV3de5OS4rDduybkzcR_r900VtZT0OolXMIT4RxnfUWx-xB1Y7Uuqw4lJzLeTTHq1fZ3a154KQ_roW6IhDHamkfDJgAClf9PDzWazk0BMynVQ8qi6cPsiQaXaBCpwECmzg9CpaGsr-D5FQWuokQEMMIFBytMl-s7-q_XkO5BfhkDziOtzTCV4R-7oCf6XOPOtk0510t_xvs1IxaNIUrpo6f4IImvg',
    estimatedHours: 18,
  },
  {
    id: 'pr-2',
    title: 'NLP Sentiment Analyzer',
    description: 'Create a Python API that analyzes product reviews and categorizes sentiment.',
    difficulty: 'Intermediate',
    skills: ['Python', 'FastAPI', 'HuggingFace'],
    imageUrl: '',
    estimatedHours: 28,
  },
  {
    id: 'pr-3',
    title: 'Distributed Caching System',
    description: 'Design and implement an in-memory caching layer mimicking Redis core features.',
    difficulty: 'Advanced',
    skills: ['Go', 'Concurrency', 'System Design'],
    imageUrl: '',
    estimatedHours: 42,
  },
];

// ---------------------------------------------------------------------------
// Interview
// ---------------------------------------------------------------------------

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q-1',
    category: 'Behavioral',
    question: 'Tell me about a time you had to lead a project with limited resources.',
    tip: 'Use the STAR method: Situation, Task, Action, Result.',
  },
  {
    id: 'q-2',
    category: 'Behavioral',
    question: 'Describe a situation where you disagreed with a team member.',
    tip: 'Focus on how you resolved the conflict constructively.',
  },
];

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content:
      "Can you review my latest resume bullet points for the Senior UX Designer role at Stripe? I want to make sure I'm emphasizing business impact.",
    timestamp: '10:01 AM',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content:
      "These are looking much stronger. You've clearly shifted from task-based descriptions to impact-driven achievements. Let's refine the metrics to be even more compelling for a company like Stripe.",
    timestamp: '10:02 AM',
  },
  {
    id: 'msg-3',
    role: 'user',
    content:
      "That's incredibly helpful. Let's practice interviewing for that first bullet point. What kind of behavioral question might they ask about it?",
    timestamp: '10:05 AM',
  },
];

export const CHAT_SUGGESTION_CHIPS: ChatSuggestionChip[] = [
  { id: 'chip-1', label: 'Help me use the STAR method' },
  { id: 'chip-2', label: 'What if the project failed?' },
  { id: 'chip-3', label: 'Critique my portfolio layout' },
];

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'tl-1',
    title: 'B.S. Computer Science',
    organization: 'University Graduation',
    period: 'June 2023',
    type: 'education',
    description: 'Graduated with honors. Specialized in Machine Learning and Data Structures.',
  },
  {
    id: 'tl-2',
    title: 'Junior ML Engineer',
    organization: 'Current role',
    period: 'Today',
    type: 'role',
    description:
      'Currently focusing on data pipeline optimization and basic model deployment. Recommended next step: Advanced PyTorch certification.',
  },
  {
    id: 'tl-3',
    title: 'Cloud Architecture Cert',
    organization: 'Target: Q3 2024',
    period: 'In progress · 65%',
    type: 'certification',
    description:
      'Mastering scalable AI deployments on AWS/GCP to bridge the gap between local models and production environments.',
  },
  {
    id: 'tl-4',
    title: 'Senior AI Engineer',
    organization: 'Goal: 2026',
    period: 'Locked',
    type: 'achievement',
    description:
      'Leading end-to-end AI initiatives, architecting novel LLM integrations, and mentoring junior engineers.',
  },
];

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Job Match: Senior Product Designer',
    description:
      'Based on your updated resume, we found a high-compatibility match at TechFlow Inc. Their roadmap aligns with your 3-year goals.',
    timestamp: '10:42 AM',
    category: 'job',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Roadmap Milestone Achieved',
    description:
      'You completed the "Advanced Prototyping" module. Your profile score has increased.',
    timestamp: '2:15 PM',
    category: 'system',
    read: true,
  },
  {
    id: 'notif-3',
    title: 'New message from Mentor AI',
    description:
      'I reviewed your latest interview answers. I have a few tips on structuring your responses using the STAR method.',
    timestamp: 'Yesterday',
    category: 'ai',
    read: true,
  },
];

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  {
    id: 'pref-1',
    label: 'Anonymous Usage Analytics',
    description:
      'Allow CareerPilot AI to collect anonymous telemetry to improve model performance. No personal identifiable information (PII) is shared.',
    enabled: true,
  },
  {
    id: 'pref-2',
    label: 'AI Model Training',
    description:
      'Opt-in to allow your anonymized resume and interview prep data to fine-tune our global AI suggestions.',
    enabled: false,
  },
];
