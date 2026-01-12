import React, { useState } from 'react';
import Shell from '../components/layout/Shell';
import KPISection from '../components/dashboard/KPISection';
import WidgetGrid from '../components/dashboard/WidgetGrid';
import AIInsight from '../components/dashboard/AIInsight';
import TemplateGallery from '../components/dashboard/TemplateGallery';
import { useDashboard } from '../hooks/use-dashboard';
import { Plus, Filter, Calendar, Layout } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { department, kpis, widgets } = useDashboard();
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <Shell>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold tracking-tight mb-1"
            >
              Executive Summary
            </motion.h2>
            <p className="text-muted-foreground">Real-time performance metrics for the {department} department.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="glass h-11 px-4 rounded-xl hidden sm:flex"
              onClick={() => setShowTemplates(true)}
            >
              <Layout className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button variant="outline" className="glass h-11 px-4 rounded-xl hidden sm:flex">
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 Days
            </Button>
            <Button variant="outline" className="glass h-11 px-4 rounded-xl hidden sm:flex">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
            <Button size="icon" className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <KPISection data={kpis} />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <WidgetGrid widgets={widgets} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <AIInsight />
          </div>
        </div>
      </div>

      <TemplateGallery open={showTemplates} onOpenChange={setShowTemplates} />
    </Shell>
  );
}
