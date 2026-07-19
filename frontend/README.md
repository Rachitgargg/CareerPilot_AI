# CareerPilot AI — Frontend

Production-ready React frontend for the CareerPilot AI platform, converted from the approved
Stitch HTML/PNG design into a scalable, typed, component-driven codebase.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS (design tokens mapped 1:1 from the approved design system)
- shadcn/ui-style primitives (Radix UI under the hood)
- React Router v7
- Framer Motion
- lucide-react (replacing the design's Material Symbols icon set)

## Getting started

```bash
npm install
npm run dev       # start local dev server
npm run build     # type-check + production build
npm run preview   # preview the production build
```

## Project structure

```
src/
  components/
    ui/          shadcn-style primitives (Button, Card, Badge, Tabs, Dialog, ...)
    common/      cross-domain shared components (ProgressRing, SectionHeading, MatchScoreBadge)
    layout/      app shell (Sidebar, MobileBottomNav, TopHeader, Footer, AppLayout)
    dashboard/   dashboard-only components
    jobs/        job discovery + dream company components
    interview/   interview prep components
    resume/      resume upload/tailoring components
    roadmap/     learning roadmap + project recommendation components
    profile/     profile page components
  pages/         one component per screen (16 screens total)
  routes/        React Router route table + shared nav config
  services/      mock "API" layer — swap function bodies for real fetch calls later
  types/         shared TypeScript domain interfaces
  hooks/         (reserved for future custom hooks)
  context/       (reserved for future global state, e.g. auth)
  utils/         cn() class merge helper
```

## Screens

1. Landing page (`/`)
2. Onboarding wizard (`/onboarding`)
3. Resume upload (`/resume-upload`)
4. Career dashboard (`/dashboard`)
5. Job discovery (`/jobs`)
6. Project recommendations (`/projects`)
7. Learning roadmap (`/roadmap`)
8. Interview preparation (`/interview-prep`)
9. Resume tailoring (`/resume-tailoring`)
10. AI chat (`/chat`)
11. Profile (`/profile`)
12. Settings (`/settings`)
13. Application tracker (`/tracker`)
14. Dream company tracker (`/dream-companies`)
15. Career timeline (`/timeline`)
16. Notifications center (`/notifications`)

## Data layer

Every page reads from `src/services/*Service.ts`. Each service exposes async functions
(`getJobs()`, `getMessages()`, `sendMessage()`, etc.) backed by mock fixtures in
`src/services/mockData.ts` with a simulated network delay (`withLatency`). Because every
service function is already `async` and returns typed data, wiring up a real FastAPI backend
later is a matter of replacing the function body with a `fetch`/`axios` call — no component
code needs to change.

## Design fidelity

Layout, spacing, color tokens, typography scale, corner radii, and animations were carried
over directly from the approved design's Tailwind config. Material Symbols icons were mapped
1:1 to their closest `lucide-react` equivalents.
