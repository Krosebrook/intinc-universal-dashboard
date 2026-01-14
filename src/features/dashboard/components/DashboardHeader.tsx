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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
      <div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-1.5"
        >
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-glow" />
          <h2 className="text-3xl font-black tracking-tight text-foreground/90">
            {currentView === 'overview' ? 'Executive Summary' : 'Data Explorer'}
          </h2>
        </motion.div>
        <p className="text-muted-foreground/60 text-sm font-medium pl-4">
          {currentView === 'overview' 
            ? `Providing high-fidelity intelligence for ${department} operations.`
            : 'Unlocking raw potential through custom data mapping and analysis.'}
        </p>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.05] p-1.5 rounded-2xl shadow-sm">
          <HeaderButton 
            icon={<Layout size={16} />} 
            label="Library" 
            onClick={onShowTemplates}
          />
          <HeaderButton 
            icon={<Save size={16} />} 
            label="Commit" 
            onClick={onShowSave}
          />
          <HeaderButton 
            icon={<Share2 size={16} />} 
            label="Broadcast" 
            onClick={onShare}
          />
          <div className="w-[1px] h-6 bg-white/5 mx-1" />
          <HeaderButton 
            icon={<MessageSquare size={16} />} 
            label="Insights" 
            onClick={onToggleComments}
            active={showComments}
          />
        </div>

        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-2xl px-4 h-12 shadow-sm transition-all hover:bg-white/[0.05]">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Logic Mode</span>
          <input 
            type="checkbox" 
            checked={isDevMode} 
            onChange={(e) => onToggleDevMode(e.target.checked)}
            className="w-4 h-4 rounded border-white/10 bg-white/5 accent-primary cursor-pointer"
          />
        </div>

        <Button 
          variant="outline" 
          className="glass h-12 px-5 rounded-2xl hidden sm:flex border-white/[0.05] hover:bg-white/[0.05] transition-all active:scale-95 shadow-sm"
          onClick={onExport}
          disabled={isExporting}
        >
          <Download className="w-4 h-4 mr-2.5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest">{isExporting ? 'Processing...' : 'Export'}</span>
        </Button>

        <Button 
          size="icon" 
          className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground shadow-glow shadow-primary/20 hover:bg-primary-glow transition-all active:scale-90"
          onClick={onAddWidget}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}

function HeaderButton({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) {
  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={onClick}
      className={cn(
        "h-9 px-3.5 rounded-xl transition-all group active:scale-95",
        active 
          ? "bg-primary/10 text-primary border border-primary/20 shadow-glow shadow-primary/5" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
      )}
    >
      <span className={cn("transition-transform group-hover:scale-110", active ? "text-primary" : "group-hover:text-primary")}>
        {icon}
      </span>
      <span className="ml-2 text-[10px] font-bold uppercase tracking-widest hidden lg:inline">{label}</span>
    </Button>
  );
}
