import React, { useState, useEffect, useCallback } from 'react';
import Shell from '../components/layout/Shell';
import KPISection from '../features/dashboard/components/KPISection';
import WidgetGrid from '../features/dashboard/components/WidgetGrid';
import AIInsight from '../features/dashboard/components/AIInsight';
import LiveSimulator from '../features/dashboard/components/LiveSimulator';
import TemplateGallery from '../features/dashboard/components/TemplateGallery';
import VisualWidgetBuilder from '../features/dashboard/components/VisualWidgetBuilder';
import UniversalIngestor from '../features/dashboard/components/UniversalIngestor';
import { SmartAssistant } from '../features/dashboard/components/SmartAssistant';
import { useDashboard } from '../hooks/use-dashboard';
import { useExport } from '../hooks/use-export';
import { motion, AnimatePresence } from 'framer-motion';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { DashboardDevMode } from '../features/dashboard/components/DashboardDevMode';
import { DashboardCollaboration } from '../features/collaboration/components/DashboardCollaboration';
import { DashboardSavedViews } from '../features/dashboard/components/DashboardSavedViews';
import { OnboardingWizard } from '../features/dashboard/components/OnboardingWizard';
import { AnalyticsDashboard } from '../features/dashboard/components/AnalyticsDashboard';
import { ReportingHub } from '../features/dashboard/components/ReportingHub';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { FeatureSpotlight } from '../features/dashboard/components/FeatureSpotlight';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

export default function DashboardPage() {
  const { 
  department, 
  kpis, 
  widgets, 
  setWidgets, 
  saveDashboard, 
  isLoading, 
  comments, 
  addComment, 
  fetchComments,
  savedDashboards,
  loadDashboard,
  deleteDashboard,
  currentView,
  setCurrentView,
  isWidgetBuilderOpen,
  setIsWidgetBuilderOpen,
  suggestedStep,
  showOnboarding,
  setShowOnboarding
  } = useDashboard();
  
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [dashboardName, setDashboardName] = useState('');
  const { isExporting, performExport } = useExport();
  const [commentInput, setCommentInput] = useState('');
  const [isDevMode, setIsDevMode] = useState(false);
  const [jsonConfig, setJsonConfig] = useState('');

  const currentDashboardId = savedDashboards.find(d => d.department === department)?.id || 'default';

  useEffect(() => {
    if (showComments && currentDashboardId) {
      fetchComments(currentDashboardId);
    }
  }, [showComments, currentDashboardId, fetchComments]);

  useEffect(() => {
    if (isDevMode) {
      setJsonConfig(JSON.stringify({ widgets }, null, 2));
    }
  }, [isDevMode, widgets]);

  const handleApplyJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonConfig);
      if (parsed.widgets && Array.isArray(parsed.widgets)) {
        setWidgets(parsed.widgets);
        toast.success('Configuration applied');
      } else {
        toast.error('Invalid configuration format. Must contain a "widgets" array.');
      }
    } catch (e) {
      toast.error('Invalid JSON syntax');
    }
  }, [jsonConfig, setWidgets]);

  const handleExport = useCallback(async () => {
    await performExport('dashboard-content', department);
  }, [department, performExport]);

  const handleSave = useCallback(async () => {
    if (!dashboardName.trim()) return;
    await saveDashboard(dashboardName);
    setShowSaveDialog(false);
    setDashboardName('');
  }, [dashboardName, saveDashboard]);

  const handleShare = useCallback(() => {
    const url = window.location.href + '?shared=true&id=' + currentDashboardId;
    navigator.clipboard.writeText(url);
    toast.success('Public share link copied to clipboard');
  }, [currentDashboardId]);

  const handleAddComment = useCallback(async () => {
    if (!commentInput.trim()) return;
    await addComment(currentDashboardId, commentInput);
    setCommentInput('');
  }, [addComment, currentDashboardId, commentInput]);

  return (
    <Shell>
      <div className="space-y-8 pb-12">
        <DashboardHeader 
          department={department}
          currentView={currentView}
          isExporting={isExporting}
          isDevMode={isDevMode}
          showComments={showComments}
          onShowTemplates={() => setShowTemplates(true)}
          onShowSave={() => setShowSaveDialog(true)}
          onShare={handleShare}
          onToggleComments={() => setShowComments(!showComments)}
          onToggleDevMode={setIsDevMode}
          onExport={handleExport}
          onAddWidget={() => setIsWidgetBuilderOpen(true)}
          onViewChange={setCurrentView}
        />

        <FeatureSpotlight 
          featureId="add_widget"
          title="Custom Visuals"
          description="Create your own data visualizations in seconds using our point-and-click builder."
          targetId="add-widget-button"
          position="left"
        />

        <FeatureSpotlight 
          featureId="data_explorer"
          title="Universal Ingestor"
          description="Switch to Data Explorer to upload CSVs or connect raw API streams for analysis."
          targetId="data-explorer-tab"
          position="right"
        />

        <FeatureSpotlight 
          featureId="export_system"
          title="Broadcast Reports"
          description="Export your current view to a high-fidelity PDF report ready for stakeholders."
          targetId="export-pdf-button"
          position="bottom"
        />

        <div className="space-y-8">
          <DashboardDevMode 
            isVisible={isDevMode}
            jsonConfig={jsonConfig}
            onJsonChange={setJsonConfig}
            onApply={handleApplyJson}
            onClose={() => setIsDevMode(false)}
          />

          <AnimatePresence>
            {suggestedStep && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-card border-primary/20 bg-primary/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-glow shadow-primary/10">
                      <Save className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-primary mb-0.5">{suggestedStep.title}</p>
                      <p className="text-[11px] text-muted-foreground font-medium">{suggestedStep.description}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={suggestedStep.onAction}
                    className="bg-primary hover:bg-primary-glow text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl px-6 h-10"
                  >
                    {suggestedStep.actionLabel}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {currentView === 'overview' ? (
            <>
              <KPISection data={kpis} />

              <div className="grid grid-cols-12 gap-6">
                <div className={`transition-all duration-300 ${showComments ? 'col-span-12 lg:col-span-6' : 'col-span-12 lg:col-span-8'}`}>
                  <WidgetGrid widgets={widgets} onUpdate={setWidgets} />
                </div>
                
                <DashboardCollaboration 
                  isVisible={showComments}
                  comments={comments}
                  commentInput={commentInput}
                  onCommentInputChange={setCommentInput}
                  onAddComment={handleAddComment}
                  onClose={() => setShowComments(false)}
                />

                {!showComments && (
                  <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div id="ai-insights-panel">
                      <AIInsight />
                    </div>
                    <FeatureSpotlight 
                      featureId="ai_insights"
                      title="AI Brain"
                      description="Our smart assistant automatically finds anomalies and opportunities in your current data view."
                      targetId="ai-insights-panel"
                      position="left"
                    />
                    <LiveSimulator />
                    <DashboardSavedViews 
                      savedDashboards={savedDashboards}
                      onLoad={loadDashboard}
                      onDelete={deleteDashboard}
                    />
                  </div>
                )}
              </div>
            </>
          ) : currentView === 'analytics' ? (
            <AnalyticsDashboard />
          ) : currentView === 'reports' ? (
            <ReportingHub />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <UniversalIngestor />
            </motion.div>
          )}
        </div>
      </div>

      <TemplateGallery open={showTemplates} onOpenChange={setShowTemplates} />
      
      <VisualWidgetBuilder 
        open={isWidgetBuilderOpen} 
        onOpenChange={setIsWidgetBuilderOpen} 
        onAdd={(widget) => setWidgets([...widgets, widget])} 
      />

      <OnboardingWizard 
        open={showOnboarding} 
        onOpenChange={setShowOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('onboarding_completed', 'true');
          toast.success('Onboarding complete! Enjoy your dashboard.');
        }}
      />

      <SmartAssistant />

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="glass-card border-white/10 max-w-md rounded-3xl p-8">
          <DialogHeader className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
              <Save size={24} className="text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-foreground/90">Commit View</DialogTitle>
            <p className="text-muted-foreground/60 text-sm font-medium mt-1">Persist your current workspace configuration to the cloud.</p>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Workspace Identity</Label>
              <Input 
                id="name" 
                placeholder="e.g., Q1 Revenue Optimization" 
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="bg-white/[0.03] border-white/[0.05] focus:border-primary/40 h-12 rounded-2xl transition-all"
              />
            </div>
          </div>
          <DialogFooter className="mt-8 flex gap-3">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="glass h-12 flex-1 rounded-2xl border-white/[0.05] hover:bg-white/[0.05]">Discard</Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !dashboardName.trim()}
              className="bg-primary hover:bg-primary-glow text-primary-foreground h-12 flex-1 rounded-2xl shadow-glow shadow-primary/20 transition-all font-bold uppercase tracking-widest text-[10px]"
            >
              {isLoading ? 'Persisting...' : 'Confirm Commit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
