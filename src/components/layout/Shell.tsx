import React from 'react';
import Sidebar from '../dashboard/Sidebar';
import EnterpriseSettings from '../dashboard/EnterpriseSettings';
import { Button } from '../ui/button';
import { blink } from '../../lib/blink';
import { LogOut, Bell, User, Search, FileText } from 'lucide-react';
import { Input } from '../ui/input';
import { useDashboard } from '../../hooks/use-dashboard';
import { exportToPdf } from '../../lib/export';
import { toast } from 'sonner';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { department } = useDashboard();
  const [showSettings, setShowSettings] = React.useState(false);

  const handleExportPDF = async () => {
    const toastId = toast.loading('Generating high-fidelity PDF...');
    try {
      await exportToPdf('dashboard-content', `Intinc-${department}-Dashboard.pdf`);
      toast.success('Dashboard exported successfully', { id: toastId });
    } catch (error) {
      console.error('Export Error:', error);
      toast.error('Failed to export dashboard', { id: toastId });
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar onOpenSettings={() => setShowSettings(true)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 glass sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold tracking-tight">{department} Dashboard</h1>
            <div className="h-6 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Engine
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search across datasets..." 
                className="pl-10 bg-white/5 border-white/5 focus:border-primary/50 h-10 text-sm rounded-xl"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExportPDF}
                className="hidden lg:flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl px-3"
              >
                <FileText size={16} />
                <span>Export PDF</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl">
                <Bell size={20} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => blink.auth.logout()}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
              >
                <LogOut size={20} />
              </Button>
            </div>
            
            <div className="h-8 w-[1px] bg-white/10" />
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">Senior Architect</p>
                <p className="text-xs text-muted-foreground mt-1">Intinc Platform</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <User size={20} className="text-primary" />
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-[#050505] p-8 scrollbar-hide">
          <div id="dashboard-content" className="max-w-7xl mx-auto space-y-8 p-4 bg-[#050505]">
            {children}
          </div>
        </main>
      </div>

      <EnterpriseSettings open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
