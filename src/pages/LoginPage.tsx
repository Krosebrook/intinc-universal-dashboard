import React from 'react';
import { Button } from '../components/ui/button';
import { blink } from '../lib/blink';
import { LayoutDashboard, Activity, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const handleLogin = () => {
    blink.auth.login();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass p-12 rounded-2xl w-full max-w-md text-center relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-3 tracking-tight">intinc.com</h1>
        <p className="text-muted-foreground mb-10 text-lg">Universal Dashboard Engine</p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleLogin}
            className="w-full h-14 text-lg font-semibold group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Sign In to Platform <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          <p className="text-xs text-muted-foreground pt-4">
            Secured by Blink Enterprise Auth
          </p>
        </div>
      </motion.div>
    </div>
  );
}
