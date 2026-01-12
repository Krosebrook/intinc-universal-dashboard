import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Layout, Check, Sparkles, TrendingUp, Users, Shield } from 'lucide-react';
import { useDashboard, Department } from '../../hooks/use-dashboard';
import { motion } from 'framer-motion';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  department: Department;
}

const templates: Template[] = [
  { id: 'sales-exec', name: 'Sales Executive', description: 'High-level revenue and conversion overview.', icon: TrendingUp, department: 'Sales' },
  { id: 'hr-retention', name: 'Retention Analysis', description: 'Deep dive into employee churn and happiness.', icon: Users, department: 'HR' },
  { id: 'it-sec', name: 'Security Posture', description: 'Monitoring threats and system vulnerabilities.', icon: Shield, department: 'IT' },
  { id: 'mkt-roi', name: 'Marketing ROI', description: 'Analyze spend across all digital channels.', icon: Sparkles, department: 'Marketing' },
];

interface TemplateGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TemplateGallery({ open, onOpenChange }: TemplateGalleryProps) {
  const { department, setDepartment } = useDashboard();

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all border-white/5 hover:border-primary/50 relative overflow-hidden group ${department === template.department ? 'bg-primary/5 border-primary/30' : 'bg-white/5'}`}
                onClick={() => {
                  setDepartment(template.department);
                  onOpenChange(false);
                }}
              >
                {department === template.department && (
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground p-1 rounded-full">
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
