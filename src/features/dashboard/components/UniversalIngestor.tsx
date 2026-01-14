import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { FileUp, Table, Check, Loader2, Sparkles, FileText, FileSpreadsheet, LayoutGrid, BarChart3, PieChart, Info } from 'lucide-react';
import { useDashboard } from '../../hooks/use-dashboard';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { blink } from '../../lib/blink';
import { Badge } from '../ui/badge';

interface RecommendedDashboard {
  id: string;
  name: string;
  description: string;
  iconType: 'growth' | 'distribution' | 'performance';
  widgets: any[];
}

export default function UniversalIngestor() {
  const { setWidgets, setCurrentView } = useDashboard();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedDashboard[]>([]);
  const [parsingSuggestion, setParsingSuggestion] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      await processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setRecommendations([]);
    setParsingSuggestion(null);
    try {
      toast.info(`Extracting content from ${file.name}...`);
      const text = await blink.data.extractFromBlob(file);
      setExtractedData(text);
      toast.success('Content extracted successfully');
      
      // Now use AI to generate recommendations
      await generateRecommendationsFromAI(text, file.name);
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateRecommendationsFromAI = async (text: string, fileName: string) => {
    setIsProcessing(true);
    try {
      toast.info('AI is analyzing data to recommend dashboard layouts...');
      
      const { object } = await blink.ai.generateObject({
        prompt: `Analyze this data from the file "${fileName}" and provide:
        1. A brief suggestion on how to best parse/structure this data for a dashboard.
        2. Three distinct dashboard layout recommendations (name, description, and 3-5 widgets for each).
        
        Data Sample: ${text.substring(0, 4000)}
        
        For each dashboard recommendation, include appropriate widgets with types (bar, line, area, pie, or kpi), titles, and data derived from the sample.
        Ensure data follows the format: [{ name: string, value: number }] or for kpi: { value: number, trend: number, label: string }`,
        schema: {
          type: 'object',
          properties: {
            parsingSuggestion: { type: 'string' },
            recommendations: {
              type: 'array',
              minItems: 3,
              maxItems: 3,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  iconType: { type: 'string', enum: ['growth', 'distribution', 'performance'] },
                  widgets: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string', enum: ['bar', 'line', 'area', 'pie', 'kpi'] },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        dataKey: { type: 'string' },
                        categoryKey: { type: 'string' },
                        gridSpan: { type: 'number', enum: [4, 6, 8, 12] },
                        data: { 
                          type: 'array',
                          items: {
                            type: 'object',
                            additionalProperties: true
                          }
                        }
                      },
                      required: ['type', 'title', 'data']
                    }
                  }
                },
                required: ['name', 'description', 'widgets']
              }
            }
          },
          required: ['parsingSuggestion', 'recommendations']
        }
      });

      setParsingSuggestion(object.parsingSuggestion);
      setRecommendations(object.recommendations.map((r: any, i: number) => ({
        ...r,
        id: `rec-${i}-${Date.now()}`
      })));
      
      toast.success('AI recommendations ready!');
    } catch (error) {
      console.error('AI recommendation error:', error);
      toast.error('AI failed to generate recommendations. Try another file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyRecommendation = (rec: RecommendedDashboard) => {
    const newWidgets = rec.widgets.map((w: any) => ({
      ...w,
      id: `ai-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      gridSpan: w.gridSpan || 6
    }));

    setWidgets(newWidgets);
    setCurrentView('overview'); // Switch to overview after applying
    toast.success(`Applied ${rec.name} layout!`);
    setFile(null);
    setRecommendations([]);
    setParsingSuggestion(null);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.csv')) return <Table className="text-emerald-500" />;
    if (fileName.endsWith('.pdf')) return <FileText className="text-rose-500" />;
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return <FileSpreadsheet className="text-green-500" />;
    if (fileName.endsWith('.docx')) return <FileText className="text-blue-500" />;
    if (fileName.endsWith('.md')) return <FileText className="text-orange-500" />;
    if (fileName.endsWith('.txt')) return <FileText className="text-slate-400" />;
    if (fileName.endsWith('.zip')) return <FileUp className="text-purple-500" />;
    return <FileUp className="text-primary" />;
  };

  return (
    <Card className="glass-card border-white/10 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">AI-Powered Ingestion</span>
        </div>
        <CardTitle className="text-xl font-bold">Universal Data Ingestor</CardTitle>
        <CardDescription>
          Drop any file. Our AI will recommend 3 dashboard layouts and suggest how to parse your data.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div 
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileUp className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">Drop your data here</p>
                <p className="text-sm text-muted-foreground mt-1">Supports CSV, PDF, XLSX, DOCX, MD, ZIP, and more</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="bg-white/5">CSV</Badge>
                <Badge variant="outline" className="bg-white/5">PDF</Badge>
                <Badge variant="outline" className="bg-white/5">XLSX</Badge>
                <Badge variant="outline" className="bg-white/5">DOCX</Badge>
                <Badge variant="outline" className="bg-white/5">MD</Badge>
                <Badge variant="outline" className="bg-white/5">TXT</Badge>
                <Badge variant="outline" className="bg-white/5">ZIP</Badge>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv,.pdf,.xlsx,.xls,.txt,.docx,.md,.zip"
                onChange={handleFileChange}
              />
            </motion.div>
          ) : isProcessing ? (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 py-8 flex flex-col items-center justify-center text-center"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  {getFileIcon(file.name)}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-24 h-24 text-primary/30 animate-spin" />
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg">{file.name}</h3>
                <p className="text-sm text-muted-foreground">
                  AI is analyzing your data to recommend the best visualizations...
                </p>
              </div>

              <div className="w-full max-w-xs space-y-2">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse">
                  Analyzing Data Structure...
                </p>
              </div>
            </motion.div>
          ) : recommendations.length > 0 ? (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {parsingSuggestion && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Parsing Suggestion</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {parsingSuggestion}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recommended Dashboards</p>
                <div className="grid gap-4">
                  {recommendations.map((rec) => (
                    <motion.div
                      key={rec.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => applyRecommendation(rec)}
                      className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          {rec.iconType === 'growth' ? <BarChart3 className="text-primary" /> : 
                           rec.iconType === 'distribution' ? <PieChart className="text-primary" /> : 
                           <LayoutGrid className="text-primary" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{rec.name}</h4>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-white transition-all">
                          Select
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setFile(null)}
              >
                Upload a different file
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
