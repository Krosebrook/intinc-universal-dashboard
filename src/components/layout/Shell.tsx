import React from 'react';
import Sidebar from '../dashboard/Sidebar';
import EnterpriseSettings from '../dashboard/EnterpriseSettings';
import { useDashboard } from '../../hooks/use-dashboard';
import { DashboardNavbar } from '../../features/dashboard/components/DashboardNavbar';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { department } = useDashboard();
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans selection:bg-primary/30 selection:text-primary-foreground">
      <Sidebar onOpenSettings={() => setShowSettings(true)} />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none" />

        <DashboardNavbar department={department} />
        
        <main className="flex-1 overflow-y-auto bg-grid-white p-4 lg:p-8 scrollbar-hide relative">
          <div id="dashboard-content" className="max-w-7xl mx-auto space-y-8 animate-in stagger-1">
            {children}
          </div>
        </main>
      </div>

      <EnterpriseSettings open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
