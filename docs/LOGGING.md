# Logging and Monitoring Guide

This guide covers logging configuration, monitoring setup, and observability practices for the Intinc Universal Dashboard.

## Table of Contents

- [Overview](#overview)
- [Winston Logger](#winston-logger)
- [Sentry Integration](#sentry-integration)
- [Audit Logging](#audit-logging)
- [Log Levels](#log-levels)
- [Structured Logging](#structured-logging)
- [Performance Monitoring](#performance-monitoring)
- [Best Practices](#best-practices)

## Overview

The Intinc Universal Dashboard uses a multi-layered logging and monitoring approach:

1. **Winston** - Structured application logging
2. **Sentry** - Error tracking and performance monitoring
3. **Audit Logging** - User action tracking and compliance
4. **Performance Profiler** - Widget and application performance metrics

## Winston Logger

### Configuration

The Winston logger is configured in `src/lib/logger.ts`:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: import.meta.env.DEV ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'intinc-dashboard',
    environment: import.meta.env.MODE,
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // File transport for production
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});
```

### Basic Usage

```typescript
import { logger } from '@/lib/logger';

// Error logging
logger.error('Operation failed', {
  userId: user.id,
  operation: 'dashboard-create',
  error: error.message,
  stack: error.stack,
});

// Warning logging
logger.warn('Rate limit approaching', {
  userId: user.id,
  requestCount: 95,
  limit: 100,
});

// Info logging
logger.info('Dashboard created successfully', {
  dashboardId: dashboard.id,
  userId: user.id,
  department: dashboard.department,
});

// Debug logging (only in development)
logger.debug('Processing widget data', {
  widgetId: widget.id,
  dataPoints: data.length,
});
```

### Contextual Logging

Add context to every log entry:

```typescript
// Create a child logger with default context
const dashboardLogger = logger.child({
  context: 'dashboard',
  userId: user.id,
});

// All logs from this logger will include the context
dashboardLogger.info('Dashboard loaded');
dashboardLogger.error('Failed to save', { dashboardId: id });
```

### Environment-Based Configuration

```typescript
class Logger {
  private isDevelopment: boolean;
  private logger: winston.Logger;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || false;
    this.logger = this.createLogger();
  }

  private createLogger() {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        level: this.isDevelopment ? 'debug' : 'info',
        format: this.isDevelopment
          ? winston.format.simple()
          : winston.format.json(),
      }),
    ];

    if (!this.isDevelopment) {
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        })
      );
    }

    return winston.createLogger({
      level: this.isDevelopment ? 'debug' : 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports,
    });
  }

  error(message: string, meta?: object) {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: object) {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: object) {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: object) {
    if (this.isDevelopment) {
      this.logger.debug(message, meta);
    }
  }
}

export const logger = new Logger();
```

## Sentry Integration

### Setup

Sentry is configured in the application entry point:

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Before sending
  beforeSend(event, hint) {
    // Filter out non-critical errors
    if (event.exception?.values?.[0]?.type === 'ResizeObserver') {
      return null;
    }
    return event;
  },
});
```

### Environment Variables

Add to `.env.local`:

```env
VITE_SENTRY_DSN=your_sentry_dsn_here
```

### Manual Error Capture

```typescript
import * as Sentry from '@sentry/react';

try {
  await processPayment();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'payments',
      severity: 'high',
    },
    extra: {
      userId: user.id,
      amount: payment.amount,
      transactionId: payment.id,
    },
    level: 'error',
  });
  throw error;
}
```

### User Context

Set user context for better error tracking:

```typescript
import * as Sentry from '@sentry/react';

Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Clear user context on logout
Sentry.setUser(null);
```

### Custom Context

Add custom context to errors:

```typescript
import * as Sentry from '@sentry/react';

Sentry.setContext('dashboard', {
  id: dashboard.id,
  name: dashboard.name,
  widgetCount: dashboard.widgets.length,
});

Sentry.setTag('department', dashboard.department);
```

### Breadcrumbs

Add breadcrumbs for better error context:

```typescript
import * as Sentry from '@sentry/react';

Sentry.addBreadcrumb({
  category: 'dashboard',
  message: 'User opened dashboard settings',
  level: 'info',
  data: {
    dashboardId: dashboard.id,
  },
});
```

## Audit Logging

### Purpose

Audit logs track user actions for:
- Compliance and security
- User activity monitoring
- Debugging user-reported issues
- Analytics and usage patterns

### Implementation

Located in `src/lib/security/audit.ts`:

```typescript
import { blink } from '@/lib/blink';
import type { BlinkUser } from '@blinkdotnew/sdk';

export type AuditAction =
  | 'dashboard_create'
  | 'dashboard_update'
  | 'dashboard_delete'
  | 'dashboard_view'
  | 'widget_create'
  | 'widget_update'
  | 'widget_delete'
  | 'comment_create'
  | 'comment_delete'
  | 'user_invite'
  | 'user_remove'
  | 'role_change'
  | 'export_pdf'
  | 'export_csv'
  | 'settings_update';

interface AuditLogEntry {
  action: AuditAction;
  userId: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export async function logAuditEvent(
  user: BlinkUser,
  action: AuditAction,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, any>
) {
  const entry: AuditLogEntry = {
    action,
    userId: user.id,
    resourceType,
    resourceId,
    metadata,
    timestamp: new Date().toISOString(),
  };

  try {
    await blink.database.insert('audit_logs').values(entry).execute();
  } catch (error) {
    logger.error('Failed to log audit event', { entry, error });
  }
}
```

### Usage

```typescript
import { logAuditEvent } from '@/lib/security/audit';

// Log dashboard creation
await logAuditEvent(
  user,
  'dashboard_create',
  'dashboard',
  dashboard.id,
  {
    department: dashboard.department,
    widgetCount: dashboard.widgets.length,
  }
);

// Log user role change
await logAuditEvent(
  user,
  'role_change',
  'user',
  targetUser.id,
  {
    oldRole: 'viewer',
    newRole: 'editor',
  }
);

// Log export action
await logAuditEvent(
  user,
  'export_pdf',
  'dashboard',
  dashboard.id,
  {
    format: 'pdf',
    widgetCount: widgets.length,
  }
);
```

### Querying Audit Logs

```typescript
export async function getAuditLogs(filters: {
  userId?: string;
  action?: AuditAction;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  let query = blink.database
    .select()
    .from('audit_logs')
    .orderBy('timestamp', 'desc');

  if (filters.userId) {
    query = query.where('userId', '=', filters.userId);
  }

  if (filters.action) {
    query = query.where('action', '=', filters.action);
  }

  if (filters.resourceType) {
    query = query.where('resourceType', '=', filters.resourceType);
  }

  if (filters.startDate) {
    query = query.where('timestamp', '>=', filters.startDate.toISOString());
  }

  if (filters.endDate) {
    query = query.where('timestamp', '<=', filters.endDate.toISOString());
  }

  const limit = filters.limit || 100;
  query = query.limit(limit);

  return await query.execute();
}
```

### Audit Log Viewer Component

The application includes an audit log viewer in `src/features/dashboard/components/AuditLogViewer.tsx`.

## Log Levels

### Available Levels

1. **error** - Application errors that need immediate attention
2. **warn** - Warning conditions (approaching rate limits, deprecated features)
3. **info** - Important application events (user actions, state changes)
4. **http** - HTTP request/response logging
5. **debug** - Detailed debugging information (only in development)

### When to Use Each Level

```typescript
// ERROR: Critical issues that prevent functionality
logger.error('Database connection failed', {
  error: error.message,
  connectionString: sanitizedConnectionString,
});

// WARN: Potential issues or approaching limits
logger.warn('Rate limit at 90%', {
  userId: user.id,
  requestCount: 90,
  limit: 100,
});

// INFO: Significant application events
logger.info('User logged in', {
  userId: user.id,
  method: 'google-oauth',
});

// DEBUG: Detailed information for debugging
logger.debug('Processing widget configuration', {
  widgetId: widget.id,
  config: widget.config,
  dataPoints: data.length,
});
```

## Structured Logging

### Benefits

- Easy to query and analyze
- Machine-readable format
- Consistent log entries
- Better for log aggregation tools

### Best Practices

```typescript
// ❌ Bad: Unstructured string concatenation
logger.info(`User ${user.id} created dashboard ${dashboard.id}`);

// ✅ Good: Structured with context
logger.info('Dashboard created', {
  userId: user.id,
  dashboardId: dashboard.id,
  department: dashboard.department,
  widgetCount: dashboard.widgets.length,
  timestamp: new Date().toISOString(),
});
```

### Standard Fields

Always include these fields when relevant:

```typescript
interface LogMetadata {
  userId?: string;
  dashboardId?: string;
  widgetId?: string;
  operation?: string;
  duration?: number;
  error?: string;
  stack?: string;
  timestamp?: string;
}
```

## Performance Monitoring

### Widget Performance Profiler

Located in `src/lib/performance/widget-profiler.ts`:

```typescript
export class WidgetPerformanceProfiler {
  private metrics = new Map<string, PerformanceMetric>();

  startProfiling(widgetId: string, operation: string) {
    const key = `${widgetId}-${operation}`;
    this.metrics.set(key, {
      widgetId,
      operation,
      startTime: performance.now(),
    });
  }

  endProfiling(widgetId: string, operation: string) {
    const key = `${widgetId}-${operation}`;
    const metric = this.metrics.get(key);

    if (metric) {
      const duration = performance.now() - metric.startTime;

      logger.info('Widget performance metric', {
        widgetId,
        operation,
        duration: `${duration.toFixed(2)}ms`,
      });

      if (duration > 1000) {
        logger.warn('Slow widget operation detected', {
          widgetId,
          operation,
          duration: `${duration.toFixed(2)}ms`,
        });
      }

      this.metrics.delete(key);
    }
  }
}
```

### Usage

```typescript
import { widgetProfiler } from '@/lib/performance/widget-profiler';

function DataWidget({ config }: WidgetProps) {
  useEffect(() => {
    widgetProfiler.startProfiling(config.id, 'render');

    return () => {
      widgetProfiler.endProfiling(config.id, 'render');
    };
  }, [config.id]);

  const handleDataFetch = async () => {
    widgetProfiler.startProfiling(config.id, 'data-fetch');
    try {
      const data = await fetchData();
      setData(data);
    } finally {
      widgetProfiler.endProfiling(config.id, 'data-fetch');
    }
  };

  return <div>{/* Widget UI */}</div>;
}
```

### Sentry Performance Monitoring

```typescript
import * as Sentry from '@sentry/react';

// Automatic transaction tracking
const transaction = Sentry.startTransaction({
  name: 'Dashboard Load',
  op: 'dashboard.load',
});

try {
  const span = transaction.startChild({
    op: 'data.fetch',
    description: 'Fetch dashboard data',
  });

  const data = await fetchDashboard(id);

  span.finish();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

## Best Practices

### 1. Log Consistently

```typescript
// Use consistent log format across the application
const logOperation = (
  operation: string,
  success: boolean,
  metadata: object
) => {
  const level = success ? 'info' : 'error';
  logger[level](`Operation: ${operation}`, {
    operation,
    success,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};
```

### 2. Don't Log Sensitive Data

```typescript
// ❌ Bad: Logs sensitive information
logger.info('User authenticated', {
  email: user.email,
  password: user.password, // Never log passwords!
  creditCard: user.creditCard,
});

// ✅ Good: Sanitized logging
logger.info('User authenticated', {
  userId: user.id,
  method: 'password',
  ipAddress: sanitizeIP(request.ip),
});
```

### 3. Include Error Stack Traces

```typescript
// ❌ Bad: Missing context
logger.error('Error occurred');

// ✅ Good: Full context with stack trace
logger.error('Dashboard save failed', {
  error: error.message,
  stack: error.stack,
  userId: user.id,
  dashboardId: dashboard.id,
});
```

### 4. Use Log Sampling for High-Volume Events

```typescript
// Sample 10% of debug logs in production
function logDebugSampled(message: string, meta: object) {
  if (import.meta.env.DEV || Math.random() < 0.1) {
    logger.debug(message, meta);
  }
}
```

### 5. Implement Log Rotation

```typescript
// Configure log rotation in production
new winston.transports.File({
  filename: 'logs/application.log',
  maxsize: 10485760, // 10MB
  maxFiles: 10,
  tailable: true,
});
```

### 6. Monitor Log Volume

```typescript
// Track log volume and alert on anomalies
const logCounter = {
  error: 0,
  warn: 0,
  info: 0,
};

function trackLogVolume(level: string) {
  logCounter[level]++;

  // Alert if error rate is too high
  if (logCounter.error > 100) {
    Sentry.captureMessage('High error rate detected', {
      level: 'warning',
      extra: { errorCount: logCounter.error },
    });
  }
}
```

### 7. Use Correlation IDs

```typescript
// Generate correlation ID for request tracing
function generateCorrelationId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Include in all related logs
const correlationId = generateCorrelationId();

logger.info('Request started', { correlationId, endpoint: '/api/dashboards' });
logger.info('Database query', { correlationId, query: 'SELECT * FROM...' });
logger.info('Request completed', { correlationId, duration: 150 });
```

## Related Documentation

- [ERROR_HANDLING.md](./ERROR_HANDLING.md) - Error handling patterns
- [PERFORMANCE.md](./PERFORMANCE.md) - Performance optimization
- [security.md](./security.md) - Security best practices
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
