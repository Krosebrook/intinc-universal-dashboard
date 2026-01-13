/**
 * Team Management Component
 * Phase 5.3: RBAC - Manage workspace members and permissions
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Users, UserPlus, Shield, Crown, Edit3, Eye, 
  Trash2, Mail, MoreHorizontal, Check
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useRBAC } from '../../hooks/use-rbac';
import { Role, ROLE_DEFINITIONS, WorkspaceMember } from '../../types/rbac';
import { useDashboard } from '../../hooks/use-dashboard';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RoleIcon: Record<Role, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  editor: Edit3,
  viewer: Eye,
  guest: Users
};

export default function TeamManagement({ open, onOpenChange }: TeamManagementProps) {
  const { 
    currentRole, 
    hasPermission, 
    workspaceMembers, 
    inviteMember, 
    updateMemberRole, 
    removeMember,
    fetchWorkspaceMembers 
  } = useRBAC();
  const { workspaces } = useDashboard();
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('viewer');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const currentWorkspaceId = workspaces[0]?.id || 'default';

  useEffect(() => {
    if (open) {
      fetchWorkspaceMembers(currentWorkspaceId);
    }
  }, [open, currentWorkspaceId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsInviting(true);
    await inviteMember(inviteEmail, inviteRole, currentWorkspaceId);
    setInviteEmail('');
    setInviteRole('viewer');
    setShowInviteForm(false);
    setIsInviting(false);
  };

  const canManageUsers = hasPermission('user:manage') || hasPermission('workspace:manage');
  const canEditRoles = hasPermission('user:manage');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass-card border-white/10 p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Team Management</DialogTitle>
                <DialogDescription className="text-sm">
                  Manage workspace members and their access permissions
                </DialogDescription>
              </div>
            </div>
            
            {canManageUsers && (
              <Button 
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="gap-2"
              >
                <UserPlus size={16} />
                Invite Member
              </Button>
            )}
          </div>
        </DialogHeader>

        <AnimatePresence>
          {showInviteForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-white/10 overflow-hidden"
            >
              <div className="p-6 bg-primary/5 space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Mail size={16} />
                  Send Invitation
                </div>
                <div className="grid grid-cols-[1fr,160px,auto] gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Email Address</Label>
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Role</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        {Object.values(ROLE_DEFINITIONS)
                          .filter(r => r.id !== 'owner') // Can't invite owners
                          .map(role => (
                            <SelectItem key={role.id} value={role.id}>
                              <span className="flex items-center gap-2">
                                {React.createElement(RoleIcon[role.id], { size: 14 })}
                                {role.name}
                              </span>
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleInvite} disabled={isInviting}>
                      {isInviting ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ScrollArea className="h-[400px]">
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {workspaceMembers.length} Member{workspaceMembers.length !== 1 ? 's' : ''}
              </p>
              <Badge variant="outline" className={ROLE_DEFINITIONS[currentRole].color}>
                Your Role: {ROLE_DEFINITIONS[currentRole].name}
              </Badge>
            </div>

            {workspaceMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarImage src={member.avatarUrl} />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                      {member.displayName?.substring(0, 2).toUpperCase() || 
                       member.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">
                      {member.displayName || member.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={`${ROLE_DEFINITIONS[member.role].color} border-current/20 bg-current/5`}
                  >
                    {React.createElement(RoleIcon[member.role], { size: 12, className: 'mr-1' })}
                    {ROLE_DEFINITIONS[member.role].name}
                  </Badge>

                  {canEditRoles && member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glass-card border-white/10" align="end">
                        <div className="px-2 py-1.5 text-xs text-muted-foreground font-semibold">
                          Change Role
                        </div>
                        {Object.values(ROLE_DEFINITIONS)
                          .filter(r => r.id !== 'owner' && r.id !== 'guest')
                          .map(role => (
                            <DropdownMenuItem
                              key={role.id}
                              onClick={() => updateMemberRole(member.id, role.id)}
                              className="gap-2"
                            >
                              {React.createElement(RoleIcon[role.id], { size: 14 })}
                              {role.name}
                              {member.role === role.id && (
                                <Check size={14} className="ml-auto text-primary" />
                              )}
                            </DropdownMenuItem>
                          ))
                        }
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem 
                          onClick={() => removeMember(member.id)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 size={14} />
                          Remove from Workspace
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </motion.div>
            ))}

            {workspaceMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">No team members yet</p>
                {canManageUsers && (
                  <Button 
                    variant="link" 
                    className="text-primary mt-2"
                    onClick={() => setShowInviteForm(true)}
                  >
                    Invite your first team member
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="grid grid-cols-5 gap-2">
            {Object.values(ROLE_DEFINITIONS).map(role => (
              <div key={role.id} className="text-center">
                <div className={`w-8 h-8 mx-auto mb-1 rounded-lg bg-white/5 flex items-center justify-center ${role.color}`}>
                  {React.createElement(RoleIcon[role.id], { size: 14 })}
                </div>
                <p className="text-[10px] font-bold">{role.name}</p>
                <p className="text-[8px] text-muted-foreground">{role.permissions.length} perms</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
