import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
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

export type WidgetType = 'area' | 'bar' | 'pie' | 'line' | 'stacked-bar' | 'multi-line';

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
}

interface WidgetGridProps {
  widgets: WidgetConfig[];
  onUpdate?: (widgets: WidgetConfig[]) => void;
}

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function WidgetGrid({ widgets, onUpdate }: WidgetGridProps) {
  const [selectedWidget, setSelectedWidget] = useState<WidgetConfig | null>(null);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);

  const handleDelete = (id: string) => {
    if (onUpdate) {
      onUpdate(widgets.filter(w => w.id !== id));
    }
  };

  const handleEditSave = () => {
    if (editingWidget && onUpdate) {
      onUpdate(widgets.map(w => w.id === editingWidget.id ? editingWidget : w));
      setEditingWidget(null);
    }
  };

  return (
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
                {renderChart(widget)}
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
          <DialogContent className="max-w-4xl glass-card border-white/10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedWidget.title}</DialogTitle>
              <DialogDescription>{selectedWidget.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart(selectedWidget)}
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <TableIcon size={16} />
                  Raw Data Explorer
                </div>
                <div className="rounded-xl border border-white/5 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow>
                        <TableHead>{selectedWidget.categoryKey}</TableHead>
                        {Array.isArray(selectedWidget.dataKey) ? (
                          selectedWidget.dataKey.map(key => (
                            <TableHead key={key}>{key}</TableHead>
                          ))
                        ) : (
                          <TableHead>{selectedWidget.dataKey}</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedWidget.data.slice(0, 5).map((row, i) => (
                        <TableRow key={i} className="hover:bg-white/5 transition-colors">
                          <TableCell className="font-medium">{row[selectedWidget.categoryKey]}</TableCell>
                          {Array.isArray(selectedWidget.dataKey) ? (
                            selectedWidget.dataKey.map(key => (
                              <TableCell key={key}>{row[key]}</TableCell>
                            ))
                          ) : (
                            <TableCell>{row[selectedWidget.dataKey]}</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!editingWidget} onOpenChange={() => setEditingWidget(null)}>
        {editingWidget && (
          <DialogContent className="glass-card border-white/10">
            <DialogHeader>
              <DialogTitle>Edit Widget Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingWidget(null)} className="glass">Cancel</Button>
              <Button onClick={handleEditSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
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

function renderChart(widget: WidgetConfig) {
  const colors = widget.colors || DEFAULT_COLORS;
  const dataKeys = Array.isArray(widget.dataKey) ? widget.dataKey : [widget.dataKey];
  
  switch (widget.type) {
    case 'area':
      return (
        <AreaChart data={widget.data}>
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
          {dataKeys.map((key, i) => (
            <Area 
              key={key}
              type="monotone" 
              dataKey={key} 
              stroke={colors[i % colors.length]} 
              fillOpacity={1} 
              fill={`url(#gradient-${widget.id}-${i})`} 
              strokeWidth={2} 
              stackId={widget.stack ? "1" : undefined}
            />
          ))}
        </AreaChart>
      );
    case 'bar':
    case 'stacked-bar':
      return (
        <BarChart data={widget.data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
          <XAxis dataKey={widget.categoryKey} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: '#ffffff05' }} content={<CustomTooltip />} />
          {widget.type === 'stacked-bar' && <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />}
          {dataKeys.map((key, i) => (
            <Bar 
              key={key}
              dataKey={key} 
              fill={colors[i % colors.length]} 
              radius={widget.type === 'bar' ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
              stackId={widget.type === 'stacked-bar' ? "a" : undefined}
            />
          ))}
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
          >
            {widget.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="rgba(255,255,255,0.05)" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      );
    case 'line':
    case 'multi-line':
      return (
        <LineChart data={widget.data}>
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
              dot={{ r: 4, fill: colors[i % colors.length], strokeWidth: 2, stroke: '#09090b' }} 
              activeDot={{ r: 6, strokeWidth: 0 }} 
            />
          ))}
        </LineChart>
      );
    default:
      return <div>Unsupported chart type</div>;
  }
}
