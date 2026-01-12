import { useState, createContext, useContext } from 'react';
import { DollarSign, ShoppingCart, Users, TrendingUp, Briefcase, Target, Cpu, Shield, Zap, Globe, Heart, Clock } from 'lucide-react';
import { KPIData } from '../components/dashboard/KPISection';
import { WidgetConfig } from '../components/dashboard/WidgetGrid';

export type Department = 'Sales' | 'HR' | 'IT' | 'Marketing';

interface DashboardContextType {
  department: Department;
  setDepartment: (dept: Department) => void;
  kpis: KPIData[];
  widgets: WidgetConfig[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const DEPT_DATA: Record<Department, { kpis: KPIData[], widgets: WidgetConfig[] }> = {
  Sales: {
    kpis: [
      { title: 'Total Revenue', value: '$1,240,592', trend: '+12.5%', trendType: 'up', icon: DollarSign, description: 'Total revenue generated from all sales channels.' },
      { title: 'Active Orders', value: '4,520', trend: '+8.2%', trendType: 'up', icon: ShoppingCart, description: 'Total number of orders currently in processing.' },
      { title: 'New Customers', value: '842', trend: '-2.4%', trendType: 'down', icon: Users, description: 'Unique customer acquisitions during the current period.' },
      { title: 'Conversion Rate', value: '4.82%', trend: '+1.2%', trendType: 'up', icon: TrendingUp, description: 'Percentage of website visitors who completed a purchase.' },
    ],
    widgets: [
      { id: 'revenue-trend', type: 'area', title: 'Revenue Distribution', description: 'Monthly growth across enterprise and SME segments', dataKey: ['Enterprise', 'SME'], categoryKey: 'name', gridSpan: 8, data: [{ name: 'Jan', Enterprise: 45000, SME: 12000 }, { name: 'Feb', Enterprise: 52000, SME: 15000 }, { name: 'Mar', Enterprise: 48000, SME: 14000 }, { name: 'Apr', Enterprise: 61000, SME: 18000 }, { name: 'May', Enterprise: 55000, SME: 17000 }, { name: 'Jun', Enterprise: 67000, SME: 21000 }, { name: 'Jul', Enterprise: 72000, SME: 25000 }] },
      { id: 'customer-segments', type: 'pie', title: 'Customer Segments', description: 'Revenue split by company size', dataKey: 'value', categoryKey: 'name', gridSpan: 4, data: [{ name: 'Enterprise', value: 45 }, { name: 'Mid-Market', value: 30 }, { name: 'SME', value: 25 }] },
      { id: 'sales-by-channel', type: 'stacked-bar', title: 'Sales by Channel', description: 'Performance comparison across all sales channels', dataKey: ['Direct', 'Channel', 'Online'], categoryKey: 'month', gridSpan: 12, data: [{ month: 'Jan', Direct: 400, Channel: 240, Online: 200 }, { month: 'Feb', Direct: 300, Channel: 139, Online: 221 }, { month: 'Mar', Direct: 200, Channel: 980, Online: 229 }, { month: 'Apr', Direct: 278, Channel: 390, Online: 200 }, { month: 'May', Direct: 189, Channel: 480, Online: 218 }, { month: 'Jun', Direct: 239, Channel: 380, Online: 250 }] },
    ]
  },
  HR: {
    kpis: [
      { title: 'Headcount', value: '1,240', trend: '+4.5%', trendType: 'up', icon: Users, description: 'Total active employees across all regions.' },
      { title: 'Turnover Rate', value: '2.1%', trend: '-0.5%', trendType: 'up', icon: Zap, description: 'Employee turnover percentage this quarter.' },
      { title: 'Open Roles', value: '48', trend: '+12%', trendType: 'up', icon: Briefcase, description: 'Current active job openings being recruited.' },
      { title: 'Training Comp.', value: '94%', trend: '+2.1%', trendType: 'up', icon: Clock, description: 'Percentage of mandatory training completed.' },
    ],
    widgets: [
      { id: 'hiring-funnel', type: 'bar', title: 'Hiring Funnel', description: 'Candidates at each stage of the recruitment process', dataKey: 'count', categoryKey: 'stage', gridSpan: 6, data: [{ stage: 'Applied', count: 1200 }, { stage: 'Screening', count: 450 }, { stage: 'Interview', count: 120 }, { stage: 'Offer', count: 45 }] },
      { id: 'diversity-split', type: 'pie', title: 'Department Diversity', description: 'Employee distribution by department', dataKey: 'value', categoryKey: 'name', gridSpan: 6, data: [{ name: 'Engineering', value: 40 }, { name: 'Sales', value: 25 }, { name: 'Marketing', value: 15 }, { name: 'HR', value: 10 }, { name: 'Other', value: 10 }] },
    ]
  },
  IT: {
    kpis: [
      { title: 'System Uptime', value: '99.99%', trend: '+0.01%', trendType: 'up', icon: Cpu, description: 'Average uptime across all production systems.' },
      { title: 'Security Alerts', value: '12', trend: '-45%', trendType: 'up', icon: Shield, description: 'High-priority security incidents detected.' },
      { title: 'API Latency', value: '124ms', trend: '-12ms', trendType: 'up', icon: Zap, description: 'Global average API response time.' },
      { title: 'Ticket Resolution', value: '92%', trend: '+3.4%', trendType: 'up', icon: Target, description: 'Percentage of support tickets resolved within SLA.' },
    ],
    widgets: [
      { id: 'system-load', type: 'area', title: 'Infrastructure Load', description: 'CPU and Memory utilization over last 24 hours', dataKey: 'usage', categoryKey: 'time', gridSpan: 8, data: [{ time: '00:00', usage: 30 }, { time: '04:00', usage: 25 }, { time: '08:00', usage: 65 }, { time: '12:00', usage: 85 }, { time: '16:00', usage: 75 }, { time: '20:00', usage: 45 }] },
      { id: 'incident-types', type: 'bar', title: 'Incident Categories', description: 'Distribution of reported IT incidents', dataKey: 'count', categoryKey: 'type', gridSpan: 4, data: [{ type: 'Access', count: 45 }, { type: 'Hardware', count: 32 }, { type: 'Software', count: 67 }, { type: 'Network', count: 21 }] },
    ]
  },
  Marketing: {
    kpis: [
      { title: 'MQLs Generated', value: '4,520', trend: '+15%', trendType: 'up', icon: Target, description: 'Marketing Qualified Leads generated this month.' },
      { title: 'CAC', value: '$124', trend: '-12%', trendType: 'up', icon: DollarSign, description: 'Average Customer Acquisition Cost.' },
      { title: 'ROAS', value: '4.2x', trend: '+0.4x', trendType: 'up', icon: TrendingUp, description: 'Return on Ad Spend across all campaigns.' },
      { title: 'Social Reach', value: '1.2M', trend: '+22%', trendType: 'up', icon: Globe, description: 'Total impressions across social media platforms.' },
    ],
    widgets: [
      { id: 'campaign-perf', type: 'line', title: 'Campaign Performance', description: 'Click-through rates for active ad campaigns', dataKey: 'ctr', categoryKey: 'campaign', gridSpan: 6, data: [{ campaign: 'Search Ads', ctr: 4.2 }, { campaign: 'Social Display', ctr: 2.8 }, { campaign: 'Video Pre-roll', ctr: 1.5 }, { campaign: 'Email Newsletter', ctr: 12.4 }] },
      { id: 'lead-sources', type: 'pie', title: 'Lead Sources', description: 'Distribution of leads by primary channel', dataKey: 'value', categoryKey: 'source', gridSpan: 6, data: [{ source: 'Organic', value: 45 }, { source: 'Paid Search', value: 25 }, { source: 'Social', value: 15 }, { source: 'Referral', value: 10 }, { source: 'Direct', value: 5 }] },
    ]
  }
};

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [department, setDepartment] = useState<Department>('Sales');

  const { kpis, widgets } = DEPT_DATA[department];

  return (
    <DashboardContext.Provider value={{ department, setDepartment, kpis, widgets }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}