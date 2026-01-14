import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Layout, Check, Sparkles, TrendingUp, Users, Shield, Search, Loader2, DollarSign, Cpu, Activity, Brain, Heart, Lock, BarChart3 } from 'lucide-react';
import { useDashboard, Department } from '../../hooks/use-dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { blink } from '../../lib/blink';
import { EXPANDED_TEMPLATES } from '../../lib/templates';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  department: Department;
}

const baseTemplates: Template[] = [
  { id: 'sales-exec', name: 'Sales Executive', description: 'High-level revenue and conversion overview.', icon: TrendingUp, department: 'Sales' },
  { id: 'hr-retention', name: 'Retention Analysis', description: 'Deep dive into employee churn and happiness.', icon: Users, department: 'HR' },
  { id: 'it-sec', name: 'Security Posture', description: 'Monitoring threats and system vulnerabilities.', icon: Shield, department: 'IT' },
  { id: 'mkt-roi', name: 'Marketing ROI', description: 'Analyze spend across all digital channels.', icon: Sparkles, department: 'Marketing' },
];

const templates: Template[] = [
  ...baseTemplates,
  ...EXPANDED_TEMPLATES.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    icon: t.icon,
    department: t.department
  }))
];

interface TemplateGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TemplateGallery({ open, onOpenChange }: TemplateGalleryProps) {
  const { department, setDepartment, loadTemplate } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestedTemplateId, setSuggestedTemplateId] = useState<string | null>(null);

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSuggestedTemplateId(null);
    
    try {
      const { text } = await blink.ai.generateText({
        system: "You are a dashboard template matcher. Given a user's request, identify the best matching template ID from the list. Return ONLY the ID. Be smart about matching synonyms like 'revenue' to 'mrr-growth' or 'token' to 'token-cost'.",
        prompt: `User Request: "${searchQuery}"
        
        Available Templates:
        ${templates.map(t => `- ${t.id}: ${t.name} (${t.description})`).join('\n')}
        
        If no template matches well, return 'none'.`,
      });
      
      const match = text.trim().toLowerCase();
      if (templates.some(t => t.id === match)) {
        setSuggestedTemplateId(match);
      }
    } catch (error) {
      console.error('AI Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl glass-card border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Layout className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Template Gallery</span>
          </div>
          <DialogTitle className="text-2xl font-bold">Choose a Dashboard Template</DialogTitle>
          <DialogDescription>
            Accelerate your insights with predefined layouts optimized for your department.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input 
              placeholder="e.g., 'I want to track token costs' or 'Analyze sales pipeline'..."
              className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
            />
            <Button 
              size="sm"
              className="absolute right-2 top-1.5 h-9 bg-primary hover:bg-primary/90 rounded-lg px-4"
              onClick={handleAISearch}
              disabled={isSearching}
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isSearching ? 'Searching...' : 'AI Match'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={suggestedTemplateId === template.id ? { 
                  boxShadow: ["0 0 0px hsl(var(--primary))", "0 0 20px hsl(var(--primary))", "0 0 0px hsl(var(--primary))"],
                  transition: { repeat: Infinity, duration: 2 }
                } : {}}
              >
                <Card 
                  className={`cursor-pointer transition-all border-white/5 hover:border-primary/50 relative overflow-hidden group ${department === template.department ? 'bg-primary/5 border-primary/30' : 'bg-white/5'} ${suggestedTemplateId === template.id ? 'border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' : ''}`}
                  onClick={() => {
                    loadTemplate(template.id);
                    onOpenChange(false);
                  }}
                >
                  {suggestedTemplateId === template.id && (
                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 z-20">
                      <Sparkles size={10} />
                      AI MATCH
                    </div>
                  )}
                  {department === template.department && (
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground p-1 rounded-full z-10">
                      <Check size={12} />
                    </div>
                  )}
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors">
                      <template.icon size={20} className={department === template.department ? 'text-primary' : 'text-muted-foreground'} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-xs">{template.department}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {template.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90">
            Create Custom Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
