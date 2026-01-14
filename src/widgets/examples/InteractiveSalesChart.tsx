/**
 * Example: Interactive Sales Chart Widget
 * Demonstrates filtering, cross-widget communication, and click interactions
 */

import { useWidgetSDK, useFilteredData, useWidgetPerformance } from '@/hooks/use-widget-sdk';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SalesData {
  category: string;
  sales: number;
  date: string;
  region: string;
}

interface InteractiveSalesChartProps {
  id: string;
  title?: string;
  description?: string;
  data: SalesData[];
}

export function InteractiveSalesChart({ 
  id, 
  title = 'Sales by Category',
  description = 'Click bars to filter dashboard',
  data 
}: InteractiveSalesChartProps) {
  // Initialize Widget SDK
  const sdk = useWidgetSDK(id, {
    respondToFilters: true,
    filterMapping: { 
      category: 'category',
      region: 'region' 
    }
  });

  // Track performance
  useWidgetPerformance(id, 'Interactive Sales Chart', data.length);

  // Get filtered data based on global state
  const filteredData = useFilteredData(id, data, {
    dateField: 'date',
    filterMapping: { 
      category: 'category',
      region: 'region' 
    }
  });

  // Aggregate by category
  const aggregatedData = filteredData.reduce((acc, item) => {
    const existing = acc.find(a => a.category === item.category);
    if (existing) {
      existing.sales += item.sales;
    } else {
      acc.push({ category: item.category, sales: item.sales });
    }
    return acc;
  }, [] as Array<{ category: string; sales: number }>);

  // Handle bar click - create filter
  const handleBarClick = (data: any) => {
    sdk.filters.create('category', data.category, 'equals');
    
    // Broadcast to other widgets
    sdk.emit('filter', {
      field: 'category',
      value: data.category,
      action: 'add'
    });
  };

  // Remove filter
  const handleRemoveFilter = (filterId: string) => {
    const filter = sdk.filters.active.find(f => f.id === filterId);
    sdk.removeFilter(filterId);
    
    if (filter) {
      sdk.emit('filter', {
        field: filter.field,
        value: filter.value,
        action: 'remove'
      });
    }
  };

  // Get selected category for highlighting
  const selectedCategory = sdk.filters.active.find(f => f.field === 'category')?.value;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {sdk.filters.active.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={sdk.filters.clear}
            >
              Clear All
            </Button>
          )}
        </div>
        
        {sdk.filters.active.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {sdk.filters.active.map(filter => (
              <Badge 
                key={filter.id} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                {filter.label || `${filter.field}: ${filter.value}`}
                <button 
                  onClick={() => handleRemoveFilter(filter.id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {aggregatedData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aggregatedData}>
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Sales ($)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => `$${value.toLocaleString()}`}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar 
                dataKey="sales" 
                onClick={handleBarClick}
                cursor="pointer"
                radius={[8, 8, 0, 0]}
              >
                {aggregatedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.category === selectedCategory ? '#3b82f6' : '#94a3b8'}
                    opacity={selectedCategory && entry.category !== selectedCategory ? 0.3 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        
        <div className="mt-4 text-xs text-muted-foreground">
          Showing {aggregatedData.length} categories • {filteredData.length} total records
        </div>
      </CardContent>
    </Card>
  );
}
