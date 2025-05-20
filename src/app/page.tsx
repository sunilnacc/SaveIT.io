
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/savvy-cart/Logo';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
      router.push('/search');
      }, 350); // simple loading

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [router, loading]);

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
