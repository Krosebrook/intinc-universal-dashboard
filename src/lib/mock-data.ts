import { DollarSign, Users, Zap, Target, Clock, Shield, Cpu, Globe } from 'lucide-react';
import { KPIData } from '../types/dashboard';
import { WidgetConfig } from '../components/dashboard/WidgetGrid';
import { EXPANDED_TEMPLATES } from './templates';

export function getMockData(source: 'Stripe' | 'Jira' | 'AWS' | 'GitHub' | 'OpenAI'): { kpis: KPIData[], widgets: WidgetConfig[] } {
  let mockKpis: KPIData[] = [];
  let mockWidgets: WidgetConfig[] = [];

  switch (source) {
    case 'Stripe':
      mockKpis = [
        { title: 'Gross Volume', value: '$245,890', trend: '+18.2%', trendType: 'up', icon: DollarSign, description: 'Total value of processed payments.' },
        { title: 'Net Revenue', value: '$212,450', trend: '+15.4%', trendType: 'up', icon: Zap, description: 'Revenue after Stripe fees and refunds.' },
        { title: 'New Customers', value: '1,245', trend: '+22.1%', trendType: 'up', icon: Users, description: 'New customer accounts created.' },
        { title: 'Churn Rate', value: '2.4%', trend: '-0.8%', trendType: 'up', icon: Target, description: 'Percentage of customers who cancelled.' },
      ];
      mockWidgets = [
        { id: 'stripe-volume', type: 'area', title: 'Payment Volume', description: 'Daily transaction volume for the last 30 days', dataKey: 'volume', categoryKey: 'date', gridSpan: 8, data: Array.from({ length: 30 }).map((_, i) => ({ date: `2024-01-${i + 1}`, volume: Math.floor(Math.random() * 5000) + 2000 })) },
        { id: 'stripe-methods', type: 'pie', title: 'Payment Methods', description: 'Distribution by card type and wallet', dataKey: 'value', categoryKey: 'name', gridSpan: 4, data: [{ name: 'Visa', value: 45 }, { name: 'Mastercard', value: 30 }, { name: 'Apple Pay', value: 15 }, { name: 'Amex', value: 10 }] },
      ];
      break;
    case 'Jira':
      mockKpis = [
        { title: 'Sprint Velocity', value: '42 pts', trend: '+5.2%', trendType: 'up', icon: Zap, description: 'Average story points completed per sprint.' },
        { title: 'Cycle Time', value: '4.2 days', trend: '-1.1 days', trendType: 'up', icon: Clock, description: 'Time from start to completion of a task.' },
        { title: 'Open Bugs', value: '18', trend: '-24%', trendType: 'up', icon: Shield, description: 'Total number of unresolved bug reports.' },
        { title: 'Completion Rate', value: '94%', trend: '+2.1%', trendType: 'up', icon: Target, description: 'Percentage of planned work completed in sprint.' },
      ];
      mockWidgets = [
        { id: 'jira-burndown', type: 'line', title: 'Sprint Burndown', description: 'Remaining effort vs ideal progress', dataKey: ['Actual', 'Ideal'], categoryKey: 'day', gridSpan: 8, data: Array.from({ length: 10 }).map((_, i) => ({ day: `Day ${i + 1}`, Actual: 100 - (i * 10) - Math.floor(Math.random() * 5), Ideal: 100 - (i * 10) })) },
        { id: 'jira-status', type: 'pie', title: 'Issue Status', description: 'Current distribution of all project tasks', dataKey: 'value', categoryKey: 'name', gridSpan: 4, data: [{ name: 'Done', value: 65 }, { name: 'In Progress', value: 20 }, { name: 'To Do', value: 15 }] },
      ];
      break;
    case 'AWS':
      mockKpis = [
        { title: 'Monthly Spend', value: '$4,120', trend: '+4.2%', trendType: 'down', icon: DollarSign, description: 'Total projected cloud cost for current month.' },
        { title: 'Instance Uptime', value: '99.98%', trend: '+0.01%', trendType: 'up', icon: Cpu, description: 'Average uptime across all EC2 instances.' },
        { title: 'Lambda Execs', value: '1.2M', trend: '+45%', trendType: 'up', icon: Zap, description: 'Total serverless function invocations.' },
        { title: 'S3 Storage', value: '2.4 TB', trend: '+12%', trendType: 'down', icon: Target, description: 'Total storage consumed across all buckets.' },
      ];
      mockWidgets = [
        { id: 'aws-cost', type: 'bar', title: 'Cost by Service', description: 'Daily breakdown of AWS service expenses', dataKey: 'cost', categoryKey: 'service', gridSpan: 6, data: [{ service: 'EC2', cost: 1200 }, { service: 'RDS', cost: 850 }, { service: 'S3', cost: 450 }, { service: 'Lambda', cost: 120 }, { service: 'Other', cost: 340 }] },
        { id: 'aws-traffic', type: 'area', title: 'Network Traffic', description: 'Data transfer in/out over the last 24 hours', dataKey: ['Inbound', 'Outbound'], categoryKey: 'time', gridSpan: 6, data: Array.from({ length: 24 }).map((_, i) => ({ time: `${i}:00`, Inbound: Math.floor(Math.random() * 100), Outbound: Math.floor(Math.random() * 80) })) },
      ];
      break;
    case 'GitHub':
      mockKpis = [
        { title: 'Pull Requests', value: '24', trend: '+4', trendType: 'up', icon: Target, description: 'Active open pull requests across repos.' },
        { title: 'Merge Time', value: '1.8 hrs', trend: '-0.4 hrs', trendType: 'up', icon: Clock, description: 'Average time to merge a pull request.' },
        { title: 'Commits', value: '142', trend: '+12%', trendType: 'up', icon: Zap, description: 'Total code commits in the last 7 days.' },
        { title: 'Vulnerabilities', value: '0', trend: '0', trendType: 'up', icon: Shield, description: 'Dependabot alerts currently active.' },
      ];
      mockWidgets = [
        { id: 'github-activity', type: 'line', title: 'Commit Activity', description: 'Frequency of code pushes across all branches', dataKey: 'commits', categoryKey: 'date', gridSpan: 12, data: Array.from({ length: 14 }).map((_, i) => ({ date: `Jan ${i + 1}`, commits: Math.floor(Math.random() * 20) + 5 })) },
      ];
      break;
    case 'OpenAI':
      const aiTemplate = EXPANDED_TEMPLATES.find(t => t.id === 'token-cost');
      if (aiTemplate) {
        mockKpis = aiTemplate.kpis;
        mockWidgets = aiTemplate.widgets;
      }
      break;
  }

  return { kpis: mockKpis, widgets: mockWidgets };
}
