import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RBACProvider, useRBAC } from '../use-rbac';
import { blink } from '../../lib/blink';

// Mock blink SDK
vi.mock('../../lib/blink', () => ({
  blink: {
    auth: {
      onAuthStateChanged: vi.fn(),
    },
    db: {
      workspaceMembers: {
        list: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      auditLogs: {
        create: vi.fn(),
      },
    },
  },
}));

function TestComponent() {
  const { currentRole, permissions, hasPermission } = useRBAC();
  return (
    <div>
      <div data-testid="role">{currentRole}</div>
      <div data-testid="permissions">{permissions.join(',')}</div>
      <div data-testid="has-edit">{hasPermission('dashboard:edit') ? 'yes' : 'no'}</div>
    </div>
  );
}

describe('useRBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default viewer role for authenticated users', async () => {
    (blink.auth.onAuthStateChanged as any).mockImplementation((callback: any) => {
      callback({ user: { id: 'user-123', email: 'test@example.com', metadata: {} }, isLoading: false });
      return () => {};
    });

    render(
      <RBACProvider>
        <TestComponent />
      </RBACProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('role').textContent).toBe('editor'); // Default for authenticated users in the hook
    });
  });

  it('should set admin role from user metadata', async () => {
    (blink.auth.onAuthStateChanged as any).mockImplementation((callback: any) => {
      callback({ user: { id: 'user-123', email: 'test@example.com', metadata: { role: 'admin' } }, isLoading: false });
      return () => {};
    });

    render(
      <RBACProvider>
        <TestComponent />
      </RBACProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('role').textContent).toBe('admin');
      expect(screen.getByTestId('has-edit').textContent).toBe('yes');
    });
  });

  it('should set guest role for unauthenticated users', async () => {
    (blink.auth.onAuthStateChanged as any).mockImplementation((callback: any) => {
      callback({ user: null, isLoading: false });
      return () => {};
    });

    render(
      <RBACProvider>
        <TestComponent />
      </RBACProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('role').textContent).toBe('guest');
      expect(screen.getByTestId('has-edit').textContent).toBe('no');
    });
  });
});
