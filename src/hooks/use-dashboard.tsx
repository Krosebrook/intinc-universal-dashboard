import { useState, createContext, useContext, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, TrendingUp, Briefcase, Target, Cpu, Shield, Zap, Globe, Heart, Clock } from 'lucide-react';
import { KPIData } from '../components/dashboard/KPISection';
import { WidgetConfig } from '../components/dashboard/WidgetGrid';
import { blink } from '../lib/blink';
import { toast } from 'react-hot-toast';

export type Department = 'Sales' | 'HR' | 'IT' | 'Marketing';

interface DashboardContextType {
  department: Department;
  setDepartment: (dept: Department) => void;
  kpis: KPIData[];
  widgets: WidgetConfig[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetConfig[]>>;
  saveDashboard: (name: string) => Promise<void>;
  loadDashboard: (id: string) => Promise<void>;
  savedDashboards: any[];
  isLoading: boolean;
  publishMetricUpdate: (data: any) => Promise<void>;
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
      { id: 'sales-forecast', type: 'area', title: 'Revenue Forecast', description: 'AI-projected revenue growth for the next quarter', dataKey: 'Revenue', categoryKey: 'month', gridSpan: 12, forecast: true, data: [{ month: 'Jan', Revenue: 45000 }, { month: 'Feb', Revenue: 52000 }, { month: 'Mar', Revenue: 48000 }, { month: 'Apr', Revenue: 61000 }, { month: 'May', Revenue: 65000 }, { month: 'Jun', Revenue: 72000 }, { month: 'Jul', Revenue: 78000 }, { month: 'Aug', Revenue: 85000 }, { month: 'Sep', Revenue: 92000 }] },
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
      { id: 'uptime-goal', type: 'gauge', title: 'Uptime Commitment', description: 'Real-time uptime vs 99.99% SLA target', dataKey: 'uptime', categoryKey: 'name', gridSpan: 4, goal: 99.99, data: [{ name: 'Current', uptime: 99.95 }] },
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
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEPT_DATA['Sales'].widgets);
  const [kpis, setKpis] = useState<KPIData[]>(DEPT_DATA['Sales'].kpis);
  const [savedDashboards, setSavedDashboards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial load of default widgets when department changes
  useEffect(() => {
    setWidgets(DEPT_DATA[department].widgets);
    setKpis(DEPT_DATA[department].kpis);
  }, [department]);

  // Real-time Metrics Subscription
  useEffect(() => {
    let channel: any = null;
    let mounted = true;

    const setupRealtime = async () => {
      try {
        const user = await blink.auth.me();
        if (!user || !mounted) return;

        channel = blink.realtime.channel(`metrics-${department}`);
        await channel.subscribe({
          userId: user.id,
          metadata: { department }
        });

        if (!mounted) return;

        channel.onMessage((msg: any) => {
          if (!mounted) return;
          
          if (msg.type === 'kpi-update') {
            setKpis(prev => prev.map(kpi => 
              kpi.title === msg.data.title ? { ...kpi, value: msg.data.value, trend: msg.data.trend } : kpi
            ));
            toast.success(`Live Update: ${msg.data.title}`, { duration: 2000, position: 'bottom-right' });
          }

          if (msg.type === 'widget-data-update') {
            setWidgets(prev => prev.map(widget => 
              widget.id === msg.data.widgetId ? { ...widget, data: msg.data.newData } : widget
            ));
          }
        });

      } catch (error) {
        console.error('Realtime setup error:', error);
      }
    };

    setupRealtime();

    return () => {
      mounted = false;
      if (channel) channel.unsubscribe();
    };
  }, [department]);

  const publishMetricUpdate = async (data: any) => {
    try {
      const user = await blink.auth.me();
      if (!user) return;
      
      const channel = blink.realtime.channel(`metrics-${department}`);
      await channel.publish(data.type, data.payload, {
        userId: user.id,
        metadata: { department }
      });
    } catch (error) {
      console.error('Failed to publish update:', error);
    }
  };

  const fetchSavedDashboards = async () => {
    try {
      const dashboards = await blink.db.dashboards.list();
      setSavedDashboards(dashboards || []);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    }
  };

  useEffect(() => {
    fetchSavedDashboards();

    const handleRefresh = () => fetchSavedDashboards();
    window.addEventListener('refresh-dashboards', handleRefresh);
    return () => window.removeEventListener('refresh-dashboards', handleRefresh);
  }, []);

  const saveDashboard = async (name: string) => {
    setIsLoading(true);
    try {
      const user = await blink.auth.me();
      if (!user) throw new Error('User not authenticated');

      const config = JSON.stringify({ widgets });
      await blink.db.dashboards.create({
        user_id: user.id,
        name,
        department,
        config
      });
      
      toast.success('Dashboard saved successfully');
      fetchSavedDashboards();
    } catch (error) {
      console.error('Error saving dashboard:', error);
      toast.error('Failed to save dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboard = async (id: string) => {
    setIsLoading(true);
    try {
      const dashboard = await blink.db.dashboards.get({ id });
      if (dashboard) {
        const config = JSON.parse(dashboard.config);
        setWidgets(config.widgets);
        setDepartment(dashboard.department as Department);
        toast.success(`Loaded dashboard: ${dashboard.name}`);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardContext.Provider value={{ 
      department, 
      setDepartment, 
      kpis, 
      widgets, 
      setWidgets, 
      saveDashboard, 
      loadDashboard, 
      savedDashboards, 
      isLoading,
      publishMetricUpdate
    }}>
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