/**
 * Widget API Hook
 * Phase 6.2: Utilities for custom widgets to interact with dashboard state
 */

import { useDashboard } from './use-dashboard';
import { useRBAC } from './use-rbac';

export function useWidgetApi(widgetId: string) {
  const { 
    globalFilters, 
    setGlobalFilter, 
    clearFilters, 
    widgets, 
    setWidgets,
    addComment,
    logAction
  } = useDashboard();
  
  const { hasPermission } = useRBAC();

  const widget = widgets.find(w => w.id === widgetId);

  return {
    // State & Data
    widget,
    allWidgets: widgets,
    
    // Filtering
    filters: globalFilters,
    setFilter: (value: any) => {
      if (widget?.categoryKey) {
        setGlobalFilter(widget.categoryKey, value);
      }
    },
    clearFilters,

    // Actions
    updateConfig: (newConfig: any) => {
      if (!hasPermission('dashboard:edit')) return;
      setWidgets(prev => prev.map(w => w.id === widgetId ? { ...w, ...newConfig } : w));
    },
    
    // Collaboration
    postInsight: (content: string) => {
      const currentDashboardId = savedDashboards.find(d => d.department === department)?.id || 'default';
      addComment(currentDashboardId, content, widgetId);
    },

    // Utilities
    logInteraction: (action: string, metadata?: any) => {
      logAction(action, 'widget', widgetId, metadata);
    }
  };
}
