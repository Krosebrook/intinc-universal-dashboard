import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Save, Share2, MessageSquare, Download, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Department } from '../../../types/dashboard';

interface DashboardHeaderProps {
  department: Department;
  currentView: 'overview' | 'explorer';
  isExporting: boolean;
  isDevMode: boolean;
  showComments: boolean;
  onShowTemplates: () => void;
  onShowSave: () => void;
  onShare: () => void;
  onToggleComments: () => void;
  onToggleDevMode: (checked: boolean) => void;
  onExport: () => void;
  onAddWidget: () => void;
}

export function DashboardHeader({
  department,
  currentView,
  isExporting,
  isDevMode,
  showComments,
  onShowTemplates,
  onShowSave,
  onShare,
  onToggleComments,
  onToggleDevMode,
  onExport,
  onAddWidget,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold tracking-tight mb-1"
        >
          {currentView === 'overview' ? 'Executive Summary' : 'Data Explorer'}
        </motion.h2>
        <p className="text-muted-foreground">
          {currentView === 'overview' 
            ? `Real-time performance metrics for the ${department} department.`
            : 'Import and map your custom datasets to generate unique insights.'}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          className="glass h-11 px-4 rounded-xl hidden sm:flex"
          onClick={onShowTemplates}
        >
          <Layout className="w-4 h-4 mr-2" />
          Templates
        </Button>
        <Button 
          variant="outline" 
          className="glass h-11 px-4 rounded-xl hidden sm:flex"
          onClick={onShowSave}
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button 
          variant="outline" 
          className="glass h-11 px-4 rounded-xl hidden sm:flex"
          onClick={onShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button 
          variant="outline" 
          className={`glass h-11 px-4 rounded-xl hidden sm:flex ${showComments ? 'text-primary border-primary/20 bg-primary/5' : ''}`}
          onClick={onToggleComments}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Insights
        </Button>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 h-11">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dev</span>
          <input 
            type="checkbox" 
            checked={isDevMode} 
            onChange={(e) => onToggleDevMode(e.target.checked)}
            className="w-4 h-4 rounded border-white/10 bg-white/5 accent-primary"
          />
        </div>
        <Button 
          variant="outline" 
          className="glass h-11 px-4 rounded-xl hidden sm:flex"
          onClick={onExport}
          disabled={isExporting}
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>
        <Button 
          size="icon" 
          className="h-11 w-11 rounded-xl bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90"
          onClick={onAddWidget}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
