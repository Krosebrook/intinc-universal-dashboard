import React, { useState } from 'react';
import { useDashboard, Department } from '../../../hooks/use-dashboard';
import { 
  BarChart3, 
  Users, 
  Cpu, 
  PieChart, 
  Activity, 
  LayoutDashboard,
  Settings,
  HelpCircle,
  Database,
  Share2,
  FileText,
  X,
  Briefcase,
  ChevronDown,
  Plus,
  CreditCard,
  Ticket,
  Cloud,
  Github as GithubIcon,
  TrendingUp,
  Brain,
  Zap,
  Shield,
  Heart
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';

const departments: { id: Department; icon: any; label: string }[] = [
  { id: 'Sales', icon: BarChart3, label: 'Sales & Revenue' },
  { id: 'HR', icon: Users, label: 'Human Resources' },
  { id: 'IT', icon: Cpu, label: 'IT Infrastructure' },
  { id: 'Marketing', icon: PieChart, label: 'Marketing Ops' },
  { id: 'SaaS', icon: TrendingUp, label: 'SaaS & Subscription' },
  { id: 'Product', icon: Heart, label: 'Product & Health' },
  { id: 'AI', icon: Brain, label: 'AI & LLM Ops' },
  { id: 'Operations', icon: Zap, label: 'Enterprise Ops' },
];

const mockSources = [
  { id: 'Stripe', icon: CreditCard, color: 'text-[#635BFF]' },
  { id: 'Jira', icon: Ticket, color: 'text-[#0052CC]' },
  { id: 'AWS', icon: Cloud, color: 'text-[#FF9900]' },
  { id: 'GitHub', icon: GithubIcon, color: 'text-[#181717]' },
  { id: 'OpenAI', icon: Brain, color: 'text-[#74AA9C]' },
] as const;

export default function Sidebar({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { department, setDepartment, savedDashboards, loadDashboard, deleteDashboard, workspaces, createWorkspace, generateMockData, currentView, setCurrentView } = useDashboard();
  const [activeWorkspace, setActiveWorkspace] = useState('Global Operations');

  return (
    <aside className="w-72 h-screen glass-sidebar flex flex-col p-6 hidden lg:flex relative z-50">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Activity className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <span className="font-bold text-xl tracking-tight block leading-none">intinc</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1 block">Universal Engine</span>
        </div>
      </div>

      <div className="mb-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-3 overflow-hidden">
                <Briefcase size={18} className="text-primary" />
                <span className="text-sm font-bold truncate">{activeWorkspace}</span>
              </div>
              <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 glass-card border-white/10" align="start">
            <DropdownMenuLabel className="text-xs uppercase tracking-widest text-muted-foreground">Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="gap-2 focus:bg-primary/10 focus:text-primary cursor-pointer" onClick={() => setActiveWorkspace('Global Operations')}>
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold">GO</div>
              Global Operations
            </DropdownMenuItem>
            {workspaces.map(ws => (
              <DropdownMenuItem key={ws.id} className="gap-2 focus:bg-primary/10 focus:text-primary cursor-pointer" onClick={() => setActiveWorkspace(ws.name)}>
                <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold">
                  {ws.name.substring(0, 2).toUpperCase()}
                </div>
                {ws.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              className="gap-2 focus:bg-primary/10 focus:text-primary cursor-pointer text-primary font-semibold"
              onClick={() => {
                const name = prompt('Workspace Name:');
                if (name) createWorkspace(name);
              }}
            >
              <Plus size={14} /> Create New Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="space-y-1 mb-10">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">Core Platform</p>
        <NavItem 
          icon={<LayoutDashboard size={20} />} 
          label="Global Overview" 
          active={currentView === 'overview'}
          onClick={() => setCurrentView('overview')}
        />
        <NavItem 
          icon={<Database size={20} />} 
          label="Data Explorer" 
          active={currentView === 'explorer'}
          onClick={() => setCurrentView('explorer')}
        />
        <NavItem 
          icon={<Share2 size={20} />} 
          label="Integrations" 
          onClick={onOpenSettings}
        />
      </div>

      <div className="space-y-1 mb-10 overflow-hidden flex flex-col min-h-0">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">Departments</p>
        <div className="space-y-1 overflow-y-auto">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setDepartment(dept.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                department === dept.id 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <dept.icon size={20} className={cn(
                "transition-colors",
                department === dept.id ? "text-primary-foreground" : "group-hover:text-primary"
              )} />
              <span className="text-sm font-semibold">{dept.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">Quick Connectors</p>
        <div className="flex gap-2 px-2 overflow-x-auto pb-2 scrollbar-hide">
          <TooltipProvider>
            {mockSources.map((source) => (
              <Tooltip key={source.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => generateMockData(source.id)}
                    className="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary/50 transition-all hover:scale-110 active:scale-95"
                  >
                    <source.icon className={cn("w-5 h-5", source.color)} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="glass-card border-white/10 text-xs font-bold uppercase tracking-widest">
                  Connect {source.id}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>

      <div className="space-y-1 flex-1 min-h-0 flex flex-col overflow-hidden mb-6">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">Saved Views</p>
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-1">
            {savedDashboards.length > 0 ? (
              savedDashboards.map((dash) => (
                <div key={dash.id} className="group/item relative">
                  <button
                    onClick={() => loadDashboard(dash.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all group"
                  >
                    <FileText size={16} className="group-hover:text-primary transition-colors" />
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="text-sm font-medium truncate w-full pr-6">{dash.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{dash.department}</span>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDashboard(dash.id);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-muted-foreground px-4 py-2 italic">No saved dashboards yet.</p>
            )}
          </div>
        </ScrollArea>
      </div>
      
      <div className="pt-6 border-t border-white/5 space-y-1">
        <NavItem 
          icon={<Settings size={20} />} 
          label="System Settings" 
          onClick={onOpenSettings}
        />
        <NavItem icon={<HelpCircle size={20} />} label="Support Center" />
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      <div className={cn(
        "transition-colors",
        active ? "text-primary-foreground" : "group-hover:text-primary"
      )}>
        {icon}
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}
