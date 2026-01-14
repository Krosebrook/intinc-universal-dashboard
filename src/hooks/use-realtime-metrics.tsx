import { useEffect } from 'react';
import { blink } from '../lib/blink';
import { toast } from 'react-hot-toast';
import { Department, KPIData } from '../types/dashboard';
import { WidgetConfig } from '../components/dashboard/WidgetGrid';
import { BlinkUser } from '@blinkdotnew/sdk';

export function useRealtimeMetrics(
  department: Department,
  currentUser: BlinkUser | null,
  setKpis: React.Dispatch<React.SetStateAction<KPIData[]>>,
  setWidgets: React.Dispatch<React.SetStateAction<WidgetConfig[]>>
) {
  useEffect(() => {
    if (!currentUser?.id) return;

    let channel: any = null;
    let mounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 1;
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
        const isRealtimeError = error?.code === 'REALTIME_ERROR' || 
                                error?.message?.includes('timeout') ||
                                error?.message?.includes('WebSocket') ||
                                error?.message?.includes('Failed to fetch');
        
        if (isRealtimeError && retryCount < MAX_RETRIES && mounted) {
          retryCount++;
          setTimeout(() => {
            if (mounted) setupRealtime();
          }, RETRY_DELAY);
        }
      }
    };

    const initTimer = setTimeout(() => {
      if (mounted) setupRealtime();
    }, 1000);

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
  }, [department, currentUser?.id, setKpis, setWidgets]);

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
      // Silently handle publish errors
    }
  };

  return { publishMetricUpdate };
}
