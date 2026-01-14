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
        <Card className="glass-card border-indigo-500/30 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-50" />
          
          <div className="p-4 relative space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-white">{suggestedStep.title}</h3>
              </div>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              {suggestedStep.description}
            </p>

            <div className="pt-2">
              <Button 
                size="sm" 
                onClick={suggestedStep.onAction}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-500/20 group/btn"
              >
                <span className="flex items-center gap-2">
                  Do it for me
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
