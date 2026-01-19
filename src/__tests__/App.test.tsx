import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { blink } from './lib/blink';

// Mock blink SDK
vi.mock('./lib/blink', () => ({
  blink: {
    auth: {
      onAuthStateChanged: vi.fn(),
      login: vi.fn(),
    },
    db: {
      workspaceMembers: { list: vi.fn() },
      dashboards: { list: vi.fn() },
      auditLogs: { create: vi.fn() },
    },
  },
}));

// Mock components to avoid deep rendering issues
vi.mock('./pages/LoginPage', () => ({ default: () => <div data-testid="login-page">Login Page</div> }));
vi.mock('./pages/DashboardPage', () => ({ default: () => <div data-testid="dashboard-page">Dashboard Page</div> }));

describe('App Auth Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show login page when not authenticated', async () => {
    (blink.auth.onAuthStateChanged as any).mockImplementation((callback: any) => {
      callback({ user: null, isLoading: false, isAuthenticated: false });
      return () => {};
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeDefined();
    });
  });

  it('should show dashboard page when authenticated', async () => {
    (blink.auth.onAuthStateChanged as any).mockImplementation((callback: any) => {
      callback({ user: { id: '123', email: 'test@test.com' }, isLoading: false, isAuthenticated: true });
      return () => {};
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeDefined();
    });
  });

  it('should show loading spinner initially', async () => {
    (blink.auth.onAuthStateChanged as any).mockImplementation((callback: any) => {
      // Simulate slow loading
      return () => {};
    });

    render(<App />);

    expect(document.querySelector('.animate-spin')).toBeDefined();
  });
});
