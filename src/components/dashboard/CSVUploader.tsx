// DEPRECATED: use src/features/dashboard/components/CSVUploader.tsx instead.
import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileUp, Table, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useDashboard } from '../../hooks/use-dashboard';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function CSVUploader() {
  const { setWidgets } = useDashboard();
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({
    category: '',
    value: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        toast.error('CSV must have a header and at least one row of data');
        return;
      }

      const csvHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      const csvData = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        const obj: any = {};
        csvHeaders.forEach((h, i) => {
          obj[h] = values[i];
        });
        return obj;
      });

      setHeaders(csvHeaders);
      setPreview(csvData);
      
      // Attempt auto-mapping
      const autoMapping: any = {};
      csvHeaders.forEach(h => {
        const lowerH = h.toLowerCase();
        if (lowerH.includes('date') || lowerH.includes('month') || lowerH.includes('name') || lowerH.includes('category')) {
          autoMapping.category = h;
        }
        if (lowerH.includes('value') || lowerH.includes('amount') || lowerH.includes('total') || lowerH.includes('count')) {
          autoMapping.value = h;
        }
      });
      setMapping(prev => ({ ...prev, ...autoMapping }));
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!mapping.category || !mapping.value) {
      toast.error('Please map both category and value columns');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const csvHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      
      const catIdx = csvHeaders.indexOf(mapping.category);
      const valIdx = csvHeaders.indexOf(mapping.value);

      const formattedData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        return {
          name: values[catIdx],
          value: parseFloat(values[valIdx]) || 0
        };
      });

      const newWidget = {
        id: `custom-csv-${Date.now()}`,
        type: 'bar' as const,
        title: file?.name.replace('.csv', '') || 'Imported Data',
        description: `Imported from ${file?.name} with ${formattedData.length} records`,
        dataKey: 'value',
        categoryKey: 'name',
        gridSpan: 12,
        data: formattedData
      };

      setWidgets(prev => [newWidget, ...prev]);
      toast.success('Data imported successfully');
      setFile(null);
      setHeaders([]);
      setPreview([]);
      setIsProcessing(false);
    };
    reader.readAsText(file!);
  };

  return (
    <Card className="glass-card border-white/10 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Table className="w-5 h-5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Self-Service Import</span>
        </div>
        <CardTitle className="text-xl font-bold">CSV Data Mapper</CardTitle>
        <CardDescription>
          Upload your own dataset and map columns to create a custom dashboard widget.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileUp className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">Drop your CSV here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse from your computer</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Table className="text-primary" />
                <div>
                  <p className="text-sm font-bold">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setHeaders([]); setPreview([]); }}>
                Change File
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category Column (X-Axis)</Label>
                <Select value={mapping.category} onValueChange={(val) => setMapping(prev => ({ ...prev, category: val }))}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select header..." />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Value Column (Y-Axis)</Label>
                <Select value={mapping.value} onValueChange={(val) => setMapping(prev => ({ ...prev, value: val }))}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select header..." />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Data Preview</Label>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/5">
                    <tr>
                      {headers.slice(0, 4).map(h => (
                        <th key={h} className="p-2 font-bold border-b border-white/10">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 last:border-none">
                        {headers.slice(0, 4).map(h => (
                          <td key={h} className="p-2 text-muted-foreground truncate max-w-[100px]">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Button 
              className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl font-bold gap-2"
              onClick={handleImport}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : <Check size={18} />}
              Generate Custom Widget
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}