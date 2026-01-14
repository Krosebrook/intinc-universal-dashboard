import React from 'react';
import { Maximize2, Table as TableIcon, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '../../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { WidgetConfig, Comment } from '../../../types/dashboard';
import { WidgetRenderer } from './WidgetRenderer';

interface WidgetDrilldownProps {
  widget: WidgetConfig | null;
  onClose: () => void;
  globalFilters: Record<string, any>;
  setGlobalFilter: (key: string, value: any) => void;
  comments: Comment[];
  onAddComment: (content: string) => void;
  commentInput: string;
  onCommentInputChange: (value: string) => void;
}

export function WidgetDrilldown({
  widget,
  onClose,
  globalFilters,
  setGlobalFilter,
  comments,
  onAddComment,
  commentInput,
  onCommentInputChange,
}: WidgetDrilldownProps) {
  if (!widget) return null;

  return (
    <Dialog open={!!widget} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl glass-card border-white/10 h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{widget.title}</DialogTitle>
              <DialogDescription>{widget.description}</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
                <Maximize2 size={10} />
                Drill-down Mode
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="flex-1 min-h-[400px]">
              <WidgetRenderer 
                widget={widget} 
                globalFilters={globalFilters} 
                setGlobalFilter={setGlobalFilter} 
              />
            </div>
            
            <Separator className="my-6 bg-white/10" />
            
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 text-sm font-semibold mb-4">
                <TableIcon size={16} className="text-primary" />
                Data Explorer
              </div>
              <ScrollArea className="flex-1 rounded-xl border border-white/5">
                <Table>
                  <TableHeader className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                    <TableRow>
                      <TableHead className="font-bold">{widget.categoryKey}</TableHead>
                      {Array.isArray(widget.dataKey) ? (
                        widget.dataKey.map(key => (
                          <TableHead key={key} className="font-bold">{key}</TableHead>
                        ))
                      ) : (
                        <TableHead className="font-bold">{widget.dataKey}</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {widget.data.map((row, i) => (
                      <TableRow key={i} className="hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium">{row[widget.categoryKey]}</TableCell>
                        {Array.isArray(widget.dataKey) ? (
                          widget.dataKey.map(key => (
                            <TableCell key={key}>{row[key]?.toLocaleString()}</TableCell>
                          ))
                        ) : (
                          <TableCell>{row[widget.dataKey]?.toLocaleString()}</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>

          <div className="w-80 border-l border-white/10 bg-white/2 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold uppercase tracking-widest">Widget Insights</h4>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {comments.filter(c => c.widget_id === widget.id).length === 0 ? (
                  <div className="text-center py-8 opacity-40">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No widget insights</p>
                  </div>
                ) : (
                  comments.filter(c => c.widget_id === widget.id).map((comment) => (
                    <div key={comment.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5 border border-white/10">
                          <AvatarFallback className="bg-primary/20 text-primary text-[8px]">
                            {comment.user_id?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] font-bold text-white/70">
                          {comment.user_id?.substring(0, 5)}
                        </span>
                        <span className="text-[8px] text-white/30 ml-auto">
                          {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/90 leading-relaxed">
                        {comment.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/10 bg-white/5 mt-auto">
              <div className="space-y-2">
                <textarea 
                  placeholder="Add an insight..." 
                  value={commentInput}
                  onChange={(e) => onCommentInputChange(e.target.value)}
                  className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
                <Button 
                  size="sm" 
                  className="w-full h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                  onClick={() => onAddComment(commentInput)}
                  disabled={!commentInput.trim()}
                >
                  Post Insight
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
