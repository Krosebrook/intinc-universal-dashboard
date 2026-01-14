import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface DashboardDevModeProps {
  isVisible: boolean;
  jsonConfig: string;
  onJsonChange: (value: string) => void;
  onApply: () => void;
  onClose: () => void;
}

export function DashboardDevMode({
  isVisible,
  jsonConfig,
  onJsonChange,
  onApply,
  onClose,
}: DashboardDevModeProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="glass-card border-primary/20 bg-primary/5 p-6 rounded-2xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Dashboard Specification (WSL)</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
                <Button size="sm" onClick={onApply}>Apply Changes</Button>
              </div>
            </div>
            <textarea
              value={jsonConfig}
              onChange={(e) => onJsonChange(e.target.value)}
              className="w-full h-64 bg-zinc-950/50 border border-white/10 rounded-xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-primary/50 transition-colors"
              spellCheck={false}
            />
            <p className="text-[10px] text-muted-foreground mt-2">
              Directly modify the JSON representation of your dashboard layout and widget data. 
              Be careful: invalid JSON will prevent updates.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
