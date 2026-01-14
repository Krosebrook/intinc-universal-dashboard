/**
 * Example Widget Index
 * 
 * Register and export all example widgets
 */

export { InteractiveSalesChart } from './InteractiveSalesChart';
export { ComparisonTimeline } from './ComparisonTimeline';

// Widget Registry for code-splitting
import { widgetLoader } from '@/lib/performance/widget-code-splitting';

/**
 * Register example widgets for lazy loading
 */
export function registerExampleWidgets() {
  widgetLoader.registerWidget({
    id: 'interactive-sales-chart',
    name: 'InteractiveSalesChart',
    version: '1.0.0',
    componentPath: '@/widgets/examples/InteractiveSalesChart',
    dependencies: ['recharts'],
    size: 45000
  });

  widgetLoader.registerWidget({
    id: 'comparison-timeline',
    name: 'ComparisonTimeline',
    version: '1.0.0',
    componentPath: '@/widgets/examples/ComparisonTimeline',
    dependencies: ['recharts', 'date-fns'],
    size: 52000
  });
}

/**
 * Example usage in your dashboard:
 * 
 * ```typescript
 * import { LazyWidget } from '@/lib/performance/widget-code-splitting';
 * import { registerExampleWidgets } from '@/widgets/examples';
 * 
 * // Register widgets on app initialization
 * registerExampleWidgets();
 * 
 * // Use lazy-loaded widgets
 * function Dashboard() {
 *   return (
 *     <div className="grid grid-cols-2 gap-4">
 *       <LazyWidget
 *         widgetId="interactive-sales-chart"
 *         props={{
 *           id: 'sales-1',
 *           data: salesData
 *         }}
 *       />
 *       <LazyWidget
 *         widgetId="comparison-timeline"
 *         props={{
 *           id: 'timeline-1',
 *           data: timelineData,
 *           metric: 'revenue'
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
