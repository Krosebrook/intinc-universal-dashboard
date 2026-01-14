import React from 'react';
import Sidebar from '../dashboard/Sidebar';
import EnterpriseSettings from '../dashboard/EnterpriseSettings';
import { useDashboard } from '../../hooks/use-dashboard';
import { DashboardNavbar } from '../../features/dashboard/components/DashboardNavbar';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { department } = useDashboard();
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar onOpenSettings={() => setShowSettings(true)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar department={department} />
        
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
