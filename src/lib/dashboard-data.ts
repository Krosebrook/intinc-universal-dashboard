import { DollarSign, ShoppingCart, Users, TrendingUp, Briefcase, Target, Cpu, Shield, Zap, Globe, Heart, Clock } from 'lucide-react';
import { Department, KPIData, WidgetConfig } from '../types/dashboard';
import { EXPANDED_TEMPLATES } from './templates';

export const DEPT_DATA: Record<Department, { kpis: KPIData[], widgets: WidgetConfig[] }> = {
  Sales: { kpis: [], widgets: [] },
  HR: { kpis: [], widgets: [] },
  IT: { kpis: [], widgets: [] },
  Marketing: { kpis: [], widgets: [] },
  SaaS: { kpis: [], widgets: [] },
  Product: { kpis: [], widgets: [] },
  AI: { kpis: [], widgets: [] },
  Operations: { kpis: [], widgets: [] }
};
