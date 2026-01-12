import React, { useEffect, useState } from 'react';
import { blink } from './lib/blink';
import { BlinkUser } from '@blinkdotnew/sdk';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { Toaster } from 'sonner';

export default function App() {
  const [user, setUser] = useState<BlinkUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster theme="dark" position="top-right" richColors />
      {user ? <DashboardPage /> : <LoginPage />}
    </>
  );
}
