/**
 * Widget State Hook - Cross-Widget Communication
 * Phase 6.2: Advanced Interactivity & State Management
 */

import { useState, createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { 
  GlobalDashboardState, 
  WidgetFilter, 
  WidgetInteraction, 
  DateRange,
  WidgetStateHook 
} from '../types/widget-state';

const initialState: GlobalDashboardState = {
  activeFilters: [],
  dateRange: { start: null, end: null },
  selectedDataPoints: new Map(),
  lastInteraction: null,
  comparisonMode: {
    enabled: false,
    primaryPeriod: { start: null, end: null },
    comparisonPeriod: { start: null, end: null }
  },
  drillDownPath: null
};

interface WidgetStateContextType extends WidgetStateHook {}

const WidgetStateContext = createContext<WidgetStateContextType | undefined>(undefined);

export function WidgetStateProvider({ children }: { children: React.ReactNode }) {
  const [globalState, setGlobalState] = useState<GlobalDashboardState>(initialState);
  const subscribersRef = useRef<Set<(interaction: WidgetInteraction) => void>>(new Set());

  // Generate unique filter ID
  const generateFilterId = () => `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Filter management
  const addFilter = useCallback((filter: Omit<WidgetFilter, 'id'>) => {
    const newFilter: WidgetFilter = {
      ...filter,
      id: generateFilterId()
    };
    
    setGlobalState(prev => ({
      ...prev,
      activeFilters: [...prev.activeFilters, newFilter]
    }));
    
    // Broadcast filter change
    broadcast({
      type: 'filter',
      sourceWidgetId: filter.sourceWidgetId,
      targetWidgetIds: 'all',
      payload: { field: filter.field, value: filter.value, action: 'add' }
    });
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setGlobalState(prev => {
      const filter = prev.activeFilters.find(f => f.id === filterId);
      const newFilters = prev.activeFilters.filter(f => f.id !== filterId);
      
      if (filter) {
        // Broadcast filter removal
        broadcast({
          type: 'filter',
          sourceWidgetId: filter.sourceWidgetId,
          targetWidgetIds: 'all',
          payload: { field: filter.field, value: filter.value, action: 'remove' }
        });
      }
      
      return { ...prev, activeFilters: newFilters };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setGlobalState(prev => ({ ...prev, activeFilters: [] }));
    broadcast({
      type: 'filter',
      sourceWidgetId: 'system',
      targetWidgetIds: 'all',
      payload: { action: 'clear' }
    });
  }, []);

  // Date range management
  const setDateRange = useCallback((range: DateRange) => {
    setGlobalState(prev => ({ ...prev, dateRange: range }));
    broadcast({
      type: 'filter',
      sourceWidgetId: 'date-picker',
      targetWidgetIds: 'all',
      payload: { field: 'date', value: range, action: 'date-range' }
    });
  }, []);

  // Cross-widget communication
  const broadcast = useCallback((interaction: Omit<WidgetInteraction, 'timestamp'>) => {
    const fullInteraction: WidgetInteraction = {
      ...interaction,
      timestamp: Date.now()
    };
    
    setGlobalState(prev => ({ ...prev, lastInteraction: fullInteraction }));
    
    // Notify all subscribers
    subscribersRef.current.forEach(callback => {
      try {
        callback(fullInteraction);
      } catch (error) {
        console.error('Widget subscriber error:', error);
      }
    });
  }, []);

  const subscribe = useCallback((callback: (interaction: WidgetInteraction) => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  // Selection management
  const selectDataPoints = useCallback((widgetId: string, dataPoints: any[]) => {
    setGlobalState(prev => {
      const newSelected = new Map(prev.selectedDataPoints);
      newSelected.set(widgetId, dataPoints);
      return { ...prev, selectedDataPoints: newSelected };
    });
    
    broadcast({
      type: 'select',
      sourceWidgetId: widgetId,
      targetWidgetIds: 'all',
      payload: { dataPoint: dataPoints }
    });
  }, []);

  const clearSelection = useCallback((widgetId?: string) => {
    setGlobalState(prev => {
      if (widgetId) {
        const newSelected = new Map(prev.selectedDataPoints);
        newSelected.delete(widgetId);
        return { ...prev, selectedDataPoints: newSelected };
      }
      return { ...prev, selectedDataPoints: new Map() };
    });
  }, []);

  // Comparison mode
  const toggleComparisonMode = useCallback(() => {
    setGlobalState(prev => ({
      ...prev,
      comparisonMode: {
        ...prev.comparisonMode,
        enabled: !prev.comparisonMode.enabled
      }
    }));
  }, []);

  const setComparisonPeriods = useCallback((primary: DateRange, comparison: DateRange) => {
    setGlobalState(prev => ({
      ...prev,
      comparisonMode: {
        enabled: true,
        primaryPeriod: primary,
        comparisonPeriod: comparison
      }
    }));
    
    broadcast({
      type: 'filter',
      sourceWidgetId: 'comparison-picker',
      targetWidgetIds: 'all',
      payload: { action: 'comparison', value: { primary, comparison } }
    });
  }, []);

  // Drill-down navigation
  const drillDown = useCallback((widgetId: string, level: number, breadcrumb: { label: string; value: any }) => {
    setGlobalState(prev => {
      const currentPath = prev.drillDownPath;
      const breadcrumbs = currentPath?.widgetId === widgetId 
        ? [...currentPath.breadcrumbs, breadcrumb]
        : [breadcrumb];
      
      return {
        ...prev,
        drillDownPath: {
          widgetId,
          level,
          breadcrumbs
        }
      };
    });
    
    broadcast({
      type: 'drill-down',
      sourceWidgetId: widgetId,
      targetWidgetIds: [widgetId],
      payload: { value: breadcrumb.value, action: 'drill-down' }
    });
  }, []);

  const drillUp = useCallback((widgetId: string) => {
    setGlobalState(prev => {
      if (!prev.drillDownPath || prev.drillDownPath.widgetId !== widgetId) {
        return prev;
      }
      
      const breadcrumbs = prev.drillDownPath.breadcrumbs.slice(0, -1);
      
      if (breadcrumbs.length === 0) {
        return { ...prev, drillDownPath: null };
      }
      
      return {
        ...prev,
        drillDownPath: {
          widgetId,
          level: prev.drillDownPath.level - 1,
          breadcrumbs
        }
      };
    });
    
    broadcast({
      type: 'drill-down',
      sourceWidgetId: widgetId,
      targetWidgetIds: [widgetId],
      payload: { action: 'drill-up' }
    });
  }, []);

  const resetDrillDown = useCallback(() => {
    setGlobalState(prev => ({ ...prev, drillDownPath: null }));
  }, []);

  return (
    <WidgetStateContext.Provider value={{
      globalState,
      addFilter,
      removeFilter,
      clearFilters,
      setDateRange,
      broadcast,
      subscribe,
      selectDataPoints,
      clearSelection,
      toggleComparisonMode,
      setComparisonPeriods,
      drillDown,
      drillUp,
      resetDrillDown
    }}>
      {children}
    </WidgetStateContext.Provider>
  );
}

export function useWidgetState(): WidgetStateHook {
  const context = useContext(WidgetStateContext);
  if (context === undefined) {
    throw new Error('useWidgetState must be used within a WidgetStateProvider');
  }
  return context;
}

/**
 * Hook for individual widgets to respond to global state changes
 */
export function useWidgetInteraction(widgetId: string, options?: {
  respondToFilters?: boolean;
  filterMapping?: Record<string, string>;
}) {
  const { globalState, subscribe, broadcast, addFilter } = useWidgetState();
  const [filteredData, setFilteredData] = useState<any[] | null>(null);

  // Subscribe to interactions targeting this widget
  useEffect(() => {
    if (!options?.respondToFilters) return;

    const unsubscribe = subscribe((interaction) => {
      // Check if this widget should respond
      if (interaction.targetWidgetIds !== 'all' && 
          !interaction.targetWidgetIds.includes(widgetId)) {
        return;
      }

      // Handle filter interactions
      if (interaction.type === 'filter' && interaction.sourceWidgetId !== widgetId) {
        // Widget should apply the filter to its data
        // This would be implemented based on widget type
      }
    });

    return unsubscribe;
  }, [widgetId, options?.respondToFilters, subscribe]);

  // Handle click interactions
  const handleClick = useCallback((dataPoint: any, field?: string) => {
    broadcast({
      type: 'click',
      sourceWidgetId: widgetId,
      targetWidgetIds: 'all',
      payload: { dataPoint, field }
    });
  }, [widgetId, broadcast]);

  // Create filter from this widget
  const createFilter = useCallback((field: string, value: any, operator: 'equals' | 'contains' | 'gt' | 'lt' = 'equals') => {
    addFilter({
      sourceWidgetId: widgetId,
      field,
      operator,
      value,
      label: `${field}: ${value}`
    });
  }, [widgetId, addFilter]);

  // Check if this widget has active filters
  const activeFilters = globalState.activeFilters.filter(f => f.sourceWidgetId === widgetId);

  return {
    handleClick,
    createFilter,
    activeFilters,
    globalFilters: globalState.activeFilters,
    isSelected: globalState.selectedDataPoints.has(widgetId),
    selectedData: globalState.selectedDataPoints.get(widgetId) || [],
    dateRange: globalState.dateRange,
    comparisonMode: globalState.comparisonMode,
    drillDownPath: globalState.drillDownPath?.widgetId === widgetId ? globalState.drillDownPath : null
  };
}
