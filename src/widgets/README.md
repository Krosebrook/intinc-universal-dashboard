# Custom Widgets

This directory contains custom widget implementations for the Intinc Universal Dashboard.

## Directory Structure

```
src/widgets/
├── examples/          # Example widget implementations
│   ├── InteractiveSalesChart.tsx
│   ├── ComparisonTimeline.tsx
│   └── index.ts
└── README.md         # This file
```

## Creating Custom Widgets

### 1. Basic Widget Structure

Every widget should:
- Use the Widget SDK hooks (`useWidgetSDK`, `useFilteredData`, etc.)
- Track performance with `useWidgetPerformance`
- Follow the established UI patterns (Card, CardHeader, CardContent)
- Handle loading and error states gracefully

### 2. Example Template

```typescript
import { useWidgetSDK, useWidgetPerformance } from '@/hooks/use-widget-sdk';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MyWidgetProps {
  id: string;
  title: string;
  data: any[];
}

export function MyWidget({ id, title, data }: MyWidgetProps) {
  // Initialize SDK
  const sdk = useWidgetSDK(id, {
    respondToFilters: true
  });

  // Track performance
  useWidgetPerformance(id, 'My Widget', data.length);

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

### 3. Register Your Widget

```typescript
import { widgetLoader } from '@/lib/performance/widget-code-splitting';

widgetLoader.registerWidget({
  id: 'my-widget',
  name: 'MyWidget',
  version: '1.0.0',
  componentPath: '@/widgets/MyWidget',
  dependencies: [],
  size: 30000
});
```

## Example Widgets

### InteractiveSalesChart
A bar chart widget demonstrating:
- Click interactions to create filters
- Global filter response
- Cross-widget communication
- Visual feedback for selected items

### ComparisonTimeline
A line chart widget demonstrating:
- Comparison mode support
- Date range handling
- Metric calculations and trend indicators
- Period-over-period visualization

## Widget SDK Features

### Cross-Widget Communication
```typescript
// Broadcast event
sdk.emit('filter', { field: 'category', value: 'electronics' });

// Subscribe to events
useEffect(() => {
  const unsubscribe = sdk.subscribe((event) => {
    if (event.type === 'filter') {
      // Handle filter from another widget
    }
  });
  return unsubscribe;
}, [sdk]);
```

### Filter Management
```typescript
// Create filter
sdk.filters.create('category', 'electronics', 'equals');

// Clear filters
sdk.filters.clear();

// Access active filters
const activeFilters = sdk.filters.active;
```

### Date Range
```typescript
// Set date range
sdk.dateRange.set({
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
});

// Clear date range
sdk.dateRange.clear();
```

### Selection
```typescript
// Select items
sdk.selection.select([item1, item2]);

// Check selection
if (sdk.selection.isSelected) {
  const selected = sdk.selection.data;
}
```

### Drill-Down
```typescript
// Drill down
sdk.drillDown.down(1, { label: 'Q1', value: 'q1' });

// Drill up
sdk.drillDown.up();

// Reset
sdk.drillDown.reset();
```

### Comparison Mode
```typescript
// Toggle comparison
sdk.comparison.toggle();

// Set periods
sdk.comparison.setPeriods(primaryPeriod, comparisonPeriod);
```

## Best Practices

1. **Always sanitize user input**
   ```typescript
   import { sanitizeWidgetConfig } from '@/lib/security/widget-security';
   const safe = sanitizeWidgetConfig(userInput);
   ```

2. **Validate data schemas**
   ```typescript
   import { validateWidgetData } from '@/lib/security/widget-security';
   const validation = validateWidgetData(data, schema);
   ```

3. **Track performance**
   ```typescript
   useWidgetPerformance(id, 'Widget Name', data.length);
   ```

4. **Handle loading states**
   ```typescript
   if (loading) return <Skeleton />;
   if (error) return <ErrorMessage />;
   ```

5. **Clean up subscriptions**
   ```typescript
   useEffect(() => {
     const unsubscribe = sdk.subscribe(handler);
     return unsubscribe; // Cleanup
   }, [sdk]);
   ```

6. **Use filtered data hook**
   ```typescript
   const filteredData = useFilteredData(id, rawData, {
     dateField: 'timestamp'
   });
   ```

7. **Implement comparison support**
   ```typescript
   const { primary, comparison, mode } = useComparisonData(id, data, 'date');
   ```

## Testing Widgets

Test your widgets with:
- Different data sizes (empty, small, large)
- Various filter combinations
- Date range selections
- Cross-widget interactions
- Comparison mode enabled/disabled
- Mobile and desktop viewports

## Performance Guidelines

- Keep widgets under 50KB when possible
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Debounce rapid user interactions
- Lazy load heavy dependencies

## Documentation

For complete SDK documentation, see:
- [Widget SDK Guide](../../docs/WIDGET_SDK.md)
- [API Documentation](../../docs/API.md)
- [Architecture Guide](../../docs/architecture.md)

## Support

For widget development support, contact the development team or refer to the documentation links above.
