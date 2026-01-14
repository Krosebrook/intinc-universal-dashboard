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
    id: 'mrr-growth',
    name: 'MRR Growth',
    description: 'Track monthly recurring revenue health and growth trajectory.',
    icon: TrendingUp,
    department: 'Sales', // Mapping SaaS Financial to Sales for now or adding new depts
    kpis: [
      { title: 'Current MRR', value: '$452,000', trend: '+15.2%', trendType: 'up', icon: DollarSign, description: 'Current month monthly recurring revenue.' },
      { title: 'ARR Forecast', value: '$5.8M', trend: '+12.5%', trendType: 'up', icon: TrendingUp, description: 'Annual Recurring Revenue projection.' },
      { title: 'Net New MRR', value: '$42,150', trend: '+8.4%', trendType: 'up', icon: Zap, description: 'New + Expansion - Churn MRR.' },
      { title: 'Churn Rate', value: '1.8%', trend: '-0.2%', trendType: 'up', icon: Activity, description: 'Percentage of MRR lost to cancellations.' },
    ],
    widgets: [
      { id: 'mrr-trend', type: 'area', title: 'MRR Growth Trajectory', description: 'Monthly growth across enterprise and SME segments', dataKey: ['New', 'Expansion', 'Churn'], categoryKey: 'month', gridSpan: 8, data: [{ month: 'Jan', New: 45000, Expansion: 12000, Churn: -5000 }, { month: 'Feb', New: 52000, Expansion: 15000, Churn: -4000 }, { month: 'Mar', New: 48000, Expansion: 14000, Churn: -6000 }, { month: 'Apr', New: 61000, Expansion: 18000, Churn: -5500 }, { month: 'May', New: 55000, Expansion: 17000, Churn: -4500 }, { month: 'Jun', New: 67000, Expansion: 21000, Churn: -7000 }] },
      { id: 'revenue-split', type: 'pie', title: 'Revenue Mix', description: 'Distribution of MRR by plan tier', dataKey: 'value', categoryKey: 'name', gridSpan: 4, data: [{ name: 'Enterprise', value: 60 }, { name: 'Pro', value: 30 }, { name: 'Basic', value: 10 }] },
    ]
  },
  {
    id: 'token-cost',
    name: 'AI Token Cost',
    description: 'Monitor AI inference expenses and model utilization.',
    icon: Brain,
    department: 'IT',
    kpis: [
      { title: 'Daily Spend', value: '$124.50', trend: '+4.2%', trendType: 'down', icon: DollarSign, description: 'Total AI costs incurred in the last 24 hours.' },
      { title: 'Total Tokens', value: '84.2M', trend: '+12%', trendType: 'down', icon: Cpu, description: 'Combined input and output tokens across all models.' },
      { title: 'Avg Cost/Req', value: '$0.0042', trend: '-15%', trendType: 'up', icon: Zap, description: 'Average cost per successful AI request.' },
      { title: 'Model Efficiency', value: '94.2%', trend: '+2.1%', trendType: 'up', icon: Activity, description: 'Percentage of queries routed to cost-effective models.' },
    ],
    widgets: [
      { id: 'cost-by-model', type: 'bar', title: 'Cost by Model', description: 'Monthly spend distribution across LLM providers', dataKey: 'cost', categoryKey: 'model', gridSpan: 6, data: [{ model: 'GPT-4o', cost: 1200 }, { model: 'Claude 3.5', cost: 850 }, { model: 'GPT-3.5 Mini', cost: 150 }, { model: 'Haiku', cost: 45 }] },
      { id: 'token-trend', type: 'area', title: 'Token Usage Trend', description: 'Input vs Output token volume over last 7 days', dataKey: ['Input', 'Output'], categoryKey: 'date', gridSpan: 6, data: [{ date: 'Mon', Input: 1200000, Output: 800000 }, { date: 'Tue', Input: 1500000, Output: 950000 }, { date: 'Wed', Input: 1100000, Output: 700000 }, { date: 'Thu', Input: 1800000, Output: 1100000 }, { date: 'Fri', Input: 1600000, Output: 1000000 }, { date: 'Sat', Input: 900000, Output: 600000 }, { date: 'Sun', Input: 1000000, Output: 650000 }] },
    ]
  },
  {
    id: 'customer-health',
    name: 'Customer Health',
    description: 'Identify at-risk customers and expansion opportunities.',
    icon: Heart,
    department: 'Sales',
    kpis: [
      { title: 'Avg Health Score', value: '74/100', trend: '+2', trendType: 'up', icon: Heart, description: 'Composite score of usage, support, and sentiment.' },
      { title: 'At-Risk Accounts', value: '12', trend: '-4', trendType: 'up', icon: Activity, description: 'High-value accounts with low health scores.' },
      { title: 'NPS Score', value: '52', trend: '+5', trendType: 'up', icon: Sparkles, description: 'Net Promoter Score from recent surveys.' },
      { title: 'Expansion Pipeline', value: '$124k', trend: '+15%', trendType: 'up', icon: TrendingUp, description: 'Qualified expansion opportunities from healthy accounts.' },
    ],
    widgets: [
      { id: 'health-dist', type: 'bar', title: 'Health Distribution', description: 'Accounts categorized by health score range', dataKey: 'count', categoryKey: 'range', gridSpan: 6, data: [{ range: '90-100', count: 45 }, { range: '70-89', count: 120 }, { range: '50-69', count: 35 }, { range: 'Below 50', count: 12 }] },
      { id: 'usage-engagement', type: 'line', title: 'Product Engagement', description: 'DAU/MAU ratio trend over the last 30 days', dataKey: 'stickiness', categoryKey: 'date', gridSpan: 6, data: Array.from({ length: 30 }).map((_, i) => ({ date: i + 1, stickiness: 25 + Math.random() * 10 })) },
    ]
  },
  {
    id: 'it-audit',
    name: 'Governance Audit',
    description: 'Track all admin actions and policy compliance.',
    icon: Lock,
    department: 'IT',
    kpis: [
      { title: 'Audit Actions', value: '1,245', trend: '+12%', trendType: 'up', icon: FileText, description: 'Total administrative actions logged this month.' },
      { title: 'Policy Violations', value: '2', trend: '-85%', trendType: 'up', icon: Shield, description: 'Security or governance rules breached.' },
      { title: 'Remediation Time', value: '4.2h', trend: '-2.1h', trendType: 'up', icon: Zap, description: 'Average time to resolve security incidents.' },
      { title: 'Compliance %', value: '99.8%', trend: '+0.2%', trendType: 'up', icon: Lock, description: 'Percentage of governance requirements met.' },
    ],
    widgets: [
      { id: 'action-types', type: 'pie', title: 'Action Categories', description: 'Distribution of administrative operations', dataKey: 'value', categoryKey: 'type', gridSpan: 6, data: [{ type: 'Access Grant', value: 45 }, { type: 'Data Export', value: 15 }, { type: 'Config Change', value: 25 }, { type: 'User Delete', value: 15 }] },
      { id: 'violation-trend', type: 'line', title: 'Compliance Incidents', description: 'Security violations detected over time', dataKey: 'violations', categoryKey: 'month', gridSpan: 6, data: [{ month: 'Jan', violations: 12 }, { month: 'Feb', violations: 8 }, { month: 'Mar', violations: 5 }, { month: 'Apr', violations: 2 }, { month: 'May', violations: 1 }, { month: 'Jun', violations: 0 }] },
    ]
  }
];
