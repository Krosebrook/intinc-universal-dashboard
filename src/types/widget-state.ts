/**
 * Widget State Management Types
 * Phase 6.2: Advanced Interactivity & Cross-Widget Communication
 */

export type FilterOperator = 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in';

export interface WidgetFilter {
  id: string;
  sourceWidgetId: string;
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface WidgetInteraction {
  type: 'click' | 'hover' | 'select' | 'filter' | 'drill-down';
  sourceWidgetId: string;
  targetWidgetIds: string[] | 'all';
  payload: {
    field?: string;
    value?: any;
    dataPoint?: any;
    action?: string;
  };
  timestamp: number;
}

export interface GlobalDashboardState {
  // Active filters applied globally
  activeFilters: WidgetFilter[];
  
  // Date range for time-based widgets
  dateRange: DateRange;
  
  // Selected data points across widgets
  selectedDataPoints: Map<string, any[]>;
  
  // Widget communication channel
  lastInteraction: WidgetInteraction | null;
  
  // Comparison mode state
  comparisonMode: {
    enabled: boolean;
    primaryPeriod: DateRange;
    comparisonPeriod: DateRange;
  };
  
  // Drill-down path
  drillDownPath: {
    widgetId: string;
    level: number;
    breadcrumbs: { label: string; value: any }[];
  } | null;
}

export interface WidgetStateHook {
  // Read global state
  globalState: GlobalDashboardState;
  
  // Filter management
  addFilter: (filter: Omit<WidgetFilter, 'id'>) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  
  // Date range
  setDateRange: (range: DateRange) => void;
  
  // Cross-widget communication
  broadcast: (interaction: Omit<WidgetInteraction, 'timestamp'>) => void;
  subscribe: (callback: (interaction: WidgetInteraction) => void) => () => void;
  
  // Selection management
  selectDataPoints: (widgetId: string, dataPoints: any[]) => void;
  clearSelection: (widgetId?: string) => void;
  
  // Comparison mode
  toggleComparisonMode: () => void;
  setComparisonPeriods: (primary: DateRange, comparison: DateRange) => void;
  
  // Drill-down
  drillDown: (widgetId: string, level: number, breadcrumb: { label: string; value: any }) => void;
  drillUp: (widgetId: string) => void;
  resetDrillDown: () => void;
}

// Widget configuration extensions for interactivity
export interface InteractiveWidgetConfig {
  // Enable click interactions
  clickable?: boolean;
  onClickAction?: 'filter' | 'drill-down' | 'navigate' | 'custom';
  
  // Filter targets
  filterTargets?: string[] | 'all';
  filterField?: string;
  
  // Responds to global filters
  respondToFilters?: boolean;
  filterMapping?: Record<string, string>; // maps global filter field to widget data field
  
  // Comparison support
  supportsComparison?: boolean;
  
  // Drill-down levels
  drillDownLevels?: {
    field: string;
    label: string;
  }[];
}
