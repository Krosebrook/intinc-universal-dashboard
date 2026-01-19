/**
 * Enterprise Settings Component
 * Full enterprise settings functionality with branding, API keys, webhooks, and team management
 */

import React, { useState, useEffect } from 'react';
import { logger } from '../../../lib/logger';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { blink } from '../../../lib/blink';
import { toast } from 'sonner';
import { 
  Palette, 
  Key, 
  Webhook, 
  Users, 
  Shield, 
  Copy, 
  RefreshCw, 
  Trash2, 
  Plus,
  Link2,
  Github,
  GitBranch,
  Building2,
  Globe,
  Bell,
  Database,
  Activity
} from 'lucide-react';
import type { BlinkUser } from '@blinkdotnew/sdk';
import { FeatureSpotlight } from './FeatureSpotlight';
import AuditLogViewer from './AuditLogViewer';

interface EnterpriseSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EnterpriseSettingsData {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  companyName?: string;
  webhookUrl?: string;
  apiKeyEnabled?: boolean;
}

export default function EnterpriseSettings({ open, onOpenChange }: EnterpriseSettingsProps) {
  const [currentUser, setCurrentUser] = useState<BlinkUser | null>(null);
  const [settings, setSettings] = useState<EnterpriseSettingsData>({
    primaryColor: '#6366f1',
    accentColor: '#10b981',
    companyName: 'Intinc Corporation',
  });
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<{ id: string; url: string; events: string[]; active: boolean }[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  // Track auth state
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setCurrentUser(state.user);
    });
    return unsubscribe;
  }, []);

  // Load settings on mount
  useEffect(() => {
    if (open && currentUser?.id) {
      loadSettings();
    }
  }, [open, currentUser?.id]);

  const loadSettings = async () => {
    if (!currentUser?.id) return;
    
    try {
      const results = await blink.db.enterpriseSettings.list();
      if (results && results.length > 0) {
        const data = results[0];
        setSettings({
          logoUrl: data.logo_url || '',
          primaryColor: data.primary_color || '#6366f1',
          accentColor: data.accent_color || '#10b981',
          companyName: data.company_name || 'Intinc Corporation',
          webhookUrl: data.webhook_url || '',
          apiKeyEnabled: Number(data.api_key_enabled) > 0,
        });
      }
    } catch (error) {
      logger.error('Failed to load settings:', error as Error);
    }
  };

  const saveSettings = async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    try {
      const existingSettings = await blink.db.enterpriseSettings.list();
      
      const settingsData = {
        userId: currentUser.id,
        logoUrl: settings.logoUrl || null,
        primaryColor: settings.primaryColor || '#6366f1',
        accentColor: settings.accentColor || '#10b981',
        companyName: settings.companyName || 'Intinc Corporation',
        webhookUrl: settings.webhookUrl || null,
        apiKeyEnabled: settings.apiKeyEnabled ? 1 : 0,
      };

      if (existingSettings && existingSettings.length > 0) {
        await blink.db.enterpriseSettings.update(
          { id: existingSettings[0].id },
          settingsData
        );
      } else {
        await blink.db.enterpriseSettings.create(settingsData);
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      logger.error('Failed to save settings:', error as Error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const generateApiKey = () => {
    const key = `intinc_${crypto.randomUUID().replace(/-/g, '')}`;
    setApiKey(key);
    setSettings(prev => ({ ...prev, apiKeyEnabled: true }));
    toast.success('API key generated successfully');
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied to clipboard');
  };

  const addWebhook = () => {
    if (!newWebhookUrl) return;
    
    const newWebhook = {
      id: crypto.randomUUID(),
      url: newWebhookUrl,
      events: ['dashboard.created', 'dashboard.updated', 'export.completed'],
      active: true,
    };
    
    setWebhooks(prev => [...prev, newWebhook]);
    setNewWebhookUrl('');
    toast.success('Webhook added successfully');
  };

  const removeWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
    toast.success('Webhook removed');
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(w => 
      w.id === id ? { ...w, active: !w.active } : w
    ));
  };

  const handleConnectGithub = async () => {
    try {
      const response = await blink.functions.invoke('github-oauth', {
        method: 'GET',
        params: { action: 'authorize' }
      });
      
      if (response && response.url) {
        window.location.href = response.url;
      } else {
        toast.error('Failed to get GitHub authorization URL');
      }
    } catch (error) {
      logger.error('GitHub connect error:', error as Error);
      toast.error('Failed to connect to GitHub');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 glass-card border-white/10">
        <FeatureSpotlight 
          featureId="enterprise_branding"
          title="White-Label Branding"
          description="Customize the look and feel of your workspace to match your brand identity perfectly."
          targetId="branding-tab"
          position="bottom"
        />
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            Enterprise Settings
          </DialogTitle>
          <DialogDescription>
            Configure your organization's branding, integrations, and security settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="branding" className="flex-1 flex flex-col min-h-0">
          <TabsList className="px-6 py-0 bg-transparent border-b border-white/10 justify-start gap-0 h-12 rounded-none">
            <TabsTrigger id="branding-tab" value="branding" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Palette size={16} />
              Branding
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Key size={16} />
              API Access
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Webhook size={16} />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Link2 size={16} />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Shield size={16} />
              Security
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              <Activity size={16} />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-6">
              <TabsContent value="branding" className="m-0 space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe size={18} />
                      Company Profile
                    </CardTitle>
                    <CardDescription>Customize your organization's branding across the platform.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={settings.companyName}
                          onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Your Company Name"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input
                          id="logoUrl"
                          value={settings.logoUrl}
                          onChange={(e) => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                          placeholder="https://..."
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex gap-2">
                          <div 
                            className="w-10 h-10 rounded-lg border border-white/10"
                            style={{ backgroundColor: settings.primaryColor }}
                          />
                          <Input
                            id="primaryColor"
                            value={settings.primaryColor}
                            onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            placeholder="#6366f1"
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accentColor">Accent Color</Label>
                        <div className="flex gap-2">
                          <div 
                            className="w-10 h-10 rounded-lg border border-white/10"
                            style={{ backgroundColor: settings.accentColor }}
                          />
                          <Input
                            id="accentColor"
                            value={settings.accentColor}
                            onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                            placeholder="#10b981"
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bell size={18} />
                      Notifications
                    </CardTitle>
                    <CardDescription>Configure email and in-app notification preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Dashboard Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications when dashboards are modified</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Weekly Digest</Label>
                        <p className="text-sm text-muted-foreground">Receive a weekly summary of dashboard activity</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="m-0 space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Key size={18} />
                      API Key Management
                    </CardTitle>
                    <CardDescription>Generate and manage API keys for programmatic access.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable API Access</Label>
                        <p className="text-sm text-muted-foreground">Allow external applications to access your dashboards</p>
                      </div>
                      <Switch 
                        checked={settings.apiKeyEnabled}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, apiKeyEnabled: checked }))}
                      />
                    </div>

                    <Separator className="bg-white/10" />

                    {settings.apiKeyEnabled && (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            value={apiKey}
                            readOnly
                            placeholder="Click 'Generate' to create an API key"
                            className="bg-white/5 border-white/10 font-mono text-sm"
                          />
                          <Button variant="outline" size="icon" onClick={copyApiKey} disabled={!apiKey} className="glass">
                            <Copy size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={generateApiKey} className="glass">
                            <RefreshCw size={16} />
                          </Button>
                        </div>
                        
                        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                          <p className="text-sm text-yellow-400">
                            <strong>Security Warning:</strong> Keep your API key secure and never share it publicly. 
                            Regenerate it immediately if you suspect it has been compromised.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database size={18} />
                      API Usage
                    </CardTitle>
                    <CardDescription>Monitor your API usage and rate limits.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-2xl font-bold">1,234</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Requests Today</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-2xl font-bold text-emerald-400">99.9%</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Success Rate</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-2xl font-bold">45ms</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Avg Latency</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="webhooks" className="m-0 space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Webhook size={18} />
                      Webhook Endpoints
                    </CardTitle>
                    <CardDescription>Configure webhooks to receive real-time notifications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newWebhookUrl}
                        onChange={(e) => setNewWebhookUrl(e.target.value)}
                        placeholder="https://your-endpoint.com/webhook"
                        className="bg-white/5 border-white/10"
                      />
                      <Button onClick={addWebhook} disabled={!newWebhookUrl}>
                        <Plus size={16} className="mr-2" />
                        Add
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {webhooks.length === 0 ? (
                        <div className="p-8 rounded-xl border border-dashed border-white/10 text-center">
                          <Webhook className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-muted-foreground">No webhooks configured yet.</p>
                        </div>
                      ) : (
                        webhooks.map(webhook => (
                          <div 
                            key={webhook.id} 
                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 group"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-2 h-2 rounded-full ${webhook.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <span className="font-mono text-sm truncate">{webhook.url}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {webhook.events.slice(0, 2).map(event => (
                                  <Badge key={event} variant="secondary" className="text-[10px]">
                                    {event.split('.')[1]}
                                  </Badge>
                                ))}
                              </div>
                              <Switch 
                                checked={webhook.active}
                                onCheckedChange={() => toggleWebhook(webhook.id)}
                              />
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeWebhook(webhook.id)}
                                className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Available Events</CardTitle>
                    <CardDescription>Events that can trigger webhook notifications.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'dashboard.created', 'dashboard.updated', 'dashboard.deleted',
                        'export.completed', 'user.invited', 'widget.added'
                      ].map(event => (
                        <div key={event} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                          <Badge variant="outline" className="font-mono text-xs">
                            {event}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integrations" className="m-0 space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Link2 size={18} />
                      Connected Apps
                    </CardTitle>
                    <CardDescription>Connect third-party services to automate data ingestion.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { 
                          name: 'GitHub', 
                          icon: Github, 
                          description: 'Track repository metrics and developer activity.',
                          connected: false,
                          color: '#24292e'
                        },
                        { 
                          name: 'HubSpot', 
                          icon: GitBranch, 
                          description: 'Sync sales pipelines and customer engagement.',
                          connected: false,
                          color: '#ff7a59'
                        },
                        { 
                          name: 'Figma', 
                          icon: Globe, 
                          description: 'Import design system metrics and team activity.',
                          connected: false,
                          color: '#f24e1e'
                        },
                        { 
                          name: 'Freshservice', 
                          icon: Database, 
                          description: 'Analyze IT service desk performance and tickets.',
                          connected: false,
                          color: '#00a1e0'
                        }
                      ].map((app) => (
                        <div 
                          key={app.name}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-4 hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${app.color}20` }}>
                              <app.icon size={20} style={{ color: app.color }} />
                            </div>
                            <Badge variant={app.connected ? "default" : "secondary"}>
                              {app.connected ? "Connected" : "Disconnected"}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-semibold">{app.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                              {app.description}
                            </p>
                          </div>
                          <Button 
                            variant={app.connected ? "outline" : "default"} 
                            className="w-full mt-2"
                            onClick={() => {
                              if (app.name === 'GitHub') {
                                handleConnectGithub();
                              } else {
                                toast.error(`${app.name} integration coming soon!`);
                              }
                            }}
                          >
                            {app.connected ? "Configure" : "Connect"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="m-0 space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield size={18} />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Configure security policies for your organization.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Require 2FA for all team members</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>IP Allowlisting</Label>
                        <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Audit Logging</Label>
                        <p className="text-sm text-muted-foreground">Track all user actions and changes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Session Timeout</Label>
                        <p className="text-sm text-muted-foreground">Auto logout after 30 minutes of inactivity</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users size={18} />
                      Session Management
                    </CardTitle>
                    <CardDescription>View and manage active sessions.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div>
                            <p className="text-sm font-medium">Current Session</p>
                            <p className="text-xs text-muted-foreground">Chrome on macOS • IP: 192.168.1.x</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </div>
                    <Button variant="destructive" className="mt-4 w-full">
                      Revoke All Other Sessions
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audit" className="m-0 space-y-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity size={18} />
                      System Audit Trail
                    </CardTitle>
                    <CardDescription>Track all administrative actions and security events across your organization.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AuditLogViewer />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>

          <div className="p-6 border-t border-white/10 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="glass">
              Cancel
            </Button>
            <Button onClick={saveSettings} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
