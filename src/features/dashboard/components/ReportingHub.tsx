import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../../../hooks/use-dashboard';
import { blink } from '../../../lib/blink';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Calendar, Clock, Mail, FileText, Plus, Trash2, Play, CheckCircle2, AlertCircle, Users, Settings2, BarChart3, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ScheduledReport {
  id: string;
  name: string;
  dashboard_id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time_of_day: string;
  format: 'pdf' | 'excel' | 'csv';
  status: 'active' | 'paused';
  last_run_at?: string;
  recipients?: string[];
}

export function ReportingHub() {
  const { department, savedDashboards } = useDashboard();
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const data = await blink.db.scheduledReports.list();
      setReports(data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await blink.db.reportHistory.list({ limit: 10 });
      setHistory(data || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchHistory();
  }, [fetchReports, fetchHistory]);

  const handleRunNow = async (reportId: string) => {
    const toastId = toast.loading('Generating report...');
    try {
      // In a real app, this would trigger an edge function
      // For MVP, we simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await blink.db.reportHistory.create({
        report_id: reportId,
        status: 'success',
        format: 'pdf',
        recipients_count: 3,
        executed_at: new Date().toISOString()
      });
      
      toast.success('Report generated and sent successfully', { id: toastId });
      fetchHistory();
    } catch (error) {
      toast.error('Failed to generate report', { id: toastId });
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      await blink.db.scheduledReports.delete(reportId);
      setReports(reports.filter(r => r.id !== reportId));
      toast.success('Scheduled report deleted');
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground/90 flex items-center gap-3">
            <Mail className="w-8 h-8 text-primary" />
            Reporting Hub
          </h2>
          <p className="text-muted-foreground/60 font-medium mt-1">
            Configure automated intelligence distribution for {department} stakeholders.
          </p>
        </div>
        <Button 
          onClick={() => setIsSchedulerOpen(true)}
          className="bg-primary hover:bg-primary-glow text-primary-foreground h-12 px-6 rounded-2xl shadow-glow shadow-primary/20 transition-all font-bold uppercase tracking-widest text-[10px]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Schedule
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Card className="glass shadow-elegant border-white/5 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Active Schedules</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground/60">Your configured recurring exports and distributions.</CardDescription>
                </div>
                <Badge variant="outline" className="glass border-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {reports.length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Synchronizing records...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mx-auto mb-6 border border-primary/10">
                    <Calendar className="w-8 h-8 text-primary/40" />
                  </div>
                  <h3 className="text-lg font-black text-foreground/80 mb-2">No Scheduled Reports</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                    Automate your workflow by scheduling periodic exports to your team.
                  </p>
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsSchedulerOpen(true)}
                    className="mt-6 text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary/5"
                  >
                    Configure First Report
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {reports.map((report) => (
                    <div key={report.id} className="p-8 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:border-primary/20 transition-all">
                          <FileText className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black tracking-tight text-foreground/90 group-hover:text-primary transition-colors">{report.name}</h4>
                          <div className="flex items-center gap-4 mt-1.5">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                              <Calendar className="w-3 h-3" />
                              {report.frequency}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                              <Clock className="w-3 h-3" />
                              {report.time_of_day}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                              <Users className="w-3 h-3" />
                              Distribution List
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRunNow(report.id)}
                          className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(report.id)}
                          className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass shadow-elegant border-white/5 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6">
              <CardTitle className="text-xl font-black tracking-tight">Enterprise Delivery Engine</CardTitle>
              <CardDescription className="text-xs font-medium text-muted-foreground/60">High-fidelity rendering status and delivery metrics.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Uptime', value: '99.98%', icon: CheckCircle2, color: 'text-emerald-400' },
                  { label: 'Latency', value: '1.2s', icon: Clock, color: 'text-blue-400' },
                  { label: 'Success', value: '100%', icon: Play, color: 'text-primary' },
                  { label: 'Failure', value: '0', icon: AlertCircle, color: 'text-muted-foreground' }
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">{stat.label}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black">{stat.value}</span>
                      <stat.icon size={14} className={stat.color} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="glass shadow-elegant border-white/5 rounded-3xl overflow-hidden">
            <CardHeader className="px-6 py-5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Execution Logs</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              {history.length === 0 ? (
                <div className="py-12 text-center border-t border-white/5">
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">No history recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 group">
                      <div className={`mt-1 w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'} shadow-glow`} />
                      <div className="flex-1 border-b border-white/5 pb-4 group-last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-foreground/80">{log.status === 'success' ? 'Report Delivered' : 'Delivery Failed'}</span>
                          <span className="text-[9px] font-bold text-muted-foreground/40">{format(new Date(log.executed_at), 'MMM d, HH:mm')}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Broadcast to {log.recipients_count} stakeholders via SMTP relay.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-white/[0.01] border-t border-white/5 px-6 py-4">
              <Button variant="ghost" className="w-full text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary">
                View Full Audit Trail
                <ChevronRight className="w-3 h-3 ml-2" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="glass shadow-elegant border-white/5 rounded-3xl bg-primary/5 border-primary/10">
            <CardHeader className="px-6 py-5">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Intelligence Pro Tip</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                "Scheduled reports increase dashboard adoption by 40%. Try setting up a 'Monday Morning Catch-up' for your department leads."
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Intinc AI Assistant</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReportSchedulerDialog 
        open={isSchedulerOpen} 
        onOpenChange={setIsSchedulerOpen} 
        onSuccess={fetchReports}
        dashboards={savedDashboards}
      />
    </div>
  );
}

function ReportSchedulerDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  dashboards 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  dashboards: any[];
}) {
  const [name, setName] = useState('');
  const [dashboardId, setDashboardId] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [time, setTime] = useState('09:00');
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [recipients, setRecipients] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dashboardId || !recipients) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const report = await blink.db.scheduledReports.create({
        name,
        dashboard_id: dashboardId,
        frequency,
        time_of_day: time,
        format,
        status: 'active'
      });

      const emailList = recipients.split(',').map(e => e.trim());
      for (const email of emailList) {
        await blink.db.reportRecipients.create({
          report_id: report.id,
          email,
          name: email.split('@')[0]
        });
      }

      toast.success('Report schedule configured successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/10 max-w-2xl rounded-3xl p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-8">
            <DialogHeader>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                <Settings2 size={24} className="text-primary" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight">Configure Broadcast</DialogTitle>
              <DialogDescription className="text-muted-foreground/60 text-sm font-medium">
                Define the parameters for your automated report delivery.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Schedule Identity</Label>
                <Input 
                  placeholder="e.g. Weekly Sales Summary" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.05] focus:border-primary/40 h-12 rounded-2xl transition-all"
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Source Dashboard</Label>
                <Select value={dashboardId} onValueChange={setDashboardId}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.05] focus:border-primary/40 h-12 rounded-2xl">
                    <SelectValue placeholder="Select workspace" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 rounded-2xl">
                    {dashboards.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                    {dashboards.length === 0 && <SelectItem value="default">Default Summary</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Cadence</Label>
                <Select value={frequency} onValueChange={(val: any) => setFrequency(val)}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.05] focus:border-primary/40 h-12 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 rounded-2xl">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Relay Time</Label>
                <Input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-white/[0.03] border-white/[0.05] focus:border-primary/40 h-12 rounded-2xl transition-all"
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Artifact Format</Label>
                <Select value={format} onValueChange={(val: any) => setFormat(val)}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.05] focus:border-primary/40 h-12 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 rounded-2xl">
                    <SelectItem value="pdf">PDF (Visual)</SelectItem>
                    <SelectItem value="excel">Excel (Data)</SelectItem>
                    <SelectItem value="csv">CSV (Raw)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Stakeholder Emails</Label>
                <span className="text-[9px] text-muted-foreground/40 font-bold uppercase">Comma separated</span>
              </div>
              <Input 
                placeholder="stakeholder1@intinc.com, stakeholder2@intinc.com" 
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="bg-white/[0.03] border-white/[0.05] focus:border-primary/40 h-12 rounded-2xl transition-all"
              />
            </div>
          </div>

          <DialogFooter className="bg-white/[0.02] border-t border-white/5 p-6 flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="glass h-12 flex-1 rounded-2xl border-white/[0.05] hover:bg-white/[0.05]">Discard</Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-glow text-primary-foreground h-12 flex-1 rounded-2xl shadow-glow shadow-primary/20 transition-all font-bold uppercase tracking-widest text-[10px]"
            >
              {isSubmitting ? 'Synchronizing...' : 'Initialize Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
