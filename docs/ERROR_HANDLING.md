# Error Handling Guide

This guide covers error handling patterns, strategies, and best practices implemented in the Intinc Universal Dashboard.

## Table of Contents

- [Overview](#overview)
- [Error Boundaries](#error-boundaries)
- [Async Error Handling](#async-error-handling)
- [Error Logging](#error-logging)
- [User-Facing Error Messages](#user-facing-error-messages)
- [Common Error Scenarios](#common-error-scenarios)
- [Best Practices](#best-practices)

## Overview

The Intinc Universal Dashboard implements a defense-in-depth approach to error handling:

1. **Error Boundaries** - React components that catch and handle render errors
2. **Try-Catch Blocks** - For asynchronous operations and external API calls
3. **Centralized Logging** - Winston logger and Sentry integration
4. **User Feedback** - Toast notifications and error UI components

## Error Boundaries

### Purpose

Error boundaries prevent the entire application from crashing when a component error occurs. They provide graceful fallback UI and log errors for debugging.

### Available Error Boundaries

#### 1. Global Error Boundary (`ErrorBoundary`)

Located in `src/components/error/ErrorBoundary.tsx`

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

**Features:**
- Catches all React component errors
- Displays user-friendly error message
- Provides "Reload" button
- Logs errors to Sentry
- Shows error details in development mode

#### 2. Dashboard Error Boundary (`DashboardErrorBoundary`)

Located in `src/components/error/DashboardErrorBoundary.tsx`

**Usage:**
```tsx
import { DashboardErrorBoundary } from '@/components/error/DashboardErrorBoundary';

function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  );
}
```

**Features:**
- Dashboard-specific error handling
- Preserves navigation functionality
- Allows retry without full page reload
- Provides context about dashboard state

#### 3. Widget Error Boundary (`WidgetErrorBoundary`)

Located in `src/components/error/WidgetErrorBoundary.tsx`

**Usage:**
```tsx
import { WidgetErrorBoundary } from '@/components/error/WidgetErrorBoundary';

function WidgetGrid() {
  return widgets.map(widget => (
    <WidgetErrorBoundary key={widget.id} widgetId={widget.id}>
      <Widget config={widget} />
    </WidgetErrorBoundary>
  ));
}
```

**Features:**
- Isolates widget errors (one widget failure doesn't affect others)
- Widget-specific fallback UI
- Retry mechanism per widget
- Detailed error information for debugging

### Creating Custom Error Boundaries

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class CustomErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Component Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

## Async Error Handling

### API Calls

Always wrap API calls in try-catch blocks:

```typescript
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

async function fetchDashboardData(id: string) {
  try {
    const response = await api.getDashboard(id);
    return response.data;
  } catch (error) {
    // Log the error
    logger.error('Failed to fetch dashboard', {
      dashboardId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Notify the user
    toast.error('Failed to load dashboard. Please try again.');

    // Re-throw if needed for upstream handling
    throw error;
  }
}
```

### Database Operations

```typescript
import { blink } from '@/lib/blink';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

async function saveDashboard(data: Dashboard) {
  try {
    const result = await blink.database
      .insert('dashboards')
      .values(data)
      .execute();

    toast.success('Dashboard saved successfully');
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('Database operation failed', {
      operation: 'insert',
      table: 'dashboards',
      error: errorMessage,
    });

    // Provide user-friendly message
    if (errorMessage.includes('unique constraint')) {
      toast.error('A dashboard with this name already exists');
    } else if (errorMessage.includes('permission')) {
      toast.error('You do not have permission to save this dashboard');
    } else {
      toast.error('Failed to save dashboard. Please try again.');
    }

    throw error;
  }
}
```

### Async Hook Pattern

```typescript
import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

function useAsyncData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const result = await fetcher();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          setError(error);
          logger.error('Async hook error', { error: error.message });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [fetcher]);

  return { data, error, loading };
}
```

## Error Logging

### Winston Logger

The application uses Winston for structured logging. See [LOGGING.md](./LOGGING.md) for detailed configuration.

**Basic Usage:**
```typescript
import { logger } from '@/lib/logger';

// Error with context
logger.error('Operation failed', {
  userId: user.id,
  operation: 'dashboard-create',
  error: error.message,
});

// Warning
logger.warn('Rate limit approaching', {
  userId: user.id,
  requestCount: count,
});

// Info
logger.info('Dashboard created', {
  dashboardId: dashboard.id,
  userId: user.id,
});
```

### Sentry Integration

Sentry captures unhandled errors and provides detailed error tracking.

**Configuration:**
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Manual Error Capture:**
```typescript
import * as Sentry from '@sentry/react';

try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'dashboard',
      operation: 'widget-render',
    },
    extra: {
      widgetId: widget.id,
      widgetType: widget.type,
    },
  });
}
```

## User-Facing Error Messages

### Toast Notifications

Use `sonner` for non-blocking notifications:

```typescript
import { toast } from 'sonner';

// Success
toast.success('Dashboard saved successfully');

// Error
toast.error('Failed to save dashboard');

// Warning
toast.warning('This action cannot be undone');

// Info
toast.info('Processing your request...');

// With custom duration
toast.error('Connection lost', { duration: 5000 });

// With action
toast.error('Failed to save', {
  action: {
    label: 'Retry',
    onClick: () => retryOperation(),
  },
});
```

### Error Messages Best Practices

1. **Be Specific But User-Friendly**
   ```typescript
   // ❌ Bad
   toast.error('Error 500');

   // ✅ Good
   toast.error('Failed to load dashboard. Please refresh the page.');
   ```

2. **Provide Actionable Guidance**
   ```typescript
   // ❌ Bad
   toast.error('Invalid input');

   // ✅ Good
   toast.error('Dashboard name must be between 3 and 50 characters');
   ```

3. **Don't Expose Technical Details to Users**
   ```typescript
   // ❌ Bad
   toast.error(`Database error: ${error.stack}`);

   // ✅ Good
   toast.error('Unable to save changes. Please try again.');
   logger.error('Database error', { stack: error.stack });
   ```

## Common Error Scenarios

### Network Errors

```typescript
async function handleNetworkRequest() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      toast.error('Network connection failed. Please check your internet.');
    } else {
      toast.error('Request failed. Please try again.');
    }
    logger.error('Network request failed', { error, url });
    throw error;
  }
}
```

### Validation Errors

```typescript
import { z } from 'zod';
import { toast } from 'sonner';

const DashboardSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500),
});

function validateDashboard(data: unknown) {
  try {
    return DashboardSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message).join(', ');
      toast.error(`Validation failed: ${messages}`);
    } else {
      toast.error('Invalid dashboard data');
    }
    throw error;
  }
}
```

### Permission Errors

```typescript
import { useRBAC } from '@/hooks/use-rbac';
import { toast } from 'sonner';

function ProtectedAction() {
  const { hasPermission } = useRBAC();

  const handleDelete = async () => {
    if (!hasPermission('delete_dashboard')) {
      toast.error('You do not have permission to delete dashboards');
      return;
    }

    try {
      await deleteDashboard();
      toast.success('Dashboard deleted');
    } catch (error) {
      toast.error('Failed to delete dashboard');
      logger.error('Delete failed', { error });
    }
  };

  return <Button onClick={handleDelete}>Delete</Button>;
}
```

### Rate Limiting Errors

```typescript
import { rateLimiter } from '@/lib/rate-limiting';
import { toast } from 'sonner';

async function handleAIRequest() {
  if (!rateLimiter.checkLimit(userId, 'ai')) {
    toast.error('Rate limit exceeded. Please try again in a few minutes.');
    logger.warn('Rate limit hit', { userId, endpoint: 'ai' });
    return;
  }

  try {
    const result = await aiService.generate();
    return result;
  } catch (error) {
    toast.error('AI request failed. Please try again.');
    throw error;
  }
}
```

## Best Practices

### 1. Always Handle Errors

Never let errors go unhandled:
```typescript
// ❌ Bad
async function loadData() {
  const data = await fetchData(); // Unhandled rejection
  return data;
}

// ✅ Good
async function loadData() {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    logger.error('Failed to load data', { error });
    toast.error('Failed to load data');
    throw error;
  }
}
```

### 2. Use Error Boundaries for Components

```tsx
// ❌ Bad
function App() {
  return <ComplexComponent />; // Any error crashes the app
}

// ✅ Good
function App() {
  return (
    <ErrorBoundary>
      <ComplexComponent />
    </ErrorBoundary>
  );
}
```

### 3. Log Errors with Context

```typescript
// ❌ Bad
logger.error('Error');

// ✅ Good
logger.error('Dashboard save failed', {
  userId: user.id,
  dashboardId: dashboard.id,
  error: error.message,
  timestamp: new Date().toISOString(),
});
```

### 4. Provide Recovery Options

```typescript
// ❌ Bad
toast.error('Operation failed');

// ✅ Good
toast.error('Operation failed', {
  action: {
    label: 'Retry',
    onClick: () => retryOperation(),
  },
});
```

### 5. Test Error Scenarios

```typescript
describe('Dashboard Save', () => {
  it('should handle network errors gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(saveDashboard(data)).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('network')
    );
  });
});
```

### 6. Use Type Guards

```typescript
function isApiError(error: unknown): error is { message: string; code: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error
  );
}

try {
  await apiCall();
} catch (error) {
  if (isApiError(error)) {
    toast.error(`API Error ${error.code}: ${error.message}`);
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

## Related Documentation

- [LOGGING.md](./LOGGING.md) - Logging and monitoring configuration
- [TESTING.md](./TESTING.md) - Testing error scenarios
- [security.md](./security.md) - Security-related error handling
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common errors and solutions
