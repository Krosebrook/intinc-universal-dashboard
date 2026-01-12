import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { motion } from 'framer-motion';

export type WidgetType = 'area' | 'bar' | 'pie' | 'line';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  data: any[];
  dataKey: string;
  categoryKey: string;
  gridSpan?: number; // 1-12
  colors?: string[];
}

interface WidgetGridProps {
  widgets: WidgetConfig[];
}

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function WidgetGrid({ widgets }: WidgetGridProps) {
  return (
    <div className="grid grid-cols-12 gap-6">
      {widgets.map((widget, index) => (
        <motion.div
          key={widget.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
          className={getGridSpan(widget.gridSpan)}
        >
          <Card className="glass-card h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold tracking-tight">{widget.title}</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">{widget.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart(widget)}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function getGridSpan(span?: number) {
  if (!span) return "col-span-12 lg:col-span-6";
  if (span === 12) return "col-span-12";
  if (span === 6) return "col-span-12 lg:col-span-6";
  if (span === 4) return "col-span-12 lg:col-span-4";
  return `col-span-12 lg:col-span-${span}`;
}

function renderChart(widget: WidgetConfig) {
  const colors = widget.colors || DEFAULT_COLORS;
  
  switch (widget.type) {
    case 'area':
      return (
        <AreaChart data={widget.data}>
          <defs>
            <linearGradient id={`gradient-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
          <XAxis dataKey={widget.categoryKey} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
            itemStyle={{ color: '#fff', fontSize: '12px' }}
          />
          <Area type="monotone" dataKey={widget.dataKey} stroke={colors[0]} fillOpacity={1} fill={`url(#gradient-${widget.id})`} strokeWidth={2} />
        </AreaChart>
      );
    case 'bar':
      return (
        <BarChart data={widget.data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
          <XAxis dataKey={widget.categoryKey} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: '#ffffff05' }}
            contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff1a', borderRadius: '12px' }}
          />
          <Bar dataKey={widget.dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
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
            dataKey={widget.dataKey}
            nameKey={widget.categoryKey}
          >
            {widget.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="rgba(255,255,255,0.1)" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff1a', borderRadius: '12px' }}
          />
        </PieChart>
      );
    case 'line':
      return (
        <LineChart data={widget.data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
          <XAxis dataKey={widget.categoryKey} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff1a', borderRadius: '12px' }}
          />
          <Line type="monotone" dataKey={widget.dataKey} stroke={colors[0]} strokeWidth={3} dot={{ r: 4, fill: colors[0], strokeWidth: 2, stroke: '#09090b' }} activeDot={{ r: 6, strokeWidth: 0 }} />
        </LineChart>
      );
  }
}
