/**
 * Role-Based Access Control (RBAC) Types
 * Phase 5.3: Granular permissions for enterprise security
 */

export type Permission = 
  | 'dashboard:view'
  | 'dashboard:create'
  | 'dashboard:edit'
  | 'dashboard:delete'
  | 'dashboard:share'
  | 'widget:create'
  | 'widget:edit'
  | 'widget:delete'
  | 'workspace:create'
  | 'workspace:manage'
  | 'settings:view'
  | 'settings:edit'
  | 'audit:view'
  | 'user:manage'
  | 'export:pdf'
  | 'connector:manage'
  | 'webhook:manage';

export type Role = 'owner' | 'admin' | 'editor' | 'viewer' | 'guest';

export interface RoleDefinition {
  id: Role;
  name: string;
  description: string;
  permissions: Permission[];
  color: string;
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  owner: {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to all features including user management',
    permissions: [
      'dashboard:view', 'dashboard:create', 'dashboard:edit', 'dashboard:delete', 'dashboard:share',
      'widget:create', 'widget:edit', 'widget:delete',
      'workspace:create', 'workspace:manage',
      'settings:view', 'settings:edit',
      'audit:view', 'user:manage',
      'export:pdf', 'connector:manage', 'webhook:manage'
    ],
    color: 'text-amber-400'
  },
  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Manage dashboards, settings, and view audit logs',
    permissions: [
      'dashboard:view', 'dashboard:create', 'dashboard:edit', 'dashboard:delete', 'dashboard:share',
      'widget:create', 'widget:edit', 'widget:delete',
      'workspace:create', 'workspace:manage',
      'settings:view', 'settings:edit',
      'audit:view', 'export:pdf', 'connector:manage', 'webhook:manage'
    ],
    color: 'text-indigo-400'
  },
  editor: {
    id: 'editor',
    name: 'Editor',
    description: 'Create and edit dashboards and widgets',
    permissions: [
      'dashboard:view', 'dashboard:create', 'dashboard:edit', 'dashboard:share',
      'widget:create', 'widget:edit',
      'settings:view', 'export:pdf'
    ],
    color: 'text-emerald-400'
  },
  viewer: {
    id: 'viewer',
    name: 'Viewer',
    description: 'View dashboards and export reports',
    permissions: [
      'dashboard:view', 'export:pdf'
    ],
    color: 'text-blue-400'
  },
  guest: {
    id: 'guest',
    name: 'Guest',
    description: 'Limited read-only access to shared dashboards',
    permissions: [
      'dashboard:view'
    ],
    color: 'text-zinc-400'
  }
};

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: Role;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  invitedAt: string;
  joinedAt?: string;
  invitedBy: string;
}

export interface Invitation {
  id: string;
  workspaceId: string;
  email: string;
  role: Role;
  token: string;
  expiresAt: string;
  createdAt: string;
  createdBy: string;
}
