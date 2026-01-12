import React, { useState } from 'react';
import Shell from '../components/layout/Shell';
import KPISection from '../components/dashboard/KPISection';
import WidgetGrid, { WidgetConfig, WidgetType } from '../components/dashboard/WidgetGrid';
import AIInsight from '../components/dashboard/AIInsight';
import TemplateGallery from '../components/dashboard/TemplateGallery';
import { useDashboard } from '../hooks/use-dashboard';
import { Plus, Filter, Calendar, Layout, Save, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

import { exportToPdf } from '../lib/export';

export default function DashboardPage() {
  const { department, kpis, widgets, setWidgets, saveDashboard, isLoading } = useDashboard();
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAddWidgetDialog, setShowAddWidgetDialog] = useState(false);
  const [dashboardName, setDashboardName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await exportToPdf('dashboard-content', `${department}-dashboard-${Date.now()}.pdf`);
    setIsExporting(false);
  };

  const [newWidget, setNewWidget] = useState<Partial<WidgetConfig>>({
    title: '',
    description: '',
    type: 'bar',
    gridSpan: 6,
    data: [{ name: 'A', value: 10 }, { name: 'B', value: 20 }, { name: 'C', value: 30 }],
    dataKey: 'value',
    categoryKey: 'name'
  });

  const handleSave = async () => {
    if (!dashboardName.trim()) return;
    await saveDashboard(dashboardName);
    setShowSaveDialog(false);
    setDashboardName('');
  };

  const handleAddWidget = () => {
    if (!newWidget.title) return;
    const widget: WidgetConfig = {
      ...newWidget as WidgetConfig,
      id: `widget-${Date.now()}`
    };
    setWidgets([...widgets, widget]);
    setShowAddWidgetDialog(false);
    setNewWidget({
      title: '',
      description: '',
      type: 'bar',
      gridSpan: 6,
      data: [{ name: 'A', value: 10 }, { name: 'B', value: 20 }, { name: 'C', value: 30 }],
      dataKey: 'value',
      categoryKey: 'name'
    });
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
              Save View
            </Button>
            <Button 
              variant="outline" 
              className="glass h-11 px-4 rounded-xl hidden sm:flex"
              onClick={() => setShowTemplates(true)}
            >
              <Layout className="w-4 h-4 mr-2" />
              Templates
            </Button>
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
              className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
              onClick={() => setShowAddWidgetDialog(true)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div id="dashboard-content" className="space-y-8">
          <KPISection data={kpis} />

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
              <WidgetGrid widgets={widgets} onUpdate={setWidgets} />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <AIInsight />
            </div>
          </div>
        </div>
      </div>

      <TemplateGallery open={showTemplates} onOpenChange={setShowTemplates} />

      {/* Save Dialog */}
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
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This will save your current widget configuration and filters.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="glass">Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading || !dashboardName.trim()}>
              {isLoading ? 'Saving...' : 'Save Dashboard'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Widget Dialog */}
      <Dialog open={showAddWidgetDialog} onOpenChange={setShowAddWidgetDialog}>
        <DialogContent className="glass-card border-white/10">
          <DialogHeader>
            <DialogTitle>Add New Widget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Widget Title</Label>
              <Input 
                placeholder="e.g., Regional Performance" 
                value={newWidget.title}
                onChange={(e) => setNewWidget({...newWidget, title: e.target.value})}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                placeholder="Briefly describe the data" 
                value={newWidget.description}
                onChange={(e) => setNewWidget({...newWidget, description: e.target.value})}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chart Type</Label>
                <Select 
                  value={newWidget.type} 
                  onValueChange={(val: WidgetType) => setNewWidget({...newWidget, type: val})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="stacked-bar">Stacked Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Grid Span</Label>
                <Select 
                  value={String(newWidget.gridSpan)} 
                  onValueChange={(val) => setNewWidget({...newWidget, gridSpan: parseInt(val)})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    <SelectItem value="4">Small (1/3)</SelectItem>
                    <SelectItem value="6">Medium (1/2)</SelectItem>
                    <SelectItem value="8">Large (2/3)</SelectItem>
                    <SelectItem value="12">Full Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWidgetDialog(false)} className="glass">Cancel</Button>
            <Button onClick={handleAddWidget} disabled={!newWidget.title}>Add to Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
