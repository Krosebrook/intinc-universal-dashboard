import React from 'react';
import { render, waitFor, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDashboardsCRUD } from '../use-dashboards-crud';
import { blink } from '../../lib/blink';

// Mock blink SDK
vi.mock('../../lib/blink', () => ({
  blink: {
    auth: {
      me: vi.fn(),
    },
    db: {
      dashboards: {
        list: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
    },
  },
}));

// Mock audit log
vi.mock('../../lib/security/audit', () => ({
  logAuditEvent: vi.fn(),
  AuditActions: { DASHBOARD_CREATE: 'create', DASHBOARD_DELETE: 'delete' },
  AuditEntities: { DASHBOARD: 'dashboard' },
}));

function TestComponent({ user }: { user: any }) {
  const { savedDashboards, saveDashboard, deleteDashboard } = useDashboardsCRUD(user);
  return (
    <div>
      <div data-testid="dashboard-count">{savedDashboards.length}</div>
      <button data-testid="save-btn" onClick={() => saveDashboard('New Dashboard', 'Sales', [])}>Save</button>
      <button data-testid="delete-btn" onClick={() => deleteDashboard('123')}>Delete</button>
    </div>
  );
}

describe('useDashboardsCRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch dashboards for authenticated user', async () => {
    const mockDashboards = [{ id: '1', name: 'Sales Dash', department: 'Sales', config: '{}' }];
    (blink.db.dashboards.list as any).mockResolvedValue(mockDashboards);

    render(<TestComponent user={{ id: 'user-123' }} />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-count').textContent).toBe('1');
    });
  });

  it('should not fetch dashboards for unauthenticated user', async () => {
    render(<TestComponent user={null} />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-count').textContent).toBe('0');
    });
    expect(blink.db.dashboards.list).not.toHaveBeenCalled();
  });

  it('should call create when saving a dashboard', async () => {
    (blink.auth.me as any).mockResolvedValue({ id: 'user-123' });
    (blink.db.dashboards.create as any).mockResolvedValue({ id: 'new-id' });

    render(<TestComponent user={{ id: 'user-123' }} />);

    const saveBtn = screen.getByTestId('save-btn');
    await act(async () => {
      saveBtn.click();
    });

    expect(blink.db.dashboards.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Dashboard',
      department: 'Sales',
    }));
  });
});
