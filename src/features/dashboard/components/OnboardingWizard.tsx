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
import { cn } from '@/lib/utils';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ElementType;
  image?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Welcome to Intinc",
    description: "Your universal dashboard engine for modern enterprise data. We've optimized your workspace for peak intelligence.",
    icon: BarChart3,
  },
  {
    title: "Departmental Intelligence",
    description: "Switch between Sales, HR, IT and more using the sidebar. Each department features its own unique KPI set and AI models.",
    icon: Layers,
  },
  {
    title: "Data Explorer Mode",
    description: "Need to analyze custom data? Switch to Explorer mode to drop CSV files or connect direct API streams effortlessly.",
    icon: Database,
  },
  {
    title: "AI Smart Insights",
    description: "Our proprietary AI models automatically analyze your widgets to surface the 'Top 3 Takeaways' for your team.",
    icon: Sparkles,
  },
  {
    title: "Visual Widget Builder",
    description: "Create stunning Recharts-powered visualizations in seconds using our point-and-click builder—no code required.",
    icon: PlusCircle,
  },
  {
    title: "Real-time Collaboration",
    description: "Tag teammates, leave comments on specific widgets, and share live dashboard links for instant decision making.",
    icon: Users,
  },
  {
    title: "Enterprise Export",
    description: "Generate high-fidelity, production-ready PDF reports that preserve your custom branding and design system.",
    icon: Share2,
  },
  {
    title: "Full Control",
    description: "You're ready to master your data. Welcome to the future of enterprise intelligence.",
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
      <DialogContent className="sm:max-w-[540px] border-white/10 bg-slate-950 text-white overflow-hidden p-0 gap-0 shadow-2xl shadow-primary/20">
        <div className="relative">
          {/* Progress bar at the very top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden z-50">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="p-10 space-y-10 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold tracking-tight">intinc</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onComplete}
                className="text-slate-500 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest"
              >
                Skip
              </Button>
            </div>

            <div className="min-h-[280px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-8"
                >
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all duration-500" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white/5 border border-white/10 mx-auto backdrop-blur-sm">
                      <Icon className="h-12 w-12 text-primary" />
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <DialogTitle className="text-3xl font-bold tracking-tight text-white">
                      {step.title}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-lg leading-relaxed max-w-[400px] mx-auto">
                      {step.description}
                    </DialogDescription>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <DialogFooter className="flex flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
              <div className="flex gap-1.5">
                {ONBOARDING_STEPS.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === currentStep ? "w-8 bg-primary" : "w-1.5 bg-white/10"
                    )}
                  />
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="text-slate-400 hover:text-white hover:bg-white/5"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90 text-white min-w-[140px] shadow-lg shadow-primary/20 font-bold"
                >
                  {currentStep === totalSteps - 1 ? "Get Started" : "Continue"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
