import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { FileUp, Table, Check, Loader2, Sparkles, FileText, FileSpreadsheet } from 'lucide-react';
import { useDashboard } from '../../hooks/use-dashboard';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { blink } from '../../lib/blink';
import { Badge } from '../ui/badge';

export default function UniversalIngestor() {
  const { setWidgets } = useDashboard();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<string | null>(null);
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
    try {
      toast.info(`Extracting content from ${file.name}...`);
      const text = await blink.data.extractFromBlob(file);
      setExtractedData(text);
      toast.success('Content extracted successfully');
      
      // Now use AI to generate widgets
      await generateWidgetsFromAI(text, file.name);
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateWidgetsFromAI = async (text: string, fileName: string) => {
    setIsProcessing(true);
    try {
      toast.info('AI is designing your dashboard layout...');
      
      const { object } = await blink.ai.generateObject({
        prompt: `Analyze this data from the file "${fileName}" and design 2-4 professional dashboard widgets. 
        Data Sample: ${text.substring(0, 4000)}
        Return a list of widgets with appropriate types (bar, line, area, pie, or kpi), titles, descriptions, and correctly formatted data.
        Ensure data follows the format: [{ name: string, value: number }] or for kpi: { value: number, trend: number, label: string }`,
        schema: {
          type: 'object',
          properties: {
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
          required: ['widgets']
        }
      });

      if (object.widgets && object.widgets.length > 0) {
        const newWidgets = object.widgets.map((w: any) => ({
          ...w,
          id: `ai-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          gridSpan: w.gridSpan || 6
        }));

        setWidgets(prev => [...newWidgets, ...prev]);
        toast.success(`AI generated ${newWidgets.length} widgets from your data!`);
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('AI failed to generate widgets. Try another file.');
    } finally {
      setIsProcessing(false);
      setFile(null);
      setExtractedData(null);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.csv')) return <Table className="text-emerald-500" />;
    if (fileName.endsWith('.pdf')) return <FileText className="text-rose-500" />;
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return <FileSpreadsheet className="text-green-500" />;
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
          Drop any CSV, PDF, or Excel file. Our AI will automatically extract data and design your widgets.
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
                <p className="text-sm text-muted-foreground mt-1">Supports CSV, PDF, XLSX, and more</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-white/5">CSV</Badge>
                <Badge variant="outline" className="bg-white/5">PDF</Badge>
                <Badge variant="outline" className="bg-white/5">XLSX</Badge>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv,.pdf,.xlsx,.xls,.txt"
                onChange={handleFileChange}
              />
            </motion.div>
          ) : (
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
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-24 h-24 text-primary/30 animate-spin" />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-lg">{file.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {isProcessing ? 'AI is analyzing your data structure...' : 'Ready to generate'}
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
                  Running Neural Extraction...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
