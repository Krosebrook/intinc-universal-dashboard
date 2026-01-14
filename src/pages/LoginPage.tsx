import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { blink } from '../lib/blink';
import { LayoutDashboard, Activity, ChevronRight, Mail, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await blink.auth.signInWithEmail(email, password);
        toast.success('Welcome back!');
      } else {
        await blink.auth.signUp({ email, password });
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await blink.auth.signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass p-8 md:p-12 rounded-2xl w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">intinc.com</h1>
          <p className="text-muted-foreground">{mode === 'login' ? 'Sign in to your enterprise dashboard' : 'Create your enterprise account'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input 
                type="email" 
                placeholder="Work Email" 
                className="pl-10 h-12 glass border-white/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input 
                type="password" 
                placeholder="Password" 
                className="pl-10 h-12 glass border-white/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit"
            className="w-full h-12 text-lg font-semibold group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <span className="relative z-10 flex items-center gap-2">
                {mode === 'login' ? 'Sign In' : 'Get Started'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full h-12 glass border-white/10 flex items-center justify-center gap-3"
          onClick={handleGoogleLogin}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google Workspace
        </Button>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm text-primary hover:underline transition-all"
          >
            {mode === 'login' ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
