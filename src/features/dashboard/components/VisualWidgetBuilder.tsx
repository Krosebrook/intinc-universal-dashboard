import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { WidgetConfig, WidgetType } from '../../../types/dashboard';
import { FileUp, Table as TableIcon, Layout, Settings2, Sparkles, Code } from 'lucide-react';
import { toast } from 'sonner';

interface VisualWidgetBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (widget: WidgetConfig) => void;
}

export default function VisualWidgetBuilder({ open, onOpenChange, onAdd }: VisualWidgetBuilderProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [config, setConfig] = useState<Partial<WidgetConfig>>({
    title: '',
    description: '',
    type: 'bar',
    gridSpan: 6,
    data: [{ name: 'Jan', value: 400 }, { name: 'Feb', value: 300 }, { name: 'Mar', value: 600 }],
    dataKey: 'value',
    categoryKey: 'name',
    forecast: false,
    goal: 100
  });

  const [csvInput, setCsvInput] = useState('');

  const handleCsvParse = () => {
    try {
      const lines = csvInput.trim().split('\n');
      if (lines.length < 2) throw new Error('Invalid CSV format');
      
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, i) => {
          const val = values[i]?.trim();
          obj[header] = isNaN(Number(val)) ? val : Number(val);
        });
        return obj;
      });

      setConfig({
        ...config,
        data,
        categoryKey: headers[0],
        dataKey: headers[1]
      });
      toast.success('CSV parsed successfully');
      setActiveTab('basic');
    } catch (error) {
      toast.error('Failed to parse CSV');
    }
  };

  const handleAdd = () => {
    if (!config.title) {
      toast.error('Title is required');
      return;
    }
    onAdd({
      ...config as WidgetConfig,
      id: `widget-${Date.now()}`
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl glass-card border-white/10 p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Visual Widget Builder</DialogTitle>
          <DialogDescription>Create and configure a new dashboard widget</DialogDescription>
        </DialogHeader>
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-6 px-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-bold">Widget Builder</span>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
              <TabsList className="flex flex-col h-auto bg-transparent gap-1 p-0">
                <TabsTrigger value="basic" className="w-full justify-start gap-2 px-3 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Layout size={16} /> Basic Config
                </TabsTrigger>
                <TabsTrigger value="data" className="w-full justify-start gap-2 px-3 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <TableIcon size={16} /> Data Source
                </TabsTrigger>
                <TabsTrigger value="advanced" className="w-full justify-start gap-2 px-3 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Settings2 size={16} /> Advanced
                </TabsTrigger>
                <TabsTrigger value="wsl" className="w-full justify-start gap-2 px-3 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs opacity-70">
                  <Code size={14} /> Widget SDK (WSL)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              <Tabs value={activeTab} className="w-full">
                <TabsContent value="basic" className="mt-0 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">General Settings</h3>
                    <p className="text-sm text-muted-foreground">Define how your widget looks on the dashboard.</p>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Widget Title</Label>
                      <Input 
                        placeholder="e.g., Monthly Growth" 
                        value={config.title}
                        onChange={(e) => setConfig({...config, title: e.target.value})}
                        className="glass border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input 
                        placeholder="Explain the data in a few words" 
                        value={config.description}
                        onChange={(e) => setConfig({...config, description: e.target.value})}
                        className="glass border-white/10"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Chart Type</Label>
                        <Select 
                          value={config.type} 
                          onValueChange={(val: WidgetType) => setConfig({...config, type: val})}
                        >
                          <SelectTrigger className="glass border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass border-white/10">
                            <SelectItem value="area">Area Chart</SelectItem>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="pie">Pie Chart</SelectItem>
                            <SelectItem value="gauge">Goal Gauge</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Layout Width</Label>
                        <Select 
                          value={String(config.gridSpan)} 
                          onValueChange={(val) => setConfig({...config, gridSpan: parseInt(val)})}
                        >
                          <SelectTrigger className="glass border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="glass border-white/10">
                            <SelectItem value="4">Small (1/3)</SelectItem>
                            <SelectItem value="6">Medium (1/2)</SelectItem>
                            <SelectItem value="8">Large (2/3)</SelectItem>
                            <SelectItem value="12">Full Width</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="data" className="mt-0 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Data Source</h3>
                    <p className="text-sm text-muted-foreground">Import data via CSV or manual entry.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border border-dashed border-white/20 rounded-xl bg-white/5 flex flex-col items-center justify-center gap-3">
                      <FileUp className="w-8 h-8 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Upload CSV, Excel, Word, or Markdown</p>
                        <p className="text-xs text-muted-foreground">Drag and drop or click to browse</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".csv,.pdf,.xlsx,.xls,.txt,.docx,.md,.zip"
                      />
                      <Button variant="outline" size="sm" className="glass">Select File</Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Raw CSV Input</Label>
                      <textarea 
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="month,value&#10;Jan,100&#10;Feb,200"
                        value={csvInput}
                        onChange={(e) => setCsvInput(e.target.value)}
                      />
                      <Button onClick={handleCsvParse} variant="secondary" size="sm" className="w-full">
                        Parse & Sync Data
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="wsl" className="mt-0 space-y-6">
                   <div className="space-y-4">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-xs text-yellow-200">
                        <strong>Developer Mode:</strong> WSL (Widget Specification Language) allows defining widgets via JSON. 
                        Changes here will directly affect the internal widget configuration.
                      </p>
                    </div>
                    <textarea 
                      className="w-full h-[350px] bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-primary focus:outline-none"
                      value={JSON.stringify(config, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setConfig(parsed);
                        } catch (e) {}
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="p-6 border-t border-white/10 bg-white/5">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                Generate Widget
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
