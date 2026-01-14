import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useDashboard } from '../../hooks/use-dashboard';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function SmartAssistant() {
  const { suggestedStep } = useDashboard();
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (suggestedStep) {
      setIsVisible(true);
    }
  }, [suggestedStep]);

  if (!suggestedStep || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm"
      >
        <Card className="glass-card border-primary/30 shadow-2xl overflow-hidden relative group rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50 pointer-events-none" />
          
          <div className="p-5 relative space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20 text-primary animate-pulse shadow-glow shadow-primary/10">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white tracking-tight leading-none">{suggestedStep.title}</h3>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1 block">AI Recommendation</span>
                </div>
              </div>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-white/40 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/70 leading-relaxed font-medium">
              {suggestedStep.description}
            </p>

            <div className="pt-1">
              <Button 
                size="sm" 
                onClick={suggestedStep.onAction}
                className="w-full bg-primary hover:bg-primary-glow text-primary-foreground border-none shadow-lg shadow-primary/20 group/btn h-10 rounded-xl font-bold uppercase tracking-widest text-[10px]"
              >
                <span className="flex items-center gap-2">
                  Execute Action
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                </span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
