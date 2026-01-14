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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
      className={getGridSpan(widget.gridSpan)}
    >
      <Card className="glass-card h-full group">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
              {widget.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs leading-relaxed">
              {widget.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg hover:bg-white/5"
              onClick={() => onSelect(widget)}
            >
              <Maximize2 size={14} className="text-muted-foreground" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5">
                  <MoreHorizontal size={14} className="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-card border-white/10">
                <DropdownMenuItem onClick={() => onEdit(widget)} className="gap-2">
                  <Edit2 size={14} />
                  Edit Widget
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(widget.id)} className="gap-2 text-destructive focus:text-destructive">
                  <Trash2 size={14} />
                  Remove Widget
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="h-[300px] mt-2 relative">
          <WidgetRenderer 
            widget={widget} 
            globalFilters={globalFilters} 
            setGlobalFilter={setGlobalFilter} 
          />
          
          <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-1 rounded-full backdrop-blur-sm border border-primary/10">
              <ArrowUpRight size={10} />
              Live Data
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
