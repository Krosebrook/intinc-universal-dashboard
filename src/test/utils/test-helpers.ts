/**
 * Test Helper Utilities
 * Common utilities for writing tests
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function with common providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Create mock data for dashboards
 */
export function createMockDashboard(overrides = {}) {
  return {
    id: 'dashboard-123',
    name: 'Test Dashboard',
    description: 'Test Description',
    department: 'Sales',
    userId: 'user-123',
    isPublic: false,
    widgets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock data for widgets
 */
export function createMockWidget(overrides = {}) {
  return {
    id: 'widget-123',
    type: 'bar',
    title: 'Test Widget',
    description: 'Test widget description',
    dataKey: 'value',
    categoryKey: 'name',
    gridSpan: 6,
    data: [
      { name: 'A', value: 100 },
      { name: 'B', value: 200 },
    ],
    ...overrides,
  };
}

/**
 * Create mock data for comments
 */
export function createMockComment(overrides = {}) {
  return {
    id: 'comment-123',
    content: 'Test comment',
    dashboardId: 'dashboard-123',
    userId: 'user-123',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock data for workspaces
 */
export function createMockWorkspace(overrides = {}) {
  return {
    id: 'workspace-123',
    name: 'Test Workspace',
    ownerId: 'user-123',
    members: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Wait for async updates in tests
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Re-export everything from testing library
 */
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
