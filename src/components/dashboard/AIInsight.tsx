import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Activity, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { blink } from '../../lib/blink';
import { useDashboard } from '../../hooks/use-dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function AIInsight() {
  const { department } = useDashboard();
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Generate 3 high-impact, strategic bullet points for a ${department} dashboard. 
        Focus on trends, anomalies, and performance optimization. 
        Format as plain text bullet points. Be concise and professional.`,
        system: "You are a Senior Business Intelligence Analyst at Intinc. Provide data-driven insights for executive dashboards.",
      });
      setInsight(text);
    } catch (error) {
      console.error('AI Insight Error:', error);
      setInsight('Unable to generate AI insights at this time. Please check your connection or try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [department]);

  return (
    <Card className="bg-primary border-none shadow-2xl shadow-primary/20 relative overflow-hidden h-full min-h-[350px]">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Sparkles size={180} />
      </div>
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70">Intelligence Engine</span>
          </div>
          <button 
            onClick={fetchInsight}
            disabled={loading}
            className="text-primary-foreground/50 hover:text-primary-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={cn(loading && "animate-spin")} />
          </button>
        </div>
        <CardTitle className="text-2xl text-white font-bold tracking-tight">AI Analysis</CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
              <p className="text-sm text-white/40 font-medium">Analyzing department data...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {insight.split('\n').filter(p => p.trim()).map((p, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="mt-2 w-2 h-2 rounded-full bg-white/40 group-hover:bg-white group-hover:scale-125 transition-all shrink-0" />
                  <p className="text-base text-white/90 font-medium leading-relaxed">
                    {p.replace(/^[•\-\d.]\s*/, '')}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
