import React from 'react';
import { LogOut, Bell, User, Search, FileText, Menu } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { blink } from '../../../lib/blink';
import { useExport } from '../../../hooks/use-export';
import { toast } from 'sonner';

interface DashboardNavbarProps {
  department: string;
  onOpenMobileMenu?: () => void;
}

export function DashboardNavbar({ department, onOpenMobileMenu }: DashboardNavbarProps) {
  const { isExporting, performExport } = useExport();

  const handleExportPDF = async () => {
    await performExport('dashboard-content', department);
  };

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 glass sticky top-0 z-50 transition-all duration-300 backdrop-blur-xl bg-background/40">
      <div className="flex items-center gap-4 lg:gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onOpenMobileMenu}
          className="lg:hidden text-muted-foreground hover:text-foreground h-10 w-10 rounded-xl"
        >
          <Menu size={20} />
        </Button>

        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight text-foreground/90">{department}</h1>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Dashboard</span>
        </div>
        <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          Engine Status: Optimal
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex relative w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input 
            placeholder="Search enterprise intelligence..." 
            className="pl-11 bg-white/[0.03] border-white/[0.05] focus:border-primary/40 h-10 text-sm rounded-xl transition-all placeholder:text-muted-foreground/40"
          />
        </div>
        
        <div className="flex items-center gap-1.5">
          <Button 
            id="export-pdf-button"
            variant="ghost" 
            size="sm" 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-white/[0.05] rounded-xl px-4 h-10 transition-all active:scale-95"
          >
            <FileText size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-white/[0.05] rounded-xl h-10 w-10 transition-all active:scale-95">
            <Bell size={18} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => blink.auth.logout()}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-10 w-10 transition-all active:scale-95"
          >
            <LogOut size={18} />
          </Button>
        </div>
        
        <div className="h-6 w-[1px] bg-white/10" />
        
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold leading-none text-foreground/90 group-hover:text-primary transition-colors">Senior Architect</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Global Admin</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center transition-all group-hover:border-primary/40 group-hover:scale-105 active:scale-95 shadow-glow shadow-primary/5">
            <User size={18} className="text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
