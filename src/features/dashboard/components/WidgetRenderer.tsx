import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Progress } from '../../../components/ui/progress';
import { WidgetConfig, WidgetType } from '../../../types/dashboard';

interface WidgetRendererProps {
  widget: WidgetConfig;
  globalFilters: Record<string, any>;
  setGlobalFilter: (key: string, value: any) => void;
  localInputs?: Record<string, any>;
}

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

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

export function WidgetRenderer({ widget, globalFilters, setGlobalFilter, localInputs = {} }: WidgetRendererProps) {
  const colors = widget.colors || DEFAULT_COLORS;
  let dataKeys = Array.isArray(widget.dataKey) ? widget.dataKey : [widget.dataKey];
  
  // Phase 6.2: Handle dataKey overrides from inputs (e.g., modelVersion)
  if (localInputs.modelVersion && localInputs.modelVersion !== 'all') {
    dataKeys = [localInputs.modelVersion];
  } else if (localInputs.cluster) {
    dataKeys = [localInputs.cluster];
  }

  const activeFilterCount = Object.values(globalFilters).filter(Boolean).length;

  const filteredData = widget.data.filter(item => {
    // Apply global filters
    const passGlobal = Object.entries(globalFilters).every(([key, value]) => {
      if (!value || key === widget.categoryKey) return true;
      return String(item[key]) === String(value);
    });

    if (!passGlobal) return false;

    // Apply local widget inputs (Phase 6.2)
    return Object.entries(localInputs).every(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === 'all') return true;
      if (typeof value === 'boolean') return true; // Handled by visualization logic usually
      return String(item[key]) === String(value);
    });
  });

  const isForecastEnabled = localInputs.showForecast ?? widget.forecast;
  const chartData = isForecastEnabled ? filteredData.map((d, i) => ({
    ...d,
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

  const renderChart = () => {
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
            <XAxis dataKey={widget.categoryKey} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
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
            {dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} stackId={widget.type === 'stacked-bar' ? "a" : undefined}>
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
            ))}
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={widget.data}
              cx="50%" cy="50%"
              innerRadius={60} outerRadius={80}
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
            {widget.type === 'multi-line' && <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />}
            {dataKeys.map((key, i) => (
              <Line 
                key={key}
                type="monotone" dataKey={key} 
                stroke={colors[i % colors.length]} 
                strokeWidth={3} 
                strokeDasharray={widget.forecast ? "5 5" : undefined}
                dot={{ r: 4, fill: colors[i % colors.length], strokeWidth: 2, stroke: '#09090b' }} 
                activeDot={{ r: 6, strokeWidth: 0 }} 
                name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              />
            ))}
          </LineChart>
        );
      case 'scatter': {
        const xKey = dataKeys[0];
        const yKey = dataKeys[1] || dataKeys[0];
        const zKey = dataKeys[2];
        return (
          <ScatterChart onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
            <XAxis type="number" dataKey={xKey} name={xKey} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis type="number" dataKey={yKey} name={yKey} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            {zKey && <ZAxis type="number" dataKey={zKey} range={[64, 144]} name={zKey} />}
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name={widget.title} data={chartData} fill={colors[0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        );
      }
      case 'gauge': {
        const value = widget.data[0][dataKeys[0]];
        const goal = widget.goal || 100;
        const percentage = Math.min(100, (value / goal) * 100);
        return (
          <div className="flex flex-col items-center justify-center h-full pt-4">
            <PieChart width={240} height={120}>
              <Pie
                data={[{ name: 'Value', value: percentage }, { name: 'Remaining', value: 100 - percentage }]}
                cx="50%" cy="100%" startAngle={180} endAngle={0}
                innerRadius={70} outerRadius={90} paddingAngle={0} dataKey="value"
              >
                <Cell fill={colors[0]} />
                <Cell fill="rgba(255,255,255,0.05)" />
              </Pie>
            </PieChart>
            <div className="text-center -mt-4">
              <div className="text-3xl font-bold">{value.toLocaleString()}{widget.dataKey === 'percentage' ? '%' : ''}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Goal: {goal.toLocaleString()}</div>
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
          </div>
        );
      }
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  );
}
