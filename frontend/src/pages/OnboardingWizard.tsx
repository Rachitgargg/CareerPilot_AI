import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plane, Briefcase, Target, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { OnboardingStep } from '@/types';

const steps: OnboardingStep[] = [
  { id: 1, title: 'What are you aiming for?', description: 'Choose the career goal that matches your ambitions.' },
  { id: 2, title: 'What is your experience level?', description: 'This helps us calibrate recommendations.' },
  { id: 3, title: 'Pick your focus skills', description: 'Select the areas you want to grow in.' },
  { id: 4, title: "You're all set", description: 'Your personalized dashboard is ready.' },
];

const goalOptions = [
  { label: 'Land my next role', icon: Briefcase },
  { label: 'Switch careers', icon: Target },
  { label: 'Grow within my company', icon: GraduationCap },
];

const experienceOptions = ['Entry level', 'Mid level', '5+ years', 'Leadership'];
const skillOptions = ['Product Strategy', 'UX Research', 'Data Analysis', 'Engineering', 'Design Systems', 'AI/ML'];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);

  const step = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const toggleSkill = (skill: string) => {
    setSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  };

  const handleNext = () => {
    if (stepIndex === steps.length - 1) {
      navigate('/resume-upload');
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const canProceed =
    stepIndex === 0 ? !!goal : stepIndex === 1 ? !!experience : stepIndex === 2 ? skills.length > 0 : true;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 md:px-container-padding h-20">
        <div className="flex items-center gap-2">
          <Plane size={24} />
          <span className="font-headline-md text-headline-md text-primary">CareerPilot AI</span>
        </div>
        <span className="font-metadata text-metadata text-on-surface-variant">
          Step {stepIndex + 1} of {steps.length}
        </span>
      </header>

      <div className="px-6 md:px-container-padding">
        <Progress value={progress} className="max-w-xl mx-auto" />
      </div>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-xl flex flex-col items-center text-center gap-8"
          >
            <div>
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
                {step.title}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">{step.description}</p>
            </div>

            {stepIndex === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {goalOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setGoal(opt.label)}
                    className={`flex flex-col items-center gap-3 rounded-card p-6 border-2 transition-colors ${
                      goal === opt.label
                        ? 'border-primary bg-surface-container-low'
                        : 'border-surface-variant hover:border-outline-variant'
                    }`}
                  >
                    <opt.icon size={26} className="text-primary" />
                    <span className="font-body-md text-body-md">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}

            {stepIndex === 1 && (
              <div className="grid grid-cols-2 gap-4 w-full">
                {experienceOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setExperience(opt)}
                    className={`rounded-full px-6 py-4 border-2 font-body-md text-body-md transition-colors ${
                      experience === opt
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-surface-variant hover:border-outline-variant'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {stepIndex === 2 && (
              <div className="flex flex-wrap gap-3 justify-center w-full">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-full px-5 py-3 border-2 font-body-md text-body-md transition-colors ${
                      skills.includes(skill)
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-surface-variant hover:border-outline-variant'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}

            {stepIndex === 3 && (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle2 size={56} className="text-primary" />
                <p className="font-body-md text-body-md text-on-surface-variant">
                  We'll use your goal, experience, and skill focus to tailor every recommendation.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="px-6 md:px-container-padding pb-10 flex justify-center">
        <Button size="lg" disabled={!canProceed} onClick={handleNext} className="w-full max-w-xs">
          {stepIndex === steps.length - 1 ? 'Go to dashboard' : 'Continue'}
        </Button>
      </footer>
    </div>
  );
}
