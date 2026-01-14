import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Comment } from '../../../types/dashboard';

interface DashboardCollaborationProps {
  isVisible: boolean;
  comments: Comment[];
  commentInput: string;
  onCommentInputChange: (value: string) => void;
  onAddComment: () => void;
  onClose: () => void;
}

export function DashboardCollaboration({
  isVisible,
  comments,
  commentInput,
  onCommentInputChange,
  onAddComment,
  onClose,
}: DashboardCollaborationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="col-span-12 lg:col-span-6 space-y-6"
        >
          <div className="glass-card border-white/10 rounded-2xl overflow-hidden flex flex-col h-[800px]">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Collaboration Hub</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {comments.filter(c => !c.widget_id).length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground">No insights yet. Start the conversation!</p>
                  </div>
                ) : (
                  comments.filter(c => !c.widget_id).map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar className="w-8 h-8 border border-white/10">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {comment.user_id?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">User {comment.user_id?.substring(0, 5)}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(comment.created_at).toLocaleTimeString()}</span>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none">
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-white/10 bg-white/5">
              <div className="flex gap-2">
                <Input 
                  placeholder="Type an insight or comment..." 
                  value={commentInput}
                  onChange={(e) => onCommentInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onAddComment()}
                  className="glass border-white/10"
                />
                <Button onClick={onAddComment}>Send</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
