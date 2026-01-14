import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { exportToPdf, ExportOptions } from '../lib/export';

/**
 * Hook for managing high-fidelity PDF exports with state and notifications
 */
export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const performExport = useCallback(async (
    elementId: string, 
    departmentName: string,
    options: ExportOptions = {}
  ) => {
    if (isExporting) return;

    const filename = options.filename || `Intinc-${departmentName}-Dashboard-${new Date().toISOString().split('T')[0]}.pdf`;
    const toastId = toast.loading(`Generating high-fidelity PDF for ${departmentName}...`);
    
    setIsExporting(true);
    
    try {
      await exportToPdf(elementId, {
        ...options,
        filename
      });
      
      toast.success('Report exported successfully', { 
        id: toastId,
        description: `Saved as ${filename}`
      });
      
      return true;
    } catch (error) {
      console.error('Export Hook Error:', error);
      toast.error('Failed to generate report', { 
        id: toastId,
        description: error instanceof Error ? error.message : 'An unexpected error occurred during export.'
      });
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [isExporting]);

  return {
    isExporting,
    performExport
  };
}
