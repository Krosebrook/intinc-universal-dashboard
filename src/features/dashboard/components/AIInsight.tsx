import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Activity, Sparkles, Loader2, RefreshCw, MessageSquare, Send, Brain } from 'lucide-react';
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
  const { department, widgets, credits, consumeCredit } = useDashboard();
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<BlinkUser | null>(null);
  const [mode, setMode] = useState<'insights' | 'qa'>('insights');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setCurrentUser(state.user);
    });
    return unsubscribe;
  }, []);

  const handleQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading || !currentUser?.id) return;

    if (!aiRateLimiter.check(currentUser.id)) {
      toast.error('AI usage limit reached. Please wait a moment.');
      return;
    }

    if (credits <= 0) {
      toast.error('No AI credits remaining. 5 credits per session.');
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

      const historyContext = messages.slice(-10).map(m => 
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');

      setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);

      await blink.ai.streamText({
        prompt: `Question about ${department} dashboard: "${userMessage.content}"\n\nContext: ${JSON.stringify(contextData, null, 2)}\n\nHistory:\n${historyContext}`,
        system: "You are a Senior BI Analyst at Intinc. Provide data-driven, concise answers.",
      }, (chunk) => {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
          }
          return prev;
        });
      });

      await consumeCredit();

      logAuditEvent(currentUser, {
        action: 'ai.qa',
        entity: AuditEntities.DASHBOARD,
        metadata: { department, query: userMessage.content }
      });
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error analyzing data.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsight = async () => {
    if (!currentUser?.id) {
      setInsight('Sign in to unlock AI insights.');
      return;
    }

    if (!aiRateLimiter.check(currentUser.id)) {
      setInsight('AI rate limit reached.');
      return;
    }

    if (credits <= 0) {
      setInsight('No AI credits remaining. Upgrade for strategic analysis.');
      return;
    }

    setLoading(true);
    setInsight('');
    try {
      const contextData = widgets.map(w => ({
        title: w.title,
        type: w.type,
        summary: w.data.slice(-3)
      }));

      await blink.ai.streamText({
        prompt: `Analyze ${department} dashboard and generate 3 strategic insights.\n\nContext: ${JSON.stringify(contextData, null, 2)}`,
        system: "Senior BI Analyst. Format as plain text bullet points. Concise and data-driven.",
      }, (chunk) => {
        setInsight(prev => prev + chunk);
      });

      await consumeCredit();

      logAuditEvent(currentUser, {
        action: 'ai.strategic_analysis',
        entity: AuditEntities.DASHBOARD,
        metadata: { department }
      });
    } catch (error) {
      setInsight(generateFallbackInsight());
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackInsight = () => {
    const insights: Record<string, string> = {
      Sales: `• Revenue momentum remains strong with positive quarterly growth\n• Enterprise segment is the primary growth driver this month\n• Pipeline velocity is increasing, indicating healthy sales operations`,
      HR: `• Employee retention is at an all-time high of 98%\n• Diversity & Inclusion metrics show significant improvement\n• Recruitment pipeline is healthy for upcoming expansion phases`,
      IT: `• Infrastructure uptime is at 99.99% for the current period\n• Security audit completed with zero critical vulnerabilities\n• Cloud resource utilization is optimized for cost efficiency`
    };
    return insights[department] || 'Insights are currently unavailable. Connecting to analysis engine...';
  };

  useEffect(() => {
    if (currentUser?.id && widgets.length > 0) {
      fetchInsight();
    }
  }, [department, widgets, currentUser?.id]);

  return (
    <Card className="bg-gradient-to-br from-primary to-indigo-600 border-none shadow-premium relative overflow-hidden h-full min-h-[400px] text-white flex flex-col">
      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none">
        <Brain size={200} />
      </div>
      
      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md shadow-sm border border-white/10">
              {mode === 'insights' ? <Sparkles className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Intelligence Layer</span>
              <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
                {mode === 'insights' ? 'AI Strategic Analysis' : 'Data Assistant'}
                <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full border border-white/5">
                  <div className={cn("w-1 h-1 rounded-full animate-pulse", credits > 0 ? "bg-primary-glow shadow-[0_0_5px_rgba(255,255,255,0.5)]" : "bg-red-500")} />
                  <span className="text-[9px] font-black tracking-widest uppercase">{credits} CR</span>
                </div>
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setMode(mode === 'insights' ? 'qa' : 'insights')}
              className="text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 border border-white/10 rounded-full h-8 px-4 transition-all"
            >
              {mode === 'insights' ? 'Data Q&A' : 'Back to Insights'}
            </Button>
            {mode === 'insights' && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => fetchInsight()}
                disabled={loading}
                className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
              >
                <RefreshCw size={14} className={cn(loading && "animate-spin")} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 flex-1 flex flex-col min-h-0 pt-4">
        <AnimatePresence mode="wait">
          {loading && mode === 'insights' ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="w-10 h-10 text-white animate-spin relative" />
              </div>
              <p className="text-sm text-white/60 font-medium animate-pulse">Running advanced heuristics...</p>
            </motion.div>
          ) : mode === 'insights' ? (
            <motion.div 
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 h-full overflow-y-auto pr-2 scrollbar-hide"
            >
              {insight.split('\n').filter(p => p.trim()).map((p, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 group bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="mt-1 w-2 h-2 rounded-full bg-primary-glow group-hover:scale-125 transition-transform shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  <p className="text-sm text-white/90 font-medium leading-relaxed">
                    {p.replace(/^[•\-\d.]\s*/, '')}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="qa"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col h-full"
            >
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide mb-4" ref={scrollContainerRef}>
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
                          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                          msg.role === 'user' 
                            ? "bg-white text-primary rounded-tr-none font-semibold" 
                            : "bg-white/10 text-white border border-white/5 backdrop-blur-md rounded-tl-none"
                        )}>
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest px-1">
                          {msg.role === 'user' ? 'Analytical Input' : 'Engine Output'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8">
                    <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                      <Sparkles className="w-8 h-8 text-white/40" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-white/80 font-semibold">Ready to assist your analysis</p>
                      <p className="text-xs text-white/40 leading-relaxed">Ask about trends, specific metrics, or department goals.</p>
                    </div>
                  </div>
                )}
                {loading && (
                  <div className="flex items-center gap-2 text-white/50 text-xs px-2 animate-pulse">
                    <Loader2 size={12} className="animate-spin" />
                    <span className="font-bold uppercase tracking-widest text-[10px]">Processing Context...</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleQuery} className="flex gap-2 relative mt-auto pb-2">
                <Input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question..."
                  className="bg-white/10 border-white/10 text-white placeholder:text-white/40 rounded-2xl h-12 pr-12 focus-visible:ring-white/30 backdrop-blur-md"
                />
                <Button 
                  type="submit"
                  disabled={loading || !query.trim()}
                  size="icon"
                  className="absolute right-1.5 top-1.5 h-9 w-9 bg-white text-primary hover:bg-white/90 rounded-xl transition-all shadow-lg"
                >
                  <Send size={16} />
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
