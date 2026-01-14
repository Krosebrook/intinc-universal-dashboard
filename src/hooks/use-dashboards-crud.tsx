import { useState, useEffect } from 'react';
import { blink } from '../lib/blink';
import { toast } from 'react-hot-toast';
import { SavedDashboard, Department } from '../types/dashboard';
import { WidgetConfig } from '../components/dashboard/WidgetGrid';
import { BlinkUser } from '@blinkdotnew/sdk';

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
        console.error('Error fetching dashboards:', error);
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

  return {
    savedDashboards,
    isLoading,
    saveDashboard,
    deleteDashboard,
    fetchSavedDashboards
  };
}
