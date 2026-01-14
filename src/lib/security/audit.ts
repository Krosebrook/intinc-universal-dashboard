/**
 * Audit Logging Service
 * Records security-relevant events and user actions for enterprise compliance
 */

import { blink } from '../blink';
import type { BlinkUser } from '@blinkdotnew/sdk';

export interface AuditEvent {
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

/**
 * Log a security or data-related event to the audit_logs table
 */
export async function logAuditEvent(
  user: BlinkUser | null,
  event: AuditEvent
): Promise<void> {
  if (!user) {
    console.warn('Audit Log: Attempted to log event without user context', event);
    return;
  }

  try {
    // Correct SDK syntax: blink.db.tableName.create()
    // The table name is converted to snake_case automatically: auditLogs -> audit_logs
    await blink.db.auditLogs.create({
      userId: user.id,
      action: event.action,
      entity: event.entity,
      entityId: event.entityId,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
    });
  } catch (error) {
    // We don't want audit log failures to break the main application flow,
    // but we should log the failure for debugging.
    console.error('Audit Log: Failed to record event', { event, error });
  }
}

/**
 * Standard audit actions for consistency
 */
export const AuditActions = {
  // Authentication
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  PASSWORD_CHANGE: 'auth.password_change',

  // Dashboard Operations
  DASHBOARD_CREATE: 'dashboard.create',
  DASHBOARD_UPDATE: 'dashboard.update',
  DASHBOARD_DELETE: 'dashboard.delete',
  DASHBOARD_EXPORT: 'dashboard.export',

  // Workspace Operations
  WORKSPACE_CREATE: 'workspace.create',
  WORKSPACE_MEMBER_ADD: 'workspace.member_add',
  WORKSPACE_MEMBER_REMOVE: 'workspace.member_remove',

  // Enterprise Settings
  SETTINGS_UPDATE: 'settings.update',
  API_KEY_TOGGLE: 'settings.api_key_toggle',

  // Security
  SECURITY_VIOLATION: 'security.violation',
  RATE_LIMIT_HIT: 'security.rate_limit_hit',
} as const;

/**
 * Standard audit entities
 */
export const AuditEntities = {
  DASHBOARD: 'dashboard',
  WIDGET: 'widget',
  WORKSPACE: 'workspace',
  USER: 'user',
  SETTINGS: 'enterprise_settings',
} as const;
