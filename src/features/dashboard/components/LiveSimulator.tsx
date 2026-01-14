import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../../hooks/use-dashboard';
import { Button } from '../../../components/ui/button';
import { Radio, Zap, Activity, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

export default function LiveSimulator() {
  const { publishMetricUpdate, department, kpis, widgets } = useDashboard();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let interval: any = null;

    if (isLive) {
      interval = setInterval(() => {
        // Randomly choose between updating a KPI or a Widget
        const type = Math.random() > 0.4 ? 'kpi' : 'widget';

        if (type === 'kpi' && kpis.length > 0) {
          const kpi = kpis[Math.floor(Math.random() * kpis.length)];
          const numericValue = parseFloat(kpi.value.replace(/[$,%]/g, '')) || 0;
          const change = (Math.random() - 0.4) * (numericValue * 0.05); // -2% to +3% change
          const newValue = numericValue + change;
          
          let formattedValue = newValue.toFixed(2);
          if (kpi.value.includes('$')) formattedValue = `$${newValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
          if (kpi.value.includes('%')) formattedValue = `${newValue.toFixed(2)}%`;

          publishMetricUpdate({
            type: 'kpi-update',
            payload: {
              title: kpi.title,
              value: formattedValue,
              trend: `${change >= 0 ? '+' : ''}${(change / numericValue * 100).toFixed(1)}%`
            }
          });
        } else if (widgets.length > 0) {
          const widget = widgets[Math.floor(Math.random() * widgets.length)];
          if (widget.data && Array.isArray(widget.data)) {
            const newData = widget.data.map((item: any) => {
              const updatedItem = { ...item };
              Object.keys(item).forEach(key => {
                if (typeof item[key] === 'number' && key !== 'name' && key !== 'month' && key !== 'time' && key !== 'stage' && key !== 'type' && key !== 'source' && key !== 'campaign') {
                  updatedItem[key] = Math.max(0, Math.floor(item[key] * (0.95 + Math.random() * 0.1))); // +/- 5%
                }
              });
              return updatedItem;
            });

            publishMetricUpdate({
              type: 'widget-data-update',
              payload: {
                widgetId: widget.id,
                newData
              }
            });
          }
        }
      }, 5000); // Update every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, kpis, widgets, publishMetricUpdate, department]);

  return (
    <Card className="glass-card border-white/10 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Live Metrics Simulator
          </CardTitle>
          <Badge variant={isLive ? "default" : "secondary"} className={isLive ? "bg-red-500/20 text-red-400 border-red-500/20 animate-pulse" : "bg-white/5"}>
            {isLive ? "LIVE" : "OFFLINE"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Enable simulation to push real-time metric updates to the dashboard via WebSockets.
        </p>
        <Button 
          size="sm" 
          className={`w-full ${isLive ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/20' : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border-indigo-500/20'}`}
          variant="outline"
          onClick={() => setIsLive(!isLive)}
        >
          {isLive ? (
            <>
              <ShieldAlert className="w-4 h-4 mr-2" />
              Stop Simulation
            </>
          ) : (
            <>
              <Radio className="w-4 h-4 mr-2" />
              Start Live Feed
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
