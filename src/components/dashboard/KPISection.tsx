// DEPRECATED: use src/features/dashboard/components/KPISection.tsx instead.
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface KPIData {
  title: string;
  value: string;
  trend: string;
  trendType: 'up' | 'down';
  icon: LucideIcon;
  description: string;
}

interface KPISectionProps {
  data: KPIData[];
}

export default function KPISection({ data }: KPISectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="glass-card overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {item.title}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all duration-300">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight mb-2">{item.value}</div>
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md",
                  item.trendType === 'up'
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-rose-500/10 text-rose-500"
                )}>
                  {item.trendType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {item.trend}
                </div>
                <span className="text-xs text-muted-foreground">vs. last month</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
                {item.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}