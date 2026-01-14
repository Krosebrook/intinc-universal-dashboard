import { useState } from 'react';
import { blink } from '../lib/blink';
import { toast } from 'sonner';
import { Comment } from '../types/dashboard';

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);

  const fetchComments = async (dashboardId: string, widgetId?: string) => {
    try {
      const where: any = { dashboard_id: dashboardId };
      if (widgetId) {
        where.widget_id = widgetId;
      }
      const results = await blink.db.comments.list({ where });
      setComments(results || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const addComment = async (dashboardId: string, content: string, widgetId?: string) => {
    try {
      const user = await blink.auth.me();
      if (!user) return;

      await blink.db.comments.create({
        user_id: user.id,
        dashboard_id: dashboardId,
        widget_id: widgetId || null,
        content
      });
      fetchComments(dashboardId);
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  return {
    comments,
    fetchComments,
    addComment
  };
}
