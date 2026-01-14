import React from 'react';
import Sidebar from '../../features/dashboard/components/Sidebar';
import EnterpriseSettings from '../../features/dashboard/components/EnterpriseSettings';
import { useDashboard } from '../../hooks/use-dashboard';
import { DashboardNavbar } from '../../features/dashboard/components/DashboardNavbar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '../ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { OnboardingWizard } from '../../features/dashboard/components/OnboardingWizard';
import { blink } from '../../lib/blink';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { department, logAction, showOnboarding, setShowOnboarding } = useDashboard();
  const [showSettings, setShowSettings] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleOnboardingComplete = async () => {
    // Always update UI state and localStorage first (the primary source of truth for onboarding)
    setShowOnboarding(false);
    localStorage.setItem('onboarding_completed', 'true');
    
    // Attempt to persist to user metadata if authenticated (non-blocking, best-effort)
    // This is a secondary sync - localStorage is authoritative for onboarding state
    try {
      // Check if user is authenticated first
      const isAuthenticated = blink.auth.isAuthenticated();
      if (!isAuthenticated) {
        // User not logged in - that's fine, localStorage handles onboarding state
        return;
      }
      
      const user = await blink.auth.me();
      if (user) {
        const metadata = user.metadata ? JSON.parse(user.metadata) : {};
        await blink.auth.updateMe({
          metadata: {
            ...metadata,
            onboarding_completed: true
          }
        });
        logAction('onboarding_complete', 'user');
      }
    } catch {
      // Silently fail - localStorage already has the onboarding state
      // This can fail if token expired during session, but localStorage handles it
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans selection:bg-primary/30 selection:text-primary-foreground">
      {/* Desktop Sidebar */}
      <Sidebar 
        onOpenSettings={() => setShowSettings(true)} 
        className="hidden lg:flex"
      />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none" />

        <DashboardNavbar 
          department={department} 
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto bg-grid-white p-4 lg:p-8 scrollbar-hide relative">
          <div id="dashboard-content" className="max-w-7xl mx-auto space-y-8 animate-in stagger-1">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r border-white/5 bg-background">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Main navigation sidebar</SheetDescription>
          <Sidebar onOpenSettings={() => {
            setShowSettings(true);
            setIsMobileMenuOpen(false);
          }} />
        </SheetContent>
      </Sheet>

      <EnterpriseSettings open={showSettings} onOpenChange={setShowSettings} />

      <OnboardingWizard 
        open={showOnboarding} 
        onOpenChange={setShowOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}