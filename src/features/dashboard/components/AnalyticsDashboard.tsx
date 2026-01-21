import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../../hooks/use-dashboard';
import { useStatistics } from '../../../hooks/use-statistics';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, ScatterChart, Scatter, ZAxis, LineChart, Line, Legend
} from 'recharts';
import { Brain, Sigma, TrendingUp, BarChart3, Binary, Info } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';

export function AnalyticsDashboard() {
  const { widgets, department } = useDashboard();
  
  // Aggregate all numeric data from widgets for analysis
  const combinedData = useMemo(() => {
    return widgets.flatMap(w => w.data || []);
  }, [widgets]);

  const stats = useStatistics(combinedData);

  // Identify numeric keys for analysis
  const numericKeys = useMemo(() => {
    if (combinedData.length === 0) return [];
    return Object.keys(combinedData[0]).filter(key => 
      typeof combinedData[0][key] === 'number'
    );
  }, [combinedData]);

  const correlationMatrix = useMemo(() => {
    if (numericKeys.length < 2) return [];
    
    const matrix = [];
    for (let i = 0; i < numericKeys.length; i++) {
      for (let j = 0; j < numericKeys.length; j++) {
        if (i === j) continue;
        const corr = stats.getCorrelation(numericKeys[i], numericKeys[j]);
        matrix.push({
          x: numericKeys[i],
          y: numericKeys[j],
          value: Number(corr.toFixed(3)),
          abs: Math.abs(corr)
        });
      }
    }
    return matrix.sort((a, b) => b.abs - a.abs).slice(0, 10);
  }, [numericKeys, stats]);

  if (widgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mb-6 border border-primary/10">
          <Brain className="w-8 h-8 text-primary/40" />
        </div>
        <h3 className="text-xl font-black text-foreground/80 mb-2">Insufficient Data</h3>
        <p className="text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed">
          Upload a dataset or add widgets to unlock statistical analytics and AI-powered insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground/90 flex items-center gap-3">
            <Sigma className="w-8 h-8 text-primary" />
            Statistical Engine
          </h2>
          <p className="text-muted-foreground/60 font-medium mt-1">
            Advanced analytical processing for {department} department data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {numericKeys.slice(0, 3).map((key, i) => {
          const s = stats.getBasicStats(key);
          if (!s) return null;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass shadow-elegant border-white/5 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{key} Distribution</CardTitle>
                    <Sigma className="w-4 h-4 text-primary/40" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">{s.mean.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                    <span className="text-[10px] font-black text-muted-foreground/40 uppercase">Mean</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] font-black text-muted-foreground/40 uppercase">Std Dev</p>
                      <p className="text-xs font-bold">{s.standardDeviation.toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] font-black text-muted-foreground/40 uppercase">Median</p>
                      <p className="text-xs font-bold">{s.median.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Tabs defaultValue="correlation" className="w-full">
        <TabsList className="glass-card p-1 rounded-2xl mb-8">
          <TabsTrigger value="correlation" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">
            <Binary className="w-3.5 h-3.5 mr-2" />
            Correlation Matrix
          </TabsTrigger>
          <TabsTrigger value="regression" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">
            <TrendingUp className="w-3.5 h-3.5 mr-2" />
            Trend Analysis
          </TabsTrigger>
          <TabsTrigger value="distribution" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest">
            <BarChart3 className="w-3.5 h-3.5 mr-2" />
            Data Variance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="correlation" className="mt-0 space-y-6">
          <Card className="glass shadow-elegant border-white/5 p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Binary className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight">Top Correlations</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground/60">Statistical relationships between different metric pairs.</CardDescription>
              </div>
            </div>
            
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={correlationMatrix}
                  layout="vertical"
                  margin={{ left: 100, right: 30 }}
                >
                  <CartGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" domain={[-1, 1]} stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <YAxis 
                    dataKey="y" 
                    type="category" 
                    stroke="rgba(255,255,255,0.5)" 
                    fontSize={10} 
                    tickFormatter={(val, i) => `${correlationMatrix[i].x} ↔ ${val}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="glass-card p-4 rounded-2xl border-white/10 shadow-glow">
                          <p className="text-[10px] font-black uppercase text-primary mb-1">{data.x} & {data.y}</p>
                          <p className="text-xl font-black">{data.value}</p>
                          <p className="text-[9px] font-medium text-muted-foreground mt-1">
                            {data.value > 0.7 ? 'Strong Positive' : data.value > 0.3 ? 'Moderate Positive' : data.value > -0.3 ? 'Weak' : data.value > -0.7 ? 'Moderate Negative' : 'Strong Negative'}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {correlationMatrix.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.value > 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))'} 
                        fillOpacity={Math.abs(entry.value)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="regression" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {numericKeys.slice(0, 2).map(key => {
              const reg = stats.getLinearRegression(key);
              if (!reg) return null;
              
              const regData = combinedData.map((d, i) => ({
                index: i,
                actual: Number(d[key]),
                trend: reg.predict(i)[1]
              }));

              return (
                <Card key={key} className="glass shadow-elegant border-white/5 p-8 rounded-3xl">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                      {key} Trend Analysis
                      <TooltipProvider>
                        <UITooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground/40" />
                          </TooltipTrigger>
                          <TooltipContent className="glass-card border-white/10 text-[10px] p-2 max-w-[200px]">
                            Linear regression calculates the line of best fit to predict future performance based on historical data points.
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    </CardTitle>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Equation: {reg.string}</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={regData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="index" hide />
                          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              return (
                                <div className="glass-card p-4 rounded-2xl border-white/10 shadow-glow">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Actual</p>
                                      <p className="text-lg font-black">{payload[0].value?.toLocaleString()}</p>
                                    </div>
                                    <div className="border-l border-white/10 pl-4">
                                      <p className="text-[9px] font-black text-primary uppercase mb-1">Trend</p>
                                      <p className="text-lg font-black">{Number(payload[1].value).toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="actual" stroke="rgba(255,255,255,0.3)" strokeWidth={1} dot={false} />
                          <Line type="monotone" dataKey="trend" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} className="shadow-glow shadow-primary/20" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="mt-0">
           <Card className="glass shadow-elegant border-white/5 p-8 rounded-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight">Metric Variance</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground/60">Comparing the standard deviation and variance across key metrics.</CardDescription>
              </div>
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={numericKeys.map(key => ({
                    name: key,
                    variance: stats.getBasicStats(key)?.variance || 0,
                    stdDev: stats.getBasicStats(key)?.standardDeviation || 0
                  }))}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="glass-card p-4 rounded-2xl border-white/10 shadow-glow">
                          <p className="text-[10px] font-black uppercase text-primary mb-2">{data.name}</p>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Variance: <span className="text-foreground font-black">{data.variance.toLocaleString()}</span></p>
                            <p className="text-xs text-muted-foreground">Std Dev: <span className="text-foreground font-black">{data.stdDev.toLocaleString()}</span></p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="stdDev" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
