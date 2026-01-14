import { 
  TrendingUp, 
  Users, 
  Shield, 
  Sparkles, 
  DollarSign, 
  Zap, 
  Activity, 
  Brain, 
  BarChart3, 
  Heart, 
  MousePointer2,
  Lock,
  Search,
  FileText,
  Cpu
} from 'lucide-react';
import { Department } from '../hooks/use-dashboard';
import { KPIData } from '../components/dashboard/KPISection';
import { WidgetConfig } from '../components/dashboard/WidgetGrid';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  icon: any;
  department: Department;
  kpis: KPIData[];
  widgets: WidgetConfig[];
}

export const EXPANDED_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'blank-sales',
    name: 'Sales Dashboard',
    description: 'A clean slate for your sales data visualization.',
    icon: TrendingUp,
    department: 'Sales',
    kpis: [],
    widgets: []
  },
  {
    id: 'blank-hr',
    name: 'HR Dashboard',
    description: 'Visualize your workforce metrics from scratch.',
    icon: Users,
    department: 'HR',
    kpis: [],
    widgets: []
  },
  {
    id: 'blank-it',
    name: 'IT Dashboard',
    description: 'Monitor your infrastructure and security with custom data.',
    icon: Cpu,
    department: 'IT',
    kpis: [],
    widgets: []
  },
  {
    id: 'blank-marketing',
    name: 'Marketing Dashboard',
    description: 'Track your campaign performance with a blank canvas.',
    icon: Target,
    department: 'Marketing',
    kpis: [],
    widgets: []
  }
];
