import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { blink } from '../lib/blink';
import { toast } from 'sonner';
import { SavedDashboard, Department, WidgetConfig } from '../types/dashboard';
import { BlinkUser } from '@blinkdotnew/sdk';
import { logAuditEvent, AuditActions, AuditEntities } from '../lib/security/audit';
import { sanitizeText } from '../lib/security/sanitize';

export function useDashboardsCRUD(currentUser: BlinkUser | null) {
  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSavedDashboards = async () => {
    if (!currentUser?.id) {
      setSavedDashboards([]);
      return;
    }
    try {
      const dashboards = await blink.db.dashboards.list();
      setSavedDashboards(dashboards || []);
    } catch (error: any) {
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Failed to fetch')) {
        setSavedDashboards([]);
      } else {
        logger.error('Error fetching dashboards:', error as Error);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser?.id) {
        fetchSavedDashboards();
      } else {
        setSavedDashboards([]);
      }
    }, 100);

    const handleRefresh = () => {
      if (currentUser?.id) fetchSavedDashboards();
    };
    window.addEventListener('refresh-dashboards', handleRefresh);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('refresh-dashboards', handleRefresh);
    };
  }, [currentUser?.id]);

  const saveDashboard = async (name: string, department: Department, widgets: WidgetConfig[]) => {
    setIsLoading(true);
    try {
      const user = await blink.auth.me();
      if (!user) throw new Error('User not authenticated');

      const sanitizedName = sanitizeText(name);
      const config = JSON.stringify({ widgets });
      const dashboard = await blink.db.dashboards.create({
        user_id: user.id,
        name: sanitizedName,
        department,
        config
      });
      
      // Log audit event
      await logAuditEvent(user, {
        action: AuditActions.DASHBOARD_CREATE,
        entity: AuditEntities.DASHBOARD,
        entityId: dashboard.id,
        metadata: { name: sanitizedName, department }
      });

      toast.success('Dashboard saved successfully');
      fetchSavedDashboards();
    } catch (error) {
      logger.error('Error saving dashboard:', error as Error);
      toast.error('Failed to save dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDashboard = async (id: string) => {
    setIsLoading(true);
    try {
      const user = await blink.auth.me();
      await blink.db.dashboards.delete({ id });
      
      // Log audit event
      if (user) {
        await logAuditEvent(user, {
          action: AuditActions.DASHBOARD_DELETE,
          entity: AuditEntities.DASHBOARD,
          entityId: id
        });
      }

      toast.success('Dashboard deleted');
      fetchSavedDashboards();
    } catch (error) {
      logger.error('Error deleting dashboard:', error as Error);
      toast.error('Failed to delete dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    savedDashboards,
    isLoading,
    saveDashboard,
    deleteDashboard,
    fetchSavedDashboards
  };
}