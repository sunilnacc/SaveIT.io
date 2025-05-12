
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/savvy-cart/Logo';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          router.push('/dashboard');
        } else {
          // If not logged in, user might want to see splash then go to login/signup.
          // Or, automatically redirect to login. For now, let's keep the splash then they can navigate.
          // If explicit redirect to login is desired: router.push('/login');
          // For now, let's assume header provides login/signup if not logged in.
          // If dashboard is the only "next step", redirecting unauth users to login from here might be good.
          // Let's redirect to login if not authenticated after splash.
          router.push('/login');
        }
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [router, user, loading]);

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading SaveIT.io...</p>
      </div>
    );
  }
  
  // Show splash screen content once auth state is known (even if redirecting shortly)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Logo size="large" />
      <p className="mt-4 text-xl md:text-2xl text-center text-muted-foreground">
        Compare Smart. Save Big.
      </p>
      <Loader2 className="mt-8 h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
