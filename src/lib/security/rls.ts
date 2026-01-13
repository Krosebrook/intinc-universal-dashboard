/**
 * Row-Level Security (RLS) Helpers
 * Enforce user-level data access control for database queries
 */

import type { BlinkUser } from '@blinkdotnew/sdk';

/**
 * Check if user has access to a resource
 */
export function checkResourceAccess(
  userId: string | undefined,
  resourceOwnerId: string,
  isPublic: boolean = false
): boolean {
  // Public resources are accessible to all
  if (isPublic) {
    return true;
  }

  // Must be authenticated
  if (!userId) {
    return false;
  }

  // Owner has access
  return userId === resourceOwnerId;
}

/**
 * Check if user has workspace access
 */
export function checkWorkspaceAccess(
  userId: string | undefined,
  workspaceMembers: Array<{ userId: string; role: string }>
): boolean {
  if (!userId) {
    return false;
  }

  return workspaceMembers.some(member => member.userId === userId);
}

/**
 * Filter resources by user access
 * Returns only resources the user has permission to view
 */
export function filterResourcesByAccess<T extends { userId: string; isPublic?: boolean }>(
  resources: T[],
  currentUserId: string | undefined
): T[] {
  if (!currentUserId) {
    // Unauthenticated users can only see public resources
    return resources.filter(r => r.isPublic === true);
  }

  // Authenticated users see their own resources and public ones
  return resources.filter(r => r.userId === currentUserId || r.isPublic === true);
}

/**
 * Add RLS filter to database query parameters
 * Ensures queries respect user-level access control
 */
export function addRLSFilter(
  user: BlinkUser | null,
  baseFilter: Record<string, any> = {}
): Record<string, any> {
  if (!user) {
    // Unauthenticated: only public resources
    return { ...baseFilter, isPublic: true };
  }

  // Authenticated: own resources or public
  return {
    ...baseFilter,
    $or: [
      { userId: user.id },
      { isPublic: true }
    ]
  };
}

/**
 * Validate user can modify a resource
 */
export function canModifyResource(
  userId: string | undefined,
  resourceOwnerId: string,
  userRole?: string
): boolean {
  if (!userId) {
    return false;
  }

  // Owner can always modify
  if (userId === resourceOwnerId) {
    return true;
  }

  // Admins and owners can modify workspace resources
  if (userRole === 'owner' || userRole === 'admin') {
    return true;
  }

  return false;
}

/**
 * Validate user can delete a resource
 */
export function canDeleteResource(
  userId: string | undefined,
  resourceOwnerId: string,
  userRole?: string
): boolean {
  if (!userId) {
    return false;
  }

  // Only owner or workspace owner/admin can delete
  if (userId === resourceOwnerId) {
    return true;
  }

  if (userRole === 'owner') {
    return true;
  }

  return false;
}
