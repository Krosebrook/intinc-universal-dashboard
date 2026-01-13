# API Documentation

This document describes the API structure and usage for the Intinc Universal Dashboard.

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Dashboards API](#dashboards-api)
- [Widgets API](#widgets-api)
- [Comments API](#comments-api)
- [Workspaces API](#workspaces-api)
- [AI API](#ai-api)
- [Real-time API](#real-time-api)
- [Error Handling](#error-handling)

## 🌐 Overview

The Intinc Universal Dashboard uses the Blink SDK for backend operations. All API calls are authenticated and rate-limited.

**Base Configuration:**
```typescript
import { blink } from '@/lib/blink';

// Blink is pre-configured with:
// - Project ID from environment
// - Publishable key from environment
// - Managed authentication mode
```

## 🔐 Authentication

### Login

```typescript
const { user, session } = await blink.auth.signIn({
  email: 'user@example.com',
  password: 'password123'
});
```

### Logout

```typescript
await blink.auth.signOut();
```

### Auth State Changes

```typescript
const unsubscribe = blink.auth.onAuthStateChanged((state) => {
  console.log('User:', state.user);
  console.log('Session:', state.session);
});

// Cleanup
unsubscribe();
```

### Get Current User

```typescript
const user = blink.auth.getCurrentUser();
```

## 📊 Dashboards API

### Create Dashboard

```typescript
import { dashboardSchema } from '@/lib/validation/dashboard.schema';

const dashboardData = dashboardSchema.parse({
  name: 'Sales Q4 2024',
  description: 'Quarterly sales performance',
  department: 'Sales',
  isPublic: false
});

const dashboard = await blink.db.dashboards.create({
  ...dashboardData,
  userId: user.id,
  widgets: [],
  createdAt: new Date().toISOString()
});
```

### List Dashboards

```typescript
// With RLS filtering
import { addRLSFilter } from '@/lib/security/rls';

const dashboards = await blink.db.dashboards.find(
  addRLSFilter(user)
);
```

### Get Dashboard

```typescript
const dashboard = await blink.db.dashboards.findOne({
  id: 'dashboard-123'
});
```

### Update Dashboard

```typescript
await blink.db.dashboards.update('dashboard-123', {
  name: 'Updated Dashboard Name',
  updatedAt: new Date().toISOString()
});
```

### Delete Dashboard

```typescript
import { canDeleteResource } from '@/lib/security/rls';

if (canDeleteResource(user.id, dashboard.userId, userRole)) {
  await blink.db.dashboards.delete('dashboard-123');
}
```

## 📈 Widgets API

### Widget Structure

```typescript
interface Widget {
  id: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'stacked-bar' | 'composed';
  title: string;
  description?: string;
  dataKey: string | string[];
  categoryKey: string;
  gridSpan?: number; // 1-12
  data: Array<Record<string, any>>;
  forecast?: boolean;
}
```

### Validate Widget

```typescript
import { widgetSchema } from '@/lib/validation/widget.schema';

const widget = widgetSchema.parse({
  id: 'widget-123',
  type: 'bar',
  title: 'Monthly Revenue',
  dataKey: 'revenue',
  categoryKey: 'month',
  data: [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 }
  ]
});
```

## 💬 Comments API

### Create Comment

```typescript
import { commentSchema } from '@/lib/validation/comment.schema';
import { sanitizeText } from '@/lib/security/sanitize';

const commentData = commentSchema.parse({
  content: sanitizeText(userInput),
  dashboardId: 'dashboard-123',
  widgetId: 'widget-123', // Optional
});

const comment = await blink.db.comments.create({
  ...commentData,
  userId: user.id,
  createdAt: new Date().toISOString()
});
```

### List Comments

```typescript
const comments = await blink.db.comments.find({
  dashboardId: 'dashboard-123'
});
```

## 🏢 Workspaces API

### Create Workspace

```typescript
const workspace = await blink.db.workspaces.create({
  name: 'Engineering Team',
  ownerId: user.id,
  members: [],
  createdAt: new Date().toISOString()
});
```

### Invite Member

```typescript
import { workspaceMemberSchema } from '@/lib/validation/user.schema';
import { sanitizeEmail } from '@/lib/security/sanitize';

const memberData = workspaceMemberSchema.parse({
  email: sanitizeEmail(userInput),
  role: 'editor',
  workspaceId: 'workspace-123'
});

// Send invitation logic here
```

## 🤖 AI API

### Generate Insights

```typescript
import { aiRateLimiter } from '@/lib/rate-limiting/api-limiter';

// Check rate limit
if (!aiRateLimiter.check(user.id)) {
  throw new Error('Rate limit exceeded');
}

const response = await blink.ai.generateText({
  prompt: `Analyze this sales data and provide insights: ${JSON.stringify(data)}`,
  maxTokens: 500
});
```

### Rate Limiting

```typescript
import { aiRateLimiter, apiRateLimiter } from '@/lib/rate-limiting/api-limiter';

// Check AI rate limit (10 req/min)
const canMakeAIRequest = aiRateLimiter.check(user.id);

// Check API rate limit (100 req/min)
const canMakeAPIRequest = apiRateLimiter.check(user.id);

// Get remaining requests
const remaining = aiRateLimiter.getRemaining(user.id);

// Get reset time
const resetIn = aiRateLimiter.getResetTime(user.id);
```

## 🔄 Real-time API

### Subscribe to Updates

```typescript
const subscription = blink.realtime.subscribe(
  'dashboards',
  { id: 'dashboard-123' },
  (event) => {
    console.log('Dashboard updated:', event);
  }
);

// Cleanup
subscription.unsubscribe();
```

### Publish Updates

```typescript
await blink.realtime.publish('metric-updates', {
  type: 'kpi_update',
  dashboardId: 'dashboard-123',
  data: { revenue: 150000 }
});
```

## ⚠️ Error Handling

### Standard Error Response

```typescript
try {
  const data = await blink.db.dashboards.find();
} catch (error) {
  if (error.code === 'PERMISSION_DENIED') {
    // Handle permission error
  } else if (error.code === 'NOT_FOUND') {
    // Handle not found
  } else {
    // Handle generic error
    logger.error('API Error', error);
  }
}
```

### Error Logging

```typescript
import { logger } from '@/lib/logger';

logger.error('Failed to create dashboard', error, {
  userId: user.id,
  action: 'create_dashboard'
});
```

## 🔒 Security Best Practices

### Input Validation

Always validate input with Zod schemas:

```typescript
import { dashboardSchema } from '@/lib/validation/dashboard.schema';

try {
  const validated = dashboardSchema.parse(userInput);
  // Use validated data
} catch (error) {
  // Handle validation error
}
```

### Input Sanitization

Always sanitize user-generated content:

```typescript
import { sanitizeText, sanitizeHtml } from '@/lib/security/sanitize';

const safeName = sanitizeText(userInput.name);
const safeContent = sanitizeHtml(userInput.content);
```

### Rate Limiting

Always check rate limits before expensive operations:

```typescript
import { aiRateLimiter } from '@/lib/rate-limiting/api-limiter';

if (!aiRateLimiter.check(user.id)) {
  const resetIn = aiRateLimiter.getResetTime(user.id);
  throw new Error(`Rate limit exceeded. Try again in ${resetIn}ms`);
}
```

### Row-Level Security

Always filter queries by user access:

```typescript
import { addRLSFilter } from '@/lib/security/rls';

const dashboards = await blink.db.dashboards.find(
  addRLSFilter(user, { department: 'Sales' })
);
```

## 📊 Response Examples

### Success Response

```json
{
  "id": "dashboard-123",
  "name": "Sales Q4 2024",
  "userId": "user-123",
  "createdAt": "2024-01-01T00:00:00Z",
  "widgets": []
}
```

### Error Response

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You don't have permission to access this resource",
    "details": {}
  }
}
```

## 📝 Audit Logging

All significant actions are logged:

```typescript
await blink.db.auditLogs.create({
  action: 'dashboard.created',
  userId: user.id,
  entityType: 'dashboard',
  entityId: dashboard.id,
  metadata: { department: 'Sales' },
  timestamp: new Date().toISOString()
});
```

## 🔍 Query Patterns

### Pagination

```typescript
const dashboards = await blink.db.dashboards.find(
  { userId: user.id },
  {
    limit: 20,
    offset: 0,
    orderBy: { createdAt: 'desc' }
  }
);
```

### Filtering

```typescript
const dashboards = await blink.db.dashboards.find({
  userId: user.id,
  department: 'Sales',
  isPublic: true
});
```

### Sorting

```typescript
const dashboards = await blink.db.dashboards.find(
  { userId: user.id },
  { orderBy: { updatedAt: 'desc' } }
);
```

## 📚 Additional Resources

- [Blink SDK Documentation](https://docs.blink.new)
- [Security Best Practices](./security.md)
- [Testing Guide](./TESTING.md)

---

For API support, contact: api-support@intinc.com
