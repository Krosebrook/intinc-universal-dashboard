import { useState, createContext, useContext, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, TrendingUp, Briefcase, Target, Cpu, Shield, Zap, Globe, Heart, Clock } from 'lucide-react';
import { KPIData } from '../components/dashboard/KPISection';
import { WidgetConfig } from '../components/dashboard/WidgetGrid';
import { blink } from '../lib/blink';
import { toast } from 'react-hot-toast';
import type { BlinkUser } from '@blinkdotnew/sdk';
import { EXPANDED_TEMPLATES } from '../lib/templates';

export type Department = 'Sales' | 'HR' | 'IT' | 'Marketing' | 'SaaS' | 'Product' | 'AI' | 'Operations';

interface DashboardContextType {
  department: Department;
  setDepartment: (dept: Department) => void;
  kpis: KPIData[];
  widgets: WidgetConfig[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetConfig[]>>;
  saveDashboard: (name: string) => Promise<void>;
  loadDashboard: (id: string) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  savedDashboards: any[];
  isLoading: boolean;
  publishMetricUpdate: (data: any) => Promise<void>;
  logAction: (action: string, entity: string, entityId?: string, metadata?: any) => Promise<void>;
  // Collaborative features
  comments: any[];
  addComment: (dashboardId: string, content: string, widgetId?: string) => Promise<void>;
  fetchComments: (dashboardId: string) => Promise<void>;
  workspaces: any[];
  createWorkspace: (name: string) => Promise<void>;
  generateMockData: (source: 'Stripe' | 'Jira' | 'AWS' | 'GitHub' | 'OpenAI') => void;
  currentView: 'overview' | 'explorer';
  setCurrentView: (view: 'overview' | 'explorer') => void;
  globalFilters: Record<string, any>;
  setGlobalFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  loadTemplate: (templateId: string) => void;
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
  },
  SaaS: {
    kpis: EXPANDED_TEMPLATES.find(t => t.id === 'mrr-growth')?.kpis || [],
    widgets: EXPANDED_TEMPLATES.find(t => t.id === 'mrr-growth')?.widgets || []
  },
  Product: {
    kpis: EXPANDED_TEMPLATES.find(t => t.id === 'customer-health')?.kpis || [],
    widgets: EXPANDED_TEMPLATES.find(t => t.id === 'customer-health')?.widgets || []
  },
  AI: {
    kpis: EXPANDED_TEMPLATES.find(t => t.id === 'token-cost')?.kpis || [],
    widgets: EXPANDED_TEMPLATES.find(t => t.id === 'token-cost')?.widgets || []
  },
  Operations: {
    kpis: EXPANDED_TEMPLATES.find(t => t.id === 'it-audit')?.kpis || [],
    widgets: EXPANDED_TEMPLATES.find(t => t.id === 'it-audit')?.widgets || []
  }
};

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [department, setDepartment] = useState<Department>('Sales');
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEPT_DATA['Sales'].widgets);
  const [kpis, setKpis] = useState<KPIData[]>(DEPT_DATA['Sales'].kpis);
  const [savedDashboards, setSavedDashboards] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'overview' | 'explorer'>('overview');
  const [globalFilters, setGlobalFilters] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<BlinkUser | null>(null);

  const setGlobalFilter = (key: string, value: any) => {
    setGlobalFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value // Toggle filter
    }));
    toast.success(`Filter applied: ${key} = ${value}`);
  };

  const clearFilters = () => {
    setGlobalFilters({});
    toast.success('All filters cleared');
  };

  const generateMockData = (source: 'Stripe' | 'Jira' | 'AWS' | 'GitHub') => {
    setIsLoading(true);
    setTimeout(() => {
      let mockKpis: KPIData[] = [];
      let mockWidgets: WidgetConfig[] = [];

      switch (source) {
        case 'Stripe':
          mockKpis = [
            { title: 'Gross Volume', value: '$245,890', trend: '+18.2%', trendType: 'up', icon: DollarSign, description: 'Total value of processed payments.' },
            { title: 'Net Revenue', value: '$212,450', trend: '+15.4%', trendType: 'up', icon: Zap, description: 'Revenue after Stripe fees and refunds.' },
            { title: 'New Customers', value: '1,245', trend: '+22.1%', trendType: 'up', icon: Users, description: 'New customer accounts created.' },
            { title: 'Churn Rate', value: '2.4%', trend: '-0.8%', trendType: 'up', icon: Target, description: 'Percentage of customers who cancelled.' },
          ];
          mockWidgets = [
            { id: 'stripe-volume', type: 'area', title: 'Payment Volume', description: 'Daily transaction volume for the last 30 days', dataKey: 'volume', categoryKey: 'date', gridSpan: 8, data: Array.from({ length: 30 }).map((_, i) => ({ date: `2024-01-${i + 1}`, volume: Math.floor(Math.random() * 5000) + 2000 })) },
            { id: 'stripe-methods', type: 'pie', title: 'Payment Methods', description: 'Distribution by card type and wallet', dataKey: 'value', categoryKey: 'name', gridSpan: 4, data: [{ name: 'Visa', value: 45 }, { name: 'Mastercard', value: 30 }, { name: 'Apple Pay', value: 15 }, { name: 'Amex', value: 10 }] },
          ];
          break;
        case 'Jira':
          mockKpis = [
            { title: 'Sprint Velocity', value: '42 pts', trend: '+5.2%', trendType: 'up', icon: Zap, description: 'Average story points completed per sprint.' },
            { title: 'Cycle Time', value: '4.2 days', trend: '-1.1 days', trendType: 'up', icon: Clock, description: 'Time from start to completion of a task.' },
            { title: 'Open Bugs', value: '18', trend: '-24%', trendType: 'up', icon: Shield, description: 'Total number of unresolved bug reports.' },
            { title: 'Completion Rate', value: '94%', trend: '+2.1%', trendType: 'up', icon: Target, description: 'Percentage of planned work completed in sprint.' },
          ];
          mockWidgets = [
            { id: 'jira-burndown', type: 'line', title: 'Sprint Burndown', description: 'Remaining effort vs ideal progress', dataKey: ['Actual', 'Ideal'], categoryKey: 'day', gridSpan: 8, data: Array.from({ length: 10 }).map((_, i) => ({ day: `Day ${i + 1}`, Actual: 100 - (i * 10) - Math.floor(Math.random() * 5), Ideal: 100 - (i * 10) })) },
            { id: 'jira-status', type: 'pie', title: 'Issue Status', description: 'Current distribution of all project tasks', dataKey: 'value', categoryKey: 'name', gridSpan: 4, data: [{ name: 'Done', value: 65 }, { name: 'In Progress', value: 20 }, { name: 'To Do', value: 15 }] },
          ];
          break;
        case 'AWS':
          mockKpis = [
            { title: 'Monthly Spend', value: '$4,120', trend: '+4.2%', trendType: 'down', icon: DollarSign, description: 'Total projected cloud cost for current month.' },
            { title: 'Instance Uptime', value: '99.98%', trend: '+0.01%', trendType: 'up', icon: Cpu, description: 'Average uptime across all EC2 instances.' },
            { title: 'Lambda Execs', value: '1.2M', trend: '+45%', trendType: 'up', icon: Zap, description: 'Total serverless function invocations.' },
            { title: 'S3 Storage', value: '2.4 TB', trend: '+12%', trendType: 'down', icon: Target, description: 'Total storage consumed across all buckets.' },
          ];
          mockWidgets = [
            { id: 'aws-cost', type: 'bar', title: 'Cost by Service', description: 'Daily breakdown of AWS service expenses', dataKey: 'cost', categoryKey: 'service', gridSpan: 6, data: [{ service: 'EC2', cost: 1200 }, { service: 'RDS', cost: 850 }, { service: 'S3', cost: 450 }, { service: 'Lambda', cost: 120 }, { service: 'Other', cost: 340 }] },
            { id: 'aws-traffic', type: 'area', title: 'Network Traffic', description: 'Data transfer in/out over the last 24 hours', dataKey: ['Inbound', 'Outbound'], categoryKey: 'time', gridSpan: 6, data: Array.from({ length: 24 }).map((_, i) => ({ time: `${i}:00`, Inbound: Math.floor(Math.random() * 100), Outbound: Math.floor(Math.random() * 80) })) },
          ];
          break;
        case 'GitHub':
          mockKpis = [
            { title: 'Pull Requests', value: '24', trend: '+4', trendType: 'up', icon: Target, description: 'Active open pull requests across repos.' },
            { title: 'Merge Time', value: '1.8 hrs', trend: '-0.4 hrs', trendType: 'up', icon: Clock, description: 'Average time to merge a pull request.' },
            { title: 'Commits', value: '142', trend: '+12%', trendType: 'up', icon: Zap, description: 'Total code commits in the last 7 days.' },
            { title: 'Vulnerabilities', value: '0', trend: '0', trendType: 'up', icon: Shield, description: 'Dependabot alerts currently active.' },
          ];
          mockWidgets = [
            { id: 'github-activity', type: 'line', title: 'Commit Activity', description: 'Frequency of code pushes across all branches', dataKey: 'commits', categoryKey: 'date', gridSpan: 12, data: Array.from({ length: 14 }).map((_, i) => ({ date: `Jan ${i + 1}`, commits: Math.floor(Math.random() * 20) + 5 })) },
          ];
          break;
        case 'OpenAI':
          const aiTemplate = EXPANDED_TEMPLATES.find(t => t.id === 'token-cost');
          if (aiTemplate) {
            mockKpis = aiTemplate.kpis;
            mockWidgets = aiTemplate.widgets;
          }
          break;
      }

      setKpis(mockKpis);
      setWidgets(mockWidgets);
      setIsLoading(false);
      toast.success(`Generated ${source} sample data`);
    }, 1000);
  };

  // Track auth state to gate auth-required operations
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setCurrentUser(state.user);
    });
    return unsubscribe;
  }, []);

  // Initial load of default widgets when department changes
  useEffect(() => {
    setWidgets(DEPT_DATA[department].widgets);
    setKpis(DEPT_DATA[department].kpis);
  }, [department]);

  // Real-time Metrics Subscription - only when authenticated
  // Note: Realtime is optional for dashboard functionality - gracefully degrade if unavailable
  useEffect(() => {
    // Don't setup realtime if user is not authenticated
    if (!currentUser?.id) return;

    let channel: any = null;
    let mounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 1; // Reduced retries to minimize error noise
    const RETRY_DELAY = 5000;

    const setupRealtime = async () => {
      try {
        channel = blink.realtime.channel(`metrics-${department}`);
        await channel.subscribe({
          userId: currentUser.id,
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

      } catch (error: any) {
        // Handle WebSocket connection errors gracefully and silently
        // The dashboard works perfectly without realtime - it's an optional enhancement
        const isRealtimeError = error?.code === 'REALTIME_ERROR' || 
                                error?.message?.includes('timeout') ||
                                error?.message?.includes('WebSocket') ||
                                error?.message?.includes('Failed to fetch');
        
        if (isRealtimeError && retryCount < MAX_RETRIES && mounted) {
          retryCount++;
          // Silent retry - no console logging
          setTimeout(() => {
            if (mounted) setupRealtime();
          }, RETRY_DELAY);
        }
        // All other cases: silently degrade - dashboard works fine without realtime
      }
    };

    // Delay initial connection to let auth settle
    const initTimer = setTimeout(() => {
      if (mounted) setupRealtime();
    }, 1000); // Increased delay for more stable connection

    return () => {
      mounted = false;
      clearTimeout(initTimer);
      if (channel) {
        try {
          channel.unsubscribe();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [department, currentUser?.id]);

  const publishMetricUpdate = async (data: any) => {
    try {
      const user = await blink.auth.me();
      if (!user) return;
      
      const channel = blink.realtime.channel(`metrics-${department}`);
      await channel.publish(data.type, data.payload, {
        userId: user.id,
        metadata: { department }
      });
    } catch {
      // Silently handle publish errors - realtime is optional enhancement
      // The live simulator will continue to work locally even if publish fails
    }
  };

  const logAction = async (action: string, entity: string, entityId?: string, metadata?: any) => {
    try {
      const user = await blink.auth.me();
      if (!user) return;

      await blink.db.auditLogs.create({
        user_id: user.id,
        action,
        entity,
        entity_id: entityId,
        metadata: metadata ? JSON.stringify(metadata) : null
      });
    } catch {
      // Silently handle audit log errors - non-critical functionality
    }
  };

  const fetchSavedDashboards = async () => {
    // Only fetch dashboards when user is authenticated
    if (!currentUser?.id) {
      setSavedDashboards([]);
      return;
    }
    try {
      const dashboards = await blink.db.dashboards.list();
      setSavedDashboards(dashboards || []);
    } catch (error: any) {
      // Gracefully handle network errors for unauthenticated or transient failures
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Failed to fetch')) {
        // Silently degrade - saved dashboards will just be empty
        console.info('Dashboard fetch unavailable - using default views');
        setSavedDashboards([]);
      } else {
        console.error('Error fetching dashboards:', error);
      }
    }
  };

  // Fetch saved dashboards only when authenticated
  useEffect(() => {
    // Add small delay to let auth state fully settle
    const timer = setTimeout(() => {
      if (currentUser?.id) {
        fetchSavedDashboards();
      } else {
        setSavedDashboards([]);
      }
    }, 100);

    const handleRefresh = () => {
      if (currentUser?.id) {
        fetchSavedDashboards();
      }
    };
    window.addEventListener('refresh-dashboards', handleRefresh);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('refresh-dashboards', handleRefresh);
    };
  }, [currentUser?.id]);

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
        fetchComments(id);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDashboard = async (id: string) => {
    setIsLoading(true);
    try {
      await blink.db.dashboards.delete({ id });
      toast.success('Dashboard deleted');
      fetchSavedDashboards();
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      toast.error('Failed to delete dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (dashboardId: string) => {
    try {
      const results = await blink.db.comments.list({ dashboard_id: dashboardId });
      setComments(results || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const addComment = async (dashboardId: string, content: string, widgetId?: string) => {
    try {
      const user = await blink.auth.me();
      if (!user) return;

      await blink.db.comments.create({
        user_id: user.id,
        dashboard_id: dashboardId,
        widget_id: widgetId || null,
        content
      });
      fetchComments(dashboardId);
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const results = await blink.db.workspaces.list();
      setWorkspaces(results || []);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const createWorkspace = async (name: string) => {
    try {
      const user = await blink.auth.me();
      if (!user) return;

      await blink.db.workspaces.create({
        userId: user.id,
        ownerId: user.id,
        name
      });
      fetchWorkspaces();
      toast.success('Workspace created');
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace');
    }
  };

  // Fetch workspaces when authenticated
  useEffect(() => {
    if (currentUser?.id) {
      fetchWorkspaces();
    }
  }, [currentUser?.id]);

  const loadTemplate = (templateId: string) => {
    const template = EXPANDED_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setDepartment(template.department);
      setWidgets(template.widgets);
      setKpis(template.kpis);
      toast.success(`Loaded template: ${template.name}`);
    } else {
      // Check base templates or fallback
      const baseMatch = Object.entries(DEPT_DATA).find(([key]) => key.toLowerCase() === templateId.toLowerCase());
      if (baseMatch) {
        setDepartment(baseMatch[0] as Department);
        toast.success(`Loaded ${baseMatch[0]} dashboard`);
      }
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
      deleteDashboard,
      savedDashboards, 
      isLoading,
      publishMetricUpdate,
      logAction,
      comments,
      addComment,
      fetchComments,
      workspaces,
      createWorkspace,
      generateMockData,
      currentView,
      setCurrentView,
      globalFilters,
      setGlobalFilter,
      clearFilters,
      loadTemplate
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