import { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { blink } from '../lib/blink';
import { toast } from 'sonner';
import type { BlinkUser } from '@blinkdotnew/sdk';
import { EXPANDED_TEMPLATES } from '../lib/templates';
import { Department, KPIData, Workspace, Comment, SavedDashboard, WidgetConfig } from '../types/dashboard';
import { logAuditEvent } from '../lib/security/audit';
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
  currentView: 'overview' | 'explorer' | 'prd-generator';
  setCurrentView: (view: 'overview' | 'explorer' | 'prd-generator') => void;
  globalFilters: Record<string, any>;
  setGlobalFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  loadTemplate: (templateId: string) => void;
  suggestedStep: SuggestedStep | null;
  isWidgetBuilderOpen: boolean;
  setIsWidgetBuilderOpen: (open: boolean) => void;
  showOnboarding: boolean;
  setShowOnboarding: (open: boolean) => void;
  dashboardState: Record<string, any>;
  setDashboardState: (key: string, value: any) => void;
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
  credits: number;
  consumeCredit: () => Promise<boolean>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [department, setDepartment] = useState<Department>('Sales');
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [currentView, setCurrentView] = useState<'overview' | 'explorer' | 'prd-generator'>('explorer'); // Start in explorer (upload) mode
  const [globalFilters, setGlobalFilters] = useState<Record<string, any>>({});
  const [dashboardState, setDashboardStateInternal] = useState<Record<string, any>>({});
  const [currentUser, setCurrentUser] = useState<BlinkUser | null>(null);
  const [credits, setCredits] = useState<number>(5);
  const [isWidgetBuilderOpen, setIsWidgetBuilderOpen] = useState(false);
  const [suggestedStep, setSuggestedStep] = useState<SuggestedStep | null>(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('onboarding_completed');
    }
    return false;
  });

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setCurrentUser(state.user);
      if (state.user) {
        // Fetch credits on login
        blink.db.users.get({ id: state.user.id }).then(user => {
          if (user && typeof user.credits === 'number') {
            setCredits(user.credits);
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  const consumeCredit = useCallback(async () => {
    if (!currentUser) return false;
    if (credits <= 0) {
      toast.error('No AI credits remaining. Upgrade for more.');
      return false;
    }

    try {
      const newCredits = credits - 1;
      await blink.db.users.update({ 
        id: currentUser.id, 
        credits: newCredits 
      });
      setCredits(newCredits);
      return true;
    } catch (error) {
      logger.error('Error consuming credit:', error as Error);
      return false;
    }
  }, [currentUser, credits]);

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

  const generateMockData = useCallback(async (source: 'Stripe' | 'Jira' | 'AWS' | 'GitHub' | 'OpenAI') => {
    const toastId = toast.loading(`Connecting to ${source} API...`);
    
    // Simulate real integration delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { kpis: mockKpis, widgets: mockWidgets } = getMockData(source);
    
    if (mockKpis.length > 0) {
      setKpis(mockKpis);
      setWidgets(mockWidgets);
      toast.success(`Connected to ${source} and synced ${mockWidgets.length} visualizations`, { id: toastId });
      
      if (currentUser) {
        logAction('external_integration_connect', 'integration', source, { status: 'success' });
      }
    } else {
      toast.error(`Failed to establish connection to ${source}`, { id: toastId });
    }
  }, [currentUser]);

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
      logger.error('Error loading dashboard:', error as Error);
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

  const setDashboardState = useCallback((key: string, value: any) => {
    setDashboardStateInternal(prev => ({ ...prev, [key]: value }));
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
    setIsWidgetBuilderOpen,
    showOnboarding,
    setShowOnboarding,
    dashboardState,
    setDashboardState,
    activeWorkspaceId,
    setActiveWorkspaceId,
    credits,
    consumeCredit
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