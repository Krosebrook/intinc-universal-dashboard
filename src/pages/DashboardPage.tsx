import React, { useState, useEffect, useCallback } from 'react';
import Shell from '../components/layout/Shell';
import KPISection from '../components/dashboard/KPISection';
import WidgetGrid from '../components/dashboard/WidgetGrid';
import AIInsight from '../components/dashboard/AIInsight';
import LiveSimulator from '../components/dashboard/LiveSimulator';
import TemplateGallery from '../components/dashboard/TemplateGallery';
import VisualWidgetBuilder from '../components/dashboard/VisualWidgetBuilder';
import UniversalIngestor from '../components/dashboard/UniversalIngestor';
import { SmartAssistant } from '../components/dashboard/SmartAssistant';
import { useDashboard } from '../hooks/use-dashboard';
import { useExport } from '../hooks/use-export';
import { motion } from 'framer-motion';
import { DashboardHeader } from '../features/dashboard/components/DashboardHeader';
import { DashboardDevMode } from '../features/dashboard/components/DashboardDevMode';
import { DashboardCollaboration } from '../features/collaboration/components/DashboardCollaboration';
import { DashboardSavedViews } from '../features/dashboard/components/DashboardSavedViews';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
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
    isWidgetBuilderOpen,
    setIsWidgetBuilderOpen
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
        />

        <div className="space-y-8">
          <DashboardDevMode 
            isVisible={isDevMode}
            jsonConfig={jsonConfig}
            onJsonChange={setJsonConfig}
            onApply={handleApplyJson}
            onClose={() => setIsDevMode(false)}
          />

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
                    <AIInsight />
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

      <SmartAssistant />

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="glass-card border-white/10">
          <DialogHeader>
            <DialogTitle>Save Dashboard View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dashboard Name</Label>
              <Input 
                id="name" 
                placeholder="e.g., Monthly Sales Report" 
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="glass border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="glass">Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading || !dashboardName.trim()}>
              {isLoading ? 'Saving...' : 'Save View'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}