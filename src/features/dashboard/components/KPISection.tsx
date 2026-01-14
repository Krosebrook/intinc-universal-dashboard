import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

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
          transition={{ 
            type: "spring",
            damping: 25,
            stiffness: 120,
            delay: index * 0.05 
          }}
        >
          <Card className="glass-card overflow-hidden group relative flex flex-col h-full border-white/[0.03]">
            {/* Background highlight */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors pointer-events-none" />
            
            <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground/80 transition-colors">
                {item.title}
              </CardTitle>
              <div className="p-2.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500 shadow-sm group-hover:scale-110 group-hover:shadow-glow group-hover:shadow-primary/5">
                <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 flex-1 flex flex-col">
              <div className="text-3xl font-black tracking-tighter text-foreground/90 group-hover:text-glow transition-all duration-500 mb-2">
                {item.value}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border shadow-sm",
                  item.trendType === 'up' 
                    ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" 
                    : "bg-rose-500/5 text-rose-500 border-rose-500/20"
                )}>
                  {item.trendType === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {item.trend}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Growth</span>
              </div>
              <p className="text-[11px] text-muted-foreground/60 font-medium leading-relaxed mt-auto line-clamp-2">
                {item.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
