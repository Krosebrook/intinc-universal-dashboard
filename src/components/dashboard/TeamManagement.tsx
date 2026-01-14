/**
 * Team Management Component
 * Full team management with invite, role assignment, and member management
 */

// DEPRECATED: use src/features/dashboard/components/TeamManagement.tsx instead.
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { useRBAC } from '../../hooks/use-rbac';
import { Role, ROLE_DEFINITIONS } from '../../types/rbac';
import { toast } from 'sonner';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreHorizontal,
  Trash2,
  Crown,
  Edit2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface TeamManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
}

export default function TeamManagement({ open, onOpenChange, workspaceId = 'default' }: TeamManagementProps) {
  const { 
    workspaceMembers, 
    inviteMember, 
    updateMemberRole, 
    removeMember, 
    fetchWorkspaceMembers,
    hasPermission 
  } = useRBAC();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('viewer');
  const [isInviting, setIsInviting] = useState(false);

  // Fetch members when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchWorkspaceMembers(workspaceId);
    }
  }, [open, workspaceId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsInviting(true);
    try {
      await inviteMember(inviteEmail, inviteRole, workspaceId);
      setInviteEmail('');
      setInviteRole('viewer');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    await updateMemberRole(memberId, newRole);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member from the workspace?')) {
      await removeMember(memberId);
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'owner': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'editor': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'viewer': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const canManageUsers = hasPermission('user:manage');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 glass-card border-white/10">
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            Team Management
          </DialogTitle>
          <DialogDescription>
            Invite team members and manage their roles and permissions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Invite Section */}
            {canManageUsers && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus size={18} />
                    Invite Team Member
                  </CardTitle>
                  <CardDescription>Send an invitation to join your workspace.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <Select value={inviteRole} onValueChange={(v: Role) => setInviteRole(v)}>
                      <SelectTrigger className="w-32 bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleInvite} disabled={isInviting}>
                      {isInviting ? 'Sending...' : 'Send Invite'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Members List */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield size={18} />
                    Team Members
                  </span>
                  <Badge variant="secondary" className="font-normal">
                    {workspaceMembers.length} member{workspaceMembers.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
                <CardDescription>Manage team members and their access levels.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {workspaceMembers.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-white/10 text-center">
                    <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No team members yet.</p>
                  </div>
                ) : (
                  workspaceMembers.map((member) => (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10 border border-white/10">
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {(member.displayName || member.email).substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {member.displayName || 'Unknown User'}
                            {member.role === 'owner' && (
                              <Crown size={14} className="text-yellow-500" />
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail size={12} />
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={`${getRoleBadgeColor(member.role)} capitalize`}>
                          {member.role}
                        </Badge>

                        {canManageUsers && member.role !== 'owner' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="glass-card border-white/10" align="end">
                              <DropdownMenuItem 
                                onClick={() => handleRoleChange(member.id, 'viewer')}
                                className="gap-2"
                              >
                                <Edit2 size={14} />
                                Change to Viewer
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRoleChange(member.id, 'editor')}
                                className="gap-2"
                              >
                                <Edit2 size={14} />
                                Change to Editor
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRoleChange(member.id, 'admin')}
                                className="gap-2"
                              >
                                <Edit2 size={14} />
                                Change to Admin
                              </DropdownMenuItem>
                              <Separator className="bg-white/10 my-1" />
                              <DropdownMenuItem 
                                onClick={() => handleRemoveMember(member.id)}
                                className="gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 size={14} />
                                Remove from Team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Role Permissions Reference */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Role Permissions</CardTitle>
                <CardDescription>Understanding what each role can do.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(ROLE_DEFINITIONS).map(([role, def]) => (
                    <div key={role} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getRoleBadgeColor(role as Role)} capitalize`}>
                          {role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{def.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {def.permissions.slice(0, 3).map(perm => (
                          <Badge key={perm} variant="outline" className="text-[10px]">
                            {perm}
                          </Badge>
                        ))}
                        {def.permissions.length > 3 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{def.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t border-white/10">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="glass">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
