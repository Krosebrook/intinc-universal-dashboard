/**
 * Global Filters Component
 * Phase 6.2: Advanced Interactivity - Dashboard-wide filtering controls
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Switch } from '../ui/switch';
import { 
  Filter, X, Calendar as CalendarIcon, 
  GitCompare, ChevronDown, Trash2, SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useWidgetState } from '../../hooks/use-widget-state';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlobalFiltersProps {
  className?: string;
}

type DatePreset = {
  label: string;
  getValue: () => { start: Date; end: Date };
};

const datePresets: DatePreset[] = [
  { label: 'Today', getValue: () => ({ start: new Date(), end: new Date() }) },
  { label: 'Last 7 Days', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: 'Last 30 Days', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: 'This Month', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { label: 'Last Month', getValue: () => ({ 
    start: startOfMonth(subMonths(new Date(), 1)), 
    end: endOfMonth(subMonths(new Date(), 1)) 
  })},
  { label: 'Last 3 Months', getValue: () => ({ start: subMonths(new Date(), 3), end: new Date() }) },
];

export default function GlobalFilters({ className }: GlobalFiltersProps) {
  const { 
    globalState, 
    removeFilter, 
    clearFilters, 
    setDateRange,
    toggleComparisonMode,
    setComparisonPeriods
  } = useWidgetState();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const activeFilterCount = globalState.activeFilters.length;
  const hasDateRange = globalState.dateRange.start && globalState.dateRange.end;
  const isComparisonMode = globalState.comparisonMode.enabled;

  const handlePresetClick = (preset: DatePreset) => {
    const range = preset.getValue();
    setDateRange({ start: range.start, end: range.end });
    setSelectedPreset(preset.label);
    setDatePickerOpen(false);
  };

  const handleComparisonToggle = () => {
    if (!isComparisonMode && hasDateRange) {
      // When enabling comparison, set comparison period to previous period
      const start = globalState.dateRange.start!;
      const end = globalState.dateRange.end!;
      const duration = end.getTime() - start.getTime();
      
      setComparisonPeriods(
        { start, end },
        { start: new Date(start.getTime() - duration), end: new Date(end.getTime() - duration) }
      );
    } else {
      toggleComparisonMode();
    }
  };

  const clearDateRange = () => {
    setDateRange({ start: null, end: null });
    setSelectedPreset(null);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "glass h-9 px-3 rounded-xl gap-2",
            isExpanded && "bg-primary/10 border-primary/30"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary text-primary-foreground">
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown size={12} className={cn("transition-transform", isExpanded && "rotate-180")} />
        </Button>

        {/* Date Range Picker */}
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "glass h-9 px-3 rounded-xl gap-2",
                hasDateRange && "bg-primary/10 border-primary/30"
              )}
            >
              <CalendarIcon size={14} />
              <span className="hidden sm:inline">
                {hasDateRange 
                  ? `${format(globalState.dateRange.start!, 'MMM d')} - ${format(globalState.dateRange.end!, 'MMM d')}`
                  : 'Date Range'
                }
              </span>
              {hasDateRange && (
                <X 
                  size={12} 
                  className="text-muted-foreground hover:text-foreground" 
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDateRange();
                  }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 glass-card border-white/10" align="start">
            <div className="flex">
              <div className="p-3 border-r border-white/10 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Quick Select
                </p>
                {datePresets.map(preset => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-xs h-8",
                      selectedPreset === preset.label && "bg-primary/10 text-primary"
                    )}
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="p-3">
                <Calendar
                  mode="range"
                  selected={{
                    from: globalState.dateRange.start || undefined,
                    to: globalState.dateRange.end || undefined
                  }}
                  onSelect={(range) => {
                    if (range?.from) {
                      setDateRange({ start: range.from, end: range.to || range.from });
                      setSelectedPreset(null);
                    }
                  }}
                  numberOfMonths={2}
                  className="rounded-xl"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Comparison Mode Toggle */}
        {hasDateRange && (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "glass h-9 px-3 rounded-xl gap-2",
              isComparisonMode && "bg-amber-500/10 border-amber-500/30 text-amber-400"
            )}
            onClick={handleComparisonToggle}
          >
            <GitCompare size={14} />
            <span className="hidden sm:inline">Compare</span>
          </Button>
        )}

        {/* Clear All Filters */}
        {(activeFilterCount > 0 || hasDateRange) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 rounded-xl gap-2 text-muted-foreground hover:text-destructive"
            onClick={() => {
              clearFilters();
              clearDateRange();
            }}
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {(isExpanded || activeFilterCount > 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-4 rounded-xl border-white/10 space-y-4">
              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Active Filters
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive"
                      onClick={clearFilters}
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {globalState.activeFilters.map(filter => (
                      <motion.div
                        key={filter.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                      >
                        <Badge
                          variant="outline"
                          className="h-7 px-2 gap-1.5 bg-primary/10 border-primary/20 text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                        >
                          <Filter size={10} />
                          <span className="text-xs font-medium">
                            {filter.label || `${filter.field} ${filter.operator} ${filter.value}`}
                          </span>
                          <X 
                            size={12} 
                            className="hover:text-destructive transition-colors"
                            onClick={() => removeFilter(filter.id)}
                          />
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparison Mode Info */}
              {isComparisonMode && (
                <>
                  <Separator className="bg-white/10" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <GitCompare size={14} className="text-amber-400" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                        Comparison Mode Active
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-[10px] text-muted-foreground mb-1">Primary Period</p>
                        <p className="font-semibold text-primary">
                          {globalState.comparisonMode.primaryPeriod.start && 
                            format(globalState.comparisonMode.primaryPeriod.start, 'MMM d, yyyy')}
                          {' - '}
                          {globalState.comparisonMode.primaryPeriod.end && 
                            format(globalState.comparisonMode.primaryPeriod.end, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <p className="text-[10px] text-muted-foreground mb-1">Comparison Period</p>
                        <p className="font-semibold text-amber-400">
                          {globalState.comparisonMode.comparisonPeriod.start && 
                            format(globalState.comparisonMode.comparisonPeriod.start, 'MMM d, yyyy')}
                          {' - '}
                          {globalState.comparisonMode.comparisonPeriod.end && 
                            format(globalState.comparisonMode.comparisonPeriod.end, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* No filters message */}
              {activeFilterCount === 0 && !isComparisonMode && isExpanded && (
                <div className="text-center py-4">
                  <Filter className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active filters</p>
                  <p className="text-xs text-muted-foreground/60">
                    Click on chart elements to create filters
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
