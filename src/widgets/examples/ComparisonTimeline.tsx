/**
 * Example: Comparison Timeline Widget
 * Demonstrates comparison mode and date range handling
 */

import { useWidgetSDK, useComparisonData } from '@/hooks/use-widget-sdk';
import { useWidgetPerformance } from '@/components/dashboard/WidgetPerformanceProfiler';
import { LineChart, Line, XAxis, YAxis, Legend, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineData {
  date: string;
  revenue: number;
  customers: number;
}

interface ComparisonTimelineProps {
  id: string;
  title?: string;
  data: TimelineData[];
  metric: 'revenue' | 'customers';
}

export function ComparisonTimeline({ 
  id, 
  title = 'Performance Timeline',
  data,
  metric = 'revenue'
}: ComparisonTimelineProps) {
  const sdk = useWidgetSDK(id);
  
  // Track performance
  useWidgetPerformance(id, 'Comparison Timeline', data.length);

  // Get comparison data
  const { primary, comparison, mode } = useComparisonData(id, data, 'date');

  // Calculate comparison metrics
  const calculateChange = () => {
    if (mode === 'disabled' || comparison.length === 0) return null;

    const primarySum = primary.reduce((sum, item) => sum + item[metric], 0);
    const comparisonSum = comparison.reduce((sum, item) => sum + item[metric], 0);
    
    const change = ((primarySum - comparisonSum) / comparisonSum) * 100;
    
    return {
      value: change,
      isPositive: change > 0,
      primarySum,
      comparisonSum
    };
  };

  const change = calculateChange();

  // Prepare chart data
  const chartData = mode === 'enabled' 
    ? primary.map((item, idx) => ({
        date: format(new Date(item.date), 'MMM dd'),
        current: item[metric],
        previous: comparison[idx]?.[metric] || 0
      }))
    : primary.map(item => ({
        date: format(new Date(item.date), 'MMM dd'),
        current: item[metric]
      }));

  const metricLabel = metric === 'revenue' ? 'Revenue' : 'Customers';
  const metricFormat = metric === 'revenue' 
    ? (value: number) => `$${value.toLocaleString()}`
    : (value: number) => value.toLocaleString();

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {mode === 'enabled' ? 'Comparing current vs previous period' : 'Current period only'}
            </CardDescription>
          </div>
          <Button 
            variant={mode === 'enabled' ? 'default' : 'outline'}
            size="sm"
            onClick={sdk.comparison.toggle}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {mode === 'enabled' ? 'Disable' : 'Enable'} Comparison
          </Button>
        </div>

        {change && (
          <div className="mt-3 flex items-center gap-3">
            <Badge 
              variant={change.isPositive ? 'default' : 'destructive'}
              className="flex items-center gap-1"
            >
              {change.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(change.value).toFixed(1)}%
            </Badge>
            <div className="text-sm text-muted-foreground">
              {metricFormat(change.primarySum)} vs {metricFormat(change.comparisonSum)}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available for selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={metricFormat}
                label={{ 
                  value: metricLabel, 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip 
                formatter={metricFormat}
                labelStyle={{ fontSize: 12 }}
              />
              <Legend 
                wrapperStyle={{ fontSize: 12 }}
              />
              <Line 
                type="monotone" 
                dataKey="current" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Current Period"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              {mode === 'enabled' && (
                <Line 
                  type="monotone" 
                  dataKey="previous" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Previous Period"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          {sdk.dateRange.current.start && sdk.dateRange.current.end ? (
            <>
              {format(sdk.dateRange.current.start, 'MMM dd, yyyy')} - {format(sdk.dateRange.current.end, 'MMM dd, yyyy')}
            </>
          ) : (
            'All time data'
          )}
          {' • '}
          {chartData.length} data points
        </div>
      </CardContent>
    </Card>
  );
}
