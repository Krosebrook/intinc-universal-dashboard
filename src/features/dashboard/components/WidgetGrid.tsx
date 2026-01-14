import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useDashboard } from '../../hooks/use-dashboard';
import { WidgetConfig } from '../../types/dashboard';
import { WidgetCard } from '../../features/dashboard/components/WidgetCard';
import { WidgetDrilldown } from '../../features/dashboard/components/WidgetDrilldown';
import { WidgetEditDialog } from '../../features/dashboard/components/WidgetEditDialog';
import { ActiveFilters } from '../../features/dashboard/components/ActiveFilters';

interface WidgetGridProps {
  widgets: WidgetConfig[];
  onUpdate?: (widgets: WidgetConfig[]) => void;
}

export default function WidgetGrid({ widgets, onUpdate }: WidgetGridProps) {
  const { 
    globalFilters, 
    setGlobalFilter, 
    clearFilters, 
    comments, 
    addComment, 
    fetchComments,
    savedDashboards,
    department
  } = useDashboard();
  
  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(null);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [isWidgetDevMode, setIsWidgetDevMode] = useState(false);
  const [widgetJson, setWidgetJson] = useState('');
  const [widgetComment, setWidgetComment] = useState('');

  const currentDashboardId = savedDashboards.find(d => d.department === department)?.id || 'default';

  useEffect(() => {
    if (selectedWidget && currentDashboardId !== 'default') {
      fetchComments(currentDashboardId, selectedWidget.id);
    }
  }, [selectedWidget, currentDashboardId, fetchComments]);

  const handleAddWidgetComment = useCallback(async (content: string) => {
    if (!content.trim() || !selectedWidget) return;
    await addComment(currentDashboardId, content, selectedWidget.id);
    setWidgetComment('');
    toast.success('Widget insight added');
  }, [addComment, currentDashboardId, selectedWidget]);

  const handleDelete = useCallback((id: string) => {
    if (onUpdate) {
      onUpdate(widgets.filter(w => w.id !== id));
    }
  }, [onUpdate, widgets]);

  const handleEditSave = useCallback((updatedWidget: WidgetConfig, isJson: boolean, json?: string) => {
    if (onUpdate) {
      if (isJson && json) {
        try {
          const parsed = JSON.parse(json);
          onUpdate(widgets.map(w => w.id === updatedWidget.id ? parsed : w));
          setEditingWidget(null);
          setIsWidgetDevMode(false);
          toast.success('Widget configuration updated');
        } catch (e) {
          toast.error('Invalid JSON syntax');
        }
      } else {
        onUpdate(widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w));
        setEditingWidget(null);
        toast.success('Widget updated');
      }
    }
  }, [onUpdate, widgets]);

  useEffect(() => {
    if (editingWidget && isWidgetDevMode) {
      setWidgetJson(JSON.stringify(editingWidget, null, 2));
    }
  }, [editingWidget, isWidgetDevMode]);

  return (
    <div className="space-y-6">
      <ActiveFilters 
        globalFilters={globalFilters} 
        onClear={clearFilters} 
        onRemove={setGlobalFilter} 
      />

      <div className="grid grid-cols-12 gap-6">
        {widgets.map((widget, index) => (
          <WidgetCard 
            key={widget.id}
            widget={widget}
            index={index}
            globalFilters={globalFilters}
            setGlobalFilter={setGlobalFilter}
            onSelect={setSelectedWidget}
            onEdit={setEditingWidget}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <WidgetDrilldown 
        widget={selectedWidget}
        onClose={() => setSelectedWidget(null)}
        globalFilters={globalFilters}
        setGlobalFilter={setGlobalFilter}
        comments={comments}
        onAddComment={handleAddWidgetComment}
        commentInput={widgetComment}
        onCommentInputChange={setWidgetComment}
      />

      <WidgetEditDialog 
        widget={editingWidget}
        onClose={() => { setEditingWidget(null); setIsWidgetDevMode(false); }}
        onSave={handleEditSave}
        isDevMode={isWidgetDevMode}
        onToggleDevMode={setIsWidgetDevMode}
        widgetJson={widgetJson}
        onJsonChange={setWidgetJson}
        globalFilters={globalFilters}
        setGlobalFilter={setGlobalFilter}
      />
    </div>
  );
}
