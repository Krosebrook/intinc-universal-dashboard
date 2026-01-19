/**
 * Widget API Hook
 * Phase 6.2: Utilities for custom widgets to interact with dashboard state
 */

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
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
    logAction,
    savedDashboards,
    department,
    dashboardState,
    setDashboardState
  } = useDashboard();
  
  const { hasPermission } = useRBAC();

  const widget = widgets.find(w => w.id === widgetId);

  // Local state for widget inputs
  const [localInputs, setLocalInputs] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = {};
    widget?.inputs?.forEach(input => {
      if (input.defaultValue !== undefined) {
        defaults[input.id] = input.defaultValue;
      }
    });
    return defaults;
  });

  const setInput = useCallback((inputId: string, value: any) => {
    setLocalInputs(prev => ({ ...prev, [inputId]: value }));
  }, []);

  return {
    // State & Data
    widget,
    allWidgets: widgets,
    inputs: localInputs,
    setInput,
    sharedState: dashboardState,
    setSharedState: setDashboardState,
    
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
    },

    // Event System (Phase 6.2)
    emitEvent: (type: string, payload: any) => {
      logAction('widget_event_emitted', 'widget', widgetId, { type, payload });
      // In a real implementation, this could use a PubSub or shared context
      logger.info(`[Widget ${widgetId}] Event: ${type}`, { payload });
    }
  };
}