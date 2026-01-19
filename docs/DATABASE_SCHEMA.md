# Database Schema Documentation

This document describes the database schema for the Intinc Universal Dashboard, including tables, relationships, indexes, and Row-Level Security (RLS) policies.

## Table of Contents

- [Overview](#overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Tables](#tables)
- [Row-Level Security (RLS)](#row-level-security-rls)
- [Indexes](#indexes)
- [Queries and Best Practices](#queries-and-best-practices)

## Overview

The Intinc Universal Dashboard uses Blink's PostgreSQL-backed database with the following key features:

- **Multi-tenant architecture**: Data isolated by user_id
- **Row-Level Security (RLS)**: Automatic data access control
- **Real-time subscriptions**: Live data updates via Blink SDK
- **JSONB support**: Flexible widget configurations
- **Soft deletes**: Optional paranoid mode for data recovery

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│   Users     │◄──────┤  Workspaces  │──────►│ WorkspaceMembers │
│ (from Auth) │       └──────────────┘       └──────────────┘
└─────────────┘              │                        │
       │                     │                        │
       │                     ▼                        │
       │             ┌──────────────┐                 │
       └────────────►│  Dashboards  │◄────────────────┘
                     └──────────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
                ▼           ▼           ▼
         ┌──────────┐ ┌──────────┐ ┌──────────┐
         │  Widgets │ │ Comments │ │  Shares  │
         └──────────┘ └──────────┘ └──────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ AuditLogs    │
                     └──────────────┘
```

## Tables

### users

Managed by Blink Auth. Not directly accessible from application code.

**Key Fields:**
- `id` (UUID): Primary key
- `email` (String): User email
- `name` (String): Display name
- `created_at` (Timestamp): Account creation time

### workspaces

Multi-tenant workspaces for team collaboration.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| name | VARCHAR(255) | NO | - | Workspace name |
| owner_id | UUID | NO | - | Creator's user ID (FK) |
| slug | VARCHAR(255) | NO | - | URL-friendly identifier |
| settings | JSONB | YES | {} | Workspace preferences |
| created_at | TIMESTAMP | NO | now() | Creation timestamp |
| updated_at | TIMESTAMP | NO | now() | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (slug)
- INDEX (owner_id)

**RLS Policy:**
```sql
-- Users can view workspaces they own or are members of
CREATE POLICY workspace_select ON workspaces
  FOR SELECT
  USING (
    owner_id = current_user_id() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = workspaces.id
      AND user_id = current_user_id()
    )
  );

-- Only owners can update workspaces
CREATE POLICY workspace_update ON workspaces
  FOR UPDATE
  USING (owner_id = current_user_id());
```

### workspace_members

Maps users to workspaces with roles.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| workspace_id | UUID | NO | - | Workspace FK |
| user_id | UUID | NO | - | User FK |
| role | VARCHAR(50) | NO | 'viewer' | Member role |
| invited_by | UUID | YES | - | Inviter's user ID |
| joined_at | TIMESTAMP | NO | now() | Join timestamp |

**Roles:**
- `owner`: Full access
- `admin`: Manage users, edit all dashboards
- `editor`: Create and edit own dashboards
- `viewer`: Read-only access

**Constraints:**
- UNIQUE (workspace_id, user_id)
- CHECK (role IN ('owner', 'admin', 'editor', 'viewer'))

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (workspace_id, user_id)
- INDEX (user_id)

### dashboards

Core dashboard entities.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| name | VARCHAR(255) | NO | - | Dashboard name |
| description | TEXT | YES | - | Dashboard description |
| department | VARCHAR(50) | NO | - | Department category |
| user_id | UUID | NO | - | Owner's user ID (FK) |
| workspace_id | UUID | YES | - | Workspace FK (optional) |
| is_public | BOOLEAN | NO | false | Public visibility |
| is_template | BOOLEAN | NO | false | Template flag |
| layout | JSONB | YES | {} | Grid layout config |
| theme | VARCHAR(50) | YES | 'default' | Theme name |
| created_at | TIMESTAMP | NO | now() | Creation timestamp |
| updated_at | TIMESTAMP | NO | now() | Last update timestamp |

**Department Values:**
- `Sales`
- `HR`
- `IT`
- `Marketing`
- `Finance`
- `Operations`

**Indexes:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (workspace_id)
- INDEX (department)
- INDEX (is_public)
- INDEX (created_at DESC)

**RLS Policy:**
```sql
-- Users can view their own dashboards and public dashboards
CREATE POLICY dashboard_select ON dashboards
  FOR SELECT
  USING (
    user_id = current_user_id() OR
    is_public = true OR
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = current_user_id()
    )
  );

-- Users can only modify their own dashboards
CREATE POLICY dashboard_update ON dashboards
  FOR UPDATE
  USING (user_id = current_user_id());

CREATE POLICY dashboard_delete ON dashboards
  FOR DELETE
  USING (user_id = current_user_id());
```

### widgets

Widget configurations attached to dashboards.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| dashboard_id | UUID | NO | - | Dashboard FK |
| type | VARCHAR(50) | NO | - | Widget type |
| title | VARCHAR(255) | NO | - | Widget title |
| description | TEXT | YES | - | Widget description |
| config | JSONB | NO | {} | Widget configuration |
| data | JSONB | YES | [] | Widget data |
| grid_span | INTEGER | NO | 6 | Grid column span (1-12) |
| position | INTEGER | NO | 0 | Display order |
| created_at | TIMESTAMP | NO | now() | Creation timestamp |
| updated_at | TIMESTAMP | NO | now() | Last update timestamp |

**Widget Types:**
- `bar`: Bar chart
- `line`: Line chart
- `area`: Area chart
- `pie`: Pie chart
- `stacked-bar`: Stacked bar chart
- `composed`: Composed chart
- `metric`: KPI metric card
- `table`: Data table
- `custom`: Custom widget

**Config Schema (JSONB):**
```json
{
  "dataKey": "value",
  "categoryKey": "name",
  "colors": ["#8b5cf6", "#3b82f6"],
  "showLegend": true,
  "showGrid": true,
  "xAxisLabel": "Category",
  "yAxisLabel": "Value"
}
```

**Indexes:**
- PRIMARY KEY (id)
- INDEX (dashboard_id)
- INDEX (type)
- INDEX (position)

**RLS Policy:**
```sql
-- Users can view widgets of dashboards they have access to
CREATE POLICY widget_select ON widgets
  FOR SELECT
  USING (
    dashboard_id IN (
      SELECT id FROM dashboards
      WHERE user_id = current_user_id() OR is_public = true
    )
  );

-- Users can modify widgets of their own dashboards
CREATE POLICY widget_update ON widgets
  FOR UPDATE
  USING (
    dashboard_id IN (
      SELECT id FROM dashboards WHERE user_id = current_user_id()
    )
  );
```

### comments

Collaboration comments on dashboards.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| dashboard_id | UUID | NO | - | Dashboard FK |
| user_id | UUID | NO | - | Author's user ID (FK) |
| content | TEXT | NO | - | Comment text |
| parent_id | UUID | YES | - | Parent comment (threading) |
| created_at | TIMESTAMP | NO | now() | Creation timestamp |
| updated_at | TIMESTAMP | NO | now() | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (dashboard_id)
- INDEX (user_id)
- INDEX (parent_id)
- INDEX (created_at DESC)

**RLS Policy:**
```sql
-- Users can view comments on dashboards they have access to
CREATE POLICY comment_select ON comments
  FOR SELECT
  USING (
    dashboard_id IN (
      SELECT id FROM dashboards
      WHERE user_id = current_user_id() OR is_public = true
    )
  );

-- Users can delete their own comments
CREATE POLICY comment_delete ON comments
  FOR DELETE
  USING (user_id = current_user_id());
```

### dashboard_shares

Share links for dashboard access control.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| dashboard_id | UUID | NO | - | Dashboard FK |
| token | VARCHAR(255) | NO | - | Share token (unique) |
| permission | VARCHAR(50) | NO | 'view' | Access level |
| expires_at | TIMESTAMP | YES | - | Expiration time |
| created_by | UUID | NO | - | Creator's user ID (FK) |
| created_at | TIMESTAMP | NO | now() | Creation timestamp |

**Permissions:**
- `view`: Read-only access
- `edit`: Edit widgets and data
- `comment`: Add comments

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (token)
- INDEX (dashboard_id)
- INDEX (expires_at)

### audit_logs

Security and compliance audit trail.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Primary key |
| user_id | UUID | NO | - | Actor's user ID (FK) |
| action | VARCHAR(100) | NO | - | Action type |
| resource_type | VARCHAR(50) | NO | - | Resource type |
| resource_id | UUID | YES | - | Resource ID |
| metadata | JSONB | YES | {} | Additional context |
| ip_address | VARCHAR(45) | YES | - | Client IP |
| user_agent | TEXT | YES | - | Client user agent |
| timestamp | TIMESTAMP | NO | now() | Event timestamp |

**Action Types:**
- `dashboard_create`
- `dashboard_update`
- `dashboard_delete`
- `dashboard_view`
- `widget_create`
- `widget_update`
- `widget_delete`
- `comment_create`
- `comment_delete`
- `user_invite`
- `user_remove`
- `role_change`
- `export_pdf`
- `export_csv`
- `settings_update`

**Indexes:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (action)
- INDEX (resource_type, resource_id)
- INDEX (timestamp DESC)

**RLS Policy:**
```sql
-- Users can only view their own audit logs
CREATE POLICY audit_log_select ON audit_logs
  FOR SELECT
  USING (user_id = current_user_id());

-- No one can update or delete audit logs (append-only)
CREATE POLICY audit_log_immutable ON audit_logs
  FOR UPDATE
  USING (false);

CREATE POLICY audit_log_no_delete ON audit_logs
  FOR DELETE
  USING (false);
```

## Row-Level Security (RLS)

### How RLS Works

Blink automatically enforces RLS policies on every query. The `current_user_id()` function returns the authenticated user's ID.

**Example:**
```typescript
// This query automatically filters by user_id
const dashboards = await blink.database
  .select()
  .from('dashboards')
  .execute();

// Equivalent SQL:
// SELECT * FROM dashboards
// WHERE user_id = current_user_id() OR is_public = true
```

### Bypassing RLS (Admin Operations)

For admin operations, use the `bypassRLS()` modifier:

```typescript
// Requires admin privileges
const allDashboards = await blink.database
  .select()
  .from('dashboards')
  .bypassRLS() // Admin only!
  .execute();
```

**Warning:** Only use `bypassRLS()` when absolutely necessary and with proper authorization checks.

### Testing RLS Policies

```sql
-- Test as a specific user
SET LOCAL app.user_id = 'user-uuid-here';

-- Run your query
SELECT * FROM dashboards;

-- Reset
RESET app.user_id;
```

## Indexes

### Performance Optimization

```sql
-- Dashboard queries
CREATE INDEX idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX idx_dashboards_workspace_id ON dashboards(workspace_id);
CREATE INDEX idx_dashboards_created_at ON dashboards(created_at DESC);

-- Widget queries
CREATE INDEX idx_widgets_dashboard_id ON widgets(dashboard_id);
CREATE INDEX idx_widgets_type ON widgets(type);

-- Comment queries
CREATE INDEX idx_comments_dashboard_id ON comments(dashboard_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Audit log queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Full-text search (optional)
CREATE INDEX idx_dashboards_name_fts ON dashboards
  USING gin(to_tsvector('english', name));
```

## Queries and Best Practices

### Fetching Dashboard with Widgets

```typescript
// Efficient: Single query with join
const dashboard = await blink.database
  .select()
  .from('dashboards')
  .leftJoin('widgets', 'widgets.dashboard_id', 'dashboards.id')
  .where('dashboards.id', '=', dashboardId)
  .first();

// Alternative: Two queries with Promise.all
const [dashboard, widgets] = await Promise.all([
  blink.database.select().from('dashboards').where('id', '=', dashboardId).first(),
  blink.database.select().from('widgets').where('dashboard_id', '=', dashboardId).execute(),
]);
```

### Pagination

```typescript
const page = 1;
const perPage = 20;
const offset = (page - 1) * perPage;

const dashboards = await blink.database
  .select()
  .from('dashboards')
  .orderBy('created_at', 'desc')
  .limit(perPage)
  .offset(offset)
  .execute();
```

### Search with Full-Text

```typescript
const searchQuery = 'sales dashboard';

const results = await blink.database
  .select()
  .from('dashboards')
  .where(
    blink.raw(`to_tsvector('english', name) @@ to_tsquery('english', ?)`, [
      searchQuery.replace(/\s+/g, ' & '),
    ])
  )
  .execute();
```

### Aggregations

```typescript
// Count dashboards by department
const stats = await blink.database
  .select('department')
  .count('* as total')
  .from('dashboards')
  .groupBy('department')
  .execute();

// Average widgets per dashboard
const avgWidgets = await blink.database
  .select()
  .avg('widget_count')
  .from(
    blink.database
      .select('dashboard_id')
      .count('* as widget_count')
      .from('widgets')
      .groupBy('dashboard_id')
      .as('subquery')
  )
  .first();
```

### Transactions

```typescript
await blink.database.transaction(async (trx) => {
  // Create dashboard
  const dashboard = await trx
    .insert('dashboards')
    .values({
      name: 'New Dashboard',
      user_id: userId,
      department: 'Sales',
    })
    .returning('*')
    .first();

  // Create default widgets
  await trx.insert('widgets').values([
    {
      dashboard_id: dashboard.id,
      type: 'bar',
      title: 'Sales by Region',
      config: {},
    },
    {
      dashboard_id: dashboard.id,
      type: 'line',
      title: 'Revenue Trend',
      config: {},
    },
  ]);
});
```

### Real-Time Subscriptions

```typescript
import { useEffect } from 'react';
import { blink } from '@/lib/blink';

function Dashboard({ id }: Props) {
  useEffect(() => {
    // Subscribe to dashboard updates
    const subscription = blink.realtime
      .subscribe('dashboards', id)
      .on('update', (updatedDashboard) => {
        console.log('Dashboard updated:', updatedDashboard);
        // Update local state
      })
      .on('delete', () => {
        console.log('Dashboard deleted');
        // Redirect or show message
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  return <div>{/* Dashboard UI */}</div>;
}
```

## Migration Best Practices

### Adding New Columns

```sql
-- Add nullable column (safe)
ALTER TABLE dashboards
ADD COLUMN tags TEXT[];

-- Add non-nullable column with default
ALTER TABLE dashboards
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';
```

### Changing Column Types

```sql
-- Safe: Widening constraint
ALTER TABLE dashboards
ALTER COLUMN name TYPE VARCHAR(500);

-- Requires data migration: Narrowing or changing type
UPDATE dashboards SET department = 'Sales' WHERE department IS NULL;
ALTER TABLE dashboards
ALTER COLUMN department SET NOT NULL;
```

### Adding Indexes Concurrently

```sql
-- In production, create indexes concurrently to avoid locks
CREATE INDEX CONCURRENTLY idx_dashboards_department
ON dashboards(department);
```

## Related Documentation

- [API.md](./API.md) - API endpoints and usage
- [security.md](./security.md) - RLS and security policies
- [architecture.md](./architecture.md) - System architecture
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Coding standards
