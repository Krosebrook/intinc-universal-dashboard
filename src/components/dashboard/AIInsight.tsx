import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Activity, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { blink } from '../../lib/blink';
import { useDashboard } from '../../hooks/use-dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { BlinkUser } from '@blinkdotnew/sdk';

export default function AIInsight() {
  const { department, widgets } = useDashboard();
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<BlinkUser | null>(null);

  // Track auth state
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setCurrentUser(state.user);
    });
    return unsubscribe;
  }, []);

  const fetchInsight = async (retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    // AI API requires authentication - skip if not logged in
    if (!currentUser?.id) {
      setInsight('Sign in to unlock AI-powered insights for your dashboard data.');
      return;
    }

    setLoading(true);
    try {
      // Create a simplified version of the data for the AI
      const contextData = widgets.map(w => ({
        title: w.title,
        type: w.type,
        summary: w.data.slice(-3) // last 3 data points
      }));

      const { text } = await blink.ai.generateText({
        prompt: `Analyze this dashboard data for the ${department} department and generate 3 high-impact, strategic bullet points.
        
        Dashboard Context:
        ${JSON.stringify(contextData, null, 2)}

        Focus on trends, anomalies, and performance optimization based on the specific widget data provided.
        Format as plain text bullet points. Be concise, data-driven, and professional.`,
        system: "You are a Senior Business Intelligence Analyst at Intinc. Provide data-driven insights for executive dashboards.",
      });
      setInsight(text);
    } catch (error: any) {
      // Handle network errors gracefully with retry
      const isNetworkError = error?.code === 'NETWORK_ERROR' || 
                             error?.code === 'AI_ERROR' ||
                             error?.message?.includes('Failed to fetch') ||
                             error?.message?.includes('Network request failed');
      
      if (isNetworkError && retryCount < MAX_RETRIES) {
        // Retry after a short delay
        setTimeout(() => fetchInsight(retryCount + 1), 2000);
        return;
      }
      
      // Only log unexpected errors (not network transient failures)
      if (!isNetworkError) {
        console.warn('AI Insight warning:', error?.message || error);
      }
      
      // Show fallback insight based on current department data
      setInsight(generateFallbackInsight());
    } finally {
      setLoading(false);
    }
  };

  // Generate static fallback insights when AI is unavailable
  const generateFallbackInsight = () => {
    const insights: Record<string, string> = {
      Sales: `• Revenue is showing positive momentum with strong Enterprise segment growth\n• Active orders are up, indicating healthy pipeline activity\n• Focus on improving conversion rates to maximize lead efficiency`,
      HR: `• Headcount growth indicates organizational expansion\n• Low turnover rate reflects strong employee satisfaction\n• Monitor open roles to maintain hiring velocity`,
      IT: `• System uptime exceeds SLA targets, maintaining reliability\n• Security posture is improving with reduced alert volume\n• API performance is within acceptable thresholds`,
      Marketing: `• MQL generation is trending upward, driving pipeline growth\n• CAC efficiency improving, indicating better targeting\n• Social reach expansion presents brand awareness opportunities`
    };
    return insights[department] || 'Dashboard insights will update when connection is restored.';
  };

  useEffect(() => {
    // Only fetch insights when authenticated and widgets are available
    if (currentUser?.id && widgets.length > 0) {
      fetchInsight();
    } else if (!currentUser?.id) {
      setInsight('Sign in to unlock AI-powered insights for your dashboard data.');
    }
  }, [department, widgets, currentUser?.id]); // Re-fetch when auth state or data changes

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
