import React, { useState, useEffect } from 'react';
import Shell from '../components/layout/Shell';
import KPISection from '../components/dashboard/KPISection';
import WidgetGrid, { WidgetConfig } from '../components/dashboard/WidgetGrid';
import AIInsight from '../components/dashboard/AIInsight';
import LiveSimulator from '../components/dashboard/LiveSimulator';
import TemplateGallery from '../components/dashboard/TemplateGallery';
import VisualWidgetBuilder from '../components/dashboard/VisualWidgetBuilder';
import { useDashboard } from '../hooks/use-dashboard';
import { Plus, Filter, Calendar, Layout, Save, Download, Share2, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import { exportToPdf } from '../lib/export';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';

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
    deleteDashboard
  } = useDashboard();
  
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAddWidgetDialog, setShowAddWidgetDialog] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [dashboardName, setDashboardName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isDevMode, setIsDevMode] = useState(false);

  const currentDashboardId = savedDashboards.find(d => d.department === department)?.id || 'default';

  useEffect(() => {
    if (showComments && currentDashboardId) {
      fetchComments(currentDashboardId);
    }
  }, [showComments, currentDashboardId]);

  const handleExport = async () => {
    setIsExporting(true);
    await exportToPdf('dashboard-content', `${department}-dashboard-${Date.now()}.pdf`);
    setIsExporting(false);
  };

  const handleSave = async () => {
    if (!dashboardName.trim()) return;
    await saveDashboard(dashboardName);
    setShowSaveDialog(false);
    setDashboardName('');
  };

  const handleShare = () => {
    const url = window.location.href + '?shared=true&id=' + currentDashboardId;
    navigator.clipboard.writeText(url);
    toast.success('Public share link copied to clipboard');
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    await addComment(currentDashboardId, commentInput);
    setCommentInput('');
  };

  return (
    <Shell>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold tracking-tight mb-1"
            >
              Executive Summary
            </motion.h2>
            <p className="text-muted-foreground">Real-time performance metrics for the {department} department.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="glass h-11 px-4 rounded-xl hidden sm:flex"
              onClick={() => setShowSaveDialog(true)}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button 
              variant="outline" 
              className="glass h-11 px-4 rounded-xl hidden sm:flex"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button 
              variant="outline" 
              className="glass h-11 px-4 rounded-xl hidden sm:flex text-primary border-primary/20 bg-primary/5"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Insights
            </Button>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 h-11">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dev</span>
              <input 
                type="checkbox" 
                checked={isDevMode} 
                onChange={(e) => setIsDevMode(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 accent-primary"
              />
            </div>
            <Button 
              variant="outline" 
              className="glass h-11 px-4 rounded-xl hidden sm:flex"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
            <Button 
              size="icon" 
              className="h-11 w-11 rounded-xl bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90"
              onClick={() => setShowAddWidgetDialog(true)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div id="dashboard-content" className="space-y-8">
          <KPISection data={kpis} />

          <div className="grid grid-cols-12 gap-6">
            <div className={`transition-all duration-300 ${showComments ? 'col-span-12 lg:col-span-6' : 'col-span-12 lg:col-span-8'}`}>
              <WidgetGrid widgets={widgets} onUpdate={setWidgets} />
            </div>
            
            <AnimatePresence>
              {showComments ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="col-span-12 lg:col-span-6 space-y-6"
                >
                  <div className="glass-card border-white/10 rounded-2xl overflow-hidden flex flex-col h-[800px]">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <h3 className="font-bold">Collaboration Hub</h3>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setShowComments(false)}>Close</Button>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                      <div className="space-y-6">
                        {comments.length === 0 ? (
                          <div className="text-center py-12">
                            <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                            <p className="text-muted-foreground">No insights yet. Start the conversation!</p>
                          </div>
                        ) : (
                          comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4">
                              <Avatar className="w-8 h-8 border border-white/10">
                                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                  {comment.user_id?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold">User {comment.user_id?.substring(0, 5)}</span>
                                  <span className="text-[10px] text-muted-foreground">{new Date(comment.created_at).toLocaleTimeString()}</span>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none">
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>

                    <div className="p-6 border-t border-white/10 bg-white/5">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Type an insight or comment..." 
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                          className="glass border-white/10"
                        />
                        <Button onClick={handleAddComment}>Send</Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  <AIInsight />
                  <LiveSimulator />
                  
                  {savedDashboards.length > 0 && (
                    <div className="glass-card border-white/10 p-6 rounded-2xl">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Saved Views</h3>
                      <div className="space-y-2">
                        {savedDashboards.map(dash => (
                          <div key={dash.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group">
                            <button 
                              className="flex-1 text-left text-sm font-medium hover:text-primary transition-colors"
                              onClick={() => loadDashboard(dash.id)}
                            >
                              {dash.name}
                            </button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                              onClick={() => deleteDashboard(dash.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <TemplateGallery open={showTemplates} onOpenChange={setShowTemplates} />
      
      <VisualWidgetBuilder 
        open={showAddWidgetDialog} 
        onOpenChange={setShowAddWidgetDialog} 
        onAdd={(widget) => setWidgets([...widgets, widget])} 
      />

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
