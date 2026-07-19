import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Sparkles, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Tailored Resumes',
    description: 'Get your resume rewritten in seconds to match any job description, boosting your ATS score.',
  },
  {
    icon: Target,
    title: 'Precision Job Matching',
    description: 'We surface roles ranked by true compatibility with your skills and career trajectory.',
  },
  {
    icon: TrendingUp,
    title: 'Personalized Roadmaps',
    description: 'A step-by-step learning plan generated from your goals, updated as you grow.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body-md">
      <header className="flex justify-between items-center w-full h-20 px-6 md:px-container-padding sticky top-0 bg-background/80 backdrop-blur-sm z-40">
        <div className="flex items-center gap-2">
          <Plane size={26} />
          <span className="font-headline-md text-headline-md text-primary">CareerPilot AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/onboarding">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/onboarding">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 md:px-container-padding py-section-margin flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl text-primary tracking-tight">
              Navigate your career with an AI co-pilot.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-6 max-w-2xl mx-auto">
              CareerPilot AI tailors your resume, preps you for interviews, and charts your path to the
              role you actually want.
            </p>
            <div className="flex items-center justify-center gap-4 mt-10">
              <Button size="lg" asChild>
                <Link to="/onboarding">
                  Start your journey <ArrowRight size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard">View demo</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        <section className="px-6 md:px-container-padding pb-section-margin grid grid-cols-1 md:grid-cols-3 gap-card-gap max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-surface-container-low rounded-card p-8 flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center">
                <feature.icon size={22} />
              </div>
              <h3 className="font-headline-md text-headline-md text-primary">{feature.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{feature.description}</p>
            </motion.div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
