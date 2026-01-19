/**
 * Custom Widget SDK Hooks
 * Phase 6.2: Advanced Interactivity & State
 * 
 * Provides a set of hooks and utilities for custom widgets
 * to interact with the global dashboard state.
 */

import { useCallback, useMemo, useState } from 'react';
import { logger } from '@/lib/logger';
import { useWidgetState, useWidgetInteraction } from './use-widget-state';
import type { WidgetConfig } from '../types/dashboard';

/**
 * Main SDK hook for custom widgets
 * Exposes simplified API for common widget operations
 */
export function useWidgetSDK(widgetId: string, config?: {
  respondToFilters?: boolean;
  filterMapping?: Record<string, string>;
}) {
  const widgetState = useWidgetState();
  const interaction = useWidgetInteraction(widgetId, config);

  // Simplified filter API
  const filters = useMemo(() => ({
    active: interaction.activeFilters,
    global: interaction.globalFilters,
    create: interaction.createFilter,
    remove: (filterId: string) => widgetState.removeFilter(filterId),
    clear: () => {
      interaction.activeFilters.forEach(f => widgetState.removeFilter(f.id));
    }
  }), [interaction.activeFilters, interaction.globalFilters, interaction.createFilter, widgetState]);

  // Date range API
  const dateRange = useMemo(() => ({
    current: interaction.dateRange,
    set: widgetState.setDateRange,
    clear: () => widgetState.setDateRange({ start: null, end: null })
  }), [interaction.dateRange, widgetState]);

  // Selection API
  const selection = useMemo(() => ({
    isSelected: interaction.isSelected,
    data: interaction.selectedData,
    select: (data: any[]) => widgetState.selectDataPoints(widgetId, data),
    clear: () => widgetState.clearSelection(widgetId)
  }), [interaction.isSelected, interaction.selectedData, widgetState, widgetId]);

  // Drill-down API
  const drillDown = useMemo(() => ({
    path: interaction.drillDownPath,
    down: (level: number, breadcrumb: { label: string; value: any }) => 
      widgetState.drillDown(widgetId, level, breadcrumb),
    up: () => widgetState.drillUp(widgetId),
    reset: () => widgetState.resetDrillDown()
  }), [interaction.drillDownPath, widgetState, widgetId]);

  // Comparison mode API
  const comparison = useMemo(() => ({
    enabled: interaction.comparisonMode.enabled,
    primaryPeriod: interaction.comparisonMode.primaryPeriod,
    comparisonPeriod: interaction.comparisonMode.comparisonPeriod,
    toggle: widgetState.toggleComparisonMode,
    setPeriods: widgetState.setComparisonPeriods
  }), [interaction.comparisonMode, widgetState]);

  // Event broadcasting
  const emit = useCallback((eventType: 'click' | 'hover' | 'select' | 'filter' | 'drill-down', payload: any) => {
    widgetState.broadcast({
      type: eventType,
      sourceWidgetId: widgetId,
      targetWidgetIds: 'all',
      payload
    });
  }, [widgetState, widgetId]);

  // Listen to events from other widgets
  const subscribe = useCallback((
    callback: (event: { type: string; source: string; payload: any }) => void
  ) => {
    return widgetState.subscribe((interaction) => {
      if (interaction.sourceWidgetId !== widgetId) {
        callback({
          type: interaction.type,
          source: interaction.sourceWidgetId,
          payload: interaction.payload
        });
      }
    });
  }, [widgetState, widgetId]);

  return {
    widgetId,
    filters,
    dateRange,
    selection,
    drillDown,
    comparison,
    emit,
    subscribe,
    // Direct click handler
    handleClick: interaction.handleClick
  };
}

/**
 * Hook for widgets that need to filter their data based on global state
 */
export function useFilteredData<T extends Record<string, any>>(
  widgetId: string,
  data: T[],
  config?: {
    filterMapping?: Record<string, string>;
    dateField?: string;
  }
): T[] {
  const { filters, dateRange } = useWidgetSDK(widgetId, config);

  return useMemo(() => {
    let filtered = [...data];

    // Apply global filters
    filters.global.forEach(filter => {
      const fieldName = config?.filterMapping?.[filter.field] || filter.field;
      
      filtered = filtered.filter(item => {
        const value = item[fieldName];
        
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'gt':
            return value > filter.value;
          case 'lt':
            return value < filter.value;
          case 'gte':
            return value >= filter.value;
          case 'lte':
            return value <= filter.value;
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          case 'between':
            return Array.isArray(filter.value) && 
                   value >= filter.value[0] && 
                   value <= filter.value[1];
          default:
            return true;
        }
      });
    });

    // Apply date range filter if configured
    if (config?.dateField && (dateRange.current.start || dateRange.current.end)) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item[config.dateField!]);
        
        if (dateRange.current.start && itemDate < dateRange.current.start) {
          return false;
        }
        if (dateRange.current.end && itemDate > dateRange.current.end) {
          return false;
        }
        
        return true;
      });
    }

    return filtered;
  }, [data, filters.global, dateRange.current, config]);
}

/**
 * Hook for widgets that support comparison mode
 */
export function useComparisonData<T extends Record<string, any>>(
  widgetId: string,
  data: T[],
  dateField: string
): { primary: T[]; comparison: T[]; mode: 'disabled' | 'enabled' } {
  const { comparison } = useWidgetSDK(widgetId);

  return useMemo(() => {
    if (!comparison.enabled) {
      return { primary: data, comparison: [], mode: 'disabled' as const };
    }

    const primaryData = data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return (!comparison.primaryPeriod.start || itemDate >= comparison.primaryPeriod.start) &&
             (!comparison.primaryPeriod.end || itemDate <= comparison.primaryPeriod.end);
    });

    const comparisonData = data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return (!comparison.comparisonPeriod.start || itemDate >= comparison.comparisonPeriod.start) &&
             (!comparison.comparisonPeriod.end || itemDate <= comparison.comparisonPeriod.end);
    });

    return { 
      primary: primaryData, 
      comparison: comparisonData, 
      mode: 'enabled' as const 
    };
  }, [data, dateField, comparison]);
}

/**
 * Hook for managing widget-specific local state with persistence
 */
export function useWidgetLocalState<T>(
  widgetId: string,
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const storageKey = `widget_${widgetId}_${key}`;
  
  const getStoredValue = useCallback((): T => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  }, [storageKey, initialValue]);

  const [state, setState] = useState<T>(getStoredValue);

  const setValue = useCallback((value: T) => {
    try {
      setState(value);
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      logger.error('Failed to save widget state:', error as Error);
    }
  }, [storageKey]);

  return [state, setValue];
}