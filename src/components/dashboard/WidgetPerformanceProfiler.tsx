/**
 * Widget Performance Profiler
 * Phase 6.3: Performance & Security Isolation
 * 
 * Helps developers optimize their custom components by tracking:
 * - Render time
 * - Re-render count
 * - Memory usage
 * - Data processing time
 */

import { useEffect, useRef, useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Clock, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface PerformanceMetrics {
  widgetId: string;
  widgetName: string;
  renderCount: number;
  avgRenderTime: number;
  lastRenderTime: number;
  maxRenderTime: number;
  dataSize: number;
  warnings: string[];
}

interface WidgetPerformanceProfilerProps {
  enabled?: boolean;
}

// Singleton to track performance across all widgets
class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private listeners: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  recordRender(widgetId: string, widgetName: string, renderTime: number, dataSize: number) {
    const current = this.metrics.get(widgetId) || {
      widgetId,
      widgetName,
      renderCount: 0,
      avgRenderTime: 0,
      lastRenderTime: 0,
      maxRenderTime: 0,
      dataSize: 0,
      warnings: []
    };

    const newRenderCount = current.renderCount + 1;
    const newAvgRenderTime = (current.avgRenderTime * current.renderCount + renderTime) / newRenderCount;
    const newMaxRenderTime = Math.max(current.maxRenderTime, renderTime);

    const warnings: string[] = [];
    if (renderTime > 16) {
      warnings.push('Render time exceeds 16ms (60fps target)');
    }
    if (newRenderCount > 100) {
      warnings.push('High re-render count detected');
    }
    if (dataSize > 10000) {
      warnings.push('Large dataset detected - consider pagination');
    }

    this.metrics.set(widgetId, {
      widgetId,
      widgetName,
      renderCount: newRenderCount,
      avgRenderTime: newAvgRenderTime,
      lastRenderTime: renderTime,
      maxRenderTime: newMaxRenderTime,
      dataSize,
      warnings
    });

    this.notifyListeners();
  }

  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  reset() {
    this.metrics.clear();
    this.notifyListeners();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const performanceTracker = PerformanceTracker.getInstance();

/**
 * Hook to track performance of custom widgets
 */
export function useWidgetPerformance(widgetId: string, widgetName: string, dataSize: number = 0) {
  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    renderStartRef.current = performance.now();
    renderCountRef.current += 1;
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current;
    performanceTracker.recordRender(widgetId, widgetName, renderTime, dataSize);
  });

  return {
    renderCount: renderCountRef.current
  };
}

/**
 * Performance Profiler UI Component
 */
export const WidgetPerformanceProfiler = memo(({ enabled = false }: WidgetPerformanceProfilerProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = performanceTracker.subscribe(() => {
      setMetrics(performanceTracker.getMetrics());
    });

    // Initial load
    setMetrics(performanceTracker.getMetrics());

    return unsubscribe;
  }, [enabled]);

  if (!enabled) return null;

  const getPerformanceStatus = (metric: PerformanceMetrics): 'good' | 'warning' | 'poor' => {
    if (metric.warnings.length > 0) return 'poor';
    if (metric.avgRenderTime > 8) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'poor': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          <Activity className="w-4 h-4 mr-2" />
          Performance ({metrics.length})
        </Button>
      ) : (
        <Card className="w-96 max-h-96 overflow-auto shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Widget Performance</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => performanceTracker.reset()}
                  variant="ghost"
                  size="sm"
                >
                  Reset
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                >
                  ×
                </Button>
              </div>
            </div>
            <CardDescription>
              Tracking {metrics.length} widget{metrics.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No widgets tracked yet
              </p>
            ) : (
              metrics.map((metric) => {
                const status = getPerformanceStatus(metric);
                return (
                  <div
                    key={metric.widgetId}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{metric.widgetName}</div>
                      <div className={`flex items-center gap-1 ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Avg:</span>
                        <span>{metric.avgRenderTime.toFixed(2)}ms</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Last:</span>
                        <span>{metric.lastRenderTime.toFixed(2)}ms</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Renders:</span> {metric.renderCount}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data:</span> {metric.dataSize} items
                      </div>
                    </div>

                    {metric.warnings.length > 0 && (
                      <div className="space-y-1">
                        {metric.warnings.map((warning, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {warning}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
});

WidgetPerformanceProfiler.displayName = 'WidgetPerformanceProfiler';
