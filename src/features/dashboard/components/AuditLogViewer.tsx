/**
 * Audit Log Viewer Component
 * Phase 5.3: Security & Compliance auditing
 */

import React, { useState, useEffect } from 'react';
import { blink } from '../../../lib/blink';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Input } from '../../../components/ui/input';
import { 
  Search, 
  Shield, 
  Clock, 
  User, 
  Activity,
  FileText,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id?: string;
  metadata?: string;
  created_at: string;
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await blink.db.auditLogs.list({
        orderBy: { created_at: 'desc' },
        limit: 100
      });
      setLogs(data as any || []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.entity.toLowerCase().includes(search.toLowerCase()) ||
    log.user_id.toLowerCase().includes(search.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('removed')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (action.includes('create') || action.includes('added')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (action.includes('update') || action.includes('edit')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Clock size={14} />
          <span>Showing last 100 activities</span>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader className="bg-white/5 sticky top-0 z-10">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Actor</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Action</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Entity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/10 animate-pulse">
                    <TableCell colSpan={5} className="h-12 bg-white/5" />
                  </TableRow>
                ))
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                    <div className="flex flex-col items-center gap-2">
                      <Shield size={24} className="opacity-20" />
                      <p>No audit records found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                    <TableCell className="text-[11px] font-mono text-muted-foreground">
                      {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <User size={12} className="text-primary" />
                        </div>
                        <span className="text-xs font-medium truncate max-w-[120px]">{log.user_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getActionColor(log.action)} capitalize text-[10px] font-black tracking-widest border`}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {log.entity === 'dashboard' ? <FileText size={12} className="text-indigo-400" /> : <Activity size={12} className="text-emerald-400" />}
                        <span className="text-xs font-medium capitalize">{log.entity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.metadata ? (
                        <div className="flex items-center gap-2 max-w-[200px] truncate">
                          <AlertCircle size={12} className="text-muted-foreground shrink-0" />
                          <span className="text-[10px] text-muted-foreground truncate">{log.metadata}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/40 italic">No additional metadata</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
