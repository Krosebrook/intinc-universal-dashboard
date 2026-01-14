import { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { DollarSign, Users, Zap, Target, Clock } from 'lucide-react';
import { blink } from '../lib/blink';
import { toast } from 'react-hot-toast';
import type { BlinkUser } from '@blinkdotnew/sdk';
import { EXPANDED_TEMPLATES } from '../lib/templates';
import { Department, KPIData, Workspace, Comment, SavedDashboard } from '../types/dashboard';
import { WidgetConfig } from '../components/dashboard/WidgetGrid';
import { DEPT_DATA } from '../lib/dashboard-data';
import { getMockData } from '../lib/mock-data';
import { useDashboardsCRUD } from './use-dashboards-crud';
import { useComments } from './use-comments';
import { useRealtimeMetrics } from './use-realtime-metrics';
import { useWorkspaces } from './use-workspaces';

export interface SuggestedStep {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

interface DashboardContextType {
  department: Department;
  setDepartment: (dept: Department) => void;
  kpis: KPIData[];
  widgets: WidgetConfig[];
  setWidgets: React.Dispatch<React.SetStateAction<WidgetConfig[]>>;
  saveDashboard: (name: string) => Promise<void>;
  loadDashboard: (id: string) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  savedDashboards: SavedDashboard[];
  isLoading: boolean;
  publishMetricUpdate: (data: any) => Promise<void>;
  logAction: (action: string, entity: string, entityId?: string, metadata?: any) => Promise<void>;
  comments: Comment[];
  addComment: (dashboardId: string, content: string, widgetId?: string) => Promise<void>;
  fetchComments: (dashboardId: string) => Promise<void>;
  workspaces: Workspace[];
  createWorkspace: (name: string) => Promise<void>;
  generateMockData: (source: 'Stripe' | 'Jira' | 'AWS' | 'GitHub' | 'OpenAI') => void;
  currentView: 'overview' | 'explorer';
  setCurrentView: (view: 'overview' | 'explorer') => void;
  globalFilters: Record<string, any>;
  setGlobalFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  loadTemplate: (templateId: string) => void;
  suggestedStep: SuggestedStep | null;
  isWidgetBuilderOpen: boolean;
  setIsWidgetBuilderOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [department, setDepartment] = useState<Department>('Sales');
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [currentView, setCurrentView] = useState<'overview' | 'explorer'>('explorer'); // Start in explorer (upload) mode
  const [globalFilters, setGlobalFilters] = useState<Record<string, any>>({});
  const [currentUser, setCurrentUser] = useState<BlinkUser | null>(null);
  const [isWidgetBuilderOpen, setIsWidgetBuilderOpen] = useState(false);
  const [suggestedStep, setSuggestedStep] = useState<SuggestedStep | null>(null);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setCurrentUser(state.user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Start empty, let user upload or select template
    if (widgets.length === 0 && kpis.length === 0) {
      setCurrentView('explorer');
    }
  }, [department, widgets.length, kpis.length]);

  useEffect(() => {
    // Logic to re-evaluate user progress
    if (widgets.length === 0) {
      setSuggestedStep({
        id: 'add-widget',
        title: 'Empty Dashboard',
        description: 'Start by adding your first data widget to visualize your metrics.',
        actionLabel: 'Add Widget',
        onAction: () => setIsWidgetBuilderOpen(true)
      });
    } else if (currentView === 'overview' && widgets.length < 3) {
      setSuggestedStep({
        id: 'explorer-mode',
        title: 'Need More Data?',
        description: 'Switch to Explorer mode to upload custom CSV datasets or connect APIs.',
        actionLabel: 'Go to Explorer',
        onAction: () => setCurrentView('explorer')
      });
    } else if (currentView === 'explorer') {
      setSuggestedStep({
        id: 'back-to-overview',
        title: 'Analyze Insights',
        description: 'Ready with your data? Head back to Overview to see AI-powered summaries.',
        actionLabel: 'View Dashboard',
        onAction: () => setCurrentView('overview')
      });
    } else {
      setSuggestedStep(null);
    }
  }, [widgets, currentView]);

  useEffect(() => {
    setWidgets(DEPT_DATA[department].widgets);
    setKpis(DEPT_DATA[department].kpis);
  }, [department]);

  const { savedDashboards, isLoading, saveDashboard, deleteDashboard, fetchSavedDashboards } = useDashboardsCRUD(currentUser);
  const { comments, fetchComments, addComment } = useComments();
  const { publishMetricUpdate } = useRealtimeMetrics(department, currentUser, setKpis, setWidgets);
  const { workspaces, createWorkspace } = useWorkspaces(currentUser);

  const setGlobalFilter = useCallback((key: string, value: any) => {
    setGlobalFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value
    }));
    toast.success(`Filter applied: ${key} = ${value}`);
  }, []);

  const clearFilters = useCallback(() => {
    setGlobalFilters({});
    toast.success('All filters cleared');
  }, []);

  const generateMockData = useCallback((source: 'Stripe' | 'Jira' | 'AWS' | 'GitHub' | 'OpenAI') => {
    const { kpis: mockKpis, widgets: mockWidgets } = getMockData(source);
    
    if (mockKpis.length > 0) {
      setKpis(mockKpis);
      setWidgets(mockWidgets);
      toast.success(`Generated ${source} sample data`);
    }
  }, []);

  const loadDashboard = async (id: string) => {
    try {
      const dashboard = await blink.db.dashboards.get({ id });
      if (dashboard) {
        const config = JSON.parse(dashboard.config);
        setWidgets(config.widgets);
        setDepartment(dashboard.department as Department);
        setCurrentView('overview');
        toast.success(`Loaded dashboard: ${dashboard.name}`);
        fetchComments(id);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    }
  };

  const logAction = async (action: string, entity: string, entityId?: string, metadata?: any) => {
    try {
      if (!currentUser) return;
      await blink.db.auditLogs.create({
        user_id: currentUser.id,
        action,
        entity,
        entity_id: entityId,
        metadata: metadata ? JSON.stringify(metadata) : null
      });
    } catch {
      // Silently handle audit log errors
    }
  };

  const loadTemplate = useCallback((templateId: string) => {
    const template = EXPANDED_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setKpis(template.kpis);
      setWidgets(template.widgets);
      toast.success(`Loaded template: ${template.name}`);
    }
  }, []);

  const value = {
    department,
    setDepartment,
    kpis,
    widgets,
    setWidgets,
    saveDashboard: (name: string) => saveDashboard(name, department, widgets),
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
    loadTemplate,
    suggestedStep,
    isWidgetBuilderOpen,
    setIsWidgetBuilderOpen
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}