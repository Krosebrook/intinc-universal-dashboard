import React from 'react';
import { motion } from 'framer-motion';
import { Maximize2, MoreHorizontal, ArrowUpRight, Trash2, Edit2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import { WidgetConfig } from '../../../types/dashboard';
import { WidgetRenderer } from './WidgetRenderer';

interface WidgetCardProps {
  widget: WidgetConfig;
  index: number;
  globalFilters: Record<string, any>;
  setGlobalFilter: (key: string, value: any) => void;
  onSelect: (widget: WidgetConfig) => void;
  onEdit: (widget: WidgetConfig) => void;
  onDelete: (id: string) => void;
}

export function WidgetCard({
  widget,
  index,
  globalFilters,
  setGlobalFilter,
  onSelect,
  onEdit,
  onDelete,
}: WidgetCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        damping: 25,
        stiffness: 120,
        delay: index * 0.05 
      }}
      className={getGridSpan(widget.gridSpan)}
    >
      <Card className="glass-card h-full group relative overflow-hidden flex flex-col">
        {/* Subtle hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
          <div className="space-y-1.5 flex-1 pr-4">
            <CardTitle className="text-lg font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors flex items-center gap-2">
              {widget.title}
              {widget.type === 'kpi' && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              )}
            </CardTitle>
            <CardDescription className="text-muted-foreground/70 text-[11px] leading-relaxed line-clamp-2">
              {widget.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg hover:bg-white/[0.08] text-muted-foreground hover:text-foreground transition-all"
              onClick={() => onSelect(widget)}
            >
              <Maximize2 size={14} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/[0.08] text-muted-foreground hover:text-foreground transition-all">
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-card border-white/10" align="end">
                <DropdownMenuItem onClick={() => onEdit(widget)} className="gap-2 focus:bg-primary/10 cursor-pointer">
                  <Edit2 size={14} />
                  Edit Configuration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(widget.id)} className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  <Trash2 size={14} />
                  Remove from Dashboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-[300px] mt-2 relative flex flex-col">
          <div className="flex-1 relative">
            <WidgetRenderer 
              widget={widget} 
              globalFilters={globalFilters} 
              setGlobalFilter={setGlobalFilter} 
            />
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              <Activity size={10} className="text-primary/60" />
              Real-time Analysis
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary/80 bg-primary/10 px-2 py-1 rounded-full border border-primary/20 shadow-sm shadow-primary/5 transition-transform group-hover:scale-105">
              <ArrowUpRight size={10} />
              Active
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getGridSpan(span?: number) {
  if (!span) return "col-span-12 lg:col-span-6";
  if (span === 12) return "col-span-12";
  if (span === 6) return "col-span-12 lg:col-span-6";
  if (span === 4) return "col-span-12 lg:col-span-4";
  if (span === 8) return "col-span-12 lg:col-span-8";
  return `col-span-12 lg:col-span-${span}`;
}
