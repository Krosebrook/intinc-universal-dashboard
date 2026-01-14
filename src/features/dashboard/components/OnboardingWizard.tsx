import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Sparkles, 
  PlusCircle, 
  Layers, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ElementType;
  image?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Welcome to Intinc",
    description: "Your universal dashboard engine for modern enterprise data. Let's get you settled in.",
    icon: BarChart3,
  },
  {
    title: "Dynamic Dashboards",
    description: "Switch between departments like HR, Sales, and IT with a single click. Every view is perfectly tailored.",
    icon: Layers,
  },
  {
    title: "AI-Powered Insights",
    description: "Our Smart Assistant analyzes your datasets to provide instant takeaways and actionable recommendations.",
    icon: Sparkles,
  },
  {
    title: "Build Your Own",
    description: "Use our Visual Widget Builder to create custom visualizations from any CSV or connected API source.",
    icon: PlusCircle,
  },
  {
    title: "All Set!",
    description: "You're ready to start building. Export your data to PDF or collaborate with your team in real-time.",
    icon: CheckCircle2,
  },
];

interface OnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function OnboardingWizard({ open, onOpenChange, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = ONBOARDING_STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-white/10 bg-slate-950 text-white overflow-hidden p-0">
        <div className="relative">
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />

          <div className="p-8 space-y-8 relative">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Step {currentStep + 1} of {totalSteps}
                </span>
                <Progress value={progress} className="h-1 w-32 bg-white/5" />
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mx-auto">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>

                  <div className="text-center space-y-2">
                    <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                      {step.title}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-base leading-relaxed">
                      {step.description}
                    </DialogDescription>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <DialogFooter className="flex flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="text-slate-400 hover:text-white hover:bg-white/5"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
              >
                {currentStep === totalSteps - 1 ? "Get Started" : "Next"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
