import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { exportToPdf, ExportOptions } from '../lib/export';
import { blink } from '../lib/blink';
import { logAuditEvent, AuditActions, AuditEntities } from '../lib/security/audit';
import { apiRateLimiter } from '../lib/rate-limiting/api-limiter';

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

    const user = await blink.auth.me();
    
    // Check rate limit
    if (user && !apiRateLimiter.check(user.id)) {
      toast.error('Export limit reached', {
        description: 'Enterprise security policy: 100 requests per minute.'
      });
      await logAuditEvent(user, {
        action: AuditActions.RATE_LIMIT_HIT,
        entity: AuditEntities.USER,
        metadata: { type: 'export' }
      });
      return false;
    }

    const filename = options.filename || `Intinc-${departmentName}-Dashboard-${new Date().toISOString().split('T')[0]}.pdf`;
    const toastId = toast.loading(`Generating high-fidelity PDF for ${departmentName}...`);
    
    setIsExporting(true);
    
    try {
      const user = await blink.auth.me();
      
      await exportToPdf(elementId, {
        ...options,
        filename
      });
      
      // Log audit event
      if (user) {
        await logAuditEvent(user, {
          action: AuditActions.DASHBOARD_EXPORT,
          entity: AuditEntities.DASHBOARD,
          metadata: { departmentName, filename }
        });
      }

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
