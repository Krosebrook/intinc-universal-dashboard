# Widget SDK Documentation

Complete guide for building custom widgets in the Intinc Universal Dashboard.

## 📋 Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Widget Lifecycle](#widget-lifecycle)
- [SDK Hooks](#sdk-hooks)
- [Cross-Widget Communication](#cross-widget-communication)
- [Performance Optimization](#performance-optimization)
- [Security Guidelines](#security-guidelines)
- [Examples](#examples)

## 🌟 Overview

The Widget SDK (Phase 6) enables developers to create custom, interactive widgets that seamlessly integrate with the Universal Dashboard ecosystem. Widgets can:

- ✅ Access global dashboard state
- ✅ Communicate with other widgets
- ✅ Respond to filters and date ranges
- ✅ Support drill-down navigation
- ✅ Enable comparison mode
- ✅ Handle user interactions
- ✅ Lazy load for optimal performance
- ✅ Execute within security boundaries

## 🚀 Getting Started

### Basic Widget Structure

```typescript
import { useWidgetSDK } from '@/hooks/use-widget-sdk';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MyWidgetProps {
  id: string;
  title: string;
  data: any[];
}

export function MyWidget({ id, title, data }: MyWidgetProps) {
  // Access Widget SDK
  const sdk = useWidgetSDK(id, {
    respondToFilters: true,
    filterMapping: { category: 'type' }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Your widget content */}
      </CardContent>
    </Card>
  );
}
```

### Widget Registration

Register your widget for code-splitting:

```typescript
import { widgetLoader } from '@/lib/performance/widget-code-splitting';

widgetLoader.registerWidget({
  id: 'my-custom-widget',
  name: 'MyWidget',
  version: '1.0.0',
  componentPath: './widgets/MyWidget',
  dependencies: ['recharts'],
  size: 45000 // bytes
});
```

## 🔄 Widget Lifecycle

### 1. Registration
Register your widget with the Widget Loader for lazy loading.

### 2. Loading
Widget is loaded on-demand or preloaded for better performance.

### 3. Initialization
Widget receives props and initializes SDK hooks.

### 4. Render
Widget renders with data and responds to state changes.

### 5. Interaction
Widget handles user interactions and broadcasts events.

### 6. Cleanup
Widget unsubscribes from events and cleans up resources.

## 🎣 SDK Hooks

### useWidgetSDK

Main hook providing access to all widget capabilities.

```typescript
const sdk = useWidgetSDK(widgetId, {
  respondToFilters: true,
  filterMapping: { 'global-field': 'widget-field' }
});

// Available APIs:
sdk.filters      // Filter management
sdk.dateRange    // Date range handling
sdk.selection    // Data selection
sdk.drillDown    // Drill-down navigation
sdk.comparison   // Comparison mode
sdk.emit         // Broadcast events
sdk.subscribe    // Listen to events
sdk.handleClick  // Click handler
```

### useFilteredData

Automatically filters widget data based on global state.

```typescript
import { useFilteredData } from '@/hooks/use-widget-sdk';

const filteredData = useFilteredData(widgetId, rawData, {
  filterMapping: { category: 'type' },
  dateField: 'timestamp'
});
```

### useComparisonData

Splits data for comparison mode.

```typescript
import { useComparisonData } from '@/hooks/use-widget-sdk';

const { primary, comparison, mode } = useComparisonData(
  widgetId,
  data,
  'date'
);

if (mode === 'enabled') {
  // Render comparison view
}
```

### useWidgetPerformance

Track widget performance metrics.

```typescript
import { useWidgetPerformance } from '@/components/dashboard/WidgetPerformanceProfiler';

useWidgetPerformance(widgetId, 'My Widget', data.length);
```

### useWidgetLocalState

Persist widget-specific settings.

```typescript
import { useWidgetLocalState } from '@/hooks/use-widget-sdk';

const [settings, setSettings] = useWidgetLocalState(
  widgetId,
  'chart-type',
  'bar'
);
```

## 🔗 Cross-Widget Communication

### Broadcasting Events

```typescript
// Emit a filter event
sdk.emit('filter', {
  field: 'category',
  value: 'electronics'
});

// Emit a selection event
sdk.emit('select', {
  dataPoint: selectedItem
});

// Emit a custom event
sdk.emit('click', {
  action: 'navigate',
  target: '/details/123'
});
```

### Subscribing to Events

```typescript
useEffect(() => {
  const unsubscribe = sdk.subscribe((event) => {
    console.log('Event received:', event);
    
    if (event.type === 'filter') {
      // Handle filter from another widget
      applyFilter(event.payload);
    }
  });

  return unsubscribe; // Cleanup on unmount
}, [sdk]);
```

## 🎯 Filter Management

### Creating Filters

```typescript
// Create a filter
sdk.filters.create('category', 'electronics', 'equals');

// Access active filters
const activeFilters = sdk.filters.active;

// Clear widget's filters
sdk.filters.clear();
```

### Responding to Global Filters

Configure automatic filter response:

```typescript
const sdk = useWidgetSDK(widgetId, {
  respondToFilters: true,
  filterMapping: {
    'global-category': 'localCategory',
    'global-region': 'localRegion'
  }
});
```

## 📅 Date Range Handling

```typescript
// Get current date range
const currentRange = sdk.dateRange.current;

// Set date range
sdk.dateRange.set({
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
});

// Clear date range
sdk.dateRange.clear();
```

## 🎯 Selection API

```typescript
// Select data points
sdk.selection.select([item1, item2]);

// Check if widget has selection
if (sdk.selection.isSelected) {
  const selected = sdk.selection.data;
}

// Clear selection
sdk.selection.clear();
```

## 🔍 Drill-Down Navigation

```typescript
// Drill down
sdk.drillDown.down(1, {
  label: 'Electronics',
  value: 'electronics'
});

// Drill up
sdk.drillDown.up();

// Reset to top level
sdk.drillDown.reset();

// Access current path
const path = sdk.drillDown.path;
if (path) {
  console.log('Breadcrumbs:', path.breadcrumbs);
}
```

## 📊 Comparison Mode

```typescript
// Check if comparison mode is enabled
if (sdk.comparison.enabled) {
  // Access periods
  const primary = sdk.comparison.primaryPeriod;
  const comparison = sdk.comparison.comparisonPeriod;
}

// Toggle comparison mode
sdk.comparison.toggle();

// Set comparison periods
sdk.comparison.setPeriods(
  { start: new Date('2024-01-01'), end: new Date('2024-03-31') },
  { start: new Date('2023-01-01'), end: new Date('2023-03-31') }
);
```

## ⚡ Performance Optimization

### Code Splitting

Load widgets on-demand:

```typescript
import { LazyWidget } from '@/lib/performance/widget-code-splitting';

function Dashboard() {
  return (
    <LazyWidget
      widgetId="my-custom-widget"
      props={{ data: myData }}
      fallback={<LoadingSpinner />}
    />
  );
}
```

### Preloading

Preload widgets for better UX:

```typescript
import { widgetLoader, preloadWidgets } from '@/lib/performance/widget-code-splitting';

// Preload single widget
widgetLoader.preloadWidget('my-widget');

// Preload multiple widgets
preloadWidgets(['widget1', 'widget2', 'widget3']);
```

### Progressive Loading

```typescript
import { progressiveLoader } from '@/lib/performance/widget-code-splitting';

// High priority (above fold)
progressiveLoader.addHighPriority('critical-widget');

// Low priority (below fold)
progressiveLoader.addLowPriority('detail-widget');
```

### Performance Monitoring

```typescript
import { WidgetPerformanceProfiler } from '@/components/dashboard/WidgetPerformanceProfiler';

function App() {
  return (
    <>
      <YourDashboard />
      <WidgetPerformanceProfiler enabled={isDevelopment} />
    </>
  );
}
```

## 🔒 Security Guidelines

### Input Sanitization

Always sanitize user input:

```typescript
import { sanitizeWidgetConfig } from '@/lib/security/widget-security';

const safeConfig = sanitizeWidgetConfig(userConfig);
```

### Data Validation

Validate data before rendering:

```typescript
import { validateWidgetData } from '@/lib/security/widget-security';

const validation = validateWidgetData(data, {
  requiredFields: ['name', 'value'],
  maxItems: 10000,
  allowedTypes: {
    name: 'string',
    value: 'number',
    date: 'date'
  }
});

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### Rate Limiting

Prevent excessive operations:

```typescript
import { WidgetRateLimiter } from '@/lib/security/widget-security';

const rateLimiter = new WidgetRateLimiter(100, 60000); // 100 ops per minute

if (rateLimiter.check(widgetId)) {
  // Perform operation
} else {
  const remaining = rateLimiter.getRemaining(widgetId);
  console.warn(`Rate limit exceeded. ${remaining} requests remaining`);
}
```

### Memory Limits

Check data size:

```typescript
import { checkMemoryLimit } from '@/lib/security/widget-security';

const memCheck = checkMemoryLimit(largeData, 5 * 1024 * 1024); // 5MB limit

if (!memCheck.withinLimit) {
  console.warn(`Data too large: ${memCheck.sizeBytes} bytes`);
}
```

### Sandbox Execution

Execute custom code safely:

```typescript
import { createWidgetSandbox } from '@/lib/security/widget-security';

const sandbox = createWidgetSandbox();

// Validate code first
const validation = sandbox.validateCode(userCode);
if (!validation.valid) {
  console.error('Unsafe code:', validation.errors);
  return;
}

// Execute safely
try {
  const result = sandbox.executeTransform(userCode, data);
} catch (error) {
  console.error('Execution error:', error);
}
```

**⚠️ Security Note:** The sandbox provides basic protection but is not foolproof. For production environments with untrusted user code, consider:
- Using Web Workers for complete isolation
- Implementing stricter code validation
- Running in separate iframes with restricted permissions
- Using server-side sandboxing solutions like vm2 (Node.js)

## 📚 Complete Examples

### Example 1: Interactive Bar Chart

```typescript
import { useWidgetSDK, useFilteredData } from '@/hooks/use-widget-sdk';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SalesChartProps {
  id: string;
  data: Array<{ category: string; sales: number; date: string }>;
}

export function SalesChart({ id, data }: SalesChartProps) {
  const sdk = useWidgetSDK(id, {
    respondToFilters: true,
    filterMapping: { category: 'category' }
  });

  // Automatically filtered data
  const filteredData = useFilteredData(id, data, {
    dateField: 'date'
  });

  const handleBarClick = (data: any) => {
    // Create filter on click
    sdk.filters.create('category', data.category, 'equals');
    
    // Broadcast event to other widgets
    sdk.emit('click', {
      field: 'category',
      value: data.category
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
        {sdk.filters.active.length > 0 && (
          <div className="flex gap-2 mt-2">
            {sdk.filters.active.map(filter => (
              <Badge key={filter.id} variant="secondary">
                {filter.label}
                <button onClick={() => sdk.filters.remove(filter.id)}>×</button>
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar 
              dataKey="sales" 
              fill="#3b82f6"
              onClick={handleBarClick}
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### Example 2: Comparison Widget

```typescript
import { useWidgetSDK, useComparisonData } from '@/hooks/use-widget-sdk';
import { LineChart, Line, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts';

interface MetricsComparisonProps {
  id: string;
  data: Array<{ date: string; revenue: number }>;
}

export function MetricsComparison({ id, data }: MetricsComparisonProps) {
  const sdk = useWidgetSDK(id);
  const { primary, comparison, mode } = useComparisonData(id, data, 'date');

  if (mode === 'disabled') {
    return <div>Enable comparison mode to see trends</div>;
  }

  // Combine datasets for visualization
  const chartData = primary.map((item, idx) => ({
    date: item.date,
    current: item.revenue,
    previous: comparison[idx]?.revenue || 0
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Comparison</CardTitle>
        <Button onClick={sdk.comparison.toggle}>
          {mode === 'enabled' ? 'Disable' : 'Enable'} Comparison
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Legend />
            <Line type="monotone" dataKey="current" stroke="#3b82f6" name="Current Period" />
            <Line type="monotone" dataKey="previous" stroke="#94a3b8" name="Previous Period" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### Example 3: Drill-Down Widget

```typescript
import { useWidgetSDK } from '@/hooks/use-widget-sdk';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface DrillDownTableProps {
  id: string;
  data: any[];
  levels: Array<{ field: string; label: string }>;
}

export function DrillDownTable({ id, data, levels }: DrillDownTableProps) {
  const sdk = useWidgetSDK(id);
  const currentLevel = sdk.drillDown.path?.level || 0;
  const currentField = levels[currentLevel].field;

  // Group data by current level
  const grouped = data.reduce((acc, item) => {
    const key = item[currentField];
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const handleDrillDown = (value: string) => {
    if (currentLevel < levels.length - 1) {
      sdk.drillDown.down(currentLevel + 1, {
        label: value,
        value: value
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {sdk.drillDown.path?.breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => {
                for (let i = 0; i < sdk.drillDown.path!.breadcrumbs.length - idx; i++) {
                  sdk.drillDown.up();
                }
              }}>
                {crumb.label}
              </Button>
              <ChevronRight className="w-4 h-4" />
            </div>
          ))}
          <span className="font-medium">{levels[currentLevel].label}</span>
        </div>
      </CardHeader>
      <CardContent>
        <table className="w-full">
          <thead>
            <tr>
              <th>{levels[currentLevel].label}</th>
              <th>Count</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([key, items]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{(items as any[]).length}</td>
                <td>
                  {currentLevel < levels.length - 1 && (
                    <Button size="sm" onClick={() => handleDrillDown(key)}>
                      Drill Down
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
```

## 🎓 Best Practices

1. **Always use SDK hooks** instead of direct state manipulation
2. **Sanitize user input** before rendering or storing
3. **Validate data schemas** to prevent runtime errors
4. **Track performance** during development
5. **Implement error boundaries** for graceful failures
6. **Use lazy loading** for large widgets
7. **Respect rate limits** for expensive operations
8. **Clean up subscriptions** in useEffect cleanup
9. **Test cross-widget communication** thoroughly
10. **Document custom widgets** with clear examples

## 🐛 Troubleshooting

### Widget Not Loading
- Check widget registration in manifest
- Verify component path is correct
- Check browser console for import errors

### Filters Not Working
- Ensure `respondToFilters: true` is set
- Verify `filterMapping` matches field names
- Check that data contains mapped fields

### Performance Issues
- Enable Performance Profiler
- Check render count and times
- Consider data pagination for large datasets
- Use React.memo for expensive components

### Cross-Widget Communication Failing
- Verify both widgets use same SDK instance
- Check that events are being emitted correctly
- Ensure subscription cleanup is working

## 📞 Support

For SDK support, refer to:
- [API Documentation](./API.md)
- [Architecture Guide](./architecture.md)
- [Security Guidelines](./security.md)

---

**Made with ❤️ for the Intinc Dashboard Platform**
