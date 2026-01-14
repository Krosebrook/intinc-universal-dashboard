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
  Cpu,
  Target
} from 'lucide-react';
import { Department } from '../hooks/use-dashboard';
import { KPIData, WidgetConfig } from '../types/dashboard';

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
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics (SDK Demo)',
    description: 'Showcasing custom widget SDK features: interactive inputs and cross-widget state.',
    icon: Brain,
    department: 'AI',
    kpis: [
      { title: 'Model Accuracy', value: '98.2%', trend: '+0.5%', trendType: 'up', icon: Brain },
      { title: 'Inference Latency', value: '124ms', trend: '-12ms', trendType: 'up', icon: Zap },
    ],
    widgets: [
      {
        id: 'model-performance-selector',
        type: 'line',
        title: 'Model Performance Tuning',
        description: 'Toggle between raw data and forecast, or filter by model version.',
        data: [
          { date: '2024-01', v1: 85, v2: 88, v3: 92 },
          { date: '2024-02', v1: 86, v2: 89, v3: 93 },
          { date: '2024-03', v1: 84, v2: 91, v3: 95 },
          { date: '2024-04', v1: 87, v2: 90, v3: 94 },
          { date: '2024-05', v1: 88, v2: 92, v3: 96 },
        ],
        dataKey: ['v1', 'v2', 'v3'],
        categoryKey: 'date',
        gridSpan: 6,
        inputs: [
          {
            id: 'showForecast',
            type: 'toggle',
            label: 'Show Forecast',
            defaultValue: false
          },
          {
            id: 'modelVersion',
            type: 'select',
            label: 'Target Version',
            defaultValue: 'v3',
            options: [
              { label: 'Version 1', value: 'v1' },
              { label: 'Version 2', value: 'v2' },
              { label: 'Version 3', value: 'v3' },
              { label: 'All Versions', value: 'all' }
            ]
          }
        ]
      },
      {
        id: 'gpu-utilization-drilldown',
        type: 'area',
        title: 'GPU Cluster Utilization',
        description: 'Interactive cluster selection and utilization history.',
        data: [
          { time: '00:00', cluster_a: 45, cluster_b: 62 },
          { time: '04:00', cluster_a: 52, cluster_b: 58 },
          { time: '08:00', cluster_a: 85, cluster_b: 71 },
          { time: '12:00', cluster_a: 78, cluster_b: 92 },
          { time: '16:00', cluster_a: 62, cluster_b: 84 },
          { time: '20:00', cluster_a: 48, cluster_b: 65 },
        ],
        dataKey: ['cluster_a', 'cluster_b'],
        categoryKey: 'time',
        gridSpan: 6,
        inputs: [
          {
            id: 'cluster',
            type: 'select',
            label: 'Active Cluster',
            defaultValue: 'cluster_a',
            options: [
              { label: 'Cluster Alpha', value: 'cluster_a' },
              { label: 'Cluster Beta', value: 'cluster_b' }
            ]
          }
        ]
      }
    ]
  }
];
