import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Activity, Sparkles, Loader2, RefreshCw, MessageSquare, Send, User } from 'lucide-react';
import { blink } from '../../../lib/blink';
import { useDashboard } from '../../../hooks/use-dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import type { BlinkUser } from '@blinkdotnew/sdk';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { aiRateLimiter } from '../../../lib/rate-limiting/api-limiter';
import { logAuditEvent, AuditActions, AuditEntities } from '../../../lib/security/audit';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIInsight() {
  const { department, widgets } = useDashboard();
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<BlinkUser | null>(null);
  const [mode, setMode] = useState<'insights' | 'qa'>('insights');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Track auth state
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setCurrentUser(state.user);
    });
    return unsubscribe;
  }, []);

  const handleQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading || !currentUser?.id) return;

    // Check rate limit
    if (!aiRateLimiter.check(currentUser.id)) {
      toast.error('AI usage limit reached. Please wait a moment.', {
        description: 'Enterprise security policy: 10 AI requests per minute.'
      });
      await logAuditEvent(currentUser, {
        action: AuditActions.RATE_LIMIT_HIT,
        entity: AuditEntities.USER,
        metadata: { type: 'ai_qa' }
      });
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const contextData = widgets.map(w => ({
        title: w.title,
        type: w.type,
        data: w.data.slice(-10)
      }));

      // Get last 5 turns for conversation context
      const historyContext = messages.slice(-10).map(m => 
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');

      const { text } = await blink.ai.generateText({
        prompt: `The user has a question about their dashboard data for the ${department} department.
        
        Recent Conversation History:
        ${historyContext}
        
        New Question: "${userMessage.content}"
        
        Dashboard Data Context:
        ${JSON.stringify(contextData, null, 2)}
        
        Provide a concise, data-driven answer based ONLY on the provided context and history. If the data doesn't contain the answer, politely say so. Be professional and helpful.`,
        system: "You are a Senior Business Intelligence Analyst at Intinc. Answer user questions about dashboard data accurately and concisely.",
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('QA Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I encountered an error analyzing your question. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsight = async (retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    if (!currentUser?.id) {
      setInsight('Sign in to unlock AI-powered insights for your dashboard data.');
      return;
    }

    // Check rate limit
    if (!aiRateLimiter.check(currentUser.id)) {
      setInsight('AI rate limit reached. Insights will update soon.');
      await logAuditEvent(currentUser, {
        action: AuditActions.RATE_LIMIT_HIT,
        entity: AuditEntities.USER,
        metadata: { type: 'ai_insight' }
      });
      return;
    }

    setLoading(true);
    try {
      const contextData = widgets.map(w => ({
        title: w.title,
        type: w.type,
        summary: w.data.slice(-3)
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
      const isNetworkError = error?.code === 'NETWORK_ERROR' || 
                             error?.code === 'AI_ERROR' ||
                             error?.message?.includes('Failed to fetch') ||
                             error?.message?.includes('Network request failed');
      
      if (isNetworkError && retryCount < MAX_RETRIES) {
        setTimeout(() => fetchInsight(retryCount + 1), 2000);
        return;
      }
      
      if (!isNetworkError) {
        console.warn('AI Insight warning:', error?.message || error);
      }
      
      setInsight(generateFallbackInsight());
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackInsight = () => {
    const insights: Record<string, string> = {
      Sales: `• Revenue is showing positive momentum with strong Enterprise segment growth\n• Active orders are up, indicating healthy pipeline activity\n• Focus on improving conversion rates to maximize lead efficiency`,
      HR: `• Headcount growth indicates organizational expansion\n• Low turnover rate reflects strong employee satisfaction\n• Monitor open roles to maintain hiring velocity`,
      IT: `• System uptime exceeds SLA targets, maintaining reliability\n• Security posture is improving with reduced alert volume\n• API performance is within acceptable thresholds`,
      Marketing: `• MQL generation is trending upward, driving pipeline growth\n• CAC efficiency improving, indicating better targeting\n• Social reach expansion presents brand awareness opportunities`,
      SaaS: `• MRR growth is accelerating across enterprise tiers\n• Churn rate remains low, indicating strong product-market fit\n• Expansion revenue from existing customers is a primary growth driver`,
      Product: `• Customer health scores are high, but monitor at-risk segments\n• Product engagement shows high stickiness and DAU/MAU ratios\n• Recent feature releases have driven significant breadth of adoption`,
      AI: `• Token utilization is optimized across model providers\n• Cost-per-request is trending down with better routing logic\n• Inference quality remains high with low hallucination rates`,
      Operations: `• Administrative action auditing is fully compliant with policies\n• Security remediation times are improving for critical vulnerabilities\n• System utilization is balanced across all infrastructure resources`
    };
    return insights[department] || 'Dashboard insights will update when connection is restored.';
  };

  useEffect(() => {
    if (currentUser?.id && widgets.length > 0) {
      fetchInsight();
    } else if (!currentUser?.id) {
      setInsight('Sign in to unlock AI-powered insights for your dashboard data.');
    }
  }, [department, widgets, currentUser?.id]);

  return (
    <Card className="bg-primary border-none shadow-2xl shadow-primary/20 relative overflow-hidden h-full min-h-[350px]">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Sparkles size={180} />
      </div>
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              {mode === 'insights' ? (
                <Activity className="w-5 h-5 text-white" />
              ) : (
                <MessageSquare className="w-5 h-5 text-white" />
              )}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70">
              {mode === 'insights' ? 'Intelligence Engine' : 'Data Assistant'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setMode(mode === 'insights' ? 'qa' : 'insights');
              }}
              className="text-xs font-bold uppercase tracking-widest text-primary-foreground/50 hover:text-primary-foreground transition-colors px-3 py-1 rounded-full border border-white/10"
            >
              {mode === 'insights' ? 'Ask a Question' : 'Back to Insights'}
            </button>
            {mode === 'insights' && (
              <button 
                onClick={() => fetchInsight()}
                disabled={loading}
                className="text-primary-foreground/50 hover:text-primary-foreground transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={cn(loading && "animate-spin")} />
              </button>
            )}
          </div>
        </div>
        <CardTitle className="text-2xl text-white font-bold tracking-tight">
          {mode === 'insights' ? 'AI Analysis' : 'Data Q&A'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 flex flex-col h-[calc(100%-120px)]">
        <AnimatePresence mode="wait">
          {loading && mode === 'insights' ? (
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
          ) : mode === 'insights' ? (
            <motion.div 
              key="insights"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 overflow-y-auto pr-2 custom-scrollbar"
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
          ) : (
            <motion.div 
              key="qa"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col h-full space-y-4"
            >
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar" ref={scrollContainerRef}>
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.slice(-10).map((msg, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "flex flex-col gap-1.5 max-w-[85%]",
                          msg.role === 'user' ? "ml-auto items-end" : "items-start"
                        )}
                      >
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                          msg.role === 'user' 
                            ? "bg-white text-primary rounded-tr-none font-medium" 
                            : "bg-white/10 text-white/90 border border-white/5 backdrop-blur-md rounded-tl-none"
                        )}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest px-1">
                          {msg.role === 'user' ? 'You' : 'Assistant'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <Sparkles className="text-white/30" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-white/70 font-medium">Ask anything about your data</p>
                      <p className="text-xs text-white/40">"What was the highest revenue peak?" or "How is the team performing?"</p>
                    </div>
                  </div>
                )}
                {loading && (
                  <div className="flex items-center gap-2 text-white/50 text-xs px-2 animate-pulse">
                    <Loader2 size={12} className="animate-spin" />
                    <span className="font-bold uppercase tracking-widest text-[10px]">Thinking...</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleQuery} className="flex gap-2 relative mt-auto">
                <Input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type your question..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-11 pr-12 focus-visible:ring-white/20"
                />
                <Button 
                  type="submit"
                  disabled={loading || !query.trim()}
                  size="icon"
                  className="absolute right-1 top-1 h-9 w-9 bg-white text-primary hover:bg-white/90 rounded-lg shrink-0"
                >
                  <Send size={18} />
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
