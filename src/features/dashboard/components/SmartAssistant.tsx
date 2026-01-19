import React, { useState } from 'react';
import { logger } from '../../../lib/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, MessageSquare, Loader2, Send } from 'lucide-react';
import { useDashboard } from '../../../hooks/use-dashboard';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { blink } from '../../../lib/blink';
import { toast } from 'sonner';
import { WidgetConfig } from '../../../types/dashboard';
import { FeatureSpotlight } from './FeatureSpotlight';

export function SmartAssistant() {
  const { suggestedStep, setWidgets, department, kpis, widgets } = useDashboard();
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    if (suggestedStep) {
      setIsVisible(true);
    }
  }, [suggestedStep]);

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    const toastId = toast.loading('Consulting AI Analyst...');
    try {
      const user = await blink.auth.me();
      
      const { object } = await blink.ai.generateObject({
        prompt: `You are an expert dashboard architect for a ${department} department.
                User request: "${prompt}"
                Current widgets: ${JSON.stringify(widgets.map(w => ({ id: w.id, title: w.title, type: w.type })))}
                Current KPIs: ${kpis.map(k => k.title).join(', ')}

                Actions you can take:
                1. 'create': Add a new widget based on the request.
                2. 'modify': Update an existing widget's configuration.
                3. 'delete': Remove a widget that is no longer relevant.
                4. 'summarize': Provide a text-based analysis of the request without changing the dashboard.

                Return a JSON object with:
                - action: 'create' | 'modify' | 'delete' | 'summarize'
                - widgetId: string (required for modify/delete)
                - config: WidgetConfig (required for create/modify)
                - summary: string (required for summarize or to explain the change)`,
        schema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['create', 'modify', 'delete', 'summarize'] },
            widgetId: { type: 'string' },
            config: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['area', 'bar', 'pie', 'line', 'stacked-bar', 'multi-line', 'gauge', 'progress', 'scatter'] },
                title: { type: 'string' },
                description: { type: 'string' },
                data: { type: 'array', items: { type: 'object', additionalProperties: true } },
                dataKey: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
                categoryKey: { type: 'string' },
                gridSpan: { type: 'number', minimum: 1, maximum: 12 },
                colors: { type: 'array', items: { type: 'string' } },
                stack: { type: 'boolean' },
                goal: { type: 'number' },
                forecast: { type: 'boolean' }
              }
            },
            summary: { type: 'string' }
          },
          required: ['action', 'summary']
        }
      });

      const response = object as any;

      switch (response.action) {
        case 'create':
          const newWidget = { ...response.config, id: `ai-widget-${Date.now()}` };
          setWidgets(prev => [newWidget, ...prev]);
          toast.success(`Generated: ${newWidget.title}`, { id: toastId });
          break;
        case 'modify':
          setWidgets(prev => prev.map(w => w.id === response.widgetId ? { ...w, ...response.config } : w));
          toast.success(`Updated: ${response.config.title || response.widgetId}`, { id: toastId });
          break;
        case 'delete':
          setWidgets(prev => prev.filter(w => w.id !== response.widgetId));
          toast.success(`Removed widget`, { id: toastId });
          break;
        case 'summarize':
          toast.info(response.summary, { id: toastId, duration: 5000 });
          break;
      }
      
      if (user) {
        await blink.db.auditLogs.create({
          user_id: user.id,
          action: `ai.${response.action}_widget`,
          entity: 'dashboard',
          metadata: JSON.stringify({ prompt, action: response.action, department })
        });
      }

      setPrompt('');
      setIsExpanded(false);
    } catch (error) {
      logger.error('AI Assistant error:', error as Error);
      toast.error('AI assistant had trouble with that request.', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isVisible && !isExpanded) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 bg-primary shadow-glow shadow-primary/20 z-50 hover:scale-110 transition-transform"
      >
        <Sparkles size={20} />
      </Button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        id="smart-assistant-trigger"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-full max-w-sm"
      >
        <Card className="glass-card border-primary/30 shadow-2xl overflow-hidden relative group rounded-2xl">
          <FeatureSpotlight 
            featureId="smart_assistant"
            title="AI Co-Pilot"
            description="Use the Smart Assistant to generate new visualizations or analyze trends using natural language."
            targetId="smart-assistant-trigger"
            position="left"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50 pointer-events-none" />
          
          <div className="p-5 relative space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20 text-primary animate-pulse shadow-glow shadow-primary/10">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white tracking-tight leading-none">Smart Assistant</h3>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1 block">AI-Powered Insights</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`text-white/40 hover:text-white transition-colors p-1 ${isExpanded ? 'text-primary' : ''}`}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { setIsVisible(false); setIsExpanded(false); }}
                  className="text-white/40 hover:text-white transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isExpanded ? (
              <form onSubmit={handleAISubmit} className="space-y-3">
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Ask me to create a specific visualization or analyze your current data.
                </p>
                <div className="relative">
                  <Input 
                    placeholder="e.g., Show me sales by month..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-black/40 border-white/10 text-white text-xs h-10 pr-10 rounded-xl focus:ring-primary/50 focus:border-primary/50"
                    disabled={isGenerating}
                  />
                  <button 
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-glow disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            ) : suggestedStep ? (
              <>
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
                      {suggestedStep.actionLabel}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </span>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-xs text-white/70 leading-relaxed font-medium italic">
                No active recommendations. Click the chat icon to generate custom widgets!
              </p>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
