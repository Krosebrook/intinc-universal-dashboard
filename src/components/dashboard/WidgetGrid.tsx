import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, MoreHorizontal, ArrowUpRight, Table as TableIcon, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { toast } from 'react-hot-toast';
import { Layout, Code, XCircle, Filter } from 'lucide-react';
import { useDashboard } from '../../hooks/use-dashboard';

import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

export type WidgetType = 'area' | 'bar' | 'pie' | 'line' | 'stacked-bar' | 'multi-line' | 'gauge' | 'progress' | 'scatter';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  data: any[];
  dataKey: string | string[];
  categoryKey: string;
  gridSpan?: number; // 1-12
  colors?: string[];
  stack?: boolean;
  goal?: number;
  forecast?: boolean;
}

interface WidgetGridProps {
  widgets: WidgetConfig[];
  onUpdate?: (widgets: WidgetConfig[]) => void;
}

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function WidgetGrid({ widgets, onUpdate }: WidgetGridProps) {
  const { 
    globalFilters, 
    setGlobalFilter, 
    clearFilters, 
    comments, 
    addComment, 
    fetchComments,
    savedDashboards,
    department
  } = useDashboard();
  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(null);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [isWidgetDevMode, setIsWidgetDevMode] = useState(false);
  const [widgetJson, setWidgetJson] = useState('');
  const [widgetComment, setWidgetComment] = useState('');

  const currentDashboardId = savedDashboards.find(d => d.department === department)?.id || 'default';

  useEffect(() => {
    if (selectedWidget && currentDashboardId !== 'default') {
      fetchComments(currentDashboardId, selectedWidget.id);
    }
  }, [selectedWidget, currentDashboardId]);

  const handleAddWidgetComment = async () => {
    if (!widgetComment.trim() || !selectedWidget) return;
    await addComment(currentDashboardId, widgetComment, selectedWidget.id);
    setWidgetComment('');
    toast.success('Widget insight added');
  };

  const activeFilterCount = Object.values(globalFilters).filter(Boolean).length;

  const handleDelete = (id: string) => {
    if (onUpdate) {
      onUpdate(widgets.filter(w => w.id !== id));
    }
  };

  const handleEditSave = () => {
    if (editingWidget && onUpdate) {
      if (isWidgetDevMode) {
        try {
          const parsed = JSON.parse(widgetJson);
          onUpdate(widgets.map(w => w.id === editingWidget.id ? parsed : w));
          setEditingWidget(null);
          setIsWidgetDevMode(false);
          toast.success('Widget configuration updated');
        } catch (e) {
          toast.error('Invalid JSON syntax');
        }
      } else {
        onUpdate(widgets.map(w => w.id === editingWidget.id ? editingWidget : w));
        setEditingWidget(null);
        toast.success('Widget updated');
      }
    }
  };

  useEffect(() => {
    if (editingWidget && isWidgetDevMode) {
      setWidgetJson(JSON.stringify(editingWidget, null, 2));
    }
  }, [editingWidget, isWidgetDevMode]);

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between glass-card border-primary/30 bg-primary/5 px-4 py-2 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                <Filter size={14} />
                Active Filters ({activeFilterCount})
              </div>
              <div className="flex gap-2">
                {Object.entries(globalFilters).map(([key, value]) => value && (
                  <div key={key} className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-lg text-xs font-medium border border-white/5">
                    <span className="text-muted-foreground">{key}:</span> {String(value)}
                    <button onClick={() => setGlobalFilter(key, value)} className="hover:text-primary transition-colors">
                      <XCircle size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[10px] font-bold uppercase tracking-widest h-7">
              Clear All
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-12 gap-6">
      {widgets.map((widget, index) => (
        <motion.div
          key={widget.id}
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
                  onClick={() => setSelectedWidget(widget)}
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
                    <DropdownMenuItem onClick={() => setEditingWidget(widget)} className="gap-2">
                      <Edit2 size={14} />
                      Edit Widget
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(widget.id)} className="gap-2 text-destructive focus:text-destructive">
                      <Trash2 size={14} />
                      Remove Widget
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart(widget, globalFilters, setGlobalFilter)}
              </ResponsiveContainer>
              
              <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-1 rounded-full backdrop-blur-sm border border-primary/10">
                  <ArrowUpRight size={10} />
                  Live Data
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <Dialog open={!!selectedWidget} onOpenChange={() => setSelectedWidget(null)}>
        {selectedWidget && (
          <DialogContent className="max-w-6xl glass-card border-white/10 h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 border-b border-white/10 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold">{selectedWidget.title}</DialogTitle>
                  <DialogDescription>{selectedWidget.description}</DialogDescription>
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
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart(selectedWidget, globalFilters, setGlobalFilter)}
                  </ResponsiveContainer>
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
                          <TableHead className="font-bold">{selectedWidget.categoryKey}</TableHead>
                          {Array.isArray(selectedWidget.dataKey) ? (
                            selectedWidget.dataKey.map(key => (
                              <TableHead key={key} className="font-bold">{key}</TableHead>
                            ))
                          ) : (
                            <TableHead className="font-bold">{selectedWidget.dataKey}</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedWidget.data.map((row, i) => (
                          <TableRow key={i} className="hover:bg-white/5 transition-colors">
                            <TableCell className="font-medium">{row[selectedWidget.categoryKey]}</TableCell>
                            {Array.isArray(selectedWidget.dataKey) ? (
                              selectedWidget.dataKey.map(key => (
                                <TableCell key={key}>{row[key]?.toLocaleString()}</TableCell>
                              ))
                            ) : (
                              <TableCell>{row[selectedWidget.dataKey]?.toLocaleString()}</TableCell>
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
                    {comments.filter(c => c.widget_id === selectedWidget.id).length === 0 ? (
                      <div className="text-center py-8 opacity-40">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No widget insights</p>
                      </div>
                    ) : (
                      comments.filter(c => c.widget_id === selectedWidget.id).map((comment) => (
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
                      value={widgetComment}
                      onChange={(e) => setWidgetComment(e.target.value)}
                      className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                    <Button 
                      size="sm" 
                      className="w-full h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                      onClick={handleAddWidgetComment}
                      disabled={!widgetComment.trim()}
                    >
                      Post Insight
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!editingWidget} onOpenChange={() => { setEditingWidget(null); setIsWidgetDevMode(false); }}>
        {editingWidget && (
          <DialogContent className="glass-card border-white/10 max-w-2xl">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0">
              <DialogTitle>Widget Settings</DialogTitle>
              <div className="flex items-center gap-2 mr-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dev Mode</span>
                <Switch 
                  checked={isWidgetDevMode} 
                  onCheckedChange={setIsWidgetDevMode}
                  className="scale-75"
                />
              </div>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {isWidgetDevMode ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Code size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Direct WSL Editor</span>
                  </div>
                  <textarea
                    value={widgetJson}
                    onChange={(e) => setWidgetJson(e.target.value)}
                    className="w-full h-[400px] bg-zinc-950/50 border border-white/10 rounded-xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-primary/50 transition-colors"
                    spellCheck={false}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input 
                      value={editingWidget.title} 
                      onChange={e => setEditingWidget({...editingWidget, title: e.target.value})}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      value={editingWidget.description} 
                      onChange={e => setEditingWidget({...editingWidget, description: e.target.value})}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Chart Type</Label>
                        <Select 
                          value={editingWidget.type} 
                          onValueChange={(val: WidgetType) => setEditingWidget({...editingWidget, type: val})}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="area">Area Chart</SelectItem>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="stacked-bar">Stacked Bar Chart</SelectItem>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="pie">Pie Chart</SelectItem>
                            <SelectItem value="scatter">Scatter Plot</SelectItem>
                            <SelectItem value="gauge">Gauge</SelectItem>
                            <SelectItem value="progress">Progress Bar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Grid Span</Label>
                        <Select 
                          value={String(editingWidget.gridSpan || 6)} 
                          onValueChange={(val) => setEditingWidget({...editingWidget, gridSpan: parseInt(val)})}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="4">Small (1/3)</SelectItem>
                            <SelectItem value="6">Medium (1/2)</SelectItem>
                            <SelectItem value="8">Large (2/3)</SelectItem>
                            <SelectItem value="12">Full Width</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <Switch 
                          id="forecast-mode" 
                          checked={editingWidget.forecast} 
                          onCheckedChange={(val) => setEditingWidget({...editingWidget, forecast: val})}
                        />
                        <Label htmlFor="forecast-mode">Enable AI Forecast</Label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Live Preview</Label>
                      <div className="h-[180px] w-full border border-white/10 rounded-xl bg-white/5 overflow-hidden flex items-center justify-center p-2">
                        <ResponsiveContainer width="100%" height="100%">
                          {renderChart(editingWidget, globalFilters, setGlobalFilter)}
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center">Changes reflect instantly in the builder</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditingWidget(null); setIsWidgetDevMode(false); }} className="glass">Cancel</Button>
              <Button onClick={handleEditSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-950 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-white/70 font-medium">{item.name}</span>
              </div>
              <span className="text-xs font-bold text-white">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function renderChart(widget: WidgetConfig, globalFilters: Record<string, any>, setGlobalFilter: (key: string, value: any) => void) {
  const colors = widget.colors || DEFAULT_COLORS;
  const dataKeys = Array.isArray(widget.dataKey) ? widget.dataKey : [widget.dataKey];
  const activeFilterCount = Object.values(globalFilters).filter(Boolean).length;
  
  // Filter data based on global filters (excluding filters that belong to this widget's categoryKey to allow drill-down selection)
  const filteredData = widget.data.filter(item => {
    return Object.entries(globalFilters).every(([key, value]) => {
      if (!value || key === widget.categoryKey) return true;
      return String(item[key]) === String(value);
    });
  });

  // Forecast processing: split data into actual and forecast if requested
  const chartData = widget.forecast ? filteredData.map((d, i) => ({
    ...d,
    // If it's the last 30% of data, it's forecast
    isForecast: i > filteredData.length * 0.7
  })) : filteredData;

  const handleClick = (data: any) => {
    if (data && data.activeLabel) {
      setGlobalFilter(widget.categoryKey, data.activeLabel);
    } else if (data && data.name) {
      setGlobalFilter(widget.categoryKey, data.name);
    } else if (data && data.payload && data.payload[widget.categoryKey]) {
      setGlobalFilter(widget.categoryKey, data.payload[widget.categoryKey]);
    }
  };

  switch (widget.type) {
    case 'area':
      return (
        <AreaChart data={chartData} onClick={handleClick}>
          <defs>
            {dataKeys.map((key, i) => (
              <linearGradient key={key} id={`gradient-${widget.id}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
          <XAxis 
            dataKey={widget.categoryKey} 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          {dataKeys.map((key, i) => {
            const isAnySelected = !!globalFilters[widget.categoryKey];
            return (
              <Area 
                key={key}
                type="monotone" 
                dataKey={key} 
                stroke={colors[i % colors.length]} 
                fillOpacity={isAnySelected ? 0.2 : 1} 
                fill={`url(#gradient-${widget.id}-${i})`} 
                strokeWidth={2} 
                strokeDasharray={widget.forecast ? "5 5" : undefined}
                stackId={widget.stack ? "1" : undefined}
              />
            );
          })}
        </AreaChart>
      );
    case 'bar':
    case 'stacked-bar':
      return (
        <BarChart data={chartData} onClick={handleClick}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
          <XAxis dataKey={widget.categoryKey} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: '#ffffff05' }} content={<CustomTooltip />} />
          {widget.type === 'stacked-bar' && <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />}
          {dataKeys.map((key, i) => {
            return (
              <Bar 
                key={key}
                dataKey={key} 
                stackId={widget.type === 'stacked-bar' ? "a" : undefined}
              >
                {chartData.map((entry, index) => {
                  const isSelected = globalFilters[widget.categoryKey] === entry[widget.categoryKey];
                  const hasOtherSelection = !!globalFilters[widget.categoryKey] && !isSelected;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[i % colors.length]} 
                      opacity={hasOtherSelection ? 0.3 : 1}
                      radius={widget.type === 'bar' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  );
                })}
              </Bar>
            );
          })}
        </BarChart>
      );
    case 'pie':
      return (
        <PieChart>
          <Pie
            data={widget.data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey={dataKeys[0]}
            nameKey={widget.categoryKey}
            onClick={(data) => setGlobalFilter(widget.categoryKey, data.name)}
          >
            {widget.data.map((entry, index) => {
              const isSelected = globalFilters[widget.categoryKey] === entry[widget.categoryKey];
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                  stroke={isSelected ? "white" : "rgba(255,255,255,0.05)"}
                  strokeWidth={isSelected ? 2 : 1}
                  opacity={activeFilterCount > 0 && !isSelected && globalFilters[widget.categoryKey] ? 0.3 : 1}
                />
              );
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      );
    case 'line':
    case 'multi-line':
      return (
        <LineChart data={chartData} onClick={handleClick}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
          <XAxis dataKey={widget.categoryKey} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {dataKeys.map((key, i) => (
            <Line 
              key={key}
              type="monotone" 
              dataKey={key} 
              stroke={colors[i % colors.length]} 
              strokeWidth={3} 
              strokeDasharray={widget.forecast ? "5 5" : undefined}
              dot={{ r: 4, fill: colors[i % colors.length], strokeWidth: 2, stroke: '#09090b' }} 
              activeDot={{ r: 6, strokeWidth: 0 }} 
            />
          ))}
        </LineChart>
      );
    case 'scatter':
      return (
        <ScatterChart data={chartData} onClick={handleClick}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
          <XAxis dataKey={widget.categoryKey} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <ZAxis type="number" range={[60, 400]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          {dataKeys.map((key, i) => (
            <Scatter 
              key={key} 
              name={key} 
              data={widget.data} 
              fill={colors[i % colors.length]} 
            />
          ))}
        </ScatterChart>
      );
    case 'gauge': {
      const value = widget.data[0][dataKeys[0]];
      const goal = widget.goal || 100;
      const percentage = Math.min(100, (value / goal) * 100);
      const gaugeData = [
        { name: 'Value', value: percentage },
        { name: 'Remaining', value: 100 - percentage }
      ];
      return (
        <div className="flex flex-col items-center justify-center h-full pt-4">
          <PieChart width={240} height={120}>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={colors[0]} />
              <Cell fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
          <div className="text-center -mt-4">
            <div className="text-3xl font-bold">{value.toLocaleString()}{widget.dataKey === 'percentage' ? '%' : ''}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Goal: {goal.toLocaleString()}
            </div>
          </div>
        </div>
      );
    }
    case 'progress': {
      const value = widget.data[0][dataKeys[0]];
      const goal = widget.goal || 100;
      const percentage = Math.min(100, (value / goal) * 100);
      return (
        <div className="flex flex-col justify-center h-full px-4 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold">{value.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">Goal: {goal.toLocaleString()}</span>
            </div>
            <Progress value={percentage} className="h-3 bg-white/5" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-3 border-white/5 bg-white/5 rounded-xl">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Completion</div>
              <div className="text-lg font-bold text-indigo-400">{percentage.toFixed(1)}%</div>
            </div>
            <div className="glass-card p-3 border-white/5 bg-white/5 rounded-xl">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Remaining</div>
              <div className="text-lg font-bold text-emerald-400">{(goal - value).toLocaleString()}</div>
            </div>
          </div>
        </div>
      );
    }
    default:
      return <div>Unsupported chart type</div>;
  }
}
