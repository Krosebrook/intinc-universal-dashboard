/**
 * RBAC Hook - Role-Based Access Control
 * Phase 5.3: Granular permission checking for enterprise security
 */

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { blink } from '../lib/blink';
import type { BlinkUser } from '@blinkdotnew/sdk';
import { Permission, Role, ROLE_DEFINITIONS, WorkspaceMember } from '../types/rbac';
import { toast } from 'react-hot-toast';

interface RBACContextType {
  currentRole: Role;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isLoading: boolean;
  workspaceMembers: WorkspaceMember[];
  inviteMember: (email: string, role: Role, workspaceId: string) => Promise<void>;
  updateMemberRole: (memberId: string, newRole: Role) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  fetchWorkspaceMembers: (workspaceId: string) => Promise<void>;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<BlinkUser | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>('viewer');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setCurrentUser(state.user);
      if (state.user) {
        // Determine role from user metadata or default to 'editor' for authenticated users
        const userRole = (state.user.metadata as any)?.role as Role || 'editor';
        setCurrentRole(userRole);
        setPermissions(ROLE_DEFINITIONS[userRole]?.permissions || []);
      } else {
        setCurrentRole('guest');
        setPermissions(ROLE_DEFINITIONS.guest.permissions);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const hasPermission = useCallback((permission: Permission): boolean => {
    return permissions.includes(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((perms: Permission[]): boolean => {
    return perms.some(p => permissions.includes(p));
  }, [permissions]);

  const hasAllPermissions = useCallback((perms: Permission[]): boolean => {
    return perms.every(p => permissions.includes(p));
  }, [permissions]);

  const fetchWorkspaceMembers = async (workspaceId: string) => {
    if (!currentUser?.id) return;
    
    try {
      let data = await blink.db.workspaceMembers.list({ 
        where: { workspaceId } 
      });
      
      // If no members found, add the current user as owner
      if ((!data || data.length === 0) && currentUser.id) {
        const newMember = await blink.db.workspaceMembers.create({
          userId: currentUser.id,
          workspaceId,
          role: 'admin',
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Owner',
          joinedAt: new Date().toISOString()
        });
        data = [newMember];
      }
      
      setWorkspaceMembers(data || []);
      
      // Update current user's role based on workspace membership
      const member = data?.find(m => m.userId === currentUser.id);
      if (member) {
        setCurrentRole(member.role as Role);
        setPermissions(ROLE_DEFINITIONS[member.role as Role]?.permissions || []);
      }
    } catch (error) {
      console.error('Failed to fetch workspace members:', error);
    }
  };

  const inviteMember = async (email: string, role: Role, workspaceId: string) => {
    if (!hasPermission('user:manage') && !hasPermission('workspace:manage')) {
      toast.error('You do not have permission to invite members');
      return;
    }

    try {
      await blink.db.workspaceMembers.create({
        userId: 'pending', // Will be linked when user joins
        workspaceId,
        role,
        email,
        invitedBy: currentUser?.id || '',
        invitedAt: new Date().toISOString()
      });

      // Log the invitation action
      await blink.db.auditLogs.create({
        userId: currentUser?.id || '',
        action: 'member_invited',
        entity: 'workspace',
        entityId: workspaceId,
        metadata: JSON.stringify({ email, role })
      });

      toast.success(`Invitation sent to ${email}`);
      await fetchWorkspaceMembers(workspaceId);
    } catch (error) {
      console.error('Failed to invite member:', error);
      toast.error('Failed to send invitation');
    }
  };

  const updateMemberRole = async (memberId: string, newRole: Role) => {
    if (!hasPermission('user:manage')) {
      toast.error('You do not have permission to change member roles');
      return;
    }

    try {
      await blink.db.workspaceMembers.update(memberId, { role: newRole });
      
      setWorkspaceMembers(prev => 
        prev.map(m => m.id === memberId ? { ...m, role: newRole } : m)
      );
      
      await blink.db.auditLogs.create({
        userId: currentUser?.id || '',
        action: 'member_role_updated',
        entity: 'workspace_member',
        entityId: memberId,
        metadata: JSON.stringify({ newRole })
      });

      toast.success('Member role updated');
    } catch (error) {
      console.error('Failed to update member role:', error);
      toast.error('Failed to update role');
    }
  };

  const removeMember = async (memberId: string) => {
    if (!hasPermission('user:manage')) {
      toast.error('You do not have permission to remove members');
      return;
    }

    try {
      await blink.db.workspaceMembers.delete(memberId);
      setWorkspaceMembers(prev => prev.filter(m => m.id !== memberId));
      
      await blink.db.auditLogs.create({
        userId: currentUser?.id || '',
        action: 'member_removed',
        entity: 'workspace_member',
        entityId: memberId,
        metadata: null
      });

      toast.success('Member removed from workspace');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove member');
    }
  };

  return (
    <RBACContext.Provider value={{
      currentRole,
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      isLoading,
      workspaceMembers,
      inviteMember,
      updateMemberRole,
      removeMember,
      fetchWorkspaceMembers
    }}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRBAC() {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
}

/**
 * Higher-order component to protect routes/components based on permissions
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: Permission,
  FallbackComponent?: React.ComponentType
) {
  return function ProtectedComponent(props: P) {
    const { hasPermission, isLoading } = useRBAC();
    
    if (isLoading) {
      return <div className="animate-pulse bg-white/5 rounded-xl h-32" />;
    }
    
    if (!hasPermission(requiredPermission)) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      return null;
    }
    
    return <Component {...props} />;
  };
}
