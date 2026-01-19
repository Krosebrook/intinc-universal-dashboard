import React from 'react';
import { logger } from '../../../lib/logger';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import html2canvas from 'html2canvas';
import { 
  Maximize2, 
  MoreHorizontal, 
  ArrowUpRight, 
  Trash2, 
  Edit2, 
  GripVertical, 
  Activity, 
  Layout, 
  ChevronRight,
  Copy,
  Download,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from '../../../components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { WidgetConfig } from '../../../types/dashboard';
import { WidgetRenderer } from './WidgetRenderer';
import { useWidgetApi } from '../../../hooks/use-widget-api';
import { useRBAC } from '../../../hooks/use-rbac';
import { cn } from '../../../lib/utils';

interface WidgetCardProps {
  widget: WidgetConfig;
  index: number;
  globalFilters: Record<string, any>;
  setGlobalFilter: (key: string, value: any) => void;
  onSelect: (widget: WidgetConfig) => void;
  onEdit: (widget: WidgetConfig) => void;
  onDelete: (id: string) => void;
  onResize: (id: string, span: number) => void;
  onDuplicate: (widget: WidgetConfig) => void;
}

export function WidgetCard({
  widget,
  index,
  globalFilters,
  setGlobalFilter,
  onSelect,
  onEdit,
  onDelete,
  onResize,
  onDuplicate,
}: WidgetCardProps) {
  const { inputs, setInput } = useWidgetApi(widget.id);
  const { hasPermission } = useRBAC();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleExportImage = async () => {
    const element = document.getElementById(`widget-${widget.id}`);
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          backgroundColor: '#09090b',
          scale: 2,
          useCORS: true,
          logging: false,
        });
        const link = document.createElement('a');
        link.download = `${widget.title.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Widget exported as image');
      } catch (error) {
        logger.error('Export failed:', error as Error);
        toast.error('Failed to export widget image');
      }
    }
  };

  const handleDuplicate = () => {
    if (!hasPermission('widget:create')) {
      toast.error('Permission denied: widget:create');
      return;
    }
    const newWidget = {
      ...widget,
      id: `widget-${Date.now()}`,
      title: `${widget.title} (Copy)`,
    };
    onDuplicate(newWidget);
  };

  const resizeOptions = [
    { label: 'Quarter Width', span: 3 },
    { label: 'Third Width', span: 4 },
    { label: 'Half Width', span: 6 },
    { label: 'Two-Thirds', span: 8 },
    { label: 'Full Width', span: 12 },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={getGridSpan(widget.gridSpan)}
    >
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
        className="h-full"
      >
        <Card 
          id={`widget-${widget.id}`}
          className="glass-card h-full group relative overflow-hidden flex flex-col border-white/10 hover:border-primary/50 transition-colors"
        >
          {/* Subtle hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0 relative">
            <div className="flex items-center gap-2 flex-1 pr-4">
              <div 
                {...(hasPermission('dashboard:edit') ? attributes : {})} 
                {...(hasPermission('dashboard:edit') ? listeners : {})} 
                className={cn(
                  "p-1 -ml-1 rounded-md transition-colors text-muted-foreground/50",
                  hasPermission('dashboard:edit') 
                    ? "cursor-grab active:cursor-grabbing hover:bg-white/10 hover:text-foreground" 
                    : "cursor-not-allowed opacity-50"
                )}
              >
                <GripVertical size={16} />
              </div>
              <div className="space-y-1.5 flex-1">
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
                  <DropdownMenuItem 
                    onClick={() => hasPermission('widget:edit') && onEdit(widget)} 
                    disabled={!hasPermission('widget:edit')}
                    className="gap-2 focus:bg-primary/10 cursor-pointer disabled:opacity-50"
                  >
                    <Edit2 size={14} />
                    Edit Configuration {!hasPermission('widget:edit') && '(Admin Only)'}
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={() => hasPermission('widget:create') && handleDuplicate()} 
                    disabled={!hasPermission('widget:create')}
                    className="gap-2 focus:bg-primary/10 cursor-pointer disabled:opacity-50"
                  >
                    <Copy size={14} />
                    Duplicate Widget {!hasPermission('widget:create') && '(Admin Only)'}
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleExportImage} className="gap-2 focus:bg-primary/10 cursor-pointer">
                    <Download size={14} />
                    Export as Image
                  </DropdownMenuItem>
                  
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger 
                      disabled={!hasPermission('dashboard:edit')}
                      className="gap-2 focus:bg-primary/10 disabled:opacity-50"
                    >
                      <Layout size={14} />
                      Adjust Width {!hasPermission('dashboard:edit') && '(Admin Only)'}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="glass-card border-white/10 min-w-[140px]">
                        {resizeOptions.map((opt) => (
                          <DropdownMenuItem 
                            key={opt.span} 
                            onClick={() => onResize(widget.id, opt.span)}
                            className={`flex items-center justify-between gap-4 cursor-pointer focus:bg-primary/10 ${widget.gridSpan === opt.span ? 'bg-primary/5 text-primary' : ''}`}
                          >
                            {opt.label}
                            <span className="text-[10px] opacity-50 font-mono">col-{opt.span}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator className="bg-white/5" />
                  
                  <DropdownMenuItem 
                    onClick={() => hasPermission('widget:delete') && onDelete(widget.id)} 
                    disabled={!hasPermission('widget:delete')}
                    className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Remove from Dashboard {!hasPermission('widget:delete') && '(Admin Only)'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          {/* Widget Inputs (Phase 6.2) */}
          {widget.inputs && widget.inputs.length > 0 && (
            <div className="px-6 py-2 border-y border-white/5 bg-white/[0.02] flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                <Filter size={10} />
                Widget Parameters
              </div>
              <div className="flex flex-wrap gap-3">
                {widget.inputs.map((input) => (
                  <div key={input.id} className="flex items-center gap-2">
                    {input.type === 'select' && (
                      <Select 
                        value={inputs[input.id]} 
                        onValueChange={(val) => setInput(input.id, val)}
                      >
                        <SelectTrigger className="h-7 min-w-[100px] text-[10px] bg-white/5 border-white/10">
                          <SelectValue placeholder={input.placeholder || input.label} />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/10">
                          {input.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-[10px]">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {input.type === 'toggle' && (
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`toggle-${widget.id}-${input.id}`} className="text-[10px] uppercase tracking-wider opacity-60">
                          {input.label}
                        </Label>
                        <Switch 
                          id={`toggle-${widget.id}-${input.id}`}
                          checked={inputs[input.id]} 
                          onCheckedChange={(val) => setInput(input.id, val)}
                        />
                      </div>
                    )}
                    {input.type === 'text' && (
                      <Input 
                        placeholder={input.placeholder || input.label}
                        value={inputs[input.id] || ''}
                        onChange={(e) => setInput(input.id, e.target.value)}
                        className="h-7 text-[10px] bg-white/5 border-white/10 max-w-[120px]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <CardContent className="flex-1 min-h-[300px] mt-2 relative flex flex-col">
            <div className="flex-1 relative">
              <WidgetRenderer 
                widget={widget} 
                globalFilters={globalFilters} 
                setGlobalFilter={setGlobalFilter}
                localInputs={inputs}
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
    </div>
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