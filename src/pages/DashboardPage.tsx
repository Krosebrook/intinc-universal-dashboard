import React, { useRef } from 'react';
import Shell from '../components/layout/Shell';
import KPISection, { KPIData } from '../components/dashboard/KPISection';
import WidgetGrid, { WidgetConfig } from '../components/dashboard/WidgetGrid';
import AIInsight from '../components/dashboard/AIInsight';
import { useDashboard } from '../hooks/use-dashboard';
import { DollarSign, ShoppingCart, Users, TrendingUp, Download, Plus, Filter, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const salesKPIs: KPIData[] = [
  { 
    title: 'Total Revenue', 
    value: '$1,240,592', 
    trend: '+12.5%', 
    trendType: 'up', 
    icon: DollarSign,
    description: 'Total revenue generated from all sales channels this month.'
  },
  { 
    title: 'Active Orders', 
    value: '4,520', 
    trend: '+8.2%', 
    trendType: 'up', 
    icon: ShoppingCart,
    description: 'Total number of orders currently in processing or shipped.'
  },
  { 
    title: 'New Customers', 
    value: '842', 
    trend: '-2.4%', 
    trendType: 'down', 
    icon: Users,
    description: 'Unique customer acquisitions during the current period.'
  },
  { 
    title: 'Conversion Rate', 
    value: '4.82%', 
    trend: '+1.2%', 
    trendType: 'up', 
    icon: TrendingUp,
    description: 'Percentage of website visitors who completed a purchase.'
  },
];

const salesWidgets: WidgetConfig[] = [
  {
    id: 'revenue-trend',
    type: 'area',
    title: 'Revenue Distribution',
    description: 'Monthly growth across enterprise and SME segments',
    dataKey: 'value',
    categoryKey: 'name',
    gridSpan: 8,
    data: [
      { name: 'Jan', value: 45000 },
      { name: 'Feb', value: 52000 },
      { name: 'Mar', value: 48000 },
      { name: 'Apr', value: 61000 },
      { name: 'May', value: 55000 },
      { name: 'Jun', value: 67000 },
      { name: 'Jul', value: 72000 },
    ]
  },
  {
    id: 'customer-segments',
    type: 'pie',
    title: 'Customer Segments',
    description: 'Revenue split by company size',
    dataKey: 'value',
    categoryKey: 'name',
    gridSpan: 4,
    data: [
      { name: 'Enterprise', value: 45 },
      { name: 'Mid-Market', value: 30 },
      { name: 'SME', value: 25 },
    ]
  },
  {
    id: 'top-products',
    type: 'bar',
    title: 'Top Performing Products',
    description: 'Sales volume for leading SKU categories',
    dataKey: 'sales',
    categoryKey: 'product',
    gridSpan: 6,
    data: [
      { product: 'Cloud Pro', sales: 450 },
      { product: 'Enterprise Suite', sales: 320 },
      { product: 'Security Plus', sales: 280 },
      { product: 'Data Connect', sales: 190 },
    ]
  },
  {
    id: 'retention-rate',
    type: 'line',
    title: 'Retention Metrics',
    description: 'Customer retention trend over last 6 months',
    dataKey: 'rate',
    categoryKey: 'month',
    gridSpan: 6,
    data: [
      { month: 'Jan', rate: 92 },
      { month: 'Feb', rate: 94 },
      { month: 'Mar', rate: 93 },
      { month: 'Apr', rate: 95 },
      { month: 'May', rate: 96 },
      { month: 'Jun', rate: 95 },
    ]
  }
];

export default function DashboardPage() {
  const { department } = useDashboard();
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!dashboardRef.current) return;
    
    const loadingToast = toast.loading('Generating high-fidelity PDF export...');
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#050505',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`intinc-dashboard-${department.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('Dashboard exported successfully!', { id: loadingToast });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export dashboard. Please try again.', { id: loadingToast });
    }
  };

  return (
    <Shell>
      <div ref={dashboardRef} className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold tracking-tight mb-1"
            >
              Executive Summary
            </motion.h2>
            <p className="text-muted-foreground">Real-time performance metrics for the {department} department.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="glass h-11 px-4 rounded-xl hidden sm:flex">
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 Days
            </Button>
            <Button variant="outline" className="glass h-11 px-4 rounded-xl hidden sm:flex">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
            <Button 
              onClick={handleExport}
              className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button size="icon" className="h-11 w-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <KPISection data={salesKPIs} />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <WidgetGrid widgets={salesWidgets} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <AIInsight />
          </div>
        </div>
      </div>
    </Shell>
  );
}
