import { LucideIcon } from 'lucide-react';
import { WidgetConfig } from '../components/dashboard/WidgetGrid';

export type Department = 'Sales' | 'HR' | 'IT' | 'Marketing' | 'SaaS' | 'Product' | 'AI' | 'Operations';

export interface KPIData {
  title: string;
  value: string;
  trend: string;
  trendType: 'up' | 'down';
  icon: LucideIcon;
  description?: string;
}

export type WidgetType = 'area' | 'bar' | 'pie' | 'line' | 'stacked-bar' | 'multi-line' | 'gauge' | 'progress' | 'scatter';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  data: any[];
  dataKey: string | string[];
  categoryKey: string;
  gridSpan?: number; // 1-12
  colors?: string[];
  stack?: boolean;
  goal?: number;
  forecast?: boolean;
}

export interface SavedDashboard {
  id: string;
  user_id: string;
  name: string;
  department: string;
  config: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  dashboard_id: string;
  widget_id?: string;
  content: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  user_id: string;
}