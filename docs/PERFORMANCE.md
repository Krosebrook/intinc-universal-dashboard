# Performance Optimization Guide

This guide covers performance optimization strategies, best practices, and tools for the Intinc Universal Dashboard.

## Table of Contents

- [Overview](#overview)
- [Code Splitting](#code-splitting)
- [Lazy Loading](#lazy-loading)
- [Memoization](#memoization)
- [Bundle Optimization](#bundle-optimization)
- [Image Optimization](#image-optimization)
- [Widget Performance](#widget-performance)
- [Network Optimization](#network-optimization)
- [Monitoring Tools](#monitoring-tools)
- [Performance Checklist](#performance-checklist)

## Overview

The Intinc Universal Dashboard implements several performance optimization strategies:

- **Code Splitting**: Reduces initial bundle size
- **Lazy Loading**: Loads components on demand
- **Memoization**: Prevents unnecessary re-renders
- **Virtualization**: Efficiently renders large lists
- **Caching**: Reduces redundant API calls
- **Progressive Enhancement**: Core features load first

## Code Splitting

### Automatic Code Splitting

Vite automatically splits vendor libraries and application code:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            'framer-motion',
          ],
          'chart-vendor': ['recharts'],
        },
      },
    },
  },
});
```

### Route-Based Code Splitting

Split code by route for optimal loading:

```typescript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const PRDGenerator = lazy(() => import('@/features/prd-generator/components/PRDGenerator'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/prd-generator" element={<PRDGenerator />} />
      </Routes>
    </Suspense>
  );
}
```

### Component-Based Code Splitting

Split heavy components:

```typescript
import { lazy, Suspense } from 'react';

// Heavy chart component
const HeavyChartWidget = lazy(() => import('@/widgets/HeavyChartWidget'));

function Dashboard() {
  return (
    <Suspense fallback={<WidgetSkeleton />}>
      <HeavyChartWidget data={data} />
    </Suspense>
  );
}
```

## Lazy Loading

### When to Use Lazy Loading

✅ **Use lazy loading for:**
- Heavy chart libraries
- Modal dialogs
- Feature-specific components
- Third-party integrations
- Large data tables

❌ **Don't lazy load:**
- Critical above-the-fold content
- Small components (< 50KB)
- Frequently used components
- Error boundaries

### Lazy Loading Widgets

```typescript
// src/lib/performance/widget-code-splitting.tsx
import { lazy, Suspense } from 'react';

const widgetLoaders = {
  bar: lazy(() => import('@/widgets/BarChartWidget')),
  line: lazy(() => import('@/widgets/LineChartWidget')),
  pie: lazy(() => import('@/widgets/PieChartWidget')),
  // ... more widgets
};

export function LazyWidget({ type, ...props }: WidgetProps) {
  const WidgetComponent = widgetLoaders[type];

  return (
    <Suspense fallback={<WidgetSkeleton />}>
      <WidgetComponent {...props} />
    </Suspense>
  );
}
```

### Preloading Components

Preload components before they're needed:

```typescript
import { lazy } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  // Preload on hover
  const handleMouseEnter = () => {
    import('./HeavyComponent');
  };

  return (
    <button onMouseEnter={handleMouseEnter}>
      Open Heavy Feature
    </button>
  );
}
```

### Progressive Loading

Load features progressively:

```typescript
function Dashboard() {
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);

  useEffect(() => {
    // Load advanced features after initial render
    const timer = setTimeout(() => {
      setShowAdvancedFeatures(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {/* Core features load immediately */}
      <CoreDashboard />

      {/* Advanced features load after delay */}
      {showAdvancedFeatures && (
        <Suspense fallback={null}>
          <AdvancedFeatures />
        </Suspense>
      )}
    </div>
  );
}
```

## Memoization

### React.memo for Component Memoization

Prevent unnecessary re-renders:

```typescript
import { memo } from 'react';

// Widget only re-renders if props change
export const WidgetCard = memo(({ widget, onEdit, onDelete }: WidgetCardProps) => {
  return (
    <Card>
      <CardHeader>{widget.title}</CardHeader>
      <CardContent>
        <WidgetRenderer config={widget} />
      </CardContent>
    </Card>
  );
});

// Custom comparison function
export const WidgetCard = memo(
  WidgetCardComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.widget.id === nextProps.widget.id &&
      prevProps.widget.updatedAt === nextProps.widget.updatedAt
    );
  }
);
```

### useMemo for Expensive Computations

Cache computed values:

```typescript
import { useMemo } from 'react';

function DashboardAnalytics({ data }: Props) {
  // Expensive calculation - only runs when data changes
  const aggregatedData = useMemo(() => {
    return data.reduce((acc, item) => {
      // Complex aggregation logic
      return acc;
    }, {});
  }, [data]);

  return <ChartWidget data={aggregatedData} />;
}
```

### useCallback for Function Memoization

Prevent function recreation:

```typescript
import { useCallback } from 'react';

function Dashboard() {
  const [widgets, setWidgets] = useState([]);

  // Function only recreated if setWidgets changes
  const handleWidgetUpdate = useCallback((id: string, updates: Partial<Widget>) => {
    setWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, ...updates } : w))
    );
  }, []);

  return (
    <WidgetGrid
      widgets={widgets}
      onUpdate={handleWidgetUpdate} // Stable reference
    />
  );
}
```

### When NOT to Memoize

```typescript
// ❌ Don't memoize simple operations
const total = useMemo(() => a + b, [a, b]); // Overkill

// ✅ Good: Just calculate directly
const total = a + b;

// ❌ Don't memoize if dependencies change frequently
const filtered = useMemo(
  () => items.filter(i => i.includes(searchQuery)),
  [items, searchQuery] // Changes every keystroke
);

// ✅ Better: Use debouncing instead
const debouncedSearch = useDebounce(searchQuery, 300);
const filtered = useMemo(
  () => items.filter(i => i.includes(debouncedSearch)),
  [items, debouncedSearch]
);
```

## Bundle Optimization

### Analyze Bundle Size

```bash
# Build and analyze
npm run build

# View bundle size report
ls -lh dist/assets/

# Use bundle analyzer (if configured)
npx vite-bundle-analyzer
```

### Tree Shaking

Import only what you need:

```typescript
// ❌ Bad: Imports entire library
import _ from 'lodash';
const result = _.debounce(fn, 300);

// ✅ Good: Import specific function
import { debounce } from 'lodash-es';
const result = debounce(fn, 300);

// ✅ Even better: Use native alternative
const result = useDebouncedCallback(fn, 300);
```

### Remove Unused Dependencies

```bash
# Analyze unused dependencies
npx depcheck

# Remove unused packages
npm uninstall unused-package
```

### Minification

Vite automatically minifies production builds:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
});
```

## Image Optimization

### Use WebP Format

```typescript
// Provide multiple formats
function OptimizedImage({ src, alt }: Props) {
  return (
    <picture>
      <source srcSet={`${src}.webp`} type="image/webp" />
      <source srcSet={`${src}.jpg`} type="image/jpeg" />
      <img src={`${src}.jpg`} alt={alt} loading="lazy" />
    </picture>
  );
}
```

### Lazy Load Images

```typescript
function ImageGallery({ images }: Props) {
  return (
    <div>
      {images.map(img => (
        <img
          key={img.id}
          src={img.url}
          alt={img.alt}
          loading="lazy" // Native lazy loading
          decoding="async"
        />
      ))}
    </div>
  );
}
```

### Responsive Images

```typescript
function ResponsiveImage({ src, alt }: Props) {
  return (
    <img
      srcSet={`
        ${src}-small.jpg 400w,
        ${src}-medium.jpg 800w,
        ${src}-large.jpg 1200w
      `}
      sizes="(max-width: 400px) 400px,
             (max-width: 800px) 800px,
             1200px"
      src={`${src}-medium.jpg`}
      alt={alt}
      loading="lazy"
    />
  );
}
```

### Image Compression

```bash
# Compress images before committing
npm install -g imagemin-cli

imagemin public/images/* --out-dir=public/images/compressed
```

## Widget Performance

### Virtualization for Large Lists

```typescript
import { VirtualizedList } from '@/components/ui/virtualized-list';

function WidgetGrid({ widgets }: Props) {
  if (widgets.length > 50) {
    // Use virtualization for large lists
    return (
      <VirtualizedList
        items={widgets}
        itemHeight={300}
        renderItem={(widget) => <WidgetCard key={widget.id} widget={widget} />}
      />
    );
  }

  // Regular rendering for small lists
  return widgets.map(widget => (
    <WidgetCard key={widget.id} widget={widget} />
  ));
}
```

### Debounce Widget Updates

```typescript
import { debounce } from 'lodash-es';
import { useMemo } from 'react';

function WidgetEditor({ widget, onSave }: Props) {
  // Debounce saves to reduce API calls
  const debouncedSave = useMemo(
    () => debounce(onSave, 1000),
    [onSave]
  );

  const handleChange = (updates: Partial<Widget>) => {
    debouncedSave({ ...widget, ...updates });
  };

  return <WidgetForm onChange={handleChange} />;
}
```

### Limit Data Points

```typescript
function ChartWidget({ data }: Props) {
  const MAX_DATA_POINTS = 1000;

  // Downsample large datasets
  const chartData = useMemo(() => {
    if (data.length <= MAX_DATA_POINTS) {
      return data;
    }

    // Sample every nth point
    const step = Math.ceil(data.length / MAX_DATA_POINTS);
    return data.filter((_, index) => index % step === 0);
  }, [data]);

  return <LineChart data={chartData} />;
}
```

### Widget Performance Profiler

```typescript
import { useEffect } from 'react';
import { widgetProfiler } from '@/lib/performance/widget-profiler';

function PerformantWidget({ id, config }: Props) {
  useEffect(() => {
    widgetProfiler.startProfiling(id, 'render');

    return () => {
      widgetProfiler.endProfiling(id, 'render');
    };
  }, [id]);

  return <WidgetRenderer config={config} />;
}
```

## Network Optimization

### Request Batching

```typescript
// Batch multiple requests
async function fetchDashboardData(dashboardId: string) {
  const [dashboard, widgets, comments] = await Promise.all([
    fetchDashboard(dashboardId),
    fetchWidgets(dashboardId),
    fetchComments(dashboardId),
  ]);

  return { dashboard, widgets, comments };
}
```

### Request Caching

```typescript
const cache = new Map();

async function fetchWithCache(key: string, fetcher: () => Promise<any>) {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const data = await fetcher();
  cache.set(key, data);

  // Auto-expire after 5 minutes
  setTimeout(() => cache.delete(key), 5 * 60 * 1000);

  return data;
}

// Usage
const dashboard = await fetchWithCache(
  `dashboard-${id}`,
  () => fetchDashboard(id)
);
```

### Request Deduplication

```typescript
const pendingRequests = new Map();

async function fetchDeduplicated(key: string, fetcher: () => Promise<any>) {
  // Return existing pending request
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // Create new request
  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}
```

### Pagination

```typescript
function DashboardList() {
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, loading } = useDashboards({
    page,
    perPage,
  });

  return (
    <>
      <DashboardGrid dashboards={data} />
      <Pagination
        currentPage={page}
        onPageChange={setPage}
        hasMore={data.length === perPage}
      />
    </>
  );
}
```

### Infinite Scrolling

```typescript
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';

function DashboardList() {
  const {
    data,
    loading,
    hasMore,
    loadMore,
  } = useInfiniteScroll({
    fetcher: (page) => fetchDashboards({ page }),
    perPage: 20,
  });

  const { ref } = useIntersectionObserver({
    onIntersect: loadMore,
    enabled: hasMore && !loading,
  });

  return (
    <div>
      {data.map(dashboard => (
        <DashboardCard key={dashboard.id} dashboard={dashboard} />
      ))}
      {hasMore && <div ref={ref}>Loading...</div>}
    </div>
  );
}
```

## Monitoring Tools

### Built-in Performance Profiler

Access via Dev Tools panel:

```typescript
// Enable in development
function App() {
  const [showDevTools, setShowDevTools] = useState(
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_MODE
  );

  return (
    <>
      <YourApp />
      {showDevTools && <PerformanceProfiler />}
    </>
  );
}
```

### Chrome DevTools

1. **Performance Tab:**
   - Record user interactions
   - Identify slow components
   - Find memory leaks

2. **Network Tab:**
   - Monitor request sizes
   - Check caching
   - Identify slow requests

3. **Lighthouse:**
   ```bash
   # Run Lighthouse audit
   npm run build
   npm run preview
   # Open Chrome DevTools → Lighthouse
   ```

### React DevTools Profiler

1. Install React DevTools extension
2. Open Profiler tab
3. Record interaction
4. Analyze component render times

### Sentry Performance Monitoring

```typescript
import * as Sentry from '@sentry/react';

// Automatic transaction tracking
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 0.1,
});

// Manual performance tracking
const transaction = Sentry.startTransaction({
  name: 'Dashboard Load',
});

try {
  await loadDashboard();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
} finally {
  transaction.finish();
}
```

## Performance Checklist

### Initial Load

- [ ] Bundle size < 500KB (gzipped)
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Time to Interactive (TTI) < 3.5s
- [ ] Critical resources loaded first
- [ ] Non-critical resources deferred

### Runtime Performance

- [ ] 60 FPS during animations
- [ ] No unnecessary re-renders
- [ ] Efficient list virtualization (> 100 items)
- [ ] Debounced user inputs
- [ ] Request caching implemented
- [ ] Memory leaks fixed

### Code Quality

- [ ] Heavy components code-split
- [ ] Images optimized and lazy-loaded
- [ ] Unused dependencies removed
- [ ] Console logs removed in production
- [ ] Source maps generated
- [ ] Error boundaries in place

### Widget Performance

- [ ] Widget data limited (< 1000 points)
- [ ] Widget updates debounced
- [ ] Large widget grids virtualized
- [ ] Widget errors isolated
- [ ] Performance profiling enabled

### Network

- [ ] API requests batched where possible
- [ ] Request deduplication implemented
- [ ] Appropriate caching headers
- [ ] Pagination/infinite scroll for large lists
- [ ] Rate limiting respected

## Performance Budget

Target metrics for the Intinc Dashboard:

| Metric | Target | Maximum |
|--------|--------|---------|
| Bundle Size (JS) | 300KB | 500KB |
| Bundle Size (CSS) | 50KB | 100KB |
| First Contentful Paint | 1.5s | 2.5s |
| Largest Contentful Paint | 2.0s | 3.5s |
| Time to Interactive | 3.0s | 5.0s |
| API Response Time | 200ms | 500ms |
| Widget Render Time | 100ms | 300ms |

## Related Documentation

- [architecture.md](./architecture.md) - Application architecture
- [WIDGET_SDK.md](./WIDGET_SDK.md) - Widget development
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Coding standards
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production optimization
- [LOGGING.md](./LOGGING.md) - Performance monitoring
