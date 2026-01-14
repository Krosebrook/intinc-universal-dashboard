import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface ActiveFiltersProps {
  globalFilters: Record<string, any>;
  onClear: () => void;
  onRemove: (key: string, value: any) => void;
}

export function ActiveFilters({ globalFilters, onClear, onRemove }: ActiveFiltersProps) {
  const activeFilterCount = Object.values(globalFilters).filter(Boolean).length;

  return (
    <AnimatePresence>
      {activeFilterCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-between glass-card border-primary/30 bg-primary/5 px-4 py-2 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <Filter size={14} />
              Active Filters ({activeFilterCount})
            </div>
            <div className="flex gap-2">
              {Object.entries(globalFilters).map(([key, value]) => value && (
                <div key={key} className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-lg text-xs font-medium border border-white/5">
                  <span className="text-muted-foreground">{key}:</span> {String(value)}
                  <button onClick={() => onRemove(key, value)} className="hover:text-primary transition-colors">
                    <XCircle size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClear} className="text-[10px] font-bold uppercase tracking-widest h-7">
            Clear All
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
