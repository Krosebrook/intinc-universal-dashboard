import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeatureSpotlightProps {
  featureId: string;
  title: string;
  description: string;
  targetId: string;
  onClose?: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function FeatureSpotlight({ 
  featureId, 
  title, 
  description, 
  targetId, 
  onClose,
  position = 'bottom' 
}: FeatureSpotlightProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem(`spotlight_${featureId}`);
    if (!hasSeen) {
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
          setIsVisible(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [featureId, targetId]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`spotlight_${featureId}`, 'true');
    if (onClose) onClose();
  };

  if (!isVisible || !targetRect) return null;

  const positions = {
    top: { top: targetRect.top - 10, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, -100%)' },
    bottom: { top: targetRect.bottom + 10, left: targetRect.left + targetRect.width / 2, transform: 'translateX(-50%)' },
    left: { top: targetRect.top + targetRect.height / 2, left: targetRect.left - 10, transform: 'translate(-100%, -50%)' },
    right: { top: targetRect.top + targetRect.height / 2, left: targetRect.right + 10, transform: 'translateY(-50%)' },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* Backdrop highlight (optional) */}
        {/* <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={handleDismiss} /> */}
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          style={positions[position]}
          className="absolute pointer-events-auto z-[101]"
        >
          <div className="glass-card border-primary/30 bg-primary/10 backdrop-blur-xl p-4 rounded-2xl w-64 shadow-2xl shadow-primary/20 ring-1 ring-primary/20">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary">{title}</h3>
              <button 
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-[11px] text-foreground/80 leading-relaxed font-medium mb-4">
              {description}
            </p>
            <Button 
              size="sm" 
              onClick={handleDismiss}
              className="w-full bg-primary hover:bg-primary-glow text-primary-foreground text-[10px] font-black uppercase tracking-widest h-8 rounded-xl"
            >
              Got it
              <ArrowRight size={12} className="ml-2" />
            </Button>
          </div>

          {/* Indicator Arrow */}
          <div 
            className={cn(
              "absolute w-3 h-3 bg-primary/10 border-primary/30 transform rotate-45 z-[-1]",
              position === 'top' && "bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r",
              position === 'bottom' && "top-[-6px] left-1/2 -translate-x-1/2 border-t border-l",
              position === 'left' && "right-[-6px] top-1/2 -translate-y-1/2 border-t border-r",
              position === 'right' && "left-[-6px] top-1/2 -translate-y-1/2 border-b border-l",
            )}
          />
        </motion.div>
        
        {/* Pulsing highlight on the target */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute',
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
          className="border-2 border-primary rounded-xl pointer-events-none"
        />
      </div>
    </AnimatePresence>
  );
}
