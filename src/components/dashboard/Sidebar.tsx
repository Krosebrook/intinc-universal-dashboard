import React from 'react';
import { useDashboard, Department } from '../../hooks/use-dashboard';
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
  Share2
} from 'lucide-react';
import { cn } from '../../lib/utils';

const departments: { id: Department; icon: any; label: string }[] = [
  { id: 'Sales', icon: BarChart3, label: 'Sales & Revenue' },
  { id: 'HR', icon: Users, label: 'Human Resources' },
  { id: 'IT', icon: Cpu, label: 'IT Infrastructure' },
  { id: 'Marketing', icon: PieChart, label: 'Marketing Ops' },
];

export default function Sidebar() {
  const { department, setDepartment } = useDashboard();

  return (
    <aside className="w-72 h-screen glass-sidebar flex flex-col p-6 hidden lg:flex relative z-50">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Activity className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <span className="font-bold text-xl tracking-tight block leading-none">intinc</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1 block">Universal Engine</span>
        </div>
      </div>
      
      <div className="space-y-1 mb-10">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">Core Platform</p>
        <NavItem icon={<LayoutDashboard size={20} />} label="Global Overview" />
        <NavItem icon={<Database size={20} />} label="Data Explorer" />
        <NavItem icon={<Share2 size={20} />} label="Integrations" />
      </div>

      <div className="space-y-1 flex-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">Departments</p>
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
      
      <div className="pt-6 border-t border-white/5 space-y-1">
        <NavItem icon={<Settings size={20} />} label="System Settings" />
        <NavItem icon={<HelpCircle size={20} />} label="Support Center" />
        
        <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-xs font-bold text-primary mb-1">Enterprise Plan</p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Universal features enabled for all departments.
          </p>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
    )}>
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
