import { useState, useEffect } from 'react';
import { blink } from '../lib/blink';
import { toast } from 'react-hot-toast';
import { Workspace } from '../types/dashboard';
import { BlinkUser } from '@blinkdotnew/sdk';

export function useWorkspaces(currentUser: BlinkUser | null) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const fetchWorkspaces = async () => {
    try {
      const results = await blink.db.workspaces.list();
      setWorkspaces(results || []);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const createWorkspace = async (name: string) => {
    try {
      const user = await blink.auth.me();
      if (!user) return;

      await blink.db.workspaces.create({
        user_id: user.id,
        owner_id: user.id,
        name
      });
      fetchWorkspaces();
      toast.success('Workspace created');
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace');
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchWorkspaces();
    }
  }, [currentUser?.id]);

  return {
    workspaces,
    createWorkspace,
    fetchWorkspaces
  };
}
