import React from 'react';
import { Code } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { WidgetConfig, WidgetType } from '../../../types/dashboard';
import { WidgetRenderer } from './WidgetRenderer';

interface WidgetEditDialogProps {
  widget: WidgetConfig | null;
  onClose: () => void;
  onSave: (widget: WidgetConfig, isJson: boolean, json?: string) => void;
  isDevMode: boolean;
  onToggleDevMode: (checked: boolean) => void;
  widgetJson: string;
  onJsonChange: (value: string) => void;
  globalFilters: Record<string, any>;
  setGlobalFilter: (key: string, value: any) => void;
}

export function WidgetEditDialog({
  widget,
  onClose,
  onSave,
  isDevMode,
  onToggleDevMode,
  widgetJson,
  onJsonChange,
  globalFilters,
  setGlobalFilter,
}: WidgetEditDialogProps) {
  const [editingWidget, setEditingWidget] = React.useState<WidgetConfig | null>(widget);

  React.useEffect(() => {
    setEditingWidget(widget);
  }, [widget]);

  if (!editingWidget) return null;

  return (
    <Dialog open={!!widget} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle>Widget Settings</DialogTitle>
          <div className="flex items-center gap-2 mr-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dev Mode</span>
            <Switch 
              checked={isDevMode} 
              onCheckedChange={onToggleDevMode}
              className="scale-75"
            />
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {isDevMode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Code size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Direct WSL Editor</span>
              </div>
              <textarea
                value={widgetJson}
                onChange={(e) => onJsonChange(e.target.value)}
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
                    <WidgetRenderer 
                      widget={editingWidget} 
                      globalFilters={globalFilters} 
                      setGlobalFilter={setGlobalFilter} 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">Changes reflect instantly in the builder</p>
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="glass">Cancel</Button>
          <Button onClick={() => onSave(editingWidget, isDevMode, widgetJson)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
