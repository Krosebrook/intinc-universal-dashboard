/**
 * App Configuration - Central configuration for all app features
 * This module initializes and exports configuration for all app features
 */

import { blink } from './blink';
import { logger } from './logger';

// Feature flags and configuration
export const AppConfig = {
  // Authentication configuration
  auth: {
    mode: 'managed' as const,
    providers: ['google', 'github', 'apple', 'microsoft', 'email'],
    requireVerification: true,
    allowSignup: true,
  },

  // AI features configuration
  ai: {
    enabled: true,
    model: 'gpt-4.1-mini',
    maxTokens: 1000,
    features: {
      insights: true,
      forecasting: true,
      summarization: true,
    },
  },

  // Dashboard configuration
  dashboard: {
    maxWidgets: 20,
    defaultDepartment: 'Sales' as const,
    autoRefreshInterval: 30000, // 30 seconds
    enableRealtime: true,
  },

  // Export configuration
  export: {
    pdf: {
      enabled: true,
      scale: 2,
      backgroundColor: '#09090b',
    },
  },

  // Enterprise features
  enterprise: {
    branding: {
      enabled: true,
      defaultPrimaryColor: '#6366f1',
      defaultAccentColor: '#10b981',
    },
    teamManagement: {
      enabled: true,
      maxTeamMembers: 50,
    },
    apiKeys: {
      enabled: true,
    },
    webhooks: {
      enabled: true,
    },
    auditLogs: {
      enabled: true,
      retentionDays: 90,
    },
  },

  // Widget types available
  widgetTypes: [
    { id: 'area', label: 'Area Chart', icon: 'TrendingUp' },
    { id: 'bar', label: 'Bar Chart', icon: 'BarChart3' },
    { id: 'stacked-bar', label: 'Stacked Bar', icon: 'BarChart3' },
    { id: 'line', label: 'Line Chart', icon: 'LineChart' },
    { id: 'pie', label: 'Pie Chart', icon: 'PieChart' },
    { id: 'scatter', label: 'Scatter Plot', icon: 'Scatter' },
    { id: 'gauge', label: 'Gauge', icon: 'Gauge' },
    { id: 'progress', label: 'Progress Bar', icon: 'Activity' },
  ],

  // Department configurations
  departments: [
    { id: 'Sales', label: 'Sales & Revenue', icon: 'BarChart3' },
    { id: 'HR', label: 'Human Resources', icon: 'Users' },
    { id: 'IT', label: 'IT Infrastructure', icon: 'Cpu' },
    { id: 'Marketing', label: 'Marketing Ops', icon: 'PieChart' },
  ],
};

// Feature availability checks
export const isFeatureEnabled = (feature: string): boolean => {
  switch (feature) {
    case 'ai':
      return AppConfig.ai.enabled;
    case 'realtime':
      return AppConfig.dashboard.enableRealtime;
    case 'export':
      return AppConfig.export.pdf.enabled;
    case 'branding':
      return AppConfig.enterprise.branding.enabled;
    case 'teamManagement':
      return AppConfig.enterprise.teamManagement.enabled;
    case 'apiKeys':
      return AppConfig.enterprise.apiKeys.enabled;
    case 'webhooks':
      return AppConfig.enterprise.webhooks.enabled;
    case 'auditLogs':
      return AppConfig.enterprise.auditLogs.enabled;
    default:
      return false;
  }
};

// Initialize app features (called once on app start)
export async function initializeAppFeatures(): Promise<void> {
  logger.info('[App] Initializing features...');
  
  // Features are initialized through their respective providers/hooks
  // This function serves as a central point for any global initialization
  
  logger.info('[App] Features initialized successfully');
}

export default AppConfig;